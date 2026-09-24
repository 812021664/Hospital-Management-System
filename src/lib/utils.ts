import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Patient, TriageCase } from '@/types';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function uid(prefix = 'id') { return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`; }
export function donorName(patient: Patient) { return `${patient.firstName} ${patient.lastName}`.trim(); }
export function patientName(patient: Patient) { return donorName(patient); }
export function initials(firstName: string, lastName = '') { return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(); }
export function formatCurrency(value: number, compact = false) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: compact ? 'compact' : 'standard' }).format(value); }
export function formatNumber(value: number, compact = false) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: compact ? 1 : 0, notation: compact ? 'compact' : 'standard' }).format(value); }
export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) { return new Intl.DateTimeFormat('en-US', options ?? { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)); }
export function formatDateTime(value: string) { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)); }
export function formatTime(value: string) { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(`2026-01-01T${value}:00`)); }
export function ageFromDate(dateOfBirth: string) { const dob = new Date(dateOfBirth); const now = new Date(); let years = now.getFullYear() - dob.getFullYear(); if (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate())) years -= 1; return years; }
export function dateKey(date = new Date()) { return date.toISOString().slice(0, 10); }
export function minutesSince(value: string) { return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000)); }
export function formatWait(value: string) { const minutes = minutesSince(value); if (minutes < 60) return `${minutes}m`; return `${Math.floor(minutes / 60)}h ${minutes % 60}m`; }
export function percent(value: number, total: number) { return total ? Math.min(100, Math.max(0, (value / total) * 100)) : 0; }
export function trend(current: number, previous: number) { return previous ? ((current - previous) / previous) * 100 : current ? 100 : 0; }
export function toCsv<T extends Record<string, unknown>>(rows: T[]) { if (!rows.length) return ''; const headers = Object.keys(rows[0]); const escape = (value: unknown) => { const normalized = value instanceof Date ? value.toISOString() : String(value ?? ''); return `"${normalized.replace(/"/g, '""')}"`; }; return [headers.map(escape).join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n'); }
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) { const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); }
export function triageSort(cases: TriageCase[]) { return [...cases].filter((item) => item.status === 'Waiting').sort((a, b) => a.severity - b.severity || +new Date(a.arrivalAt) - +new Date(b.arrivalAt)); }
export function severityLabel(severity: number) { return ({ 1: 'Resuscitation', 2: 'Emergent', 3: 'Urgent', 4: 'Standard', 5: 'Non-urgent' } as Record<number, string>)[severity] ?? 'Standard'; }
export function severityColor(severity: number) { return ({ 1: '#ff5c68', 2: '#ff8a65', 3: '#f6c85f', 4: '#4adeb5', 5: '#67e8f9' } as Record<number, string>)[severity] ?? '#67e8f9'; }
