from __future__ import annotations

import os
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .data_store import store
from .models import (
    Appointment,
    BootstrapResponse,
    Doctor,
    ImportRequest,
    ImportResult,
    LegacyReportResponse,
    Patient,
    TriageCase,
    WorkspaceStatus,
)

app = FastAPI(
    title="Aarogya Health API",
    version="2.0.0",
    description="Appointment, patient, clinician, and severity-first triage management.",
)
origins = [
    origin.strip()
    for origin in os.getenv("APP_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)


@app.get("/health", tags=["system"])
@app.get("/api/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "UP", "service": "aarogya-health-api"}


@app.get("/api/status", response_model=WorkspaceStatus, tags=["workspace"])
def workspace_status() -> WorkspaceStatus:
    return store.status()


@app.get("/api/bootstrap", response_model=BootstrapResponse, tags=["workspace"])
def bootstrap() -> BootstrapResponse:
    return store.bootstrap()


@app.post("/api/import", response_model=ImportResult, tags=["workspace"])
def import_workspace(request: ImportRequest) -> ImportResult:
    return store.import_workspace(request)


@app.post("/api/reset", status_code=status.HTTP_200_OK, tags=["workspace"])
def reset_workspace() -> dict[str, bool]:
    store.reset()
    return {"reset": True}


@app.get("/api/patients", response_model=list[Patient], tags=["patients"])
def list_patients() -> list[Patient]:
    return store.list_patients()


@app.put("/api/patients/{patient_id}", response_model=Patient, tags=["patients"])
def save_patient(patient_id: str, patient: Patient) -> Patient:
    if patient.id != patient_id:
        raise HTTPException(status_code=409, detail="Patient id in URL and body must match")
    return store.save_patient(patient)


@app.get("/api/doctors", response_model=list[Doctor], tags=["doctors"])
def list_doctors() -> list[Doctor]:
    return store.list_doctors()


@app.put("/api/doctors/{doctor_id}", response_model=Doctor, tags=["doctors"])
def save_doctor(doctor_id: str, doctor: Doctor) -> Doctor:
    if doctor.id != doctor_id:
        raise HTTPException(status_code=409, detail="Doctor id in URL and body must match")
    return store.save_doctor(doctor)


@app.get("/api/appointments", response_model=list[Appointment], tags=["appointments"])
def list_appointments() -> list[Appointment]:
    return store.list_appointments()


@app.put("/api/appointments/{appointment_id}", response_model=Appointment, tags=["appointments"])
def save_appointment(appointment_id: str, appointment: Appointment) -> Appointment:
    if appointment.id != appointment_id:
        raise HTTPException(status_code=409, detail="Appointment id in URL and body must match")
    try:
        return store.save_appointment(appointment)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@app.get("/api/triage", response_model=list[TriageCase], tags=["triage"])
def list_triage() -> list[TriageCase]:
    return store.list_triage()


@app.post("/api/triage", response_model=TriageCase, status_code=status.HTTP_201_CREATED, tags=["triage"])
def create_triage(triage_case: TriageCase) -> TriageCase:
    try:
        return store.create_triage(triage_case)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.post("/api/triage/serve-next", response_model=TriageCase | None, tags=["triage"])
def serve_next() -> TriageCase | None:
    return store.serve_next()


@app.post("/api/triage/{triage_id}/complete", response_model=TriageCase, tags=["triage"])
def complete_triage(triage_id: str) -> TriageCase:
    try:
        return store.complete_triage(triage_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get("/api/legacy/reports", response_model=LegacyReportResponse, tags=["legacy"])
def legacy_report() -> LegacyReportResponse:
    return store.legacy_report()


@app.exception_handler(ValueError)
async def value_error_handler(_: Request, error: ValueError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(error), "type": "validation_error"})
