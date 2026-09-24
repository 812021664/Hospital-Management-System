import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'emergency';
type Size = 'sm' | 'md' | 'lg' | 'icon';
const variants: Record<Variant, string> = { primary: 'bg-clinical-400 text-[#041317] shadow-[0_8px_26px_rgba(34,211,238,.16)] hover:bg-clinical-300', secondary: 'border border-white/[0.09] bg-white/[0.05] text-white/80 hover:bg-white/[0.08] hover:text-white', ghost: 'text-white/50 hover:bg-white/[0.05] hover:text-white', danger: 'border border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/15', emergency: 'bg-coral text-white shadow-[0_8px_24px_rgba(255,111,97,.18)] hover:bg-[#ff8377]' };
const sizes: Record<Size, string> = { sm: 'h-8 rounded-lg px-3 text-xs', md: 'h-10 rounded-xl px-4 text-sm', lg: 'h-12 rounded-xl px-5 text-sm', icon: 'h-10 w-10 rounded-xl' };

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }>(function Button({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) {
  return <button ref={ref} className={cn('inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-45', variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}{children}</button>;
});
