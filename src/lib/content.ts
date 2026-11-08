import { getCollection, type CollectionEntry } from 'astro:content';

type Draftable = { data: { draft: boolean } };

/** Drafts show in `astro dev` only. */
const isPublished = ({ data }: Draftable) => import.meta.env.DEV || !data.draft;

const newestFirst = (a: Date, b: Date) => b.getTime() - a.getTime();

export async function getNotes() {
  const notes = await getCollection('notes', isPublished);
  return notes.sort((a, b) => newestFirst(a.data.date, b.data.date));
}

export async function getProjects() {
  const projects = await getCollection('projects', isPublished);
  return projects.sort((a, b) =>
    newestFirst(a.data.ended ?? a.data.started, b.data.ended ?? b.data.started),
  );
}

/** Every revision of /now, newest first. The first one is the live page. */
export async function getNowRevisions() {
  const revisions = await getCollection('now', isPublished);
  return revisions.sort((a, b) => newestFirst(a.data.date, b.data.date));
}

/* ---------- Site data lists ---------- */

type ListCollection = 'spec' | 'statusRows' | 'changelog' | 'config' | 'ports';

/** The ordered `items` from a src/data list. Each collection has exactly one entry. */
export async function getList<C extends ListCollection>(collection: C) {
  const [entry] = await getCollection(collection);
  if (!entry) throw new Error(`src/data list for "${collection}" is missing.`);
  return entry.data.items as CollectionEntry<C>['data']['items'];
}

/* ---------- Home log ---------- */

export type LogEntry = {
  date: Date;
  kind: 'NOTE' | 'PROJECT' | 'NOW';
  title: string;
  href: string;
};

export async function getLog(limit = 5): Promise<LogEntry[]> {
  const [notes, projects, now] = await Promise.all([getNotes(), getProjects(), getNowRevisions()]);

  const entries: LogEntry[] = [
    ...notes.map((n) => ({
      date: n.data.date,
      kind: 'NOTE' as const,
      title: n.data.title,
      href: `/notes/${n.id}`,
    })),
    ...projects.map((p) => ({
      date: p.data.ended ?? p.data.started,
      kind: 'PROJECT' as const,
      title: `${p.data.title}: ${p.data.summary}`,
      href: `/projects#${p.id}`,
    })),
    ...now.map((r) => ({
      date: r.data.date,
      kind: 'NOW' as const,
      title: `Updated /now: ${r.data.summary}`,
      href: '/now',
    })),
  ];

  return entries.sort((a, b) => newestFirst(a.date, b.date)).slice(0, limit);
}

/* ---------- Status page uptime ---------- */

export const UPTIME_DAYS = 45;

/** `none` means no data yet: the day is before the first recorded activity. */
export type BarState = 'up' | 'down' | 'none';

export type StatusRow = CollectionEntry<'statusRows'>['data']['items'][number] & {
  /** Oldest first; the last bar is the build day. */
  bars: BarState[];
  /** Plain-text summary for screen readers, since the bars are decorative. */
  summary: string;
};

const DAY = 24 * 60 * 60 * 1000;
const dayIndex = (d: Date) => Math.floor(d.getTime() / DAY);

/**
 * A day is up if there was activity within the trailing window ending on that day.
 * Days before the first ever activity have no data.
 */
function barsFromActivity(dates: Date[], windowDays: number, today: number): BarState[] {
  const days = dates.map(dayIndex).sort((a, b) => a - b);
  const first = days[0] ?? Infinity;

  return Array.from({ length: UPTIME_DAYS }, (_, i) => {
    const day = today - (UPTIME_DAYS - 1 - i);
    if (day < first) return 'none';
    return days.some((d) => d <= day && d > day - windowDays) ? 'up' : 'down';
  });
}

function barsFromOutages(outages: number[]): BarState[] {
  return Array.from({ length: UPTIME_DAYS }, (_, i) =>
    outages.includes(UPTIME_DAYS - 1 - i) ? 'down' : 'up',
  );
}

function summarise(name: string, bars: BarState[]) {
  const measured = bars.filter((b) => b !== 'none');
  if (measured.length === 0) return `${name}: no data yet.`;
  const up = measured.filter((b) => b === 'up').length;
  const pct = Math.round((up / measured.length) * 100);
  return `${name}: ${pct}% uptime over the last ${measured.length} days.`;
}

/** Windows are how long one piece of activity keeps a row green. */
const WRITING_WINDOW_DAYS = 21;
const PROJECTS_WINDOW_DAYS = 30;

export async function getStatusRows(now = new Date()): Promise<StatusRow[]> {
  const [rows, notes, projects] = await Promise.all([
    getList('statusRows'),
    getNotes(),
    getProjects(),
  ]);
  const today = dayIndex(now);

  const writingDates = notes.flatMap((n) => [n.data.date, n.data.updated ?? []].flat());
  const projectDates = projects.flatMap((p) =>
    [p.data.started, p.data.ended ?? [], p.data.updated ?? []].flat(),
  );

  return rows.map((row) => {
    const bars =
      row.source === 'writing'
        ? barsFromActivity(writingDates, WRITING_WINDOW_DAYS, today)
        : row.source === 'projects'
          ? barsFromActivity(projectDates, PROJECTS_WINDOW_DAYS, today)
          : barsFromOutages(row.outages);
    return { ...row, bars, summary: summarise(row.name, bars) };
  });
}
