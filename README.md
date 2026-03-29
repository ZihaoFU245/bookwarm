# Zihao Fu Site

Personal site built with Astro.

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build the site:

```bash
npm run build
```

Run Astro checks:

```bash
npm run check
```

## Project Structure

`src/pages/`

- Route files for the site.
- `index.astro` is the homepage.
- `blog/` contains blog listing, pagination, and single-post routes.
- `about.astro`, `archive.astro`, and `resume.astro` are standalone pages.

`src/content/`

- Markdown content collections.
- `posts/` contains blog posts.
- `about/` contains the about page content.
- `authors/` contains author metadata.

`src/content.config.ts`

- Defines Astro content collections and frontmatter schema.

`src/config/`

- Site-level configuration.
- `config.json` stores metadata, favicon path, and general site settings.
- `menu.json` stores navbar and footer links.
- `social.json` stores social profile links.

`src/layouts/`

- Shared page layout and partials.
- `Base.astro` wraps most pages.
- `partials/` contains header and footer.
- `components/` contains reusable UI pieces used by pages and layouts.

`src/lib/`

- Utility code for content parsing, sorting, and markdown behavior.
- `remarkTocHeadings.mjs` handles custom heading ids like `{#section}` and TOC insertion.

`public/`

- Static assets copied as-is at build time.
- `public/assets/` stores site images, CSS, JS, favicons, and resume files.
- Do not put generated route HTML here.

## Writing a New Blog Post

1. Create a new Markdown file in `src/content/posts/`.
   File names become post slugs.

2. Add frontmatter.

```md
---
title: My New Post
description: Short summary for cards and metadata.
date: 2026-03-29
image: /assets/path-to-cover-image.jpg
categories:
  - general
authors:
  - Zihao Fu
tags:
  - notes
draft: false
---
```

3. Write the post body in Markdown below the frontmatter.

4. Put any images or downloadable files for the post under `public/assets/`.
   Example:

```text
public/assets/2026-03-29-resources/
```

5. Reference those assets with site-root paths in Markdown.

```md
![Caption](/assets/2026-03-29-resources/example.jpg)
```

## Headings And TOC

Custom heading ids are supported:

```md
## My Section {#my-section}
```

The `{#my-section}` part is hidden in rendering and becomes the heading id.

TOC insertion is supported with one of these markers:

```md
[toc]
```

```md
[[toc]]
```

You can also use a `Table of Contents` heading as the insertion point.

## Notes

- `public/` is for static assets only.
- Route output belongs in `dist/`, not `public/`.
- Content should live in `src/content/` whenever possible so Astro generates pages from source.
