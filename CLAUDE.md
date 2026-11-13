# Maadoo Job (มาดูจ็อบ) — project guide for Claude Code

Maadoo Job is a **demo** website: a Fastwork-style job market ("ก่อนไปทำงาน มาดูก่อน") for Thai students and new graduates — jobs & internships, inclusive hiring, student freelance gigs, career-experience programs, mentors, free resume maker.
Live site: https://maadoo.pages.dev (Cloudflare Pages, auto-deploys from `main`).

## Source of truth
The site is the approved demo **v24** (hand-off package from Hb), split into plain files, no build step:
- `index.html` — shell: meta tags, header/footer/bottom-nav markup, `<script src="js/app.js">`, service-worker registration.
- `css/style.css` — all CSS (guards for 360px overflow are appended at the end).
- `js/app.js` — the whole SPA (hash router, views in `V.*`, state `S`, `store` → localStorage keys `maadoo-demo-*`, embedded sample data, TH/EN runtime translator `EN8` + MutationObserver).
- PWA: `manifest.webmanifest`, `icons/`, `sw.js`, `offline.html`. **Bump `VERSION` in `sw.js` on every commit that changes a site file** (and list new files in `FILES`).
- `supabase/setup.sql` and the old Supabase setup are left untouched; the site does **not** call any backend.

## Decisions (from the team)
- Everything is a demo: state lives in the browser (localStorage). No backend, auth, payments, secrets or new Supabase tables.
- All companies, jobs, people, reviews, numbers are fictional; keep the "เดโม · ข้อมูลสมมติ" banner.
- No review-writing, no floating review button, no Maadoo coins, no real-time chat/mentor chat (chat is the scripted freelance chat only).
- Landing is animated and cannot be skipped; sign in (or "ใช้บัญชีตัวอย่าง") before using the app.
- Accessibility is part of the product (workplace-accommodation filters, accessibility statement, accessibility panel).
- Free 3 application slots = active applications; they return on withdraw/company reply/14-day silence.
- TH | EN: `#lLangBtn` (landing) and `#langBtn` (app bar, must stay visible ≤860px). Thai text must not leak in EN mode (intro splash excepted). New UI strings need an entry in the `EN8` dictionary inside `js/app.js`.
- Don't tie heavy effects directly to scroll (rAF throttle, `scr` class, reduced effects under `(hover:none)`).
- Fonts: Mali (display) and Anuphan (body).

## Before every commit
Test the changed page at 360px, 390px and 1280px in Thai and English; no console errors, no horizontal overflow; bump `sw.js` `VERSION`.

## Workflow กับ Hb
- แก้เสร็จให้ push ขึ้น branch ของ session แล้วส่งลิงก์ Preview ของ Cloudflare ให้ Hb
  (ชื่อ branch เปลี่ยน / เป็น - แล้วต่อด้วย .maadoo.pages.dev เช่น claude/abc-xyz → https://claude-abc-xyz.maadoo.pages.dev
  ⚠️ Cloudflare ตัดชื่อไม่เกิน 28 ตัวอักษร ถ้ายาวให้ตัดท้ายทิ้ง และตัด - ท้ายสุดออก)
  บอกให้รอประมาณ 1 นาที และสรุปสั้นๆ เป็นภาษาไทยว่าแก้อะไร
- ห้าม merge เข้า main จนกว่า Hb จะพิมพ์ว่า "ยืนยัน" แล้วค่อย merge/push (ผ่าน PR ถ้าทำได้)
- ถ้า push main ไม่ได้เพราะสิทธิ์ ให้บอก Hb ตรงๆ และส่งลิงก์ PR
