# Maadoo Job (มาดูจ็อบ) — project guide for Claude Code

Maadoo Job is a **demo** website for workplace reviews, salaries, part-time jobs and career advice, aimed at Thai university students and new graduates.
Slogan: "ก่อนไปทำงาน มาดูก่อน" / "Before you go, Maadoo first".
Brand name: **Maadoo Job** (Thai: **มาดูจ็อบ**). Use it only where the brand is named (title, header logo, footer, ©, welcome popup, employer page, login title, meta tags). "มาดู" is also a Thai verb and stays in the slogan and sentences — never find-and-replace it across the file. The mascot is still "น้องมาดู" / "Maadoo the pup"; product names such as Maadoo Plus stay as they are.
Live site: https://maadoo.pages.dev (Cloudflare Pages, auto-deploys from `main`).

## Files
- `index.html` — the whole app in one file: HTML + CSS + vanilla JS, no build step, no framework.
- Header logo = mascot circle + "Maadoo" wordmark + an orange "JOB" tag hung through the last "o", built in HTML/CSS/SVG (no image). It is a fixed brand mark: always the Classic pup (`maadoo-icon.webp`) and `--logo-ink` (brand navy; light blue only in the night theme for readability) — it does not follow the theme. Tag colors come from `--tag`, `--tag-shade`, `--tag-ink`. At ≤350px only the circle and a small JOB badge show.
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
- Keep the "เดโม · ข้อมูลตัวอย่าง" demo tag. Sample data and most state live in memory; our own `localStorage` keys are only language, theme, effect toggles, ambient-sound on/off + volume, and the "promotions hidden" timestamp (7 days) (always wrapped in try/catch).
- Supabase (supabase-js v2 from cdn.jsdelivr.net, loaded `async`) handles only: login (email + password, email code/OTP, or "try without signing up" anonymous guest), the `reviews` and `mentor_reviews` tables, the premium tables `profiles`, `coin_ledger` and `questions`, `employer_signups`, and the RPCs `pioneer_stats`, `use_invite_code`, `claim_referral_reward`, `early_bird_left`. supabase-js keeps its auth session in `localStorage`.
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
home · explore (companies) · company (overview / reviews / salaries / interviews / open jobs) · jobs (tabs: full-time/internships and ⚡ quick part-time) · write (5-question quick review) · ask (Tinder-style mentor swipe + community board) · me (profile, Plus + coin cards, level, badges, my questions, mentor sessions, applications) · plus (Maadoo Plus page) · wallet (coin wallet + weekly missions) · invite (my invite code, invite stats, how it works, Pioneer card; linked from Me so the code stays reachable after the home promo block is hidden) · employer (plans) · rules (guidelines, PDPA, part-time safety) · quiz.

## Premium (decided) — Maadoo Plus, Maadoo coins, Ask a mentor
- **Always free:** reading/writing reviews, salaries and applying to jobs. Paying never removes, hides or edits reviews.
- **Demo payments only:** every "pay" opens the simulated checkout (`payModal`) with a clear "เดโม / DEMO" banner. No real money is taken; never add a real payment integration without the owner's go-ahead.
- **Maadoo Plus plans:** monthly 99 THB (30 days) · yearly 990 THB (365 days, "คุ้มสุด", 2 months free) · internship term 249 THB (90 days). Buying extends `plus_until` from the later of now/current expiry.
- **Plus perks:** 5 free mentor questions a month · 20% off live mentor calls · 1 free resume review a month · job alerts 24 h early · detailed salary comparison · special themes + music (coming soon) · 100 coins a month (granted once per calendar month while Plus is active).
- **Plus mission:** write 3 company reviews → 1 free month of Plus (once per account, counted from the user's real reviews).
- **Ask a mentor (Plus):** open-ended chat until answered. "ได้คำตอบแล้ว พอใจ" closes it and uses 1 question, then offers a mentor review. No mentor reply within 48 h → refunded. 7 days quiet after a mentor reply → auto-closes and uses 1. Max 2 open at once; 5 per calendar month, no rollover (used this month + open ≤ 5). Mentors are fictional; replies are simulated a few seconds after sending. Statuses: รอคำตอบ / ตอบแล้ว / ปิดแล้ว.
- **Plus look on the mentor swipe cards (ask view):** Plus members see a 5px gold outer frame (`.scard.gold`, tokens `--gold-*`; the inside keeps the theme colors), 2 small gold ✦ sparkles in the image area, an orange "💬 ถามฟรี X/5" button next to the price, and a pale-gold "✨ Plus" tag by the ask heading. Non-Plus users see the normal card.
- **Maadoo coins:** 1 coin = 1 THB off (mentor bookings, theme unlocks); never exchangeable for cash. Top-ups: 100 = 99, 300 = 279, 600 = 529 THB. Weekly missions: company review +30, salary (in a review) +20, interview review +20, answer 3 juniors on the board +15, invite a friend +50 — each once per ISO week. Coins from reviews stay pending until the review passes moderation. Mission coins (missions + reviews) are capped at 300 per calendar month.
- **Storage:** logged-in (non-guest) users sync to Supabase `profiles` (`plus_until`, `free_month_claimed`), `coin_ledger` and `questions`, all RLS own-rows only. The coin balance is **never stored**: it is always the sum of `ok` rows in `coin_ledger`, read through the `my_coins` view (`profiles.coins` is deprecated and unused). The `coin_ledger` trigger enforces the rules above. Guests and logged-out users are sent to log in / add an email before subscribing, asking or claiming coins. Without Supabase everything runs in memory.
- Before real payments: move `plus_until` renewals and `topup` ledger entries into a server-side payment webhook / Edge Function and revoke those client rights.

## Promotions (decided)
- **Home promo block** (below the hero/search, hidden while searching): swipeable banner carousel with dots — "รีวิวแรก แลก Plus ฟรี!" (links to the existing 3-reviews → 1 free month mission; there is no separate first-review trial), "1,000 คนแรก", "ชวนเพื่อน", "โปรตามฤดูกาล" — plus a Pioneer card and an Invite card. The × hides the whole block for 7 days.
- **Pioneer badge:** permanent 🚩 badge for the first 1,000 non-guest members; "เหลืออีก X ที่" and "is me a pioneer" come from `pioneer_stats()` (real `auth.users` count + my sign-up rank). Without Supabase a sample figure is shown and labelled.
- **Invite a friend:** every profile gets a code `MAADOO-XXXXXX` (server-generated). Links use `?ref=CODE`; the code is applied after login with `use_invite_code()` (once, never your own, not for guests). When the invited friend has written their first company review, `claim_referral_reward()` gives 50 coins to both (once per friend). `referral` ledger rows can only come from that function.
- **Seasonal offer by month:** Jan–Mar Plus internship term 249 · Apr Songkran theme (coming soon → Ocean theme) · Jul–Aug new-semester part-time jobs · Nov Loy Krathong (ask a mentor) · Dec yearly Plus 30% off (990 → 693, applied on the Plus page and checkout) · other months: weekly coin missions. Preview any month with `?promo_month=1..12`.
- **Employer plans:** Starter free · Pro 3,900 THB/month, early-bird 1,950 for the first 3 months + 3 months of free job posts for the first 50 companies · Enterprise from 15,000. Pro goes through the simulated checkout. `employer_signups` records sign-ups; the server decides `early_bird` (first 50 Pro) and `early_bird_left()` feeds "เหลือ X สิทธิ์". Every plan can reply to reviews but never delete or hide them.

## Parked decisions (don't build yet unless asked)
- Prices for promoting part-time jobs (shows "free during the demo" for now).
- Special themes/music for Plus and coin theme unlocks (shown as "coming soon").

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
