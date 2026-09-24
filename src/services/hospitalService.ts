import { apiClient } from './apiClient';
import type { Appointment, Doctor, Patient, TriageCase } from '@/types';
export interface HospitalStatus { initialized: boolean; integration: string; storage: string; patients: number; doctors: number; appointments: number; triageCases: number; serverTime: string; }
export interface BootstrapResponse { patients: Patient[]; doctors: Doctor[]; appointments: Appointment[]; triageCases: TriageCase[]; status: HospitalStatus; }
export const hospitalService = {
  status: () => apiClient.get<HospitalStatus>('/status'),
  bootstrap: () => apiClient.get<BootstrapResponse>('/bootstrap'),
  importWorkspace: (data: { patients: Patient[]; doctors: Doctor[]; appointments: Appointment[]; triageCases: TriageCase[] }) => apiClient.post('/import', data, { timeout: 30_000 }),
  savePatient: (patient: Patient) => apiClient.put(`/patients/${patient.id}`, patient),
  saveDoctor: (doctor: Doctor) => apiClient.put(`/doctors/${doctor.id}`, doctor),
  saveAppointment: (appointment: Appointment) => apiClient.put(`/appointments/${appointment.id}`, appointment),
  createTriage: (triageCase: TriageCase) => apiClient.post('/triage', triageCase),
  serveNext: () => apiClient.post<TriageCase>('/triage/serve-next'),
  completeTriage: (id: string) => apiClient.post(`/triage/${id}/complete`),
};
