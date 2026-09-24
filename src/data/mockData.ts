import type { Activity, Appointment, Doctor, HospitalSettings, Patient, TriageCase } from '@/types';
import { dateKey } from '@/lib/utils';

const dayMs = 86_400_000;
const isoDate = (offset: number) => dateKey(new Date(Date.now() + offset * dayMs));
const isoMinutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export const MOCK_PATIENTS: Patient[] = [
  { id: 'patient-1', mrn: 'MRN-10482', firstName: 'Maya', lastName: 'Chen', dateOfBirth: '1986-04-12', gender: 'Female', phone: '+1 555 0101', email: 'maya.chen@example.org', address: '1820 Harbor Avenue, Oakland', bloodGroup: 'O+', allergies: ['Penicillin'], conditions: ['Asthma'], insuranceProvider: 'Blue Shield', insuranceNumber: 'BS-482901', status: 'Active', registeredAt: isoDate(-420), lastVisit: isoDate(-12), emergencyContact: 'Victor Chen · +1 555 0191', visits: 8 },
  { id: 'patient-2', mrn: 'MRN-10491', firstName: 'James', lastName: 'Wilson', dateOfBirth: '1972-09-03', gender: 'Male', phone: '+1 555 0102', email: 'james.wilson@example.org', address: '74 Cedar Lane, Austin', bloodGroup: 'A+', allergies: [], conditions: ['Hypertension', 'Type 2 diabetes'], insuranceProvider: 'Aetna', insuranceNumber: 'AE-775210', status: 'Admitted', registeredAt: isoDate(-680), lastVisit: isoDate(-1), emergencyContact: 'Nora Wilson · +1 555 0192', visits: 14 },
  { id: 'patient-3', mrn: 'MRN-10507', firstName: 'Amara', lastName: 'Okafor', dateOfBirth: '1994-01-28', gender: 'Female', phone: '+1 555 0103', email: 'amara.okafor@example.org', address: '9 Wren Street, London', bloodGroup: 'B+', allergies: ['Latex'], conditions: [], insuranceProvider: 'UnitedHealthcare', insuranceNumber: 'UH-330182', status: 'Active', registeredAt: isoDate(-190), lastVisit: isoDate(-32), emergencyContact: 'Chidi Okafor · +1 555 0193', visits: 3 },
  { id: 'patient-4', mrn: 'MRN-10512', firstName: 'Theo', lastName: 'Martinez', dateOfBirth: '1965-06-17', gender: 'Male', phone: '+1 555 0104', email: 'theo.martinez@example.org', address: '410 Aspen Road, Denver', bloodGroup: 'O-', allergies: ['Sulfa drugs'], conditions: ['Heart failure'], insuranceProvider: 'Cigna', insuranceNumber: 'CG-663109', status: 'Critical', registeredAt: isoDate(-910), lastVisit: isoDate(0), emergencyContact: 'Lena Martinez · +1 555 0194', visits: 21 },
  { id: 'patient-5', mrn: 'MRN-10538', firstName: 'Sofia', lastName: 'Anders', dateOfBirth: '2001-11-09', gender: 'Female', phone: '+1 555 0105', email: 'sofia.anders@example.org', address: '22 North Street, Copenhagen', bloodGroup: 'AB+', allergies: [], conditions: ['Migraine'], insuranceProvider: 'Novo Health', insuranceNumber: 'NV-901223', status: 'Active', registeredAt: isoDate(-110), lastVisit: isoDate(-8), emergencyContact: 'Lars Anders · +1 555 0195', visits: 4 },
  { id: 'patient-6', mrn: 'MRN-10542', firstName: 'Noah', lastName: 'Williams', dateOfBirth: '1989-07-22', gender: 'Male', phone: '+1 555 0106', email: 'noah.williams@example.org', address: '76 Pine Street, Toronto', bloodGroup: 'A-', allergies: [], conditions: [], insuranceProvider: 'Sun Life', insuranceNumber: 'SL-102938', status: 'Discharged', registeredAt: isoDate(-330), lastVisit: isoDate(-2), emergencyContact: 'Ava Williams · +1 555 0196', visits: 7 },
  { id: 'patient-7', mrn: 'MRN-10555', firstName: 'Priya', lastName: 'Shah', dateOfBirth: '1978-12-14', gender: 'Female', phone: '+1 555 0107', email: 'priya.shah@example.org', address: '511 Lake Drive, Seattle', bloodGroup: 'O+', allergies: ['Iodine contrast'], conditions: ['Hypothyroidism'], insuranceProvider: 'Premera', insuranceNumber: 'PR-441022', status: 'Active', registeredAt: isoDate(-500), lastVisit: isoDate(-20), emergencyContact: 'Rohan Shah · +1 555 0197', visits: 11 },
  { id: 'patient-8', mrn: 'MRN-10561', firstName: 'Liam', lastName: 'Brooks', dateOfBirth: '1958-03-30', gender: 'Male', phone: '+1 555 0108', email: 'liam.brooks@example.org', address: '9 Orchard Way, Portland', bloodGroup: 'B-', allergies: [], conditions: ['COPD', 'Hypertension'], insuranceProvider: 'Medicare', insuranceNumber: 'MC-880143', status: 'Admitted', registeredAt: isoDate(-1200), lastVisit: isoDate(0), emergencyContact: 'June Brooks · +1 555 0198', visits: 28 },
  { id: 'patient-9', mrn: 'MRN-10579', firstName: 'Elena', lastName: 'Rossi', dateOfBirth: '1990-08-16', gender: 'Female', phone: '+1 555 0109', email: 'elena.rossi@example.org', address: '14 Via Roma, Milan', bloodGroup: 'A+', allergies: [], conditions: ['IBS'], insuranceProvider: 'Sanitas', insuranceNumber: 'ST-334902', status: 'Active', registeredAt: isoDate(-240), lastVisit: isoDate(-41), emergencyContact: 'Marco Rossi · +1 555 0199', visits: 5 },
  { id: 'patient-10', mrn: 'MRN-10584', firstName: 'Malik', lastName: 'Johnson', dateOfBirth: '1981-02-11', gender: 'Male', phone: '+1 555 0110', email: 'malik.johnson@example.org', address: '305 Lake Drive, Chicago', bloodGroup: 'O+', allergies: [], conditions: ['Type 1 diabetes'], insuranceProvider: 'Blue Cross', insuranceNumber: 'BC-992018', status: 'Active', registeredAt: isoDate(-610), lastVisit: isoDate(-16), emergencyContact: 'Nia Johnson · +1 555 0200', visits: 13 },
  { id: 'patient-11', mrn: 'MRN-10596', firstName: 'Ava', lastName: 'Thompson', dateOfBirth: '2012-05-19', gender: 'Female', phone: '+1 555 0111', email: 'ava.thompson@example.org', address: '85 Hill Street, Boston', bloodGroup: 'AB-', allergies: ['Peanuts'], conditions: [], insuranceProvider: 'Harvard Pilgrim', insuranceNumber: 'HP-620118', status: 'Active', registeredAt: isoDate(-90), lastVisit: isoDate(-6), emergencyContact: 'Ethan Thompson · +1 555 0201', visits: 2 },
  { id: 'patient-12', mrn: 'MRN-10603', firstName: 'Mateo', lastName: 'Silva', dateOfBirth: '1969-10-02', gender: 'Male', phone: '+1 555 0112', email: 'mateo.silva@example.org', address: '63 Palm Avenue, Miami', bloodGroup: 'B+', allergies: [], conditions: ['High cholesterol'], insuranceProvider: 'Aetna', insuranceNumber: 'AE-220183', status: 'Discharged', registeredAt: isoDate(-740), lastVisit: isoDate(-4), emergencyContact: 'Lucia Silva · +1 555 0202', visits: 17 },
  { id: 'patient-13', mrn: 'MRN-10612', firstName: 'Nora', lastName: 'Lindberg', dateOfBirth: '1997-01-25', gender: 'Female', phone: '+1 555 0113', email: 'nora.lindberg@example.org', address: '18 Fjord Road, Stockholm', bloodGroup: 'O+', allergies: [], conditions: [], insuranceProvider: 'Region Stockholm', insuranceNumber: 'RS-730184', status: 'Active', registeredAt: isoDate(-75), lastVisit: isoDate(-10), emergencyContact: 'Elsa Lindberg · +1 555 0203', visits: 2 },
  { id: 'patient-14', mrn: 'MRN-10627', firstName: 'Owen', lastName: 'Murphy', dateOfBirth: '1983-07-07', gender: 'Male', phone: '+1 555 0114', email: 'owen.murphy@example.org', address: '12 Clinic Row, Dublin', bloodGroup: 'A-', allergies: ['Codeine'], conditions: ['GERD'], insuranceProvider: 'VHI', insuranceNumber: 'VH-820110', status: 'Active', registeredAt: isoDate(-360), lastVisit: isoDate(-24), emergencyContact: 'Ruth Murphy · +1 555 0204', visits: 9 },
  { id: 'patient-15', mrn: 'MRN-10634', firstName: 'Zara', lastName: 'Khan', dateOfBirth: '1993-03-21', gender: 'Female', phone: '+1 555 0115', email: 'zara.khan@example.org', address: '41 Crescent Road, New York', bloodGroup: 'AB+', allergies: [], conditions: ['Anxiety'], insuranceProvider: 'UnitedHealthcare', insuranceNumber: 'UH-110982', status: 'Active', registeredAt: isoDate(-150), lastVisit: isoDate(-19), emergencyContact: 'Imran Khan · +1 555 0205', visits: 5 },
  { id: 'patient-16', mrn: 'MRN-10648', firstName: 'Lucas', lastName: 'Meyer', dateOfBirth: '1975-11-08', gender: 'Male', phone: '+1 555 0116', email: 'lucas.meyer@example.org', address: '70 Linden Street, Berlin', bloodGroup: 'O-', allergies: [], conditions: ['Diabetes'], insuranceProvider: 'TK', insuranceNumber: 'TK-419330', status: 'Admitted', registeredAt: isoDate(-820), lastVisit: isoDate(-1), emergencyContact: 'Anna Meyer · +1 555 0206', visits: 19 },
  { id: 'patient-17', mrn: 'MRN-10651', firstName: 'Grace', lastName: 'Lee', dateOfBirth: '1962-06-05', gender: 'Female', phone: '+1 555 0117', email: 'grace.lee@example.org', address: '34 River Road, Vancouver', bloodGroup: 'B-', allergies: ['Aspirin'], conditions: ['Osteoarthritis'], insuranceProvider: 'BC Health', insuranceNumber: 'BC-552014', status: 'Active', registeredAt: isoDate(-1000), lastVisit: isoDate(-35), emergencyContact: 'Daniel Lee · +1 555 0207', visits: 24 },
  { id: 'patient-18', mrn: 'MRN-10669', firstName: 'Samir', lastName: 'Patel', dateOfBirth: '1988-09-13', gender: 'Male', phone: '+1 555 0118', email: 'samir.patel@example.org', address: '90 Market Street, Atlanta', bloodGroup: 'O+', allergies: [], conditions: ['Lower back pain'], insuranceProvider: 'Kaiser', insuranceNumber: 'KP-382901', status: 'Active', registeredAt: isoDate(-205), lastVisit: isoDate(-14), emergencyContact: 'Nina Patel · +1 555 0208', visits: 4 },
  { id: 'patient-19', mrn: 'MRN-10675', firstName: 'Isla', lastName: 'Campbell', dateOfBirth: '2008-04-03', gender: 'Female', phone: '+1 555 0119', email: 'isla.campbell@example.org', address: '21 Queen Street, Edinburgh', bloodGroup: 'A+', allergies: [], conditions: [], insuranceProvider: 'NHS', insuranceNumber: 'NHS-923014', status: 'Active', registeredAt: isoDate(-45), lastVisit: isoDate(-5), emergencyContact: 'Fiona Campbell · +1 555 0209', visits: 1 },
  { id: 'patient-20', mrn: 'MRN-10682', firstName: 'Ethan', lastName: 'Nguyen', dateOfBirth: '1954-12-29', gender: 'Male', phone: '+1 555 0120', email: 'ethan.nguyen@example.org', address: '310 Bay Street, Houston', bloodGroup: 'B+', allergies: ['Shellfish'], conditions: ['Atrial fibrillation', 'Hypertension'], insuranceProvider: 'Medicare', insuranceNumber: 'MC-110284', status: 'Discharged', registeredAt: isoDate(-1320), lastVisit: isoDate(-3), emergencyContact: 'Linh Nguyen · +1 555 0210', visits: 31 }
];

export const MOCK_DOCTORS: Doctor[] = [
  { id: 'doctor-1', name: 'Dr. Elena Rao', specialization: 'Internal Medicine', department: 'General Medicine', email: 'elena.rao@aegis.health', phone: '+1 555 1001', status: 'Available', color: '#22d3ee', patientsToday: 6, rating: 4.9, experienceYears: 14 },
  { id: 'doctor-2', name: 'Dr. Rohan Mehta', specialization: 'Cardiology', department: 'Cardiology', email: 'rohan.mehta@aegis.health', phone: '+1 555 1002', status: 'In surgery', color: '#ff6f61', patientsToday: 4, rating: 4.8, experienceYears: 18 },
  { id: 'doctor-3', name: 'Dr. Amina Yusuf', specialization: 'Pediatrics', department: 'Pediatrics', email: 'amina.yusuf@aegis.health', phone: '+1 555 1003', status: 'Available', color: '#4adeb5', patientsToday: 7, rating: 5.0, experienceYears: 11 },
  { id: 'doctor-4', name: 'Dr. Daniel Brooks', specialization: 'Orthopedics', department: 'Surgery', email: 'daniel.brooks@aegis.health', phone: '+1 555 1004', status: 'On call', color: '#a78bfa', patientsToday: 3, rating: 4.7, experienceYears: 16 },
  { id: 'doctor-5', name: 'Dr. Sofia Alvarez', specialization: 'Neurology', department: 'Neurology', email: 'sofia.alvarez@aegis.health', phone: '+1 555 1005', status: 'Available', color: '#f6c85f', patientsToday: 5, rating: 4.9, experienceYears: 13 },
  { id: 'doctor-6', name: 'Dr. Jonah Kim', specialization: 'Emergency Medicine', department: 'Emergency', email: 'jonah.kim@aegis.health', phone: '+1 555 1006', status: 'Available', color: '#fb7185', patientsToday: 8, rating: 4.8, experienceYears: 9 },
  { id: 'doctor-7', name: 'Dr. Clara Bennett', specialization: 'Dermatology', department: 'Outpatient', email: 'clara.bennett@aegis.health', phone: '+1 555 1007', status: 'Off duty', color: '#38bdf8', patientsToday: 2, rating: 4.9, experienceYears: 12 },
  { id: 'doctor-8', name: 'Dr. Isaac Mensah', specialization: 'General Surgery', department: 'Surgery', email: 'isaac.mensah@aegis.health', phone: '+1 555 1008', status: 'On call', color: '#c084fc', patientsToday: 4, rating: 4.8, experienceYears: 20 }
];

const reasons = ['Annual wellness review', 'Persistent cough', 'Medication review', 'Post-operative follow-up', 'Recurring headaches', 'Hypertension check', 'Abdominal discomfort', 'Vaccination consultation', 'Knee pain assessment', 'Diabetes follow-up', 'Shortness of breath', 'Skin rash evaluation', 'Cardiac follow-up', 'Pediatric wellness visit', 'Telehealth consultation'];
const appointmentTimes = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
const visitTypes = ['New patient', 'Follow-up', 'Telehealth', 'Procedure'] as const;

export const MOCK_APPOINTMENTS: Appointment[] = Array.from({ length: 36 }, (_, index) => {
  const dateOffset = Math.floor(index / 5) - 3;
  const status = dateOffset < 0 ? 'Completed' : dateOffset > 0 ? 'Scheduled' : (['Checked in', 'In consultation', 'Scheduled', 'Completed', 'Scheduled'][index % 5] as Appointment['status']);
  return {
    id: `appointment-${index + 1}`,
    patientId: `patient-${(index * 7 + 3) % MOCK_PATIENTS.length + 1}`,
    doctorId: `doctor-${(index * 3 + 1) % MOCK_DOCTORS.length + 1}`,
    date: isoDate(dateOffset),
    time: appointmentTimes[index % appointmentTimes.length],
    durationMinutes: [15, 20, 30, 45][index % 4],
    type: visitTypes[index % visitTypes.length],
    reason: reasons[index % reasons.length],
    status,
    notes: index % 6 === 0 ? 'Bring current medication list.' : '',
    createdAt: isoMinutesAgo(1440 + index * 130)
  };
});

export const MOCK_TRIAGE: TriageCase[] = [
  { id: 'triage-1', patientId: 'patient-4', severity: 1, complaint: 'Acute chest pain and difficulty breathing', vitals: { heartRate: 138, systolic: 182, diastolic: 104, temperature: 37.4, oxygenSaturation: 89, respiratoryRate: 29 }, arrivalAt: isoMinutesAgo(4), status: 'Waiting', assignedDoctorId: null, notes: 'Symptoms began 20 minutes ago.' },
  { id: 'triage-2', patientId: 'patient-8', severity: 2, complaint: 'Worsening shortness of breath', vitals: { heartRate: 122, systolic: 168, diastolic: 96, temperature: 37.2, oxygenSaturation: 92, respiratoryRate: 25 }, arrivalAt: isoMinutesAgo(18), status: 'With doctor', assignedDoctorId: 'doctor-6', notes: 'Oxygen started in triage.' },
  { id: 'triage-3', patientId: 'patient-2', severity: 2, complaint: 'Severe abdominal pain with dizziness', vitals: { heartRate: 116, systolic: 148, diastolic: 88, temperature: 38.1, oxygenSaturation: 95, respiratoryRate: 22 }, arrivalAt: isoMinutesAgo(31), status: 'Waiting', assignedDoctorId: null, notes: 'Pain score 8/10.' },
  { id: 'triage-4', patientId: 'patient-7', severity: 3, complaint: 'Persistent migraine with visual changes', vitals: { heartRate: 98, systolic: 142, diastolic: 88, temperature: 36.9, oxygenSaturation: 97, respiratoryRate: 18 }, arrivalAt: isoMinutesAgo(46), status: 'Waiting', assignedDoctorId: null, notes: 'New neurological symptoms.' },
  { id: 'triage-5', patientId: 'patient-14', severity: 4, complaint: 'Reflux and intermittent stomach pain', vitals: { heartRate: 82, systolic: 128, diastolic: 80, temperature: 36.8, oxygenSaturation: 98, respiratoryRate: 16 }, arrivalAt: isoMinutesAgo(62), status: 'Waiting', assignedDoctorId: null, notes: 'No acute distress.' },
  { id: 'triage-6', patientId: 'patient-19', severity: 5, complaint: 'Minor ankle sprain', vitals: { heartRate: 88, systolic: 112, diastolic: 70, temperature: 36.7, oxygenSaturation: 99, respiratoryRate: 16 }, arrivalAt: isoMinutesAgo(74), status: 'Waiting', assignedDoctorId: null, notes: 'Able to bear weight.' }
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'activity-1', type: 'triage', title: 'Critical triage case arrived', description: 'Theo Martinez · Resuscitation priority', timestamp: isoMinutesAgo(4) },
  { id: 'activity-2', type: 'appointment', title: 'Consultation started', description: 'Ava Thompson with Dr. Amina Yusuf', timestamp: isoMinutesAgo(12) },
  { id: 'activity-3', type: 'patient', title: 'Patient checked in', description: 'James Wilson · MRN-10491', timestamp: isoMinutesAgo(19) },
  { id: 'activity-4', type: 'doctor', title: 'Emergency physician on call', description: 'Dr. Jonah Kim is available', timestamp: isoMinutesAgo(38) },
  { id: 'activity-5', type: 'appointment', title: 'Appointment completed', description: 'Noah Williams · Cardiology follow-up', timestamp: isoMinutesAgo(57) },
  { id: 'activity-6', type: 'system', title: 'Morning handover complete', description: 'Night shift summary acknowledged', timestamp: isoMinutesAgo(83) }
];

export const DEFAULT_SETTINGS: HospitalSettings = {
  hospitalName: 'Aegis Community Hospital',
  location: 'Harbor Medical District',
  mission: 'Deliver timely, equitable, human-centered care to every person in our community.',
  emergencyPhone: '+1 555 0100',
  timezone: 'America/Los_Angeles',
  bedCapacity: 184,
  triageTargetMinutes: 20,
  soundAlerts: true,
  autoRefresh: true,
  dailyDigest: true
};
