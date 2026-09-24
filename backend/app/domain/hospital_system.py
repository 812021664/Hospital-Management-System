"""Production-safe versions of the original hospital data structures.

The original repository used a circular queue, min-heap, singly linked doctor
schedule, hash-based patient index, and undo stack. This module keeps those
structures and fixes destructive undo behavior by recording exact queue and
severity state.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
import heapq
import itertools
import time
from typing import Any, Dict, Generic, List, Optional, Tuple, TypeVar

T = TypeVar("T")


@dataclass
class Patient:
    id: int | str
    name: str
    age: int
    severity: int = 0
    history: List[str] = field(default_factory=list)


@dataclass
class Token:
    tokenId: int
    patientId: int | str
    doctorId: int | str | None
    slotId: Optional[int]
    type: str
    severity: Optional[int] = None
    timestamp: float = field(default_factory=time.time)


@dataclass
class Doctor:
    id: int | str
    name: str
    specialization: str


class SlotNode:
    def __init__(self, slotId: int, startTime: str, endTime: str, status: str = "FREE") -> None:
        self.slotId = slotId
        self.startTime = startTime
        self.endTime = endTime
        self.status = status
        self.next: Optional[SlotNode] = None


class CircularQueue(Generic[T]):
    """Fixed-size circular queue with O(1) enqueue, dequeue, and peek."""

    def __init__(self, capacity: int = 1000) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self.capacity = capacity
        self.data: List[Optional[T]] = [None] * capacity
        self.head = 0
        self.tail = 0
        self.size = 0

    def enqueue(self, item: T) -> bool:
        if self.size == self.capacity:
            return False
        self.data[self.tail] = item
        self.tail = (self.tail + 1) % self.capacity
        self.size += 1
        return True

    def dequeue(self) -> Optional[T]:
        if self.size == 0:
            return None
        item = self.data[self.head]
        self.data[self.head] = None
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return item

    def peek(self) -> Optional[T]:
        return self.data[self.head] if self.size else None

    def snapshot(self) -> List[T]:
        return [item for item in self.data if item is not None]

    def replace(self, items: List[T]) -> None:
        if len(items) > self.capacity:
            raise ValueError("items exceed queue capacity")
        self.data = [None] * self.capacity
        self.head = 0
        self.tail = 0
        self.size = 0
        for item in items:
            self.enqueue(item)

    def is_empty(self) -> bool:
        return self.size == 0

    def __len__(self) -> int:
        return self.size


class MinHeapTriage:
    """Severity-first FIFO min-heap."""

    def __init__(self) -> None:
        self.heap: List[Tuple[int, int, Token]] = []
        self._counter = itertools.count()

    def insert(self, token: Token, severity: int) -> None:
        heapq.heappush(self.heap, (severity, next(self._counter), token))

    def extract_min(self) -> Optional[Token]:
        return heapq.heappop(self.heap)[2] if self.heap else None

    def peek(self) -> Optional[Token]:
        return self.heap[0][2] if self.heap else None

    def remove(self, tokenId: int) -> Optional[Token]:
        found: Optional[Token] = None
        rebuilt: List[Tuple[int, int, Token]] = []
        while self.heap:
            item = heapq.heappop(self.heap)
            if item[2].tokenId == tokenId and found is None:
                found = item[2]
            else:
                rebuilt.append(item)
        self.heap = rebuilt
        heapq.heapify(self.heap)
        return found

    def snapshot(self) -> List[Token]:
        return [item[2] for item in sorted(self.heap, key=lambda item: (item[0], item[1]))]

    def __len__(self) -> int:
        return len(self.heap)


class PatientIndex:
    """Hash table abstraction for constant-time patient lookup."""

    def __init__(self) -> None:
        self.table: Dict[int | str, Patient] = {}

    def upsert(self, patient: Patient) -> None:
        self.table[patient.id] = patient

    def get(self, patientId: int | str) -> Optional[Patient]:
        return self.table.get(patientId)

    def delete(self, patientId: int | str) -> None:
        self.table.pop(patientId, None)

    def snapshot(self) -> List[Patient]:
        return list(self.table.values())

    def __len__(self) -> int:
        return len(self.table)


class UndoStack:
    def __init__(self) -> None:
        self.stack: List[Tuple[str, Any]] = []

    def push(self, action_type: str, payload: Any) -> None:
        self.stack.append((action_type, payload))

    def pop(self) -> Optional[Tuple[str, Any]]:
        return self.stack.pop() if self.stack else None

    def is_empty(self) -> bool:
        return not self.stack


class DoctorSchedule:
    def __init__(self, doctor: Doctor) -> None:
        self.doctor = doctor
        self.head: Optional[SlotNode] = None
        self.slot_map: Dict[int, SlotNode] = {}

    def add_slot(self, slotId: int, startTime: str, endTime: str) -> None:
        if slotId in self.slot_map:
            raise ValueError(f"slot {slotId} already exists")
        node = SlotNode(slotId, startTime, endTime)
        node.next = self.head
        self.head = node
        self.slot_map[slotId] = node

    def book_next_free(self) -> Optional[SlotNode]:
        current = self.head
        while current:
            if current.status == "FREE":
                current.status = "BOOKED"
                return current
            current = current.next
        return None

    def find_slot(self, slotId: int) -> Optional[SlotNode]:
        return self.slot_map.get(slotId)

    def pending_count(self) -> int:
        return sum(1 for node in self.slot_map.values() if node.status == "BOOKED")

    def next_free_slot(self) -> Optional[SlotNode]:
        return next((node for node in reversed(list(self._walk())) if node.status == "FREE"), None)

    def _walk(self):
        current = self.head
        while current:
            yield current
            current = current.next


class HospitalSystem:
    """Appointment and triage engine with reversible operations."""

    def __init__(self, queue_capacity: int = 500) -> None:
        self.patients = PatientIndex()
        self.doctors: Dict[int | str, Doctor] = {}
        self.schedules: Dict[int | str, DoctorSchedule] = {}
        self.routine_queue: CircularQueue[Token] = CircularQueue(queue_capacity)
        self.triage = MinHeapTriage()
        self.undo = UndoStack()
        self.token_counter = itertools.count(1000)
        self.served: List[Token] = []
        self.severity_by_token: Dict[int, int] = {}

    def register_patient(self, pid: int | str, name: str, age: int, severity: int = 0) -> Patient:
        patient = Patient(id=pid, name=name, age=age, severity=severity)
        self.patients.upsert(patient)
        return patient

    def get_patient(self, pid: int | str) -> Optional[Patient]:
        return self.patients.get(pid)

    def add_doctor(self, doc_id: int | str, name: str, specialization: str) -> Doctor:
        doctor = Doctor(id=doc_id, name=name, specialization=specialization)
        self.doctors[doc_id] = doctor
        self.schedules[doc_id] = DoctorSchedule(doctor)
        return doctor

    def add_slot_to_doctor(self, doc_id: int | str, slotId: int, start: str, end: str) -> None:
        if doc_id not in self.schedules:
            raise ValueError("Doctor not found")
        self.schedules[doc_id].add_slot(slotId, start, end)

    def book_routine(self, patientId: int | str, doctorId: int | str) -> Optional[Token]:
        if not self.get_patient(patientId):
            raise ValueError("Patient not registered")
        if doctorId not in self.schedules:
            raise ValueError("Doctor not found")
        slot = self.schedules[doctorId].book_next_free()
        if not slot:
            return None
        token = Token(next(self.token_counter), patientId, doctorId, slot.slotId, "ROUTINE")
        if not self.routine_queue.enqueue(token):
            slot.status = "FREE"
            return None
        self.undo.push("book", {"token": token})
        return token

    def cancel_booking(self, tokenId: int) -> bool:
        removed: Optional[Token] = None
        remaining: List[Token] = []
        for token in self.routine_queue.snapshot():
            if token.tokenId == tokenId and removed is None:
                removed = token
            else:
                remaining.append(token)
        if not removed:
            return False
        self.routine_queue.replace(remaining)
        schedule = self.schedules.get(removed.doctorId)
        if schedule and removed.slotId is not None:
            node = schedule.find_slot(removed.slotId)
            if node:
                node.status = "FREE"
        self.undo.push("cancel", {"token": removed})
        return True

    def triage_insert(self, patientId: int | str, severity: int, doctorId: int | str | None = None) -> Token:
        if not self.get_patient(patientId):
            raise ValueError("Patient not registered")
        if not 0 <= severity <= 4:
            raise ValueError("severity must be between 0 and 4")
        token = Token(next(self.token_counter), patientId, doctorId, None, "EMERGENCY", severity)
        self.severity_by_token[token.tokenId] = severity
        self.triage.insert(token, severity)
        self.undo.push("triage_insert", {"token": token, "severity": severity})
        return token

    def serve_next(self) -> Optional[Token]:
        token = self.triage.extract_min() or self.routine_queue.dequeue()
        if token is None:
            return None
        self.served.append(token)
        action = "serve_triage" if token.type == "EMERGENCY" else "serve_routine"
        self.undo.push(action, {"token": token, "severity": token.severity})
        return token

    def undo_last(self) -> str:
        item = self.undo.pop()
        if not item:
            return "Nothing to undo"
        action, payload = item
        token: Token = payload["token"]
        if action == "book":
            remaining = [item for item in self.routine_queue.snapshot() if item.tokenId != token.tokenId]
            self.routine_queue.replace(remaining)
            self._free_slot(token)
            return f"Undid booking token {token.tokenId}"
        if action == "cancel":
            schedule = self.schedules.get(token.doctorId)
            if schedule and token.slotId is not None:
                node = schedule.find_slot(token.slotId)
                if node:
                    node.status = "BOOKED"
            self.routine_queue.enqueue(token)
            return f"Undid cancellation: rebooked token {token.tokenId}"
        if action == "serve_routine":
            if token in self.served:
                self.served.remove(token)
            self.routine_queue.enqueue(token)
            return f"Undid serving of routine token {token.tokenId}"
        if action == "serve_triage":
            if token in self.served:
                self.served.remove(token)
            self.triage.insert(token, self.severity_by_token.get(token.tokenId, token.severity or 0))
            return f"Undid serving of triage token {token.tokenId}"
        if action == "triage_insert":
            removed = self.triage.remove(token.tokenId)
            return f"Undid triage insert {token.tokenId}" if removed else "Could not find triage token to undo"
        return "Unknown action to undo"

    def _free_slot(self, token: Token) -> None:
        schedule = self.schedules.get(token.doctorId)
        if schedule and token.slotId is not None:
            node = schedule.find_slot(token.slotId)
            if node:
                node.status = "FREE"

    def report_per_doctor(self) -> List[Dict[str, Any]]:
        reports = []
        for doc_id, schedule in self.schedules.items():
            next_free = schedule.next_free_slot()
            reports.append({"doctorId": doc_id, "doctorName": schedule.doctor.name, "pending_booked_slots": schedule.pending_count(), "next_free_slot": getattr(next_free, "slotId", None)})
        return reports

    def report_served_vs_pending(self) -> Dict[str, int]:
        return {"served": len(self.served), "pending": len(self.routine_queue) + len(self.triage)}

    def top_k_frequent_patients(self, k: int = 3) -> List[Tuple[int | str, int]]:
        frequency: Dict[int | str, int] = {}
        for token in self.served:
            frequency[token.patientId] = frequency.get(token.patientId, 0) + 1
        return sorted(frequency.items(), key=lambda item: (-item[1], str(item[0])))[:k]

    def snapshot(self) -> Dict[str, Any]:
        return {"patients": [asdict(patient) for patient in self.patients.snapshot()], "doctors": [asdict(doctor) for doctor in self.doctors.values()], "served": [asdict(token) for token in self.served], "pending": self.report_served_vs_pending()}
