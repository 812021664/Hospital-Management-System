import { useCallback, useEffect, useRef } from 'react';
import { isApiConfigured } from '@/services/apiClient';
import { hospitalService } from '@/services/hospitalService';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';

export function useBackendSync() {
  const patients = useAppStore((state) => state.patients); const doctors = useAppStore((state) => state.doctors); const appointments = useAppStore((state) => state.appointments); const triageCases = useAppStore((state) => state.triageCases); const replaceData = useAppStore((state) => state.replaceData); const setMode = useUIStore((state) => state.setDataMode); const setStatus = useUIStore((state) => state.setBackendStatus); const setSyncNow = useUIStore((state) => state.setSyncNow); const started = useRef(false);
  const sync = useCallback(async () => { if (!isApiConfigured) { setMode('local'); setStatus(null); return; } setMode('syncing'); try { await hospitalService.status(); await hospitalService.importWorkspace({ patients, doctors, appointments, triageCases }); const { data } = await hospitalService.bootstrap(); replaceData({ patients: data.patients, doctors: data.doctors, appointments: data.appointments, triageCases: data.triageCases }); setStatus({ storage: data.status.storage, patients: data.status.patients, appointments: data.status.appointments, lastSyncedAt: new Date().toISOString() }); setMode('connected'); } catch { setMode('offline'); setStatus(null); } }, [patients, doctors, appointments, triageCases, replaceData, setMode, setStatus]);
  useEffect(() => { setSyncNow(() => { void sync(); }); if (started.current) return; started.current = true; void sync(); }, [setSyncNow, sync]);
  useEffect(() => () => setSyncNow(() => undefined), [setSyncNow]);
  return sync;
}
