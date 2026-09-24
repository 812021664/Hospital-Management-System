"""Backward-compatible import for the original hospital assignment API."""

from backend.app.domain.hospital_system import (
    CircularQueue,
    Doctor,
    DoctorSchedule,
    HospitalSystem,
    MinHeapTriage,
    Patient,
    PatientIndex,
    SlotNode,
    Token,
    UndoStack,
)

__all__ = [
    "CircularQueue",
    "Doctor",
    "DoctorSchedule",
    "HospitalSystem",
    "MinHeapTriage",
    "Patient",
    "PatientIndex",
    "SlotNode",
    "Token",
    "UndoStack",
]

if __name__ == "__main__":
    system = HospitalSystem(queue_capacity=20)
    system.add_doctor(1, "Dr. Rao", "General")
    system.add_slot_to_doctor(1, 101, "09:00", "09:15")
    system.add_slot_to_doctor(1, 102, "09:15", "09:30")
    for patient_id, name, age in [(1, "Alice", 30), (2, "Bob", 45), (3, "Charlie", 25)]:
        system.register_patient(patient_id, name, age)
    print("Booked:", system.book_routine(1, 1))
    print("Triage inserted:", system.triage_insert(3, severity=0, doctorId=1))
    print("Served:", system.serve_next())
    print("Report:", system.report_served_vs_pending())
