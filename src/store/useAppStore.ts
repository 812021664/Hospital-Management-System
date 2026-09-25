import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS, MOCK_ACTIVITIES, MOCK_APPOINTMENTS, MOCK_DOCTORS, MOCK_PATIENTS, MOCK_TRIAGE } from '@/data/mockData';
import { triageSort, uid } from '@/lib/utils';
import type { Activity, Appointment, Doctor, HospitalSettings, Patient, TriageCase } from '@/types';

export type NewPatient = Pick<Patient, 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'phone' | 'email' | 'address' | 'bloodGroup' | 'allergies' | 'conditions' | 'insuranceProvider' | 'insuranceNumber' | 'emergencyContact'>;
export type NewAppointment = Pick<Appointment, 'patientId' | 'doctorId' | 'date' | 'time' | 'durationMinutes' | 'type' | 'reason' | 'notes'>;
export type NewTriageCase = Pick<TriageCase, 'patientId' | 'severity' | 'complaint' | 'vitals' | 'notes'>;
export type NewDoctor = Pick<Doctor, 'name' | 'specialization' | 'department' | 'email' | 'phone'>;

interface AppState {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  triageCases: TriageCase[];
  activities: Activity[];
  settings: HospitalSettings;
  addPatient: (input: NewPatient) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addAppointment: (input: NewAppointment) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  addDoctor: (input: NewDoctor) => Doctor;
  addTriageCase: (input: NewTriageCase) => TriageCase;
  serveNextTriage: () => TriageCase | null;
  completeTriage: (id: string) => void;
  updateSettings: (updates: Partial<HospitalSettings>) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  replaceData: (data: Pick<AppState, 'patients' | 'doctors' | 'appointments' | 'triageCases'>) => void;
  resetDemo: () => void;
}

const clone = <T,>(value: T): T => structuredClone(value);
const initial = { patients: clone(MOCK_PATIENTS), doctors: clone(MOCK_DOCTORS), appointments: clone(MOCK_APPOINTMENTS), triageCases: clone(MOCK_TRIAGE), activities: clone(MOCK_ACTIVITIES), settings: clone(DEFAULT_SETTINGS) };

export const useAppStore = create<AppState>()(persist((set, get) => ({
  ...initial,
  addPatient: (input) => {
    const now = new Date().toISOString();
    const patient: Patient = { ...input, id: uid('patient'), mrn: `MRN-${Math.floor(10000 + Math.random() * 89999)}`, status: 'Active', registeredAt: now, lastVisit: null, visits: 0 };
    set((state) => ({ patients: [patient, ...state.patients], activities: [{ id: uid('activity'), type: 'patient', title: 'New patient registered', description: `${patient.firstName} ${patient.lastName} · ${patient.mrn}`, timestamp: now }, ...state.activities] }));
    return patient;
  },
  updatePatient: (id, updates) => set((state) => ({ patients: state.patients.map((item) => item.id === id ? { ...item, ...updates } : item) })),
  addAppointment: (input) => {
    const appointment: Appointment = { ...input, id: uid('appointment'), status: 'Scheduled', createdAt: new Date().toISOString() };
    set((state) => ({ appointments: [appointment, ...state.appointments], doctors: state.doctors.map((doctor) => doctor.id === appointment.doctorId ? { ...doctor, patientsToday: doctor.patientsToday + 1 } : doctor), activities: [{ id: uid('activity'), type: 'appointment', title: 'Appointment booked', description: `${appointment.reason} · ${appointment.time}`, timestamp: new Date().toISOString() }, ...state.activities] }));
    return appointment;
  },
  updateAppointment: (id, updates) => set((state) => ({ appointments: state.appointments.map((item) => item.id === id ? { ...item, ...updates } : item) })),
  addDoctor: (input) => {
    const doctor: Doctor = { ...input, id: uid('doctor'), status: 'Available', color: '#22d3ee', patientsToday: 0, rating: 5, experienceYears: 0 };
    set((state) => ({ doctors: [...state.doctors, doctor], activities: [{ id: uid('activity'), type: 'doctor', title: 'Clinical team updated', description: `${doctor.name} joined ${doctor.department}`, timestamp: new Date().toISOString() }, ...state.activities] }));
    return doctor;
  },
  addTriageCase: (input) => {
    const triageCase: TriageCase = { ...input, id: uid('triage'), arrivalAt: new Date().toISOString(), status: 'Waiting', assignedDoctorId: null };
    set((state) => ({ triageCases: [triageCase, ...state.triageCases], activities: [{ id: uid('activity'), type: 'triage', title: `Triage level ${triageCase.severity} case arrived`, description: triageCase.complaint, timestamp: triageCase.arrivalAt }, ...state.activities] }));
    return triageCase;
  },
  serveNextTriage: () => {
    const next = triageSort(get().triageCases)[0];
    if (!next) return null;
    const doctor = get().doctors.find((item) => ['Available', 'On call'].includes(item.status) && ['Emergency', 'General Medicine', 'Cardiology'].includes(item.department)) ?? get().doctors.find((item) => item.status === 'Available');
    const now = new Date().toISOString();
    set((state) => ({ triageCases: state.triageCases.map((item) => item.id === next.id ? { ...item, status: 'With doctor', assignedDoctorId: doctor?.id ?? null } : item), activities: doctor ? [{ id: uid('activity'), type: 'triage', title: 'Triage case assigned', description: `${doctor.name} is seeing the next patient`, timestamp: now }, ...state.activities] : state.activities }));
    return doctor ? { ...next, status: 'With doctor', assignedDoctorId: doctor.id } : { ...next, status: 'With doctor' };
  },
  completeTriage: (id) => {
    const triageCase = get().triageCases.find((item) => item.id === id);
    if (!triageCase) return;
    const now = new Date().toISOString();
    set((state) => ({ triageCases: state.triageCases.map((item) => item.id === id ? { ...item, status: 'Completed' } : item), patients: state.patients.map((item) => item.id === triageCase.patientId ? { ...item, status: triageCase.severity <= 2 ? 'Admitted' : 'Active', lastVisit: now, visits: item.visits + 1 } : item), activities: [{ id: uid('activity'), type: 'triage', title: 'Triage encounter completed', description: `Patient record updated after level ${triageCase.severity} care`, timestamp: now }, ...state.activities] }));
  },
  updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
  addActivity: (activity) => set((state) => ({ activities: [{ ...activity, id: uid('activity'), timestamp: new Date().toISOString() }, ...state.activities] })),
  replaceData: (data) => set(data),
  resetDemo: () => set({ ...clone(initial) })
}), { name: 'aarogya-hospital-data', version: 1 }));
