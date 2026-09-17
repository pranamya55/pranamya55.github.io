import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

const DISCLOSURE_DIR = './src/content/disclosures';

/**
 * Slugs of entries marked `unlisted: true`.
 *
 * @astrojs/sitemap's `filter` runs outside the content-collection API, so we read
 * the frontmatter off disk here rather than duplicating the flag in two places.
 */
function unlistedSlugs() {
  if (!fs.existsSync(DISCLOSURE_DIR)) return new Set();
  const slugs = new Set();
  for (const file of fs.readdirSync(DISCLOSURE_DIR)) {
    if (!file.endsWith('.md')) continue;
    const src = fs.readFileSync(path.join(DISCLOSURE_DIR, file), 'utf8');
    const frontmatter = src.split(/^---\s*$/m)[1] ?? '';
    if (/^\s*unlisted:\s*true\s*$/m.test(frontmatter)) {
      slugs.add(file.replace(/\.md$/, ''));
    }
  }
  return slugs;
}

const excluded = unlistedSlugs();

export default defineConfig({
  site: 'https://pranamya.me',
  integrations: [
    sitemap({
      filter: (page) => {
        const slug = new URL(page).pathname.replace(/^\/disclosures\/|\/$/g, '');
        return !excluded.has(slug);
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-default' },
      wrap: false,
    },
  },
});
