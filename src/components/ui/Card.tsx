import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) { return <div className={cn('glass-panel relative overflow-hidden rounded-2xl', className)} {...props}>{children}</div>; }
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0', className)} {...props} />; }
export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h2 className={cn('text-base font-semibold tracking-tight text-white', className)} {...props} />; }
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('p-5 sm:p-6', className)} {...props} />; }
