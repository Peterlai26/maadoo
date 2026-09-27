# Maadoo Job (มาดูจ็อบ) — project guide for Claude Code

Maadoo Job is a **demo** website for workplace reviews, salaries, part-time jobs and career advice, aimed at Thai university students and new graduates.
Slogan: "ก่อนไปทำงาน มาดูก่อน" / "Before you go, Maadoo first".
Brand name: **Maadoo Job** (Thai: **มาดูจ็อบ**). Use it only where the brand is named (title, header logo, footer, ©, welcome popup, employer page, login title, meta tags). "มาดู" is also a Thai verb and stays in the slogan and sentences — never find-and-replace it across the file. The mascot is still "น้องมาดู" / "Maadoo the pup"; product names such as Maadoo Plus stay as they are.
Live site: https://maadoo.pages.dev (Cloudflare Pages, auto-deploys from `main`).

## Files
- No build step, no framework: plain HTML + CSS + vanilla JS files served as they are.
- `index.html` — only the page shell: `<head>` meta tags, the header/logo markup, the empty containers the JS fills (`#app`, `#modal`, `#sheet`, `#bnav`, `#toast`…) and the `<script>` tags.
- `css/style.css` — all the site's CSS (base light + dark palettes as CSS variables, layout, every component, responsive rules).
- `js/` — classic scripts (not modules) that share one global scope. They load **in this order** and the order matters; only `js/app.js` runs the start-up code, at its very end, so every other file only declares things (plus a few `S.x=…` defaults and event listeners). Keep it that way: don't call a function from another file at load time.
  1. `js/core.js` — `store` (localStorage wrapper), the app state `S`, `t()` / `x()` for Thai/English, helpers (`$`, `esc`, `fmt`, `getCo`, `toast`, `go`), `applyPrefs()` (applies the current theme's `data-theme` and CSS variables), the nav bars (`nav()`), and shared pieces (`coCard`, `review`, `brand`).
  2. `js/themes.js` — **every theme as one data entry** in `THEMES` (+ `TH(key)`): menu icon + 2-language name, `dark`, preview colors, CSS variables (`vars`), effect config (`fx`: particle kinds, colors, events, tap kind) and sound (`snd`: a named scene or a `mix` of layers, `music` for a real file). Adding a theme = one entry here + `maadoo-icon-<key>.webp`; no new effect/sound code unless it needs a brand-new particle kind or layer.
  3. `js/data.js` — all fictional sample data: nav items `NAV`, jobs `JOBS`, sample mentors `MENTORS` + their reviews `MREV`, notifications, industries `IND`, companies `CO` (reviews, salaries, interviews), board posts `POSTS`, levels, `QUIZ`; then the career-map data (skills `SK`, faculties `FAC`, `WORLDS`, `GROUPS`, `ROLES`, fit table `FIT_SRC`/`FITM`) and its small lookup helpers (`fitOf`, `roleGap`…).
  4. `js/auth.js` — Supabase setup (`SB`, publishable key, `initSB()`), login modals (password · email code/OTP · guest · add email), loading reviews, deleting your own review.
  5. `js/views.js` — the main pages: home (hero + search, "สำหรับคุณ" tabs), explore (the Jobs › บริษัท tab), company, reviews (composer, filters, feed, `pollCard`) + the write-a-review sheet (`openWrite`, `writeModal`, `reviewSent`), ask (mentor swipe deck + community board), quiz, jobs (tabs, full-time list, job cards, `salaries`) and the mentor card pieces (`scard`, `mRevs`, `mStat`).
  6. `js/premium.js` — Maadoo Plus (`PLANS`, `isPlus`), coins + ledger + weekly missions, simulated payment (`payModal`), Plus page, wallet, ask-a-mentor questions; interview review; promotions (home carousel, Pioneer, invite codes, seasonal offer); and the Me page (`me`) + employer page (`employer`, `EMP`).
  7. `js/mentor.js` — mentor sessions & reviews, real mentors (applications, admin page, realtime chat room, contact masking, reports/blocks, mentor mode), live calls (availability, booking page, live room, reminders, session notes).
  8. `js/onboard.js` — career-map view and faculty picker, first-visit welcome, home start card + compact first steps, coach-mark tours.
  9. `js/parttime.js` — ⚡ quick part-time jobs (`PT`, feed, post, apply, rate, minimum-wage warning) and the rules page (`rules`).
  10. `js/fx.js` — theme background/tap effects (`FX`, canvas; particle-kind registry `PK` and rare events `EV`, shared by all themes) and ambient sound (`SND`; named `SCENES` for the first 9 themes and reusable `LAYERS` that newer themes stack with `snd.mix`; `MUSIC_FILES`).
  11. `js/app.js` — modals and notifications (`openModal`, `renderModal`, bell, theme menu), explore category dropdown, `render()`, the main click/submit/input/keydown handlers, and at the end the start-up code (`render()`, timers, onboarding, Supabase init).
- To add a new file: put a `<script src="js/….js"></script>` before `js/app.js` in `index.html`, and list it here.
- Header logo = mascot circle + "Maadoo" wordmark + an orange "JOB" tag hung through the last "o", built in HTML/CSS/SVG (no image). It is a fixed brand mark: always the Classic pup (`maadoo-icon.webp`) and `--logo-ink` (brand navy; light blue only in the dark themes for readability) — it does not follow the theme. Tag colors come from `--tag`, `--tag-shade`, `--tag-ink`. At ≤350px only the circle and a small JOB badge show.
- Home hero mascot (theme image) has a "JOB!" speech bubble in inline SVG (`.m-say`, colors from `--surface`, `--navy`, `--tag`).
- `maadoo-job-icon-512.png` — favicon and apple-touch-icon.
- `maadoo-job-round.png` — round Maadoo Job logo, shown small at the top of the first-visit onboarding (on a light `--logo-bg` circle in the dark themes).
- `maadoo-icon.webp` — the mascot (a white puppy with a magnifying glass) for the Classic theme.
- `maadoo-icon-<theme>.webp` — mascot variants: night, sakura, mint, lavender, sunset, dino, garden, sea, space, galaxy, japan, china, cafe, rain, pixel, library.
- `og-image.jpg` — 1200×630 link-preview image. When you replace it, bump the `?v=` query on `og:image` / `twitter:image` so caches refresh.
- `supabase/setup.sql` — Supabase tables, RLS and grants. The owner runs it by hand in the SQL Editor; keep it idempotent.
- Deploy = commit to `main`. No build command, output directory is the repo root.

## Hard rules
- Everything user-facing is **bilingual Thai + English**. Use `t('ไทย','English')` for UI strings and `[th, en]` pairs with `x(...)` for data. Never add a string in only one language.
- **All sample companies, people, reviews, salaries and sample mentors are fictional.** Never use real company names or real people in sample data. Sample mentors (m1–m9) carry a "ตัวอย่าง / Sample" chip and keep auto-replying.
- **Real mentors (step 1) are the only real people:** users who applied and an admin approved. They appear by **nickname only** with a "✓ รุ่นพี่จริง / Real mentor" chip; their LinkedIn/work-email contact is for verification and only admins see it.
- Keep the "เดโม · ข้อมูลตัวอย่าง" demo tag. Sample data and most state live in memory; our own `localStorage` keys are only language, theme, effect strengths per theme (`maadoo-fx`), ambient-sound on/off + volume, the "promotions hidden" timestamp (7 days), onboarding seen (`maadoo-welcome`), onboarding answers (goal, fields, faculty/major) + first-steps progress + career-map followed roles (`maadoo-onboard`) and which coach-mark tours were seen (`maadoo-coach`), and a friend's invite code from `?ref=` until it is used (`maadoo-ref`) (always wrapped in try/catch through `store`).
- Supabase (supabase-js v2 from cdn.jsdelivr.net, loaded `async`) handles only: login (email + password, email code/OTP, or "try without signing up" anonymous guest), the `reviews` and `mentor_reviews` tables, the premium tables `profiles`, `coin_ledger` and `questions`, `employer_signups`, the real-mentor tables `admins`, `mentor_applications`, `mentors`, `chat_rooms`, `messages`, `chat_reports`, `mentor_availability`, `mentor_days_off`, `bookings`, `session_notes`, the private Storage bucket `chat-files`, Realtime (messages, chat_rooms, bookings, session_notes, typing broadcast), and the RPCs `pioneer_stats`, `use_invite_code`, `claim_referral_reward`, `early_bird_left`, `is_admin`, `review_mentor_application`, `chat_mark_read`, `chat_confirm_live`, `chat_set_block`, `mentor_taken_slots`, `book_session`, `cancel_booking`, `report_noshow`, `complete_booking`, `set_meet_link`, `save_session_notes`, `toggle_note_saved`. supabase-js keeps its auth session in `localStorage`.
  - New reviews are `pending`; the public sees only `approved` ones via the `approved_reviews` view (no `user_id`, no `salary`). Users can never set or change `status`; moderation happens in the Supabase dashboard.
  - Guests (anonymous users) can browse, swipe and apply, but can't add reviews (blocked in the UI and by RLS); they can keep their account by adding an email (`updateUser`).
  - Only the publishable key goes in `js/auth.js`. Never add a secret / `service_role` key.
  - If Supabase can't load (`SB` is `null`), everything must keep working as the in-memory demo.
- Paying can **never** remove, hide or edit reviews, not even with Plus or employer plans. Companies may only reply publicly.
- Mentor reviews: only after a session (1 booking = 1 review, marked "✓ ปรึกษาจริง / Real session"); the author can edit or delete their own. Mentors may **reply** but can **never delete or hide** reviews. Everyone reads them through the `mentor_reviews_public` view (no `user_id`); the `reply` column is set by admins only. A mentor's rating and count are always computed from the reviews (samples in `MREV` + real ones), never typed in; fewer than 3 reviews shows "✨ รุ่นพี่ใหม่ / New mentor".
- Part-time jobs: employers may never charge applicants. Keep the anti-scam notes, the report button and the minimum-wage warning.
- Must work at every screen size (360px phone → desktop) with no horizontal scrolling. Phone and tablet (≤1020px) use the bottom nav, desktop the top nav; both have the same 5 items: หน้าแรก · งาน · รีวิว · ปรึกษา · ฉัน. Writing a review lives on the Reviews page (composer + a floating ✎ button), not in the nav.
- Calm layout: 24–28px between sections (`.sec` = 26px), section headings (`.sec-h h2`) 20px everywhere, page titles `.pg-t`; at most 1 accent colour and at most 2 chips per card.
- Every theme must look right (17): default, night (dark), sakura, mint, lavender, sunset, dino, garden, sea, space (dark), galaxy (dark), japan, china, cafe, rain (dark), pixel (dark), library. Dark themes use the night palette from `css/style.css` as their base (`dark:true`), then their own `vars` on top. Style through CSS variables (`--bg`, `--surface`, `--ink`, `--blue`, `--navy`, `--orange`…), never hard-coded colors in components.
- Each theme has its own background effect and tap effect (canvas). The theme menu is a scrollable 3-column grid of small cards with each theme's pup, and has two sliders, "เอฟเฟกต์พื้นหลัง" and "เอฟเฟกต์ตอนแตะ", 0–100% (0 = off; 60% = the original look) that scale particle count, speed and size live, remembered per theme in `maadoo-fx`. Default 60%, or 0 under `prefers-reduced-motion`.
- The header's CSS is scoped to `header.top` because the top swipe card also has the class `top`.
- Each theme also has an ambient sound scene (`SND` + `SCENES` in `js/fx.js`), synthesized with the Web Audio API — no audio files, no licensing. It is off by default and must never start without a user gesture (a remembered "on" waits for the first tap/click/key). Theme changes crossfade; the tab being hidden suspends it. To use a real recording, add `music/<theme>.mp3` and set `music:true` on that theme in `js/themes.js` (or list it in `MUSIC_FILES`); if the file fails to load, the synthesized sound plays instead.
- Style: cute, rounded, friendly. Fonts are Mali (display) and Anuphan (body).

## Main areas (views, drawn by `render()` in `js/app.js`)
home · company (overview / reviews / salaries / interviews / open jobs) · jobs (tabs: งาน/ฝึกงาน · บริษัท (the explore page) · งานด่วน · เงินเดือน · แผนที่อาชีพ) · reviews · ask (Tinder-style mentor swipe + community board) · me (profile, Plus + coin cards, level, badges, my questions, mentor sessions, applications) · plus (Maadoo Plus page) · wallet (coin wallet + weekly missions) · invite (my invite code, invite stats, how it works, Pioneer card; linked from Me so the code stays reachable after the home promo block is hidden) · chat (1:1 room with a real mentor) · book (live-call booking page) · live (live-call room) · mentorApply (mentor application form) · admin (approve mentors, read chat reports; only users in `admins`) · employer (plans) · rules (guidelines, PDPA, part-time safety) · quiz (linked from Me and the footer).
- Old routes still work: `go('explore')` opens Jobs › บริษัท, `go('write')` / `data-go="write"` open the review sheet.
- **Home** has 4 parts only: hero title + search (no stats) · start card + compact first steps · "สำหรับคุณ" (tabs บริษัท / ฝึกงาน / งานด่วน, 3 each, onboarding fields first, "ดูทั้งหมด") · one single-line promo strip. The poll and helpful reviews are on Reviews, the salary checker is Jobs › เงินเดือน, the quiz is on Me.
- **Company cards** are compact: letter logo, name, category, ★ score, one tag (e.g. "ฝึกงาน 2"). The mood split, % and "+N reviews this month" are on the company page.
- **Reviews page:** composer card ("เคยทำงาน/ฝึกงานที่ไหน?…" + chips 🏢 review / 🎤 interview / 💰 salary + "1 นาที · ไม่ระบุตัวตน · 30 เหรียญ"), filter chips (มีประโยชน์ / ล่าสุด / ฝึกงาน / สายของฉัน / เลือกบริษัท), a feed of every company's reviews (samples + approved + my pending ones on top, marked "รอตรวจ", seen only by me) that loads 6 more at a time on scroll, the poll after the 3rd review, and a floating ✎ button.
- **Write sheet** (`openWrite`): bottom sheet on phones, modal on desktop; the same 5 questions one step at a time with X/5 progress, Back/Next; closing keeps what was typed (`S.form`). Every "write a review" link (company page, promos) opens it with the company preselected. Sending closes it, shows a toast and goes to Reviews.

## Premium (decided) — Maadoo Plus, Maadoo coins, Ask a mentor
- **Always free:** reading/writing reviews, salaries and applying to jobs. Paying never removes, hides or edits reviews.
- **Demo payments only:** every "pay" opens the simulated checkout (`payModal`) with a clear "เดโม / DEMO" banner. No real money is taken; never add a real payment integration without the owner's go-ahead.
- **Maadoo Plus plans:** monthly 99 THB (30 days) · yearly 990 THB (365 days, "คุ้มสุด", 2 months free) · internship term 249 THB (90 days). Buying extends `plus_until` from the later of now/current expiry.
- **Plus perks:** 5 free mentor questions a month · 20% off live mentor calls · 1 free resume review a month · job alerts 24 h early · detailed salary comparison · special themes + music (coming soon) · 100 coins a month (granted once per calendar month while Plus is active).
- **Plus mission:** write 3 company reviews → 1 free month of Plus (once per account, counted from the user's real reviews).
- **Ask a mentor (Plus):** open-ended chat until answered. "ได้คำตอบแล้ว พอใจ" closes it and uses 1 question, then offers a mentor review. No mentor reply within 48 h → refunded. 7 days quiet after a mentor reply → auto-closes and uses 1. Max 2 open at once; 5 per calendar month, no rollover (used this month + open ≤ 5). Sample mentors reply by simulation a few seconds after sending; real mentors reply in the realtime chat room. Statuses: รอคำตอบ / ตอบแล้ว / ปิดแล้ว.
- **Plus look on the mentor swipe cards (ask view):** Plus members see a 5px gold outer frame (`.scard.gold`, tokens `--gold-*`; the inside keeps the theme colors), 2 small gold ✦ sparkles in the image area, an orange "💬 ถามฟรี X/5" button next to the price, and a pale-gold "✨ Plus" tag by the ask heading. Non-Plus users see the normal card.
- **Maadoo coins:** 1 coin = 1 THB off (mentor bookings, theme unlocks); never exchangeable for cash. Top-ups: 100 = 99, 300 = 279, 600 = 529 THB. Weekly missions: company review +30, salary (in a review) +20, interview review +20, answer 3 juniors on the board +15, invite a friend +50 — each once per ISO week. Coins from reviews stay pending until the review passes moderation. Mission coins (missions + reviews) are capped at 300 per calendar month.
- **Storage:** logged-in (non-guest) users sync to Supabase `profiles` (`plus_until`, `free_month_claimed`, and the onboarding answers `onboard_goal`, `onboard_inds`, `onboard_fac`, `onboard_major`), `coin_ledger` and `questions`, all RLS own-rows only. The coin balance is **never stored**: it is always the sum of `ok` rows in `coin_ledger`, read through the `my_coins` view (`profiles.coins` is deprecated and unused). The `coin_ledger` trigger enforces the rules above. Guests and logged-out users are sent to log in / add an email before subscribing, asking or claiming coins. Without Supabase everything runs in memory.
- Before real payments: move `plus_until` renewals and `topup` ledger entries into a server-side payment webhook / Edge Function and revoke those client rights.

## Real mentors, step 1 (decided)
- **Apply:** nickname, field, company (optional), years, topics, LinkedIn link or work email (not a free mail), live-call price 99–249 THB/30 min, accept the mentor rules + 18 or older. Statuses: รออนุมัติ / อนุมัติแล้ว / ไม่ผ่าน. One pending application per user. Admins approve or reject on the admin page via `review_mentor_application()`; approval adds the mentor to `mentors` and their card shows on the swipe deck right away.
- **Make someone an admin:** `insert into public.admins (user_id) select id from auth.users where email = '…' on conflict do nothing;` (by hand in the SQL Editor).
- **Chat room:** 1 question = 1 room, still under the Plus 5-questions rule (the `questions` row is created first). Realtime messages, "✓✓" read receipts (`*_read_at` on the room), "🐾🐾🐾 กำลังพิมพ์..." via a broadcast channel, images/PDF up to 5 MB in the private `chat-files` bucket at `<room id>/<file>` (signed URLs; only the two members, plus admins for reported rooms). Quick asks: resume / interview questions / starting salary. The student's top bar "ได้คำตอบแล้ว? พอใจ ปิดคำถาม" closes the question and opens the mentor review (booking id = room id; real mentors can only be reviewed after a closed room).
- **Contact masking:** phone numbers, LINE IDs, emails and contact links are replaced with `[hidden]` (shown as "🔒 ซ่อนไว้") **by the database on save** until both sides tap "เราคุยสดกันแล้ว"; the original text is never stored. Report (to admins) and block (either side; only the blocker can unblock) are in the room header. Chat history is kept (no delete).
- **Mentor mode (Me):** available/not-available switch (hides the card, open chats still work), summary card (earnings this month are **simulated**: 40 THB per closed question, no real payouts; rating from reviews; average first-reply time), tabs รอตอบ / กำลังคุย / ปิดแล้ว with the 48 h countdown (red under 6 h).
- **Notifications:** red dot on the bell (new notification) and on the Ask tab (unread chats); browser notifications only after the user taps "เปิดแจ้งเตือน" and only while the tab is open in the background. No email notifications yet.
- Mentors never see the asker's email; the room shows the asker's display name only if they set one, otherwise "น้อง (ไม่ระบุชื่อ)".

## Real mentors, step 2: live calls (decided)
- **Times** are Bangkok time in 30-minute slots (`slot` 0–47; the editor shows 08:00–21:30). Mentors set a weekly schedule, can switch whole weekdays off (`mentors.off_weekdays`) and add days off (`mentor_days_off`) in mentor mode.
- **Booking page (`book`)**, used for every 📅 button (sample mentors get a made-up schedule and in-memory bookings):
  - A strip of the next 7 days, faded when there are no free slots, and a 3-column slot grid with taken slots struck through.
  - A slot must start at least 1 h from now and within 8 days.
  - Price summary: full price → Plus 20% off → coin slider (up to 50% of the Plus price and your balance) → big orange total.
  - Terms: free cancellation until 12 h before; mentor no-show = full refund; student no-show = no refund.
  - The payment is simulated (`payModal`, `what:'live'`), but coins are really deducted: `book_session()` writes a `spend` row with ref `booking:<id>`.
- **One booking per slot:** a unique index on `(mentor_id, starts_at)` where the booking isn't cancelled. Refunds are `refund` ledger rows that only `cancel_booking()` / `report_noshow()` can write.
- **Live room (`live`):**
  - Jitsi link `https://meet.jit.si/maadoojob-<64 random hex>` made per booking; the mentor may set a Google Meet link instead.
  - "เข้าห้องวิดีโอ" works from 10 minutes before the start.
  - A 30-minute timer ring, a 5-minute warning, and a link to the same chat (reuses an open room with that mentor, or a booking room with no question).
  - Cancel before the start; no-show buttons from +10 min; "คุยเสร็จแล้ว" from +15 min.
- **After the call:**
  - Done (or the mentor's notes) unlocks contact details in that chat for new messages. Messages masked earlier stay masked, because the original text isn't stored.
  - The mentor writes up to 3 tips (`session_notes`); the student sees "📝 สรุปจากรุ่นพี่" and can save it to Me.
  - The student is asked to rate the mentor with the existing mentor-review flow (booking id = booking id). Those reviews get `live = true` and show "✓ คุยสดจริง".
- **Mentor earnings (simulated)** = 80% of the price after the Plus discount (the platform covers the coin part), counted for done and student-no-show calls. It is shown with the question earnings in mentor mode.
- **Reminders** in the site (bell + toast, and a browser notification if allowed and the tab is hidden) for both sides: 1 h before, at the start, and 5 minutes before the end.

## Onboarding (decided)
- **First visit** (no `maadoo-welcome`): a 3-step welcome in the modal layer (`onboard`), replacing the old welcome popup. No login is needed. It shows step dots and a "ข้าม" on every step; "ข้าม" closes the whole welcome.
  - Step 1: the pup asks "มาหาอะไรที่ Maadoo Job?" with 6 big cards (pick one): intern, first job, part-time, salary, mentor, just looking.
  - Step 2: multi-select field chips from `IND`.
  - Step 3 (skippable): "เรียนคณะ/สาขาอะไร?" — the faculty picker (15 faculties + major search).
  - Answers go to `maadoo-onboard`, and to `profiles` when logged in (`onboard_goal`, `onboard_inds`, `onboard_fac`, `onboard_major`; pulled on login if the device has none).
- The theme menu has "🎯 เปลี่ยนเป้าหมาย / คณะ" to reopen the welcome.
- **Home "เริ่มตรงนี้" card** (brought back at the owner's request): one button that routes by goal (intern → jobs filtered by type + first matching field · first job → career map · part-time → quick jobs · salary → Jobs › เงินเดือน with a role preselected · mentor → swipe deck · just looking → Jobs › บริษัท filtered by field), "เปลี่ยน" reopens the welcome, × hides it (`startClosed`) until the welcome is finished again.
- **"ก้าวแรกของฉัน"** (compact): one line with a progress bar, tap to open the 4 steps (open a company +5 pts, follow a company +5 pts, swipe a mentor +5 pts, first review +30 coins as a `review` ledger row with ref `onboard:first-review`). Ticks work logged out; rewards are paid once to a logged-in non-guest. × hides it.
- **First day after onboarding:** the promo strip shows the "รีวิวแรก แลก Plus ฟรี!" offer.
- **Coach marks:** a small pup bubble points at one target at a time (no dimming, kept inside the viewport). Shown once per tour after onboarding. **At most 3 targets per page.**
  - Home is one continuous walk: search → Reviews menu → Jobs menu (home, 3) → (on Jobs) the 🗺️ tab → (on the map) a world circle.
  - Users who saw the older tours get `nav2` once (Reviews menu → Jobs menu). Reviews: composer → filters.
  - Steps that lead to another page open it on a tap on the highlighted target or on "ไปกันเลย →", and the walk carries on there. Other steps: any tap goes on. "ข้ามทั้งหมด" or Esc ends all tours.
  - Users who saw the older Home tour get the short `map` walk once (Jobs button → 🗺️ tab → circle); a first Jobs visit before the map was opened gets `jobsmap` (🗺️ tab → circle).
  - Ask: the swipe card, the star badge, ask-free.
  - The theme menu's "❓ พาเที่ยวอีกครั้ง" resets and replays. A legacy `maadoo-coach = '1'` counts as Home + Ask seen.

## Promotions (decided)
- **Home promo strip** (last on home, hidden while searching): one single-line promotion (`promoStrip`) — "รีวิวแรก แลก Plus ฟรี!" (the 3-reviews → 1 free month mission; always on the first day), otherwise one of "1,000 คนแรก", "ชวนเพื่อน" (both open the invite page) or the seasonal offer, changing by day. The × hides it for 7 days. The Pioneer and Invite cards live on the invite page.
- **Pioneer badge:** permanent 🚩 badge for the first 1,000 non-guest members; "เหลืออีก X ที่" and "is me a pioneer" come from `pioneer_stats()` (real `auth.users` count + my sign-up rank). Without Supabase a sample figure is shown and labelled.
- **Invite a friend:** every profile gets a code `MAADOO-XXXXXX` (server-generated). Links use `?ref=CODE`; the code is kept in `maadoo-ref` (so it survives sign-up, the email-confirmation link and guest → email) and applied after login with `use_invite_code()` (once, never your own, not for guests). Using a code gives 10 coins to both right away (`use_invite_code()`, ref `referral:<friend id>:join`); when the friend has written their first company review, `claim_referral_reward()` gives 40 more to both (50 in total, once per friend; 50 if they linked before the join bonus existed). `referral` ledger rows can only come from that function.
- **Seasonal offer by month:** Jan–Mar Plus internship term 249 · Apr Songkran theme (coming soon → Ocean theme) · Jul–Aug new-semester part-time jobs · Nov Loy Krathong (ask a mentor) · Dec yearly Plus 30% off (990 → 693, applied on the Plus page and checkout) · other months: weekly coin missions. Preview any month with `?promo_month=1..12`.
- **Employer plans:** Starter free · Pro 3,900 THB/month, early-bird 1,950 for the first 3 months + 3 months of free job posts for the first 50 companies · Enterprise from 15,000. Pro goes through the simulated checkout. `employer_signups` records sign-ups; the server decides `early_bird` (first 50 Pro) and `early_bird_left()` feeds "เหลือ X สิทธิ์". Every plan can reply to reviews but never delete or hide them.

## Parked decisions (don't build yet unless asked)
- Prices for promoting part-time jobs (shows "free during the demo" for now).
- Special themes/music for Plus and coin theme unlocks (shown as "coming soon").

## Before every commit
- **Small change** (text, colour, price): test only the page you changed at 360px and 1280px in the default theme. That's enough.
- **Big change** (new feature, layout, logic, anything touching several pages): open the page at 360px, 768px and 1280px widths, in Thai and English, and in at least the default and night themes.
- Either way: no console errors and nothing overflows horizontally.

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
