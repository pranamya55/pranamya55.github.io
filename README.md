# Pranamya's Disclosures

Vulnerability disclosure site for [pranamya.me](https://pranamya.me), built with
[Astro](https://astro.build). Disclosures are markdown files; the site is static.

## Publishing a disclosure

1. Copy the frontmatter block from [`TEMPLATE.md`](./TEMPLATE.md) into
   `src/content/disclosures/<slug>.md`. The filename becomes the URL.
2. Write the body in markdown. Fenced code blocks are syntax-highlighted
   (`solidity`, `bash`, `js`, `python`, … via Shiki, with light/dark variants).
3. Commit to `main`. The Actions workflow builds and deploys automatically.

### Visibility

| Frontmatter | Index / RSS / sitemap | Direct URL | Use for |
| --- | --- | --- | --- |
| *(default)* | Listed | Public | Published disclosures |
| `unlisted: true` | Hidden | **Still public** | Not advertised, but shareable by link |
| `draft: true` | Hidden | 404 — never built | Work in progress, embargoed findings |

`unlisted` is obscurity, not access control. The page is served with
`noindex, nofollow, noarchive` and kept out of every listing, but a 200 is a 200:
anyone with the URL can read it, and **because this repo is public, the filename —
and therefore the URL — is visible in `src/content/disclosures/`.** For anything
that genuinely must not be read yet, use `draft: true` or keep the file out of this
repo entirely.

Note that `robots.txt` deliberately does *not* `Disallow` unlisted paths: a
`Disallow` rule would publish the exact path it is meant to hide. Per-page
`noindex` achieves the same result without advertising anything.

Frontmatter is schema-validated: an invalid `severity`, a malformed date, or a
non-URL reference **fails the build** rather than shipping a broken page.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run check    # type + schema check
```

## Structure

| Path | Purpose |
| --- | --- |
| `src/content/disclosures/` | One markdown file per disclosure |
| `src/content.config.ts` | Frontmatter schema (severity/status enums live here) |
| `src/layouts/Base.astro` | Shell: header, nav, footer, meta tags |
| `src/pages/index.astro` | Index, grouped by year with severity counts |
| `src/pages/disclosures/[...slug].astro` | Disclosure page: badges, factsheet, prose |
| `src/styles/global.css` | Design tokens and all styling |
| `public/CNAME` | Custom domain — **do not delete**, Pages needs it |

Colors, including the severity palette, are CSS custom properties at the top of
`global.css` and are defined for both light and dark mode.

## Housekeeping

`src/content/disclosures/example-vault-reentrancy.md` is a sample entry against a
fictional target, used to exercise the rendering. Delete it once real content lands.
