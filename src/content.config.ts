import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational'] as const;
export const STATUSES = ['fixed', 'mitigated', 'acknowledged', 'reported', 'disclosed', 'wontfix'] as const;

const disclosures = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/disclosures' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    severity: z.enum(SEVERITIES),
    status: z.enum(STATUSES),
    target: z.string(),
    date: z.coerce.date(),
    reportedAt: z.coerce.date().optional(),
    fixedAt: z.coerce.date().optional(),
    cve: z.string().optional(),
    cvss: z.number().min(0).max(10).optional(),
    bounty: z.string().optional(),
    tags: z.array(z.string()).default([]),
    references: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    draft: z.boolean().default(false),
    // Reachable at its URL, but kept out of the index, RSS and sitemap,
    // and served with <meta name="robots" content="noindex">.
    unlisted: z.boolean().default(false),
  }),
});

export const collections = { disclosures };
