import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const entries = (await getCollection('disclosures', ({ data }) => !data.draft && !data.unlisted))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: "Pranamya's Disclosures",
    description: 'Vulnerability disclosures and security research by Pranamya Keshkamat.',
    site: context.site!,
    items: entries.map((entry) => ({
      title: `[${entry.data.severity.toUpperCase()}] ${entry.data.title}`,
      description: entry.data.summary,
      pubDate: entry.data.date,
      link: `/disclosures/${entry.id}/`,
      categories: entry.data.tags,
    })),
    customData: '<language>en-us</language>',
  });
}
