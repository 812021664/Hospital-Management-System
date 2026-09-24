import { create } from 'zustand';
import { uid } from '@/lib/utils';

export type DataMode = 'local' | 'syncing' | 'connected' | 'offline';
export type ToastKind = 'success' | 'info' | 'error';
export interface ToastMessage { id: string; title: string; description?: string; kind: ToastKind }

interface UIState {
  mobileNavOpen: boolean;
  triageModalOpen: boolean;
  appointmentModalOpen: boolean;
  patientModalOpen: boolean;
  globalSearchOpen: boolean;
  notificationsOpen: boolean;
  dataMode: DataMode;
  backendStatus: { storage: string; patients: number; appointments: number; lastSyncedAt: string | null } | null;
  syncNow: () => void;
  toasts: ToastMessage[];
  setMobileNavOpen: (open: boolean) => void;
  setTriageModalOpen: (open: boolean) => void;
  setAppointmentModalOpen: (open: boolean) => void;
  setPatientModalOpen: (open: boolean) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setDataMode: (mode: DataMode) => void;
  setBackendStatus: (status: UIState['backendStatus']) => void;
  setSyncNow: (sync: () => void) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false, triageModalOpen: false, appointmentModalOpen: false, patientModalOpen: false, globalSearchOpen: false, notificationsOpen: false, dataMode: 'local', backendStatus: null, syncNow: () => undefined, toasts: [],
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setTriageModalOpen: (triageModalOpen) => set({ triageModalOpen }),
  setAppointmentModalOpen: (appointmentModalOpen) => set({ appointmentModalOpen }),
  setPatientModalOpen: (patientModalOpen) => set({ patientModalOpen }),
  setGlobalSearchOpen: (globalSearchOpen) => set({ globalSearchOpen }),
  setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
  setDataMode: (dataMode) => set({ dataMode }),
  setBackendStatus: (backendStatus) => set({ backendStatus }),
  setSyncNow: (syncNow) => set({ syncNow }),
  addToast: (toast) => set((state) => ({ toasts: [...state.toasts, { ...toast, id: uid('toast') }] })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
