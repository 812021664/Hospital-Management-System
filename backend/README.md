# Aegis Health API

FastAPI service for the upgraded hospital management system. It preserves the original Python circular queue, min-heap triage, linked schedules, patient hash index, undo stack, and reports while adding validated REST endpoints and persistent workspace data.

## Run

```bash
python -m pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

API documentation is available at `http://localhost:8000/docs`.

## Test

```bash
python -m pytest -q
```

## Endpoints

- `GET /api/health`
- `GET /api/status`
- `GET /api/bootstrap`
- `POST /api/import`
- `GET/PUT /api/patients/{id}`
- `GET/PUT /api/appointments/{id}`
- `GET/POST /api/triage`
- `POST /api/triage/serve-next`
- `POST /api/triage/{id}/complete`
- `GET /api/legacy/reports`

Development records persist to `backend/data/hospital.json`. Replace the store with an encrypted clinical database and authenticated gateway before production use.
