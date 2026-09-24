export type PatientStatus = 'Active' | 'Admitted' | 'Discharged' | 'Critical';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Female' | 'Male' | 'Non-binary' | 'Prefer not to say';

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  bloodGroup: BloodGroup;
  allergies: string[];
  conditions: string[];
  insuranceProvider: string;
  insuranceNumber: string;
  status: PatientStatus;
  registeredAt: string;
  lastVisit: string | null;
  emergencyContact: string;
  visits: number;
}

export type DoctorStatus = 'Available' | 'In surgery' | 'On call' | 'Off duty';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  email: string;
  phone: string;
  status: DoctorStatus;
  color: string;
  patientsToday: number;
  rating: number;
  experienceYears: number;
}

export type AppointmentStatus = 'Scheduled' | 'Checked in' | 'In consultation' | 'Completed' | 'Cancelled' | 'No show';
export type VisitType = 'New patient' | 'Follow-up' | 'Telehealth' | 'Emergency' | 'Procedure';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  durationMinutes: number;
  type: VisitType;
  reason: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}

export type TriageSeverity = 1 | 2 | 3 | 4 | 5;
export type TriageStatus = 'Waiting' | 'With doctor' | 'Completed' | 'Discharged';

export interface Vitals {
  heartRate: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
}

export interface TriageCase {
  id: string;
  patientId: string;
  severity: TriageSeverity;
  complaint: string;
  vitals: Vitals;
  arrivalAt: string;
  status: TriageStatus;
  assignedDoctorId: string | null;
  notes: string;
}

export interface Activity {
  id: string;
  type: 'appointment' | 'triage' | 'patient' | 'doctor' | 'system';
  title: string;
  description: string;
  timestamp: string;
}

export interface HospitalSettings {
  hospitalName: string;
  location: string;
  mission: string;
  emergencyPhone: string;
  timezone: string;
  bedCapacity: number;
  triageTargetMinutes: number;
  soundAlerts: boolean;
  autoRefresh: boolean;
  dailyDigest: boolean;
}

export interface AppUser {
  name: string;
  role: 'Administrator' | 'Physician' | 'Triage coordinator' | 'Receptionist';
  email: string;
}
