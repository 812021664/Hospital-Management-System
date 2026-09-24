from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from threading import RLock
from typing import Any

from .models import (
    Appointment,
    BootstrapResponse,
    Doctor,
    ImportRequest,
    ImportResult,
    LegacyReportResponse,
    LegacyReportRow,
    Patient,
    TriageCase,
    WorkspaceStatus,
)


def parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


class HospitalDataStore:
    """Thread-safe JSON persistence for the single-hospital workspace."""

    def __init__(self, path: Path | None = None) -> None:
        self.path = path or Path(__file__).resolve().parents[1] / "data" / "hospital.json"
        self._lock = RLock()
        self.patients: list[Patient] = []
        self.doctors: list[Doctor] = []
        self.appointments: list[Appointment] = []
        self.triage_cases: list[TriageCase] = []
        self.initialized = False
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
            self.patients = [Patient.model_validate(item) for item in payload.get("patients", [])]
            self.doctors = [Doctor.model_validate(item) for item in payload.get("doctors", [])]
            self.appointments = [Appointment.model_validate(item) for item in payload.get("appointments", [])]
            self.triage_cases = [TriageCase.model_validate(item) for item in payload.get("triageCases", [])]
            self.initialized = bool(payload.get("initialized", False))
        except (OSError, ValueError, json.JSONDecodeError):
            # A corrupt demo file should not prevent the API from starting.
            self.patients, self.doctors, self.appointments, self.triage_cases = [], [], [], []
            self.initialized = False

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "initialized": self.initialized,
            "patients": [item.model_dump(mode="json") for item in self.patients],
            "doctors": [item.model_dump(mode="json") for item in self.doctors],
            "appointments": [item.model_dump(mode="json") for item in self.appointments],
            "triageCases": [item.model_dump(mode="json") for item in self.triage_cases],
        }
        temporary = self.path.with_suffix(".tmp")
        temporary.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        temporary.replace(self.path)

    @staticmethod
    def _upsert(items: list[Any], value: Any) -> None:
        for index, current in enumerate(items):
            if current.id == value.id:
                items[index] = value
                return
        items.append(value)

    def import_workspace(self, request: ImportRequest) -> ImportResult:
        with self._lock:
            for patient in request.patients:
                self._upsert(self.patients, patient)
            for doctor in request.doctors:
                self._upsert(self.doctors, doctor)
            for appointment in request.appointments:
                self._upsert(self.appointments, appointment)
            for triage_case in request.triageCases:
                self._upsert(self.triage_cases, triage_case)
            self.initialized = True
            self._save()
            return ImportResult(
                patients=len(request.patients),
                doctors=len(request.doctors),
                appointments=len(request.appointments),
                triageCases=len(request.triageCases),
            )

    def status(self) -> WorkspaceStatus:
        with self._lock:
            return WorkspaceStatus(
                initialized=self.initialized,
                storage="JSON file",
                patients=len(self.patients),
                doctors=len(self.doctors),
                appointments=len(self.appointments),
                triageCases=len(self.triage_cases),
                serverTime=datetime.now(timezone.utc).isoformat(),
            )

    def bootstrap(self) -> BootstrapResponse:
        with self._lock:
            return BootstrapResponse(
                patients=list(self.patients),
                doctors=list(self.doctors),
                appointments=sorted(self.appointments, key=lambda item: (item.date, item.time), reverse=True),
                triageCases=sorted(self.triage_cases, key=lambda item: (item.status != "Waiting", item.severity, parse_time(item.arrivalAt))),
                status=self.status(),
            )

    def list_patients(self) -> list[Patient]:
        with self._lock:
            return list(self.patients)

    def save_patient(self, patient: Patient) -> Patient:
        with self._lock:
            self._upsert(self.patients, patient)
            self._save()
            return patient

    def list_doctors(self) -> list[Doctor]:
        with self._lock:
            return list(self.doctors)

    def save_doctor(self, doctor: Doctor) -> Doctor:
        with self._lock:
            self._upsert(self.doctors, doctor)
            self._save()
            return doctor

    def list_appointments(self) -> list[Appointment]:
        with self._lock:
            return list(self.appointments)

    def save_appointment(self, appointment: Appointment) -> Appointment:
        with self._lock:
            conflict = any(
                item.id != appointment.id
                and item.doctorId == appointment.doctorId
                and item.date == appointment.date
                and item.time == appointment.time
                and item.status not in {"Cancelled", "No show"}
                for item in self.appointments
            )
            if conflict:
                raise ValueError("That clinician time slot is already booked.")
            self._upsert(self.appointments, appointment)
            self._save()
            return appointment

    def list_triage(self) -> list[TriageCase]:
        with self._lock:
            return sorted(self.triage_cases, key=lambda item: (item.status != "Waiting", item.severity, parse_time(item.arrivalAt)))

    def create_triage(self, triage_case: TriageCase) -> TriageCase:
        with self._lock:
            if not any(patient.id == triage_case.patientId for patient in self.patients):
                raise KeyError("Patient not found")
            self._upsert(self.triage_cases, triage_case)
            self._save()
            return triage_case

    def serve_next(self) -> TriageCase | None:
        with self._lock:
            waiting = [item for item in self.triage_cases if item.status == "Waiting"]
            if not waiting:
                return None
            next_case = min(waiting, key=lambda item: (item.severity, parse_time(item.arrivalAt)))
            doctor = next((item for item in self.doctors if item.department == "Emergency" and item.status in {"Available", "On call"}), None)
            doctor = doctor or next((item for item in self.doctors if item.status == "Available"), None)
            updated = next_case.model_copy(update={"status": "With doctor", "assignedDoctorId": doctor.id if doctor else None})
            self._upsert(self.triage_cases, updated)
            self._save()
            return updated

    def complete_triage(self, triage_id: str) -> TriageCase:
        with self._lock:
            triage_case = next((item for item in self.triage_cases if item.id == triage_id), None)
            if triage_case is None:
                raise KeyError("Triage case not found")
            updated = triage_case.model_copy(update={"status": "Completed"})
            self._upsert(self.triage_cases, updated)
            for index, patient in enumerate(self.patients):
                if patient.id == triage_case.patientId:
                    self.patients[index] = patient.model_copy(
                        update={
                            "status": "Admitted" if triage_case.severity <= 2 else "Active",
                            "lastVisit": datetime.now(timezone.utc).isoformat(),
                            "visits": patient.visits + 1,
                        }
                    )
                    break
            self._save()
            return updated

    def legacy_report(self) -> LegacyReportResponse:
        with self._lock:
            rows = []
            for patient in sorted(self.patients, key=lambda item: (item.lastName, item.firstName)):
                visits = sum(1 for item in self.appointments if item.patientId == patient.id)
                rows.append(LegacyReportRow(patientId=patient.id, name=f"{patient.firstName} {patient.lastName}", email=patient.email, totalVisits=visits))
            return LegacyReportResponse(
                rows=rows,
                totalPatients=len(rows),
                totalVisits=len(self.appointments),
                completedVisits=sum(1 for item in self.appointments if item.status == "Completed"),
            )

    def reset(self) -> None:
        with self._lock:
            self.patients.clear()
            self.doctors.clear()
            self.appointments.clear()
            self.triage_cases.clear()
            self.initialized = False
            if self.path.exists():
                self.path.unlink()


store = HospitalDataStore()
