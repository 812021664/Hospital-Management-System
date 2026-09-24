from fastapi.testclient import TestClient
from backend.app.data_store import store
from backend.app.main import app


def sample_workspace() -> dict:
    return {
        "patients": [
            {
                "id": "patient-test", "mrn": "MRN-TEST", "firstName": "Maya", "lastName": "Chen",
                "dateOfBirth": "1986-04-12", "gender": "Female", "phone": "+1 555 0101",
                "email": "maya@example.org", "address": "1 Oak Street", "bloodGroup": "O+",
                "allergies": [], "conditions": ["Asthma"], "insuranceProvider": "Example Health",
                "insuranceNumber": "INS-1", "status": "Active", "registeredAt": "2026-01-01T00:00:00Z",
                "lastVisit": None, "emergencyContact": "Victor Chen", "visits": 0,
            }
        ],
        "doctors": [
            {
                "id": "doctor-test", "name": "Dr. Elena Rao", "specialization": "Emergency Medicine",
                "department": "Emergency", "email": "elena@example.org", "phone": "+1 555 1000",
                "status": "Available", "color": "#22d3ee", "patientsToday": 0, "rating": 5.0,
                "experienceYears": 12,
            }
        ],
        "appointments": [
            {
                "id": "appointment-test", "patientId": "patient-test", "doctorId": "doctor-test",
                "date": "2026-09-25", "time": "09:00", "durationMinutes": 30, "type": "Follow-up",
                "reason": "Asthma review", "status": "Scheduled", "notes": "", "createdAt": "2026-09-24T09:00:00Z",
            }
        ],
        "triageCases": [
            {
                "id": "triage-test", "patientId": "patient-test", "severity": 2,
                "complaint": "Shortness of breath", "vitals": {"heartRate": 110, "systolic": 150,
                "diastolic": 90, "temperature": 37.1, "oxygenSaturation": 93, "respiratoryRate": 22},
                "arrivalAt": "2026-09-25T09:10:00Z", "status": "Waiting", "assignedDoctorId": None, "notes": "",
            }
        ],
    }


def test_bootstrap_import_and_triage_preemption(tmp_path, monkeypatch):
    monkeypatch.setattr(store, "path", tmp_path / "hospital.json")
    store.reset()
    client = TestClient(app)

    status_response = client.get("/api/status")
    assert status_response.status_code == 200
    assert status_response.json()["initialized"] is False

    import_response = client.post("/api/import", json=sample_workspace())
    assert import_response.status_code == 200
    assert import_response.json()["patients"] == 1

    bootstrap = client.get("/api/bootstrap").json()
    assert len(bootstrap["patients"]) == 1
    assert bootstrap["status"]["initialized"] is True

    served = client.post("/api/triage/serve-next")
    assert served.status_code == 200
    assert served.json()["severity"] == 2
    assert served.json()["assignedDoctorId"] == "doctor-test"

    completed = client.post("/api/triage/triage-test/complete")
    assert completed.status_code == 200
    assert completed.json()["status"] == "Completed"
    patient = client.get("/api/patients").json()[0]
    assert patient["status"] == "Admitted"
    assert patient["visits"] == 1

    report = client.get("/api/legacy/reports")
    assert report.status_code == 200
    assert report.json()["totalPatients"] == 1
    assert report.json()["totalVisits"] == 1


def test_rejects_conflicting_appointment(tmp_path, monkeypatch):
    monkeypatch.setattr(store, "path", tmp_path / "conflict.json")
    store.reset()
    client = TestClient(app)
    workspace = sample_workspace()
    client.post("/api/import", json=workspace)
    duplicate = dict(workspace["appointments"][0])
    duplicate["id"] = "appointment-conflict"
    response = client.put("/api/appointments/appointment-conflict", json=duplicate)
    assert response.status_code == 409
