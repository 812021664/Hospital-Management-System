# Deployment Guide

## Frontend

```bash
npm ci
npm run type-check
npm run lint
npm test
npm run build
```

The repository is configured for Netlify with:

```text
Build command: npm run build
Publish directory: dist
Node version: 20, pinned by `netlify.toml` and `.nvmrc`
```

The intended public Netlify URL is:

```text
https://imaginative-churros-ee9ad0.netlify.app
```

For automatic deployment, connect that Netlify site to `812021664/Hospital-Management-System` and use the repository root as the base directory. For a manual production deploy, install and authenticate the Netlify CLI, link the site, and run `npx netlify-cli deploy --build --prod`.

SPA history fallback, long-lived asset caching, and security headers are configured in `netlify.toml`. Equivalent routing configuration is also present in `vercel.json` and `public/_redirects`.

A static Netlify deployment has no FastAPI process. Leave `VITE_API_BASE_URL` empty to use persisted browser data, or set it to an independently deployed HTTPS API origin to enable remote synchronization.

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
