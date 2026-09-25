import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, MOCK_DOCTORS, MOCK_PATIENTS } from './mockData';

describe('Indian demonstration dataset', () => {
  it('uses unique MRNs and Indian mobile numbers', () => {
    expect(new Set(MOCK_PATIENTS.map((patient) => patient.mrn)).size).toBe(MOCK_PATIENTS.length);
    expect(MOCK_PATIENTS.every((patient) => patient.phone.startsWith('+91 '))).toBe(true);
    expect(MOCK_PATIENTS.every((patient) => patient.emergencyContact.includes('+91 '))).toBe(true);
  });

  it('keeps all patient email addresses synthetic', () => {
    expect(MOCK_PATIENTS.every((patient) => patient.email.endsWith('@example.in'))).toBe(true);
  });

  it('uses Indian clinician contact details', () => {
    expect(MOCK_DOCTORS.every((doctor) => doctor.phone.startsWith('+91 '))).toBe(true);
    expect(MOCK_DOCTORS.every((doctor) => doctor.email.endsWith('@aarogya.example'))).toBe(true);
  });

  it('configures the hospital for India', () => {
    expect(DEFAULT_SETTINGS.hospitalName).toBe('Aarogya Community Hospital');
    expect(DEFAULT_SETTINGS.location).toContain('Pune, Maharashtra');
    expect(DEFAULT_SETTINGS.timezone).toBe('Asia/Kolkata');
    expect(DEFAULT_SETTINGS.emergencyPhone).toBe('108');
  });
});
