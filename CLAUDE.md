# Maadoo (มาดู) — project guide for Claude Code

Maadoo is a **demo** website for workplace reviews, salaries, part-time jobs and career advice, aimed at Thai university students and new graduates.
Slogan: "ก่อนไปทำงาน มาดูก่อน" / "Before you go, Maadoo first".
Live site: https://maadoo.pages.dev (Cloudflare Pages, auto-deploys from `main`).

## Files
- `index.html` — the whole app in one file: HTML + CSS + vanilla JS, no build step, no framework.
- `maadoo-icon.webp` — the mascot (a white puppy with a magnifying glass) for the Classic theme.
- `maadoo-icon-<theme>.webp` — mascot variants: night, sakura, mint, lavender, sunset, dino, garden, sea.
- `og-image.jpg` — 1200×630 link-preview image.
- Deploy = commit to `main`. No build command, output directory is the repo root.

## Hard rules
- Everything user-facing is **bilingual Thai + English**. Use `t('ไทย','English')` for UI strings and `[th, en]` pairs with `x(...)` for data. Never add a string in only one language.
- **All companies, people, reviews and salaries are fictional.** Never use real company names or real people.
- Keep the "เดโม · ข้อมูลตัวอย่าง" demo tag. Nothing is saved to a server: state lives in memory, and only language, theme and effect toggles go to `localStorage` (always wrapped in try/catch).
- Paying can **never** remove, hide or edit reviews, not even with Plus or employer plans. Companies may only reply publicly.
- Part-time jobs: employers may never charge applicants. Keep the anti-scam notes, the report button and the minimum-wage warning.
- Must work at every screen size (360px phone → desktop) with no horizontal scrolling. Phone and tablet (≤1020px) use the bottom nav; the review button floats in the middle.
- Every theme must look right: default, night (dark), sakura, mint, lavender, sunset, dino, garden, sea. Style through CSS variables (`--bg`, `--surface`, `--ink`, `--blue`, `--navy`, `--orange`…), never hard-coded colors in components.
- Each theme has its own background effect and tap effect (canvas), and each can be switched off in the theme menu. Respect `prefers-reduced-motion`.
- Style: cute, rounded, friendly. Fonts are Mali (display) and Anuphan (body).

## Main areas (views in `index.html`)
home · explore (companies) · company (overview / reviews / salaries / interviews / open jobs) · jobs (tabs: full-time/internships and ⚡ quick part-time) · write (5-question quick review) · ask (Tinder-style mentor swipe + community board) · me (profile, level, badges, applications) · employer (plans) · rules (guidelines, PDPA, part-time safety) · quiz.

## Parked decisions (don't build yet unless asked)
- New mentor pricing: swipe → pick a program → pay with "Maadoo coins", buy coin packages, earn free coins from missions.
- New Plus perks (monthly coins, exclusive themes, early job alerts).
- Prices for promoting part-time jobs (shows "free during the demo" for now).

## Before every commit
Open the page at 360px, 768px and 1280px widths, in Thai and English, and in at least the default and night themes. Check there are no console errors and nothing overflows horizontally.
