# ILa

A product catalog website for ILa, a small online shop in Laos that sells goods sourced from China.

Customers browse products by category on the website and place orders through WhatsApp or Facebook Messenger. The owner manages products through an admin area (planned).

**Live site:** https://ila.vilaxathphommahaxay.workers.dev

## Why this project

Posts on a Facebook page get buried under newer posts. This site keeps every product in one organized place, so customers can find what they want easily.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage) - planned
- Cloudflare Workers via OpenNext - hosting, auto-deploys from GitHub

## Status

Work in progress.

- [x] Project setup and automatic deployment
- [ ] Database
- [ ] Storefront
- [ ] Admin area
- [ ] SEO and launch

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.