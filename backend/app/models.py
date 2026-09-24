from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

PatientStatus = Literal["Active", "Admitted", "Discharged", "Critical"]
BloodGroup = Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
Gender = Literal["Female", "Male", "Non-binary", "Prefer not to say"]
DoctorStatus = Literal["Available", "In surgery", "On call", "Off duty"]
AppointmentStatus = Literal["Scheduled", "Checked in", "In consultation", "Completed", "Cancelled", "No show"]
VisitType = Literal["New patient", "Follow-up", "Telehealth", "Emergency", "Procedure"]
TriageStatus = Literal["Waiting", "With doctor", "Completed", "Discharged"]


class APIModel(BaseModel):
    model_config = ConfigDict(extra="ignore")


class Vitals(APIModel):
    heartRate: int = Field(ge=1, le=250)
    systolic: int = Field(ge=1, le=300)
    diastolic: int = Field(ge=1, le=200)
    temperature: float = Field(ge=30, le=45)
    oxygenSaturation: int = Field(ge=50, le=100)
    respiratoryRate: int = Field(ge=1, le=80)


class Patient(APIModel):
    id: str = Field(min_length=1)
    mrn: str = Field(min_length=1)
    firstName: str = Field(min_length=1)
    lastName: str = Field(min_length=1)
    dateOfBirth: str
    gender: Gender
    phone: str
    email: str
    address: str
    bloodGroup: BloodGroup
    allergies: list[str] = Field(default_factory=list)
    conditions: list[str] = Field(default_factory=list)
    insuranceProvider: str
    insuranceNumber: str
    status: PatientStatus
    registeredAt: str
    lastVisit: str | None = None
    emergencyContact: str
    visits: int = Field(ge=0)


class Doctor(APIModel):
    id: str
    name: str
    specialization: str
    department: str
    email: str
    phone: str
    status: DoctorStatus
    color: str
    patientsToday: int = Field(ge=0)
    rating: float = Field(ge=0, le=5)
    experienceYears: int = Field(ge=0)


class Appointment(APIModel):
    id: str
    patientId: str
    doctorId: str
    date: str
    time: str
    durationMinutes: int = Field(ge=10, le=120)
    type: VisitType
    reason: str
    status: AppointmentStatus
    notes: str = ""
    createdAt: str


class TriageCase(APIModel):
    id: str
    patientId: str
    severity: int = Field(ge=1, le=5)
    complaint: str
    vitals: Vitals
    arrivalAt: str
    status: TriageStatus
    assignedDoctorId: str | None = None
    notes: str = ""


class ImportRequest(APIModel):
    patients: list[Patient]
    doctors: list[Doctor]
    appointments: list[Appointment]
    triageCases: list[TriageCase]


class ImportResult(APIModel):
    patients: int
    doctors: int
    appointments: int
    triageCases: int


class WorkspaceStatus(APIModel):
    initialized: bool
    integration: str = "Original Python hospital engine + FastAPI workspace"
    storage: str = "JSON file"
    patients: int
    doctors: int
    appointments: int
    triageCases: int
    serverTime: str


class BootstrapResponse(APIModel):
    patients: list[Patient]
    doctors: list[Doctor]
    appointments: list[Appointment]
    triageCases: list[TriageCase]
    status: WorkspaceStatus


class LegacyDonorRequest(APIModel):
    name: str = Field(min_length=2)
    email: str


class LegacyDonationRequest(APIModel):
    patientId: str
    amount: float = Field(gt=0)
    category: str = Field(min_length=2)
    doctorId: str | None = None


class LegacyReportRow(APIModel):
    patientId: str
    name: str
    email: str
    totalVisits: int


class LegacyReportResponse(APIModel):
    rows: list[LegacyReportRow]
    totalPatients: int
    totalVisits: int
    completedVisits: int
