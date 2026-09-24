import { describe, expect, it } from 'vitest';
import { severityLabel, toCsv, triageSort } from './utils';
import type { TriageCase } from '@/types';
function triage(id: string, severity: number, arrivalAt: string, status: TriageCase['status'] = 'Waiting'): TriageCase {
  return { id, patientId: id, severity: severity as 1 | 2 | 3 | 4 | 5, complaint: 'Test', vitals: { heartRate: 80, systolic: 120, diastolic: 80, temperature: 37, oxygenSaturation: 98, respiratoryRate: 16 }, arrivalAt, status, assignedDoctorId: null, notes: '' };
}
describe('hospital utilities', () => {
  it('orders triage by severity then arrival time', () => {
    const cases = [triage('routine', 4, '2026-01-01T09:00:00Z'), triage('late-critical', 1, '2026-01-01T10:00:00Z'), triage('early-critical', 1, '2026-01-01T08:00:00Z')];
    expect(triageSort(cases).map((item) => item.id)).toEqual(['early-critical', 'late-critical', 'routine']);
  });
  it('excludes cases that are no longer waiting', () => {
    expect(triageSort([triage('done', 1, '2026-01-01T08:00:00Z', 'Completed')])).toHaveLength(0);
  });
  it('provides emergency severity labels', () => {
    expect(severityLabel(1)).toBe('Resuscitation');
    expect(severityLabel(5)).toBe('Non-urgent');
  });
  it('escapes exported CSV values', () => {
    expect(toCsv([{ complaint: 'Pain, "severe"' }])).toContain('"Pain, ""severe"""');
  });
});
