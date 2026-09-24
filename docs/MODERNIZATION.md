# Modernization Notes

## Upstream baseline

The original repository at commit `8b8ce9cfdc6962d50d9043a375d7db0e46051e55` contained a Python console implementation with circular appointment storage, min-heap triage, linked schedules, a patient dictionary, undo operations, reports, and five tests.

## Preserved algorithms

The upgraded `backend/app/domain/hospital_system.py` retains each data structure and its expected complexity:

- Circular queue for routine appointments: O(1) enqueue, dequeue, and peek.
- Min-heap with sequence counter for severity priority and FIFO tie-breaking: O(log n).
- Singly linked schedule with slot map: O(1) lookup and O(k) next-free search.
- Patient hash index: expected O(1) lookup and upsert.
- Undo stack: O(1) push/pop with operation-specific restoration.

## Correctness updates

- The original test imported `src.hospital_system`, although the file was at repository root. The compatibility module now imports the maintained engine from `hospital_system.py`.
- Undoing a served triage case no longer restores it at severity zero. Exact severity is retained in `Token.severity` and `severity_by_token`.
- Queue reconstruction is isolated in explicit `snapshot` and `replace` operations.
- Missing patients and invalid severity values now fail immediately.
- Undo operations are covered by regression tests.

## Product expansion

The algorithms are now consumed through a typed FastAPI boundary and a React clinical workspace covering patient records, scheduling, triage, clinical staff, analytics, exports, and settings. The API persists the demonstration workspace atomically and the browser retains an offline operational fallback.

## Production boundary

The JSON store is intentionally a demonstration adapter. A real clinical deployment requires a compliant database, identity provider, role enforcement, consent, audit events, encryption, backups, monitoring, and regulatory review.
