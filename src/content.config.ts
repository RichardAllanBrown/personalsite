import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

// Drafts render in `astro dev` and are filtered out of production builds (see src/lib/content.ts).
const draft = z.boolean().default(false);

/* ---------- Writing ---------- */

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft,
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      status: z.enum(['shipped', 'in-progress', 'abandoned']),
      stack: z.array(z.string()).default([]),
      started: z.coerce.date(),
      ended: z.coerce.date().optional(),
      /** Last meaningful change; feeds the "Side projects" uptime row. */
      updated: z.coerce.date().optional(),
      featured: z.boolean().default(false),
      causeOfDeath: z.string().optional(),
      writeUp: reference('notes').optional(),
      url: z.url().optional(),
      repo: z.url().optional(),
      draft,
    })
    .refine((p) => p.status !== 'abandoned' || (p.ended && p.causeOfDeath), {
      message: 'Abandoned projects need `ended` and an honest `causeOfDeath`.',
    }),
});

/** One file per revision of /now; the newest is the page, the rest are its history. */
const now = defineCollection({
  loader: glob({ base: './src/content/now', pattern: '**/*.yaml' }),
  schema: z.object({
    date: z.coerce.date(),
    /** One line for the home log: "Updated /now: …". */
    summary: z.string(),
    shipped: z.array(z.string()).default([]),
    inProgress: z.array(z.string()).default([]),
    blockers: z.array(z.string()).default([]),
    loadout: z.object({
      reading: z.string().optional(),
      listening: z.string().optional(),
      learning: z.string().optional(),
      location: z.string().optional(),
    }),
    notDoing: z.array(z.string()).default([]),
    draft,
  }),
});

/* ---------- Site data (ordered lists in src/data) ---------- */

/**
 * One YAML file holding an ordered `items` list. Collections sort entries by id,
 * so a list per file is the only way to keep the order it's written in.
 */
const list = <T extends z.ZodType>(name: string, item: T) =>
  defineCollection({
    loader: file(`src/data/${name}.yaml`, {
      parser: (text) => ({ [name]: parseYaml(text) }),
    }),
    schema: z.object({ items: z.array(item) }),
  });

const spec = list('spec', z.object({ label: z.string(), value: z.string() }));

const statusRows = list(
  'status',
  z.object({
    id: z.string(),
    name: z.string(),
    note: z.string(),
    /** `writing` and `projects` are derived from content; `manual` uses `outages`. */
    source: z.enum(['writing', 'projects', 'manual']),
    /** Days ago (0 = build day) that count as incidents. Manual rows only. */
    outages: z.array(z.number().int().min(0).max(44)).default([]),
  }),
);

const changelog = list(
  'changelog',
  z.object({
    version: z.string(),
    period: z.string(),
    title: z.string(),
    line: z.string(),
  }),
);

const config = list(
  'config',
  z.object({
    key: z.string(),
    value: z.string(),
    comment: z.string().optional(),
  }),
);

const ports = list(
  'ports',
  z.object({
    port: z.number().int(),
    protocol: z.string(),
    label: z.string(),
    href: z.string(),
  }),
);

export const collections = { notes, projects, now, spec, statusRows, changelog, config, ports };
