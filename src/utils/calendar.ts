import { ScheduleItem } from '../types';

/**
 * Generates a direct Google Calendar web event URL
 */
export function generateGCalUrl(item: ScheduleItem): string {
  const title = encodeURIComponent(item.text);
  const cleanDate = item.date.replace(/-/g, '');
  const [hours, minutes] = item.time.split(':');
  
  // Default to 45 min duration
  const startHourNum = parseInt(hours, 10) || 9;
  const startMinNum = parseInt(minutes, 10) || 0;
  
  const startHoursStr = String(startHourNum).padStart(2, '0');
  const startMinStr = String(startMinNum).padStart(2, '0');
  const startISO = `${cleanDate}T${startHoursStr}${startMinStr}00`;

  let endHourNum = startHourNum;
  let endMinNum = startMinNum + 45;
  if (endMinNum >= 60) {
    endHourNum = (endHourNum + Math.floor(endMinNum / 60)) % 24;
    endMinNum = endMinNum % 60;
  }
  const endHoursStr = String(endHourNum).padStart(2, '0');
  const endMinStr = String(endMinNum).padStart(2, '0');
  const endISO = `${cleanDate}T${endHoursStr}${endMinStr}00`;

  const detailsArr = [`Scheduled via Mompreneur Life OS [Context: ${item.mode.toUpperCase()}]`];
  if (item.assignee) detailsArr.push(`Assignee: ${item.assignee}`);
  if (item.prepList && item.prepList.length > 0) {
    detailsArr.push('Prep List:');
    item.prepList.forEach((p) => detailsArr.push(`- [${p.done ? 'x' : ' '}] ${p.text}`));
  }
  const details = encodeURIComponent(detailsArr.join('\n'));
  const locationParam = item.location ? `&location=${encodeURIComponent(item.location)}` : '';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}${locationParam}`;
}

export function getDirectionsUrl(location: string, mapLink?: string): string {
  if (mapLink && (mapLink.startsWith('http://') || mapLink.startsWith('https://'))) {
    return mapLink;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Checks whether an item should appear on targetDateStr (YYYY-MM-DD)
 * Takes recurrence rule into account
 */
export function isItemActiveOnDate(
  item: { date: string; recurrence?: { frequency: string; dayOfWeek?: number; dayOfMonth?: number } },
  targetDateStr: string
): boolean {
  if (item.date === targetDateStr) return true;
  if (!item.recurrence || item.recurrence.frequency === 'none') return false;

  const targetDate = new Date(`${targetDateStr}T12:00:00`);
  if (isNaN(targetDate.getTime())) return item.date === targetDateStr;

  const itemDate = new Date(`${item.date}T12:00:00`);
  // If item start date is in the future compared to target date, don't show
  if (targetDate < itemDate && item.date !== targetDateStr) return false;

  if (item.recurrence.frequency === 'daily') {
    return true;
  }

  if (item.recurrence.frequency === 'weekly') {
    const targetDayOfWeek = targetDate.getDay();
    if (typeof item.recurrence.dayOfWeek === 'number') {
      return item.recurrence.dayOfWeek === targetDayOfWeek;
    }
    // Default to the original item date's day of week
    return itemDate.getDay() === targetDayOfWeek;
  }

  if (item.recurrence.frequency === 'monthly') {
    const targetDayOfMonth = targetDate.getDate();
    if (typeof item.recurrence.dayOfMonth === 'number') {
      return item.recurrence.dayOfMonth === targetDayOfMonth;
    }
    return itemDate.getDate() === targetDayOfMonth;
  }

  return false;
}


export function formatDisplayTime(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const symbols: Record<string, string> = {
    ZAR: 'R ',
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
  };
  const sym = symbols[currencyCode] || `${currencyCode} `;
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
