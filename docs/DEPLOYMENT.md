# Deployment Guide

## Frontend

```bash
npm ci
npm run type-check
npm run lint
npm test
npm run build
```

Publish `dist/` to Netlify, Vercel, or another static host. SPA history fallback is configured in `netlify.toml`, `vercel.json`, and `public/_redirects`.

## API

```bash
python -m pip install -r requirements.txt
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

Or:

```bash
docker compose up --build
```

The service stores demonstration records in `backend/data/hospital.json`. Mount that directory as a persistent volume for the demo deployment.

## Environment

Frontend:

```env
VITE_API_BASE_URL=https://api.example.org
VITE_ENVIRONMENT=production
```

API:

```env
APP_ALLOWED_ORIGINS=https://aarogya.example.org
```

Never put secrets in `VITE_*` variables.

## Production readiness

Before real clinical use:

- Add OIDC/SAML authentication and MFA.
- Enforce server-side roles and least-privilege access.
- Replace JSON with an encrypted compliant database.
- Add immutable audit logs and access-event monitoring.
- Add backups, disaster recovery, rate limits, and observability.
- Establish consent, retention, correction, and deletion workflows.
- Complete privacy, threat-model, penetration, and regulatory reviews.
- Validate accessibility, disaster procedures, and clinical workflows with professionals.
