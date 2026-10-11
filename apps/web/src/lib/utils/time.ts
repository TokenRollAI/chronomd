// Timezone-aware date helpers for the stream.
// The timezone comes from site settings so SSR (Workers run in UTC) and the
// client render the same day groups and avoid hydration mismatches.

function safeZone(timeZone?: string): string {
  if (!timeZone) return 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return timeZone;
  } catch {
    return 'UTC';
  }
}

function parts(iso: string, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23'
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(new Date(iso))) map[p.type] = p.value;
  return map;
}

const WEEKDAYS: Record<string, string> = {
  Sun: '周日', Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六'
};

export interface DayGroup<T> {
  key: string;
  label: string;
  weekday: string;
  items: T[];
}

/** Group items (already sorted desc) by calendar day in the given timezone. */
export function groupByDay<T extends { published_at: string }>(items: T[], timeZone?: string): DayGroup<T>[] {
  const tz = safeZone(timeZone);
  const thisYear = parts(new Date().toISOString(), tz).year;
  const groups: DayGroup<T>[] = [];

  for (const item of items) {
    const p = parts(item.published_at, tz);
    const key = `${p.year}-${p.month}-${p.day}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
      continue;
    }
    const md = `${Number(p.month)}月${Number(p.day)}日`;
    groups.push({
      key,
      label: p.year === thisYear ? md : `${p.year}年${md}`,
      weekday: WEEKDAYS[p.weekday] || '',
      items: [item]
    });
  }
  return groups;
}

/** "21:40" */
export function timeOfDay(iso: string, timeZone?: string): string {
  const p = parts(iso, safeZone(timeZone));
  return `${p.hour}:${p.minute}`;
}

/** "2026年10月5日 周日 · 14:20" */
export function fullDateTime(iso: string, timeZone?: string): string {
  const p = parts(iso, safeZone(timeZone));
  return `${p.year}年${Number(p.month)}月${Number(p.day)}日 ${WEEKDAYS[p.weekday] || ''} · ${p.hour}:${p.minute}`;
}
