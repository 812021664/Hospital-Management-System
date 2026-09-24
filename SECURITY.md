# Security and Clinical Data Safety

Aegis is a demonstration and educational system. It is not a certified medical device, electronic health record, or production clinical platform.

## Before handling real patient data

- Replace JSON persistence with an encrypted, access-controlled clinical database.
- Add server-enforced authentication, MFA, role-based authorization, and session expiry.
- Use TLS for every API, database, and identity-provider connection.
- Add immutable audit logs for patient access, record changes, exports, and triage decisions.
- Implement consent, retention, correction, and deletion workflows appropriate to the jurisdiction.
- Never expose protected health information in client logs, analytics, error traces, or AI prompts.
- Add rate limiting, request validation, malware scanning, and backup recovery testing.
- Complete threat modeling, privacy review, penetration testing, and compliance validation.

## Secrets

Never place service credentials, database passwords, or provider tokens in a `VITE_*` environment variable. Vite variables are embedded in the browser bundle.

## Exports

CSV and JSON files can contain protected health information. Apply least-privilege access, encryption in transit and at rest, and approved retention policies.
