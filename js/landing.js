/* Maadoo Job · js/landing.js — the landing page (view `landing`). Classic script sharing one global scope; see CLAUDE.md for load order.
   Everyone who isn't logged in sees only this page; logging in (email or an anonymous guest account) opens the app, logging out comes back here.
   Nothing on it links into the app: the nav scrolls to sections on the page, every call to action opens the login popup.
   Always light, its own font (IBM Plex Sans Thai, loaded only here) and its own colors (scoped to .ld in css/style.css); the app's header, bottom nav, footer and theme effects are hidden while it shows. */
/* is a login being restored? (supabase-js keeps the session in localStorage; until auth answers, don't flash the landing) */
const ldSession=()=>{try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(/^sb-.*-auth-token$/.test(k))return true}}catch(e){}return false};
const LD_BOOT=Date.now();
const ldNeed=()=>!S.user&&!(ldSession()&&!S.authReady&&(SB||Date.now()-LD_BOOT<6000));
if(!ldSession())S.view='landing';
S.ldMenu=false;
function ldFont(){if(document.getElementById('ldFont'))return;const l=document.createElement('link');l.id='ldFont';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@500;600;700&display=swap';document.head.appendChild(l)}
/* nav: [section id, th, en] — each scrolls to its section on this page */
const LD_NAV=[['how','วิธีใช้','How it works'],['reviews','รีวิวบริษัท','Company reviews'],['sal','เงินเดือน','Salaries'],['intern','ฝึกงาน','Internships'],['mentor','ปรึกษารุ่นพี่','Ask a senior'],['price','ราคา','Pricing']];
function ldScroll(id){const el=document.getElementById('ld-'+id);if(el)el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}
/* everything on the landing stays on the landing; the only way in is logging in (email or a guest account) */
function ldGo(k){const wasMenu=S.ldMenu;S.ldMenu=false;if(wasMenu)render();
 if(k==='login'){openModal({type:'login'});return}
 if(k==='signup'){openModal({type:'login',mode:'up'});return}
 if(k==='guest'){openModal({type:'login'});if(SB)authRun(()=>SB.auth.signInAnonymously(),'anon');return}
 if(k==='top'){window.scrollTo({top:0,behavior:'smooth'});return}
 ldScroll(k)}
/* called first in render(): logged out → the landing (whatever page was asked for); logged in → back into the app.
   The page gets html.landing-on while it shows; the first-visit welcome opens once someone logs in for the first time. */
function ldSync(){const need=ldNeed();if(need)S.view='landing';else if(S.view==='landing')S.view='home';
 const on=S.view==='landing';document.documentElement.classList.toggle('landing-on',on);
 if(!on&&ldSync.was&&!welcomed()&&!S.modal)setTimeout(()=>{if(!S.modal&&S.view!=='landing'&&!welcomed())openOnboard()},300);
 if(on&&!ldSync.was&&S.modal&&S.modal.type!=='login'&&S.modal.type!=='otp')S.modal=null;
 ldSync.was=on}
function landing(){ldFont();const logo=`<button class="logo ld-logo" data-ld="top" aria-label="Maadoo Job"><img src="maadoo-icon.webp" alt=""><span class="lw" aria-hidden="true">Maado<span class="lo">${(document.querySelector('header.top .lo')||{innerHTML:'<span class="lo-c">o</span>'}).innerHTML}</span></span></button>`;
 const navs=LD_NAV.map(([k,th,en])=>`<button data-ld="${k}">${t(th,en)}</button>`).join('');
 return `<div class="ld"><header class="ld-top"><div class="ld-in">${logo}<nav class="ld-nav" aria-label="${t('เมนู','Menu')}">${navs}</nav>
  <div class="ld-acts"><button class="ld-login" data-ld="login">${t('เข้าสู่ระบบ','Log in')}</button><button class="ld-btn" data-ld="signup">${t('เริ่มใช้ฟรี','Start free')}</button>
  <button class="ld-burger" data-ldmenu aria-expanded="${S.ldMenu}" aria-controls="ldMenu" aria-label="${t('เมนู','Menu')}"><span aria-hidden="true">☰</span></button></div></div>
  ${S.ldMenu?`<div class="ld-menu" id="ldMenu">${navs}<div class="ld-menu-acts"><button class="ld-login" data-ld="login">${t('เข้าสู่ระบบ','Log in')}</button><button class="ld-btn" data-ld="signup">${t('เริ่มใช้ฟรี','Start free')}</button></div></div>`:''}</header>
 <main class="ld-hero"><div class="ld-in ld-grid">
  <div class="ld-copy">
   <p class="ld-pill"><b>✦ ${t('ใหม่','New')}</b>${t('เปิดให้ทดลองใช้แล้ว · ฟรีสำหรับนักศึกษา','Now open to try · free for students')}</p>
   <p class="ld-kicker">MAADOO JOB · ${t('รีวิวที่ทำงานจากคนใน','Workplace reviews from insiders')}</p>
   <h1 class="ld-h"><span>${t('ประกาศงานบอกแค่ด้านดี','Job ads show the good side.')}</span><span class="o">${t('คนในบอกความจริง','Insiders tell the truth.')}</span></h1>
   <p class="ld-sub">${t('อ่านรีวิวจากคนที่เคยทำจริง ดูเงินเดือนที่ได้จริง แล้วปัดหารุ่นพี่ถามได้ทันที — <span class="nw">ก่อนไปทำงาน มาดูก่อน</span>','Read reviews from people who really worked there, see real salaries, then swipe to find a senior to ask — <span class="nw">before you go, Maadoo first.</span>')}</p>
   <div class="ld-cta"><button class="ld-btn big" data-ld="signup">${t('เริ่มมาดูเลย','Start looking')} <span aria-hidden="true">→</span></button><button class="ld-ghost big" data-ld="how">${t('ดูวิธีใช้','How it works')}</button></div>
   <button class="ld-guest" data-ld="guest">👀 ${t('หรือลองใช้แบบไม่ระบุตัวตน ไม่ต้องสมัคร','Or try it anonymously, no sign-up')}</button>
   <ul class="ld-ticks"><li>${t('ไม่ระบุตัวตน','Anonymous')}</li><li>${t('บริษัทลบรีวิวไม่ได้','Companies can’t delete reviews')}</li><li>${t('ใช้ฟรี','Free')}</li></ul>
  </div>
  <div class="ld-art" aria-label="${t('ตัวอย่างรีวิว (ข้อมูลสมมติ)','Sample review (fictional)')}">
   <div class="ld-dots" aria-hidden="true"></div>
   <div class="ld-card ld-pup"><img src="maadoo-icon.webp" alt=""><div><b>${t('มาดูด้วยกันนะ!','Let’s look together!')}</b><small>${t('น้องมาดูสรุปรีวิว 12 รีวิวให้แล้ว','Maadoo summed up 12 reviews for you')}</small></div></div>
   <div class="ld-card ld-rev">
    <div class="ld-rev-top"><span class="ld-dots3" aria-hidden="true">•••</span><span>${t('รีวิวบริษัท','Company review')}</span><span class="ld-role">${t('ฝึกงาน · QC','Intern · QC')}</span></div>
    <div class="ld-co"><span class="ld-mark">${t('บฟ','BF')}</span><div><b>${t('ไบโอเฟรช ฟู้ดส์','BioFresh Foods')}</b><small>${t('อาหาร · บางนา','Food · Bang Na')} · <em>✓ ${t('คนในยืนยันแล้ว 12 คน','12 insiders confirmed')}</em></small></div></div>
    <p class="ld-vs">${t('ประกาศ VS ความจริง','The ad VS reality')}</p>
    <div class="ld-tbl">
     <div class="ld-r"><span>${t('เงินเดือน','Salary')}</span><s>${t('ตามตกลง','Negotiable')}</s><b>฿24,500</b></div>
     <div class="ld-r"><span>${t('เวลาเข้างาน','Start time')}</span><s>8:30</s><b class="ld-ring">6:30 ${t('น. (กะเช้า)','am (early shift)')}<svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true"><path d="M14 34C10 14 70 4 120 6s78 10 74 28-60 24-112 22S8 50 16 30"/></svg></b></div>
     <div class="ld-r ld-lab"><span>${t('ได้ลงแล็บจริง','Real lab work')}</span><em>${t('ได้ ตั้งแต่สัปดาห์แรก','Yes, from week one')}</em><b class="ld-stars" aria-label="5/5">★★★★★</b></div>
    </div>
    <p class="ld-quote">“${t('พี่เลี้ยงสอนดี แต่ต้องขึ้นรถรับส่ง 6 โมงครึ่ง ประกาศไม่ได้บอก','Great mentor, but the shuttle leaves at 6:30 am. The ad never said so.')}”</p>
   </div>
   <div class="ld-card ld-sen">
    <div class="ld-sen-h"><b>💬 ${t('ปรึกษารุ่นพี่','Ask a senior')}</b><span class="ld-on">● ${t('ออนไลน์','Online')}</span></div>
    <div class="ld-sen-p"><span class="ld-av">${t('พพ','PR')}</span><div><b>${t('พี่แพร · Data Analyst','Prae · Data Analyst')}</b><small>★ 4.9 · ${t('ตอบเฉลี่ย 2 ชม. · เคยฝึกงานที่นี่','replies in ~2 h · interned here')}</small></div></div>
    <button class="ld-btn ld-ask" data-ld="signup">${t('ถามรุ่นพี่คนนี้','Ask this senior')} <span aria-hidden="true">→</span></button>
   </div>
  </div>
 </div></main>
 <section class="ld-how" id="ld-how" aria-labelledby="ld-how-h"><div class="ld-in">
  <p class="ld-kicker">${t('วิธีใช้','HOW IT WORKS')}</p>
  <h2 class="ld-h2" id="ld-how-h">${t('ใช้ Maadoo Job ยังไง?','How do I use Maadoo Job?')}</h2>
  <p class="ld-how-sub">${t('4 ขั้นง่าย ๆ ก่อนตัดสินใจไปฝึกงานหรือทำงานที่ไหน','4 simple steps before you decide where to intern or work')}</p>
  <ol class="ld-steps">${LD_STEPS.map(([ic,th,en,dth,den],i)=>`<li class="ld-step"><span class="ld-num">${i+1}</span><span class="ld-ic" aria-hidden="true">${ic}</span><b>${t(th,en)}</b><p>${t(dth,den)}</p></li>`).join('')}</ol>
 </div></section>
 ${ldSections()}
 <section class="ld-end"><div class="ld-in"><img src="maadoo-icon.webp" alt=""><h2 class="ld-h2">${t('พร้อมมาดูก่อนไปทำงานหรือยัง?','Ready to look before you go?')}</h2><p class="ld-how-sub">${t('สมัครฟรีด้วยอีเมล หรือลองแบบไม่ระบุตัวตนก่อนก็ได้','Sign up free with email, or try it anonymously first')}</p>
  <div class="ld-how-cta"><button class="ld-btn big" data-ld="signup">${t('เริ่มใช้ฟรี','Start free')} <span aria-hidden="true">→</span></button><button class="ld-ghost big" data-ld="guest">👀 ${t('ลองแบบไม่ระบุตัวตน','Try anonymously')}</button><button class="ld-ghost big" data-ld="login">${t('มีบัญชีแล้ว เข้าสู่ระบบ','I have an account · Log in')}</button></div></div></section>
 <footer class="ld-foot"><div class="ld-in">© 2026 ${t('มาดูจ็อบ','Maadoo Job')} · ${t('เดโม · ข้อมูลตัวอย่าง','Demo · sample data')}</div></footer></div>`}
/* feature sections (sample data from js/data.js, all fictional); each ends with a log-in button, never a link into the app */
function ldSec(id,kick,h,sub,body,cta){return `<section class="ld-sec" id="ld-${id}" aria-labelledby="ld-${id}-h"><div class="ld-in"><p class="ld-kicker">${kick}</p><h2 class="ld-h2" id="ld-${id}-h">${h}</h2><p class="ld-how-sub">${sub}</p>${body}
 <div class="ld-sec-cta"><button class="ld-btn" data-ld="signup">${cta} <span aria-hidden="true">→</span></button><span>${t('ฟรี · ใช้เวลาไม่ถึงนาที','Free · takes under a minute')}</span></div></div></section>`}
function ldSections(){const sample=`<span class="ld-sample">${t('ข้อมูลตัวอย่าง','Sample data')}</span>`;
 const revs=CO.slice(0,3).map(c=>{const r=c.reviews[0];return `<article class="ld-mini"><div class="ld-mini-h"><span class="ld-mark sm" style="background:${c.hue}">${esc(x(c.mk))}</span><b>${esc(x(c.name))}</b><span class="ld-stars">${'★'.repeat(r.r)}${'☆'.repeat(5-r.r)}</span></div><p class="ld-mini-t">“${esc(x(r.t))}”</p><p class="ld-mini-p">👍 ${esc(x(r.p))}</p><p class="ld-mini-c">👎 ${esc(x(r.c))}</p></article>`}).join('');
 const sal=CO.slice(0,5).map(c=>c.salary.find(v=>!v[5])).filter(Boolean).slice(0,4).map(v=>`<div class="ld-r"><span>${esc(x(v[0]))}</span><em>${t(`${v[4]} คนบอก`,`${v[4]} reports`)}</em><b>฿${fmt(v[1])}–${fmt(v[3])}</b></div>`).join('');
 const jobs=JOBS.filter(j=>j.type==='intern').slice(0,3).map(j=>{const c=getCo(j.co);return `<article class="ld-mini"><div class="ld-mini-h"><span class="ld-mark sm" style="background:${c.hue}">${esc(x(c.mk))}</span><b>${esc(x(j.title))}</b></div><p class="ld-mini-t">${esc(x(c.name))}</p><p class="ld-mini-p">💸 ${j.pay[1]?`${fmt(j.pay[0])}${j.pay[1]>j.pay[0]?'–'+fmt(j.pay[1]):''} ${j.unit==='day'?t('บาท/วัน','THB/day'):t('บาท/เดือน','THB/month')}`:t('ไม่มีเบี้ยเลี้ยง','No allowance')}</p><p class="ld-tags">${(j.tags||[]).slice(0,2).map(g=>`<span>${esc(x(g))}</span>`).join('')}</p></article>`}).join('');
 const mts=MENTORS.slice(0,3).map(m=>`<article class="ld-mini"><div class="ld-mini-h"><span class="ld-av" style="background:${m.bg};color:#14233F">${m.ava}</span><div><b>${esc(x(m.name))}</b><small>${esc(x(m.role))} · ${esc(x(m.at))}</small></div></div><p class="ld-mini-t">“${esc(x(m.bio))}”</p><p class="ld-mini-p">💬 ${t(`${m.price} บาท / 30 นาที`,`${m.price} THB / 30 min`)}</p></article>`).join('');
 const P=PLANS,price=`<div class="ld-prices"><article class="ld-plan"><b>${t('ใช้ฟรี','Free')}</b><p class="ld-pr">฿0</p><ul><li>${t('อ่านและเขียนรีวิว','Read and write reviews')}</li><li>${t('ดูเงินเดือน','See salaries')}</li><li>${t('สมัครงานและฝึกงาน','Apply to jobs and internships')}</li><li>${t('ปัดหารุ่นพี่','Swipe for seniors')}</li></ul></article>
  <article class="ld-plan plus"><b>✨ Maadoo Plus</b><p class="ld-pr">฿${P.m.price}<small>${x(P.m.per)}</small></p><p class="ld-pr-alt">${t(`หรือ ฿${fmt(P.y.price)}${P.y.per[0]} · ฿${P.t.price}${P.t.per[0]} (เทอมฝึกงาน)`,`or ฿${fmt(P.y.price)}${P.y.per[1]} · ฿${P.t.price}${P.t.per[1]} (internship term)`)}</p><ul><li>${t('ถามรุ่นพี่ฟรี 5 ข้อ/เดือน','5 free mentor questions a month')}</li><li>${t('ลด 20% คุยสดกับรุ่นพี่','20% off live mentor calls')}</li><li>${t('ตรวจเรซูเม่ฟรีเดือนละครั้ง','1 free resume review a month')}</li><li>${t('100 เหรียญทุกเดือน','100 coins every month')}</li></ul></article></div>
  <p class="ld-note">${t('เดโม: ยังไม่มีการเก็บเงินจริง · การจ่ายเงินไม่มีทางลบหรือซ่อนรีวิวได้','Demo: no real payments yet · paying can never delete or hide reviews')}</p>`;
 return ldSec('reviews',t('รีวิวบริษัท','COMPANY REVIEWS'),t('รีวิวจากคนที่เคยอยู่จริง','Reviews from people who were really there'),t('ข้อดี ข้อเสีย ไม่ระบุตัวตน และบริษัทลบรีวิวไม่ได้','Pros and cons, anonymous, and companies can’t delete them')+' '+sample,`<div class="ld-minis">${revs}</div>`,t('เข้าสู่ระบบเพื่ออ่านรีวิวทั้งหมด','Log in to read every review'))
 +ldSec('sal',t('เงินเดือน','SALARIES'),t('เงินเดือนจริง ไม่ใช่ “ตามตกลง”','Real pay, not “negotiable”'),t('ช่วงเงินเดือนที่คนในตำแหน่งนั้นบอกไว้','Pay ranges reported by people in the role')+' '+sample,`<div class="ld-tbl ld-sal">${sal}</div>`,t('เข้าสู่ระบบเพื่อเทียบเงินเดือน','Log in to compare salaries'))
 +ldSec('intern',t('ฝึกงาน','INTERNSHIPS'),t('ที่ฝึกงานที่ได้ทำงานจริง','Internships with real work'),t('เบี้ยเลี้ยง สวัสดิการ และรีวิวจากรุ่นก่อน ในที่เดียว','Allowance, perks and reviews from past interns in one place')+' '+sample,`<div class="ld-minis">${jobs}</div>`,t('เข้าสู่ระบบเพื่อดูที่ฝึกงานทั้งหมด','Log in to see every internship'))
 +ldSec('mentor',t('ปรึกษารุ่นพี่','ASK A SENIOR'),t('ปัดหารุ่นพี่ ถามเรื่องที่รีวิวไม่ได้บอก','Swipe for a senior, ask what reviews don’t say'),t('รุ่นพี่ตัวจริงยืนยันด้วยอีเมลที่ทำงาน คุยแชทหรือวิดีโอคอล','Real seniors verified by work email; chat or video call')+' '+sample,`<div class="ld-minis">${mts}</div>`,t('เข้าสู่ระบบเพื่อปัดหารุ่นพี่','Log in to swipe for seniors'))
 +ldSec('price',t('ราคา','PRICING'),t('ใช้ฟรีได้เลย อยากได้มากกว่าค่อยอัปเกรด','Free to use; upgrade only if you want more'),t('อ่านรีวิว ดูเงินเดือน และสมัครงาน ฟรีตลอด','Reviews, salaries and applying are always free'),price,t('เริ่มใช้ฟรี','Start free'))}
/* how-it-works steps (text only): [icon, title th/en, text th/en] */
const LD_STEPS=[
 ['🔍','ค้นหาบริษัท','Find a company','พิมพ์ชื่อบริษัท ตำแหน่ง หรือย่านที่อยากทำงาน แล้วเปิดดูหน้าบริษัท','Search a company, role or area and open its page'],
 ['⭐','อ่านรีวิวจากคนใน','Read insider reviews','ข้อดี ข้อเสีย บรรยากาศจริง จากคนที่เคยฝึกงานหรือทำงานที่นั่น ไม่ระบุตัวตน','Pros, cons and the real vibe from people who interned or worked there, anonymously'],
 ['💰','เทียบเงินเดือนจริง','Compare real salaries','ดูว่าตำแหน่งนี้ได้เงินเท่าไหร่จริง ๆ ก่อนไปสัมภาษณ์หรือต่อรอง','See what the role really pays before you interview or negotiate'],
 ['💬','ปัดหารุ่นพี่ ถามได้เลย','Swipe to find a senior','ปัดหารุ่นพี่ที่ทำงานสายที่สนใจ แล้วถามเรื่องที่รีวิวไม่ได้บอก','Swipe to find seniors in your field and ask what reviews don’t say']];
document.addEventListener('click',e=>{if(S.view!=='landing')return;const b=e.target.closest('[data-ld],[data-ldmenu]');
 if(!b){if(S.ldMenu&&!e.target.closest('#ldMenu')){S.ldMenu=false;render()}return}
 e.stopPropagation();if(b.hasAttribute('data-ldmenu')){S.ldMenu=!S.ldMenu;render();return}ldGo(b.dataset.ld)},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.view==='landing'&&S.ldMenu){S.ldMenu=false;render()}});
