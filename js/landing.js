/* Maadoo Job · js/landing.js — the landing page (view `landing`) for a first visit while logged out. Classic script sharing one global scope; see CLAUDE.md for load order.
   Shown once: when there's no `maadoo-welcome`, no `maadoo-landing` and no saved Supabase session. Leaving it (any button, logging in) sets `maadoo-landing`.
   Always light, its own font (IBM Plex Sans Thai, loaded only here) and its own colors (scoped to .ld in css/style.css); the app's header, bottom nav, footer and theme effects are hidden while it shows. */
const LD_KEY='maadoo-landing';
const ldSession=()=>{try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(/^sb-.*-auth-token$/.test(k))return true}}catch(e){}return false};
if(!store.get('maadoo-welcome')&&!store.get(LD_KEY)&&!ldSession())S.view='landing';
S.ldMenu=false;
function ldFont(){if(document.getElementById('ldFont'))return;const l=document.createElement('link');l.id='ldFont';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@500;600;700&display=swap';document.head.appendChild(l)}
/* nav: [key, th, en] — each opens the matching page of the app */
const LD_NAV=[['how','วิธีใช้','How it works'],['reviews','รีวิวบริษัท','Company reviews'],['sal','เงินเดือน','Salaries'],['intern','ฝึกงาน','Internships'],['ask','ปรึกษารุ่นพี่','Ask a senior'],['plus','ราคา','Pricing']];
function ldGo(k){const wasMenu=S.ldMenu;S.ldMenu=false;
 if(k==='how'){if(wasMenu)render();const el=document.getElementById('ld-how');if(el)el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return}
 if(k==='goal'){openOnboard();return}
 if(k==='login'||k==='signup'){openModal(k==='signup'?{type:'login',mode:'up'}:{type:'login'});return}
 if(k==='reviews')go('reviews');else if(k==='sal')go('jobs',{jobTab:'sal'});else if(k==='intern'){S.jobF=Object.assign({},S.jobF,{type:'intern'});go('jobs',{jobTab:'full'})}
 else if(k==='ask')go('ask',{askTab:'swipe'});else if(k==='plus')go('plus');else go('home')}
/* called from render(): leaving the landing (or logging in) marks it seen; the page gets html.landing-on while it shows */
function ldSync(){if(S.view==='landing'&&S.user)S.view='home';const on=S.view==='landing';document.documentElement.classList.toggle('landing-on',on);if(!on&&ldSync.was)store.set(LD_KEY,'1');ldSync.was=on}
function landing(){ldFont();const logo=`<button class="logo ld-logo" data-ld="home" aria-label="Maadoo Job"><img src="maadoo-icon.webp" alt=""><span class="lw" aria-hidden="true">Maado<span class="lo">${(document.querySelector('header.top .lo')||{innerHTML:'<span class="lo-c">o</span>'}).innerHTML}</span></span></button>`;
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
   <div class="ld-cta"><button class="ld-btn big" data-ld="home">${t('เริ่มมาดูเลย','Start looking')} <span aria-hidden="true">→</span></button><button class="ld-ghost big" data-ld="how">${t('ดูวิธีใช้','How it works')}</button></div>
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
    <button class="ld-btn ld-ask" data-ld="ask">${t('ถามรุ่นพี่คนนี้','Ask this senior')} <span aria-hidden="true">→</span></button>
   </div>
  </div>
 </div></main>
 <section class="ld-how" id="ld-how" aria-labelledby="ld-how-h"><div class="ld-in">
  <p class="ld-kicker">${t('วิธีใช้','HOW IT WORKS')}</p>
  <h2 class="ld-h2" id="ld-how-h">${t('ใช้ Maadoo Job ยังไง?','How do I use Maadoo Job?')}</h2>
  <p class="ld-how-sub">${t('4 ขั้นง่าย ๆ ก่อนตัดสินใจไปฝึกงานหรือทำงานที่ไหน','4 simple steps before you decide where to intern or work')}</p>
  <ol class="ld-steps">${LD_STEPS.map(([ic,th,en,dth,den,k,bth,ben],i)=>`<li class="ld-step"><span class="ld-num">${i+1}</span><span class="ld-ic" aria-hidden="true">${ic}</span><b>${t(th,en)}</b><p>${t(dth,den)}</p><button class="ld-link" data-ld="${k}">${t(bth,ben)} <span aria-hidden="true">→</span></button></li>`).join('')}</ol>
  <div class="ld-how-cta"><button class="ld-btn big" data-ld="home">${t('เริ่มมาดูเลย','Start looking')} <span aria-hidden="true">→</span></button><button class="ld-ghost big" data-ld="goal">🎯 ${t('ให้น้องมาดูช่วยเลือกให้','Let Maadoo pick for me')}</button></div>
 </div></section></div>`}
/* how-it-works steps: [icon, title th/en, text th/en, where the button goes, button th/en] */
const LD_STEPS=[
 ['🔍','ค้นหาบริษัท','Find a company','พิมพ์ชื่อบริษัท ตำแหน่ง หรือย่านที่อยากทำงาน แล้วเปิดดูหน้าบริษัท','Search a company, role or area and open its page','reviews','ดูรีวิวบริษัท','See company reviews'],
 ['⭐','อ่านรีวิวจากคนใน','Read insider reviews','ข้อดี ข้อเสีย บรรยากาศจริง จากคนที่เคยฝึกงานหรือทำงานที่นั่น ไม่ระบุตัวตน','Pros, cons and the real vibe from people who interned or worked there, anonymously','reviews','อ่านรีวิว','Read reviews'],
 ['💰','เทียบเงินเดือนจริง','Compare real salaries','ดูว่าตำแหน่งนี้ได้เงินเท่าไหร่จริง ๆ ก่อนไปสัมภาษณ์หรือต่อรอง','See what the role really pays before you interview or negotiate','sal','ดูเงินเดือน','See salaries'],
 ['💬','ปัดหารุ่นพี่ ถามได้เลย','Swipe to find a senior','ปัดหารุ่นพี่ที่ทำงานสายที่สนใจ แล้วถามเรื่องที่รีวิวไม่ได้บอก','Swipe to find seniors in your field and ask what reviews don’t say','ask','ปัดหารุ่นพี่','Find a senior']];
document.addEventListener('click',e=>{if(S.view!=='landing')return;const b=e.target.closest('[data-ld],[data-ldmenu]');
 if(!b){if(S.ldMenu&&!e.target.closest('#ldMenu')){S.ldMenu=false;render()}return}
 e.stopPropagation();if(b.hasAttribute('data-ldmenu')){S.ldMenu=!S.ldMenu;render();return}ldGo(b.dataset.ld)},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.view==='landing'&&S.ldMenu){S.ldMenu=false;render()}});
