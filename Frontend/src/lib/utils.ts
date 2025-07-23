import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, toZonedTime } from 'date-fns-tz';
import { toast as showToast } from '@/hooks/use-toast';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string in a given timezone.
 * @param date ISO string or Date
 * @param timezone IANA timezone string (e.g., 'America/New_York'). If not provided, uses system tz.
 * @param fmt date-fns format string (default: 'yyyy-MM-dd HH:mm zzz')
 */
export function formatDateWithTimezone(date: string | Date, timezone?: string, fmt = 'yyyy-MM-dd HH:mm zzz') {
  try {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zoned = toZonedTime(date, tz);
    return format(zoned, fmt, { timeZone: tz });
  } catch {
    return String(date);
  }
}

/**
 * Show a toast notification if the user's settings allow it.
 * @param type The notification type (e.g., 'email', 'push', 'homework', 'grades', 'announcements')
 * @param options Toast options (title, description, etc.)
 */
export function notify(type: string, options: { title: string; description?: string; variant?: 'default' | 'destructive' }) {
  try {
    const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
    const enabled = settings?.notifications?.[type];
    if (enabled) {
      showToast(options);
    }
  } catch {
    // fallback: always show
    showToast(options);
  }
}
