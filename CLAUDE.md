# Maadoo Job (มาดูจ็อบ) — project guide for Claude Code

Maadoo Job is a **demo** website for workplace reviews, salaries, part-time jobs and career advice, aimed at Thai university students and new graduates.
Slogan: "ก่อนไปทำงาน มาดูก่อน" / "Before you go, Maadoo first".
Brand name: **Maadoo Job** (Thai: **มาดูจ็อบ**). Use it only where the brand is named (title, header logo, footer, ©, welcome popup, employer page, login title, meta tags). "มาดู" is also a Thai verb and stays in the slogan and sentences — never find-and-replace it across the file. The mascot is still "น้องมาดู" / "Maadoo the pup"; product names such as Maadoo Plus stay as they are.
Live site: https://maadoo.pages.dev (Cloudflare Pages, auto-deploys from `main`).

## Files
- `index.html` — the whole app in one file: HTML + CSS + vanilla JS, no build step, no framework.
- Header logo = mascot circle + "Maadoo" wordmark + an orange "JOB" tag hung through the last "o", built in HTML/CSS/SVG (no image). Tag colors come from `--tag`, `--tag-shade`, `--tag-ink`. At ≤350px only the circle and a small JOB badge show.
- Home hero mascot (theme image) has a "JOB!" speech bubble in inline SVG (`.m-say`, colors from `--surface`, `--navy`, `--tag`).
- `maadoo-job-icon-512.png` — favicon and apple-touch-icon.
- `maadoo-job-round.png` — round Maadoo Job logo shown in the first-visit welcome popup (on a light `--logo-bg` panel in the night theme).
- `maadoo-icon.webp` — the mascot (a white puppy with a magnifying glass) for the Classic theme.
- `maadoo-icon-<theme>.webp` — mascot variants: night, sakura, mint, lavender, sunset, dino, garden, sea.
- `og-image.jpg` — 1200×630 link-preview image. When you replace it, bump the `?v=` query on `og:image` / `twitter:image` so caches refresh.
- `supabase/setup.sql` — Supabase tables, RLS and grants. The owner runs it by hand in the SQL Editor; keep it idempotent.
- Deploy = commit to `main`. No build command, output directory is the repo root.

## Hard rules
- Everything user-facing is **bilingual Thai + English**. Use `t('ไทย','English')` for UI strings and `[th, en]` pairs with `x(...)` for data. Never add a string in only one language.
- **All companies, people, reviews and salaries are fictional.** Never use real company names or real people.
- Keep the "เดโม · ข้อมูลตัวอย่าง" demo tag. Sample data and most state live in memory; our own `localStorage` keys are only language, theme, effect toggles and ambient-sound on/off + volume (always wrapped in try/catch).
- Supabase (supabase-js v2 from cdn.jsdelivr.net, loaded `async`) handles only: login (email + password, email code/OTP, or "try without signing up" anonymous guest), the `reviews` table and the `mentor_reviews` table. supabase-js keeps its auth session in `localStorage`.
  - New reviews are `pending`; the public sees only `approved` ones via the `approved_reviews` view (no `user_id`, no `salary`). Users can never set or change `status`; moderation happens in the Supabase dashboard.
  - Guests (anonymous users) can browse, swipe and apply, but can't add reviews (blocked in the UI and by RLS); they can keep their account by adding an email (`updateUser`).
  - Only the publishable key goes in `index.html`. Never add a secret / `service_role` key.
  - If Supabase can't load (`SB` is `null`), everything must keep working as the in-memory demo.
- Paying can **never** remove, hide or edit reviews, not even with Plus or employer plans. Companies may only reply publicly.
- Mentor reviews: only after a session (1 booking = 1 review, marked "✓ ปรึกษาจริง / Real session"); the author can edit or delete their own. Mentors may **reply** but can **never delete or hide** reviews. Everyone reads them through the `mentor_reviews_public` view (no `user_id`); the `reply` column is set by admins only. A mentor's rating and count are always computed from the reviews (samples in `MREV` + real ones), never typed in; fewer than 3 reviews shows "✨ รุ่นพี่ใหม่ / New mentor".
- Part-time jobs: employers may never charge applicants. Keep the anti-scam notes, the report button and the minimum-wage warning.
- Must work at every screen size (360px phone → desktop) with no horizontal scrolling. Phone and tablet (≤1020px) use the bottom nav; the review button floats in the middle.
- Every theme must look right: default, night (dark), sakura, mint, lavender, sunset, dino, garden, sea. Style through CSS variables (`--bg`, `--surface`, `--ink`, `--blue`, `--navy`, `--orange`…), never hard-coded colors in components.
- Each theme has its own background effect and tap effect (canvas), and each can be switched off in the theme menu. Respect `prefers-reduced-motion`.
- Each theme also has an ambient sound scene (`SND` + `SCENES` in `index.html`), synthesized with the Web Audio API — no audio files, no licensing. It is off by default and must never start without a user gesture (a remembered "on" waits for the first tap/click/key). Theme changes crossfade; the tab being hidden suspends it. To use a real recording, add `music/<theme>.mp3` and put the theme name in `MUSIC_FILES`.
- Style: cute, rounded, friendly. Fonts are Mali (display) and Anuphan (body).

## Main areas (views in `index.html`)
home · explore (companies) · company (overview / reviews / salaries / interviews / open jobs) · jobs (tabs: full-time/internships and ⚡ quick part-time) · write (5-question quick review) · ask (Tinder-style mentor swipe + community board) · me (profile, level, badges, applications) · employer (plans) · rules (guidelines, PDPA, part-time safety) · quiz.

## Parked decisions (don't build yet unless asked)
- New mentor pricing: swipe → pick a program → pay with "Maadoo coins", buy coin packages, earn free coins from missions.
- New Plus perks (monthly coins, exclusive themes, early job alerts).
- Prices for promoting part-time jobs (shows "free during the demo" for now).

## Before every commit
Open the page at 360px, 768px and 1280px widths, in Thai and English, and in at least the default and night themes. Check there are no console errors and nothing overflows horizontally.

## Workflow กับ Hb
- ทุกครั้งที่แก้เสร็จ ให้ push ขึ้น branch ของ session แล้วส่งลิงก์ Preview ของ Cloudflare ให้ Hb
  (รูปแบบ: ชื่อ branch เปลี่ยน / เป็น - แล้วต่อด้วย .maadoo.pages.dev
  เช่น claude/abc-xyz → https://claude-abc-xyz.maadoo.pages.dev
  ⚠️ Cloudflare ตัดชื่อให้เหลือไม่เกิน 28 ตัวอักษร ถ้ายาวกว่านั้นให้ตัดท้ายทิ้ง (และตัด - ท้ายสุดออก)
  เช่น claude/charming-ptolemy-ljj70z → https://claude-charming-ptolemy-ljj7.maadoo.pages.dev)
  บอกให้รอประมาณ 1 นาทีก่อนเปิด และสรุปสั้นๆ เป็นภาษาไทยว่าแก้อะไรบ้าง
- ห้าม merge เข้า main จนกว่า Hb จะพิมพ์ว่า "ยืนยัน"
- พอ Hb ยืนยันแล้ว ให้ merge branch เข้า main แล้ว push เอง
  (ถ้าสร้าง PR และ merge ได้ ให้ทำผ่าน PR) จากนั้นบอก Hb ว่าขึ้นเว็บจริงแล้ว
- ถ้า push ขึ้น main ไม่ได้เพราะติดสิทธิ์ ให้บอก Hb ตรงๆ และส่งลิงก์ PR ให้กด Merge เอง
