/* Maadoo Job · js/views.js — main pages: home, explore, company, write, ask, quiz, jobs. Classic script sharing one global scope; see CLAUDE.md for load order. */
/* ---------- views ---------- */
function home(){
 const q=S.q.trim().toLowerCase();
 const hay=c=>[...c.name,IND[c.ind][0],IND[c.ind][1],...c.loc,...c.transit,...c.salary.flatMap(s=>s[0])].join(' ').toLowerCase();
 const list=q?CO.filter(c=>hay(c).includes(q)):CO.slice().sort((a,b)=>b.trend-a.trend).slice(0,6);
 const latest=CO.map(c=>[c.reviews[0],c,0]).sort((a,b)=>b[0].h-a[0].h);
 const tot=POLL.o.reduce((a,o)=>a+o[1],0)+(S.poll!==null?1:0);
 const quick=[['QC','QC'],['สตาร์ทอัพ','startup'],['MRT','MRT'],['ยา','pharma'],['ฝึกงาน','intern']];
 const roles=allRoles();
 return `<section class="hero"><div class="hero-txt">
  <h1>${t('ก่อนไปทำงาน <em>มาดู</em>ก่อน','Before you go, <em>Maadoo</em> first')}</h1>
  <p class="hero-sub">${t('รีวิวที่ทำงานจากคนในตัวจริง','Real workplace reviews from real insiders')}</p>
 </div><div class="hero-side"><div class="mascot"><img src="${PUP()}" alt="${t('น้องมาดู น้องหมาผู้ช่วยหางาน','Maadoo, the job-hunting pup')}"><svg class="m-say" viewBox="0 0 100 100" aria-hidden="true"><g transform="translate(69 12) rotate(6)"><path d="M6 0H32Q38 0 38 6V17Q38 23 32 23H14L2.5 32.5L7.5 23H6Q0 23 0 17V6Q0 0 6 0Z"/><text x="19" y="12.2" text-anchor="middle" dominant-baseline="central">JOB!</text></g></svg><span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">✦</span></div>
  <div class="stats"><div><b class="num">${fmt(12480)}</b><span>${t('รีวิว','reviews')}</span></div><div><b class="num">${fmt(3120)}</b><span>${t('บริษัท','companies')}</span></div><div><b class="num">${fmt(8904)}</b><span>${t('ข้อมูลเงินเดือน','salaries')}</span></div></div></div></section>
 <div class="search-wrap"><form class="search" id="searchForm" role="search"><input id="q" placeholder="${t('ค้นหาบริษัท ตำแหน่ง หรือย่าน เช่น QC, ลาดพร้าว','Search companies, roles or areas, e.g. QC, Ari')}" value="${esc(S.q)}" aria-label="${t('ค้นหา','Search')}"><button class="btn y">${t('ค้นหา','Search')}</button></form><div class="quick"><button class="explore-btn" data-go="explore"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>${t('สำรวจบริษัททั้งหมด','Explore all companies')}</button>${quick.map(k=>`<button data-qk="${esc(S.lang==='en'?k[1]:k[0])}">${S.lang==='en'?(k[1]==='intern'?'Internships':k[1]==='startup'?'Startups':k[1]==='pharma'?'Pharma':k[1]==='MRT'?'Near MRT':k[1]):(k[0]==='MRT'?'ใกล้ MRT':k[0])}</button>`).join('')}</div></div>
 ${q?'':promoSection()}
 <section class="sec"><div class="sec-h"><h2>${q?t(`ผลการค้นหา “${esc(S.q)}”`,`Results for “${esc(S.q)}”`):t('บริษัทที่ถูกพูดถึงสัปดาห์นี้','Talked about this week')}</h2>${q?`<button class="link" data-clear>${t('ล้างการค้นหา','Clear search')}</button>`:`<button class="link" data-go="explore">${t('ดูทั้งหมด','See all')}</button>`}</div>
  <div class="grid g3">${list.length?list.map(coCard).join(''):`<div class="card empty">${t('ยังไม่มีบริษัทนี้ใน Maadoo','This company is not on Maadoo yet')} · <button class="link" data-go="write">${t('เป็นคนแรกที่รีวิว','Be the first to review')}</button> ${t('แล้วรับเหรียญ “ผู้บุกเบิก”','and earn the “Pioneer” badge')}</div>`}</div></section>
 <section class="sec grid g2">
  <div class="card" style="display:grid;gap:12px"><div class="sec-h" style="margin:0"><h2>${t('คำถามวันนี้','Question of the day')}</h2><span class="muted">${fmt(tot*37)} ${t('คนตอบแล้ว','answered')}</span></div>
   <p style="font-weight:500">${x(POLL.q)}</p><div class="poll">${POLL.o.map((o,i)=>{const n=o[1]+(S.poll===i?1:0);const p=Math.round(n/tot*100);return `<button class="pollopt ${S.poll===i?'mine':''}" data-poll="${i}"><i class="fill" style="width:${S.poll!==null?p:0}%"></i><span><span>${x(o[0])}</span>${S.poll!==null?`<b class="num">${p}%</b>`:''}</span></button>`}).join('')}</div>
   <p class="muted">${S.poll!==null?t('ขอบคุณที่ตอบ! พรุ่งนี้มีคำถามใหม่','Thanks! A new question drops tomorrow'):t('กดตอบ 1 ครั้งแล้วดูว่าคนอื่นตอบอะไร','Tap once to see how others answered')}</p></div>
  <div class="card" style="display:grid;gap:12px;align-content:start"><h2 style="font-size:20px">${t('เงินเดือนคุณสูงกว่าคนอื่นแค่ไหน?','How does your salary compare?')}</h2>
   <p class="muted" style="font-size:14px">${t('เทียบกับข้อมูลเงินเดือนตำแหน่งเดียวกัน แล้วแชร์การ์ดผลลัพธ์ได้เลย','Compare with others in the same role, then share your result card')}</p>
   <select class="field" id="salRole" aria-label="${t('ตำแหน่ง','Role')}">${roles.map((r,i)=>`<option value="${i}" ${i===+S.sal.role?'selected':''}>${x(r)}</option>`).join('')}</select>
   <div class="row"><input class="field num" id="salV" inputmode="numeric" value="${esc(S.sal.v)}" style="flex:1;min-width:120px" aria-label="${t('เงินเดือน (บาท)','Salary (THB)')}"><span class="muted">${t('บาท/เดือน','THB/month')}</span></div>
   <button class="btn" data-salcheck>${t('เช็กเลย','Check')}</button><div id="salOut"></div></div>
 </section>
 ${q||S.ob.goal==='first'?'':`<section class="sec card cm-home"><span aria-hidden="true">🗺️</span><div><b>${t('คณะคุณไปได้ไกลกว่าที่คิด','Your faculty can take you further than you think')}</b><span class="muted">${t('ยังไม่รู้ว่าอยากทำอะไร? เริ่มจากแผนที่นี้ได้เลย','Still figuring out what you want? Start with this map')}</span><span class="muted">${FAC[S.ob.fac]?t(`ดูงานที่ ${facName()} เข้าได้ ทั้งตรงสายและข้ามสาย`,`See the roles ${facName()} can reach, direct and cross-over`):t('เลือกคณะ แล้วดูงานที่เข้าได้ ทั้งตรงสายและข้ามสาย','Pick your faculty and see the roles it can reach, direct and cross-over')}</span></div><button class="btn y" data-cmopen>${t('เปิดแผนที่อาชีพ →','Open the career map →')}</button></section>`}
 <section class="sec"><div class="sec-h"><h2>${t('ฝึกงานและงานใหม่','New internships & jobs')}</h2><button class="link" data-go="jobs">${t('ดูทั้งหมด','See all')}</button></div><div class="grid g2">${JOBS.slice().sort((a,b)=>(b.spon-a.spon)||(a.days-b.days)).slice(0,2).map(jobCard).join('')}</div></section>
 <section class="sec"><div class="sec-h"><h2>⚡ ${t('งานด่วนใกล้มหาลัย','Quick part-time near campus')}</h2><button class="link" data-gopt>${t('ดูทั้งหมด','See all')}</button></div><div class="grid g2">${ptSorted(PT).filter(p=>p.filled<p.need).slice(0,2).map(ptCard).join('')}</div></section>
 <section class="sec"><div class="sec-h"><h2>${t('รีวิวที่คนกดว่ามีประโยชน์','Most helpful reviews')}</h2></div><div class="grid g2">${latest.slice(0,4).map(v=>review(v[0],v[1],v[2])).join('')}</div></section>
 <section class="sec card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between">
  <div><h2 style="font-size:20px">${t('คุณเหมาะกับบริษัทแบบไหน?','Which kind of company fits you?')}</h2><p class="muted">${t('ตอบ 5 ข้อ ใช้เวลา 30 วินาที แล้วรับบริษัทที่ตรงกับคุณ','5 questions, 30 seconds, and get your company matches')}</p></div><button class="btn y" data-go="quiz">${t('เริ่มควิซ','Start quiz')}</button></section>`;
}
function explore(){
 const keys=Object.keys(IND);
 let list=S.filter===-1?CO:CO.filter(c=>c.ind===keys[S.filter]);if(S.coOnlyJobs)list=list.filter(c=>JOBS.some(j=>j.co===c.id));
 return `<h1 style="font-size:28px;margin-top:8px">${t('สำรวจบริษัท','Explore companies')}</h1>
 <div class="exp-bar">${indDropdown()}
 <label class="row" style="gap:8px;cursor:pointer"><input type="checkbox" id="onlyJobs" ${S.coOnlyJobs?'checked':''} style="width:18px;height:18px;accent-color:var(--blue)"> ${t('เฉพาะบริษัทที่เปิดรับงาน/ฝึกงาน','Only companies that are hiring')}</label></div>
 <div class="grid g3" style="margin-top:16px">${list.map(coCard).join('')}</div>`;
}
function company(){
 const c=getCo(S.co);if(!c){S.view='explore';return explore()}const tb=S.tab;const n=c.reviews.length*37;const all=revs(c);if(SB&&S.dbState==='error'&&Date.now()-S.dbAt>15000)setTimeout(loadApproved,0);
 const tabs=[['overview',t('ภาพรวม','Overview')],['reviews',`${t('รีวิว','Reviews')} (${all.length})`],['salary',t('เงินเดือน','Salaries')],['interview',t('สัมภาษณ์','Interviews')],['jobs',`${t('งานที่เปิดรับ','Open jobs')} (${JOBS.filter(j=>j.co===c.id).length})`]];
 let body='';
 if(tb==='overview'){body=`<div class="grid g2" style="margin-top:18px">
  <div class="card" style="display:grid;gap:14px;align-content:start"><div class="row"><b style="font-family:var(--display);font-size:42px;line-height:1;color:${col(c.overall)}">${c.overall.toFixed(1)}</b><div><div class="stars" style="font-size:16px">${stars(c.overall)}</div><div class="muted">${t(`จาก ${fmt(n)} รีวิว`,`from ${fmt(n)} reviews`)}</div></div></div>
   ${moodBar(c.mood)}<div class="moodlegend">${MOODS.map((m,i)=>`<span>${m[0]} ${x(m[1])} ${c.mood[i]}%</span>`).join('')}</div>
   <div class="cats">${CATS.map(([k,nm])=>`<div class="cat"><span>${x(nm)}</span><span class="bar"><i style="width:${c.cats[k]/5*100}%;background:${col(c.cats[k])}"></i></span><b class="num">${c.cats[k].toFixed(1)}</b></div>`).join('')}</div></div>
  <div style="display:grid;gap:14px;align-content:start">
   <div class="ai"><div class="ai-h"><img src="${PUP()}" alt="">${t(`น้องมาดูสรุปจาก ${fmt(n)} รีวิว`,`Maadoo’s summary of ${fmt(n)} reviews`)} <span class="chip">Maadoo AI</span></div>
    <div><b class="ok">${t('ข้อดี','Pros')}</b><ul>${c.ai.pros.map(v=>`<li>${x(v)}</li>`).join('')}</ul></div>
    <div><b class="no">${t('ข้อเสีย','Cons')}</b><ul>${c.ai.cons.map(v=>`<li>${x(v)}</li>`).join('')}</ul></div></div>
   <div><h3 style="font-size:17px;margin-bottom:10px">${t('ความจริง vs ที่ประกาศ','Reality vs. job ad')}</h3>
    <div class="rvp"><div class="hd">${t('บริษัทประกาศว่า','The ad says')}</div><div class="hd">${t('พนักงานบอกว่า','Employees say')}</div>${c.reality.map(r=>`<div>${x(r[0])}</div><div class="${r[2]}">${r[2]==='ok'?'✓':r[2]==='no'?'✗':'~'} ${x(r[1])}</div>`).join('')}</div></div>
  </div></div>
  <div class="sec"><div class="sec-h"><h2>${t('รีวิวล่าสุด','Latest reviews')}</h2><button class="link" data-tab="reviews">${t('ดูทั้งหมด','See all')}</button></div><div class="grid g2">${all.slice(0,2).map((r,i)=>review(r,null,i)).join('')}</div></div>`}
 if(tb==='reviews'){const free=all.slice(0,3),rest=all.slice(3);
  body=`<div class="grid" style="margin-top:18px">${free.map((r,i)=>review(r,null,i)).join('')}
  ${rest.length?(S.unlocked?rest.map((r,i)=>review(r,null,i+3)).join(''):`<div class="lockwrap"><div class="locked grid">${rest.map((r,i)=>review(r,null,i+3)).join('')}</div>
   <div class="lock"><div class="card"><img src="${PUP()}" alt=""><h3>${t('อ่านฟรีครบ 3 รีวิวแล้ว','You’ve read your 3 free reviews')}</h3><p class="muted">${t('แบ่งประสบการณ์ของคุณ 1 รีวิว (ไม่ถึง 1 นาที) แล้วปลดล็อกรีวิวและเงินเดือนทุกบริษัท','Share one quick review (under a minute) to unlock every review and salary')}</p><button class="btn y" data-go="write">${t('เขียนรีวิวสั้นเพื่อปลดล็อก','Write a quick review to unlock')}</button></div></div></div>`):''}</div>`}
 if(tb==='salary'){body=`<div class="card" style="margin-top:18px"><div class="scroll"><table class="tbl"><thead><tr><th>${t('ตำแหน่ง','Role')}</th><th class="r">${t('ต่ำสุด','Low')}</th><th class="r">${t('มัธยฐาน','Median')}</th><th class="r">${t('สูงสุด','High')}</th><th>${t('ช่วง','Range')}</th><th class="r">${t('ข้อมูล','Reports')}</th></tr></thead><tbody>
  ${c.salary.map(s=>{const unit=s[5]?t('/วัน','/day'):'';return `<tr><td>${x(s[0])}</td><td class="r num">${fmt(s[1])}${unit}</td><td class="r num"><b>${fmt(s[2])}${unit}</b></td><td class="r num">${fmt(s[3])}${unit}</td>
  <td><div class="range"><i style="left:0;right:0"></i><b style="left:${(s[2]-s[1])/(s[3]-s[1])*100}%"></b></div></td><td class="r muted">${s[4]} ${t('คน','people')}</td></tr>`}).join('')}</tbody></table></div>
  <p class="muted" style="margin-top:10px">${t('หน่วย: บาท/เดือน ก่อนหักภาษี · ข้อมูลส่งแบบไม่ระบุตัวตน · ตำแหน่งที่มีข้อมูลน้อยกว่า 3 คนจะถูกซ่อนเพื่อความปลอดภัย','THB per month before tax · submitted anonymously · roles with fewer than 3 reports are hidden for privacy')}</p></div>`}
 if(tb==='interview'){const iv=c.interview;const df=DIFF[iv.diff];body=`<div class="grid g2" style="margin-top:18px">
  <div class="card" style="display:grid;gap:10px;align-content:start"><h3 style="font-size:17px">${t('ภาพรวมการสัมภาษณ์','Interview overview')}</h3>
   <div class="row"><span class="chip">${t(`${iv.rounds} รอบ`,`${iv.rounds} round${iv.rounds>1?'s':''}`)}</span><span class="chip">${t('รอผล','Result in')} ${x(iv.days)}</span><span class="chip ${df[2]}">${t('ความยาก','Difficulty')}: ${x(df)}</span></div></div>
  <div class="card"><h3 style="font-size:17px;margin-bottom:10px">${t('คำถามที่เจอจริง','Questions people were asked')}</h3><ol style="margin:0;padding-left:20px;display:grid;gap:6px">${iv.qs.map(q=>`<li>${x(q)}</li>`).join('')}</ol><button class="btn ghost sm" style="margin-top:12px" data-ivopen="${c.id}">🎤 ${t('รีวิวการสัมภาษณ์ของคุณ','Share your interview')}</button></div></div>`}
 if(tb==='jobs'){const js=JOBS.filter(j=>j.co===c.id);body=`<div class="grid g2" style="margin-top:18px">${js.length?js.map(jobCard).join(''):`<div class="card empty">${t('ยังไม่มีงานเปิดรับ กด “ติดตาม” เพื่อรับแจ้งเตือน','No open jobs. Follow to get notified.')}</div>`}</div>`}
 return `<button class="back-btn" data-go="explore"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>${t('กลับ','Back')}</button>
 <div class="cp-head"><span class="mark" style="background:${c.hue}">${x(c.mk)}</span><div><h1>${x(c.name)}</h1>
  <div class="info"><span>${x(IND[c.ind])}</span><span>👥 ${fmt(c.size)} ${t('คน','staff')}</span><span>📍 ${x(c.loc)}</span><span>🚆 ${x(c.transit)}</span>${PTRATE[c.id]?`<span class="chip ver">⚡ ${t('พาร์ทไทม์','Part-time')} ★ ${PTRATE[c.id][0]} (${PTRATE[c.id][1]})</span>`:''}</div></div>
  <div class="actions"><button class="btn ghost" data-follow="${c.id}">${S.follow[c.id]?t('✓ ติดตามแล้ว','✓ Following'):t('+ ติดตาม','+ Follow')}</button><button class="btn y" data-writefor="${c.id}">${t('เขียนรีวิว','Write a review')}</button></div></div>
 <div class="tabs" role="tablist">${tabs.map(([k,nm])=>`<button role="tab" class="${tb===k?'on':''}" data-tab="${k}">${nm}</button>`).join('')}</div>${body}`;
}
function write(){
 if(S.done)return done();
 const f=S.form;const n=[f.co,f.r,f.mood!==null,f.ot!==null,f.rec!==null].filter(Boolean).length;
 const o=(k,v,l)=>`<button type="button" class="opt ${f[k]===v?'on':''}" data-f="${k}" data-v="${v}">${l}</button>`;
 return `<div class="fhead" style="margin-top:8px"><img src="${PUP()}" alt=""><div><h1 style="font-size:28px">${t('เขียนรีวิวสั้น','Quick review')}</h1><p class="muted">${t('5 ข้อ ไม่ถึง 1 นาที · ไม่แสดงชื่อ · วันที่แสดงเป็นไตรมาส','5 questions, under a minute · anonymous · dates shown by quarter')}</p></div></div>
 <div class="progress" style="margin:16px 0 22px;max-width:640px"><i style="width:${n/5*100}%"></i></div>
 <form class="form" id="rvForm">
  <div class="q"><span class="step">1/5</span><label class="t" for="fco">${t('รีวิวที่ไหน?','Which company?')}</label>
   <select class="field" id="fco"><option value="">${t('เลือกบริษัท','Choose a company')}</option>${CO.map(c=>`<option value="${c.id}" ${f.co===c.id?'selected':''}>${x(c.name)}</option>`).join('')}</select>
   <div class="row"><input class="field" id="frole" maxlength="80" placeholder="${t('ตำแหน่ง (ไม่บังคับ)','Role (optional)')}" value="${esc(f.role)}" style="flex:1;min-width:180px"><div class="opts">${o('type','emp',x(TYPE.emp))}${o('type','intern',x(TYPE.intern))}</div></div></div>
  <div class="q"><span class="step">2/5</span><label class="t">${t('ให้คะแนนรวมกี่ดาว?','Overall rating')}</label><div class="starsel">${[1,2,3,4,5].map(i=>`<button type="button" class="${f.r>=i?'on':''}" data-star="${i}" aria-label="${i} ${t('ดาว','stars')}">★</button>`).join('')}</div></div>
  <div class="q"><span class="step">3/5</span><label class="t">${t('รู้สึกยังไงกับที่นี่?','How do you feel about it?')}</label><div class="opts">${MOODS.map((m,i)=>o('mood',i,m[0]+' '+x(m[1]))).join('')}</div></div>
  <div class="q"><span class="step">4/5</span><label class="t">${t('OT จ่ายจริงไหม?','Is overtime actually paid?')}</label><div class="opts">${o('ot','y',t('จ่ายครบ','Fully'))}${o('ot','p',t('จ่ายบางส่วน','Partly'))}${o('ot','n',t('ไม่จ่าย','Not paid'))}${o('ot','x',t('ไม่มี OT','No OT'))}</div></div>
  <div class="q"><span class="step">5/5</span><label class="t">${t('จะแนะนำให้เพื่อนมาทำไหม?','Would you recommend it to a friend?')}</label><div class="opts">${o('rec','y',t('แนะนำ','Yes'))}${o('rec','m',t('แล้วแต่คน','Depends'))}${o('rec','n',t('ไม่แนะนำ','No'))}</div></div>
  <details class="q"><summary style="cursor:pointer;font-weight:500">${t('เล่าเพิ่ม และใส่เงินเดือน (ไม่บังคับ)','Add details and salary (optional)')}</summary>
   <div class="grid" style="margin-top:10px"><input class="field" id="ftitle" maxlength="120" placeholder="${t('สรุปสั้น ๆ เช่น “สวัสดิการดี แต่ OT หนัก”','Headline, e.g. “Great benefits, heavy OT”')}" value="${esc(f.title)}">
   <textarea class="field" id="fpro" maxlength="1000" placeholder="${t('ข้อดี','Pros')}">${esc(f.pro)}</textarea><textarea class="field" id="fcon" maxlength="1000" placeholder="${t('ข้อเสีย','Cons')}">${esc(f.con)}</textarea>
   <input class="field num" id="fsal" inputmode="numeric" placeholder="${t('เงินเดือน (บาท) — ใช้คำนวณสถิติเท่านั้น','Salary (THB), used only for statistics')}" value="${esc(f.sal)}">
   <p class="muted">⚠️ ${t('ห้ามระบุชื่อบุคคล ให้พูดถึงตำแหน่งแทน เช่น “หัวหน้าแผนก”','Don’t name individuals; refer to roles instead, e.g. “department head”')}</p></div></details>
  <div class="row"><button class="btn y" ${n<5?'disabled':''}>${t('ส่งรีวิว','Submit review')}</button><span class="muted">${n<5?t(`อีก ${5-n} ข้อ`,`${5-n} to go`):t('พร้อมส่งแล้ว','Ready to submit')}</span></div>
  ${SB&&S.user&&S.user.anon?`<p class="muted">🔐 ${t('บัญชีชั่วคราวเขียนรีวิวไม่ได้ เก็บบัญชีไว้ด้วยอีเมลก่อนนะ','Guest accounts can’t post reviews. Keep your account with an email first.')}</p>`:''}
  ${SB&&!S.user?`<p class="muted">🔐 ${t('ต้องเข้าสู่ระบบด้วยอีเมลก่อนส่ง (ไม่ต้องใช้รหัสผ่าน)','You’ll log in with your email before submitting (no password needed)')}</p>`:''}
 </form>`;
}
function done(){const d=S.done;const c=getCo(d.co);
 return `<div style="display:grid;gap:20px;margin-top:12px;max-width:640px">
 <div><h1 style="font-size:28px">${t('ขอบคุณที่ช่วยให้คนอื่น “มาดู” ก่อน 🙌','Thanks for helping others look first 🙌')}</h1><p class="muted" style="margin-top:6px">${t('รีวิวของคุณจะแสดงหลังผ่านการตรวจ · คุณปลดล็อกรีวิวและเงินเดือนทุกบริษัทแล้ว','Your review appears after moderation · every review and salary is now unlocked')}</p></div>
 <div class="row"><span class="chip ver">+50 ${t('แต้ม','points')}</span><span class="chip mid">🏅 ${t('เหรียญ “นักรีวิวมือใหม่”','“First Review” badge')}</span></div>
 <div class="share">${brand()}
  <small>${t(`ฉันรีวิว ${x(c.name)}`,`I reviewed ${x(c.name)}`)}</small><div class="big">${'★'.repeat(d.r)}</div>
  <div style="font-family:var(--display);font-size:20px">${MOODS[d.mood][0]} ${x(MOODS[d.mood][1])}</div>
  <small>${t(`คนที่นี่ ${c.mood[0]}% บอกว่า “อยู่ยาว” · แล้วที่ทำงานคุณล่ะ? maadoo.app`,`${c.mood[0]}% here say “Staying” · What about your workplace? maadoo.app`)}</small></div>
 <p class="muted">${t('แคปหน้าจอการ์ดนี้ไปแชร์ใน IG Story หรือ LINE ได้เลย','Screenshot this card to share on IG Stories or LINE')}</p>
 <div class="row"><button class="btn" data-co="${c.id}" data-tabto="reviews">${t(`ดูรีวิวทั้งหมดของ ${x(c.name)}`,`See all ${x(c.name)} reviews`)}</button><button class="btn ghost" data-again>${t('เขียนอีกรีวิว','Write another')}</button></div></div>`}
function ask(){
 const top=`<h1 style="font-size:28px;margin-top:8px">${t('ปรึกษาเรื่องงาน','Ask about work')}${isPlus()?'<span class="plus-tag">✨ Plus</span>':''}</h1><p class="muted" style="margin-top:4px">${t('ปัดหารุ่นพี่คุยตัวต่อตัว หรือโพสต์ถามและแชร์ในบอร์ดที่ใครก็ตอบได้','Swipe for a 1:1 mentor, or post and share on a board anyone can answer.')}</p>
 <div class="segs">${[['swipe',PAW+t('ปัดหารุ่นพี่','Swipe mentors')],['threads',t('💬 บอร์ดพูดคุย','💬 Community board')]].map(([k,n])=>`<button class="${S.askTab===k?'on':''}" data-asktab="${k}">${n}</button>`).join('')}</div>`;
 if(S.askTab==='swipe')return top+chatStrip()+swipe();
 return top+chatStrip()+board()}
const PAW='<svg class="paw" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="5" ry="4.2"/><circle cx="6" cy="10.5" r="2.1"/><circle cx="18" cy="10.5" r="2.1"/><circle cx="9.3" cy="6.3" r="2.1"/><circle cx="14.7" cy="6.3" r="2.1"/></svg>';
function agoFmt(m){if(m<1)return t('เมื่อสักครู่','just now');if(m<60)return t(`${m} นาที`,`${m}m`);if(m<1440)return t(`${Math.round(m/60)} ชม.`,`${Math.round(m/60)}h`);return t(`${Math.round(m/1440)} วัน`,`${Math.round(m/1440)}d`)}
function who(o,small){return `<span class="p-ava ${small?'sm':''}" style="background:${o.bg}">${o.ava}</span>`}
function badges(o){return `${o.ver?`<span class="chip ver">✓ ${t('คนใน','Insider')}</span>`:''}${o.lv?`<span class="badge">${x(LV[o.lv])}</span>`:''}`}
function post(p){const B=S.bd;const open=B.open[p.id];const lk=S.pl[p.id];const cs=p.comments;
 const kind=p.kind==='ask'?`<span class="chip kind-ask">🙋 ${t('ขอคำปรึกษา','Asking')}</span>`:`<span class="chip kind-share">💡 ${t('แชร์ประสบการณ์','Sharing')}</span>`;
 const shown=open?cs:cs.slice().sort((a,b)=>b.likes-a.likes).slice(0,1);
 return `<article class="card post"><header class="p-head">${who(p)}<div style="min-width:0"><div class="row" style="gap:6px"><b>${esc(x(p.by))}</b>${badges(p)}</div><span class="muted">${agoFmt(p.ts)} · ${x(TAGS[p.tag])}</span></div><span style="margin-left:auto">${kind}</span></header>
 <p class="p-text">${esc(x(p.text))}</p>
 <div class="p-acts"><button class="pa ${lk?'on':''}" data-plike="${p.id}">${lk?'♥':'♡'} ${p.likes+(lk?1:0)}</button><button class="pa" data-popen="${p.id}">💬 ${cs.length} ${t('ความคิดเห็น','comments')}</button><button class="pa" data-pshare="${p.id}">↗ ${t('แชร์','Share')}</button><button class="report" data-report="1">⚑</button></div>
 ${cs.length?`<div class="cmts">${shown.map((c,i)=>{const ci=cs.indexOf(c);const ck=S.pl[p.id+':'+ci];return `<div class="cmt">${who(c,1)}<div class="c-body"><div class="c-bubble"><div class="row" style="gap:6px"><b>${esc(x(c.by))}</b>${badges(c)}</div><p>${esc(x(c.text))}</p></div><div class="c-meta"><span>${agoFmt(c.ts)}</span><button class="link-s ${ck?'on':''}" data-clike="${p.id}:${ci}">${ck?'♥':'♡'} ${c.likes+(ck?1:0)}</button><button class="link-s" data-reply="${p.id}">${t('ตอบกลับ','Reply')}</button></div></div></div>`}).join('')}
 ${!open&&cs.length>1?`<button class="link" data-popen="${p.id}">${t(`ดูความคิดเห็นทั้งหมด (${cs.length})`,`View all ${cs.length} comments`)}</button>`:''}</div>`:''}
 <form class="cform" data-pid="${p.id}"><span class="p-ava sm" style="background:var(--sky)">${S.user?esc(S.user.name.slice(0,1).toUpperCase()):'🙂'}</span><input class="field" id="cin-${p.id}" placeholder="${p.kind==='ask'?t('ช่วยตอบหรือให้กำลังใจ...','Help out or cheer them on...'):t('แสดงความคิดเห็น...','Write a comment...')}" autocomplete="off"><button class="btn" aria-label="${t('ส่ง','Send')}">➤</button></form></article>`}
function board(){const B=S.bd;
 let list=POSTS.filter(p=>B.tag===-1||p.tag===B.tag);
 list=list.slice().sort(B.sort==='new'?(a,b)=>a.ts-b.ts:(a,b)=>(b.likes+b.comments.length*3)/Math.pow(b.ts/60+2,.6)-(a.likes+a.comments.length*3)/Math.pow(a.ts/60+2,.6));
 return `<form class="card composer" id="askForm"><div class="row" style="gap:10px"><span class="p-ava" style="background:var(--sky)">${S.user?esc(S.user.name.slice(0,1).toUpperCase()):'🙂'}</span>
  <div class="segs" style="margin:0">${[['ask',t('🙋 ขอคำปรึกษา','🙋 Ask')],['share',t('💡 แชร์ประสบการณ์','💡 Share')]].map(([k,n])=>`<button type="button" class="${B.kind===k?'on':''}" data-bkind="${k}">${n}</button>`).join('')}</div></div>
  <textarea class="field" id="askq" placeholder="${B.kind==='ask'?t('มีเรื่องงานอะไรอยากปรึกษา? เช่น ฝึกงานที่ไหนดีสำหรับสายจุลชีวะ','What do you need advice on? e.g. Where should a microbiology student intern?'):t('เล่าประสบการณ์ที่อยากให้คนอื่นรู้ เช่น ทริคสัมภาษณ์ที่ได้ผล','Share something others should know, e.g. an interview trick that worked')}">${esc(S.askText)}</textarea>
  <div class="opts">${TAGS.map((tg,i)=>`<button type="button" class="opt sm ${S.askTag===i?'on':''}" data-asktag="${i}">#${x(tg)}</button>`).join('')}</div>
  <div class="row"><label class="row" style="gap:6px;font-size:14px;color:var(--ink-2);cursor:pointer"><input type="checkbox" id="anon" ${B.anon?'checked':''} style="width:18px;height:18px;accent-color:var(--blue)">${t('โพสต์แบบไม่ระบุตัวตน','Post anonymously')}</label><button class="btn y" style="margin-left:auto">${t('โพสต์','Post')}</button></div></form>
 <div class="board-bar"><div class="segs" style="margin:0">${[['hot',t('🔥 มาแรง','🔥 Hot')],['new',t('🕒 ล่าสุด','🕒 New')]].map(([k,n])=>`<button class="${B.sort===k?'on':''}" data-bsort="${k}">${n}</button>`).join('')}</div>
  <div class="opts tagrow"><button class="opt sm ${B.tag===-1?'on':''}" data-btag="-1">${t('ทั้งหมด','All')}</button>${TAGS.map((tg,i)=>`<button class="opt sm ${B.tag===i?'on':''}" data-btag="${i}">#${x(tg)}</button>`).join('')}</div></div>
 <div class="grid feed">${list.length?list.map(post).join(''):`<div class="card empty">${t('ยังไม่มีโพสต์ในแท็กนี้ เป็นคนแรกเลย!','No posts with this tag yet. Be the first!')}</div>`}</div>
 <p class="muted" style="text-align:center;margin-top:12px">${t('ใครก็ตอบได้ · ป้าย ✓ คนใน = ยืนยันว่าทำงานในสายนั้นจริง','Anyone can answer · ✓ Insider = verified to work in that field')}</p>`}
function quiz(){
 const z=S.quiz;
 if(z.i>=QUIZ.length){const cnt={};z.a.forEach(a=>cnt[a]=(cnt[a]||0)+1);const k=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];const r=QRES[k];
  return `<div style="display:grid;gap:18px;margin-top:12px;max-width:720px"><div class="share" style="max-width:420px">${brand('Maadoo Quiz')}<small>${t('คุณคือ','You are')}</small><div class="big" style="font-size:36px">${x(r.t)}</div><small>${x(r.d)}</small></div>
  <h2 style="font-size:20px">${t('บริษัทที่ตรงกับคุณ','Your company matches')}</h2><div class="grid g2">${r.co.map(id=>coCard(getCo(id))).join('')}</div>
  <div class="row"><button class="btn ghost" data-quizreset>${t('ทำใหม่','Retake')}</button><span class="muted">${t('แคปการ์ดผลลัพธ์ไปแชร์ให้เพื่อนทายกันได้','Screenshot your result and challenge your friends')}</span></div></div>`}
 const q=QUIZ[z.i];
 return `<div style="max-width:560px;margin-top:12px;display:grid;gap:16px"><span class="muted num">${t('ข้อ','Question')} ${z.i+1}/${QUIZ.length}</span>
 <div class="progress"><i style="width:${z.i/QUIZ.length*100}%"></i></div><h1 style="font-size:26px">${x(q.q)}</h1>
 <div class="grid">${q.o.map(o=>`<button class="opt" style="text-align:left;padding:14px 18px;border-radius:18px" data-qa="${o[1]}">${x(o[0])}</button>`).join('')}</div></div>`}

/* ---------- v4: jobs, mentors, profile, employers, rules ---------- */
const payTxt=j=>{if(!j.pay[1])return t('ไม่มีเบี้ยเลี้ยง','Unpaid');const u=j.unit==='day'?t('บาท/วัน','THB/day'):t('บาท/เดือน','THB/mo');return (j.pay[0]===j.pay[1]?fmt(j.pay[0]):`${fmt(j.pay[0])}–${fmt(j.pay[1])}`)+' '+u};
const agoTxt=d=>t(`${d} วันที่แล้ว`,`${d}d ago`);
function jobCard(j){const c=getCo(j.co);
 return `<article class="job ${j.spon?'spon':''}"><div class="job-top"><span class="mark" style="background:${c.hue}">${x(c.mk)}</span>
  <div style="flex:1;min-width:0"><h3>${x(j.title)}</h3><div class="row" style="gap:8px"><button class="link" data-co="${c.id}">${x(c.name)}</button><span class="corate">★ <b>${c.overall.toFixed(1)}</b> · 😊 ${c.mood[0]}%</span></div></div>
  ${j.spon?`<span class="chip ad">${t('โฆษณา','Sponsored')}</span>`:''}</div>
  <div class="row" style="gap:6px"><span class="chip ${j.type==='intern'?'mid':''}">${j.type==='intern'?t('ฝึกงาน','Internship'):t('งานประจำ','Full-time')}</span><span class="pay">${payTxt(j)}</span><span class="muted">· ${x(c.loc)}</span></div>
  <div class="row" style="gap:6px">${j.tags.map(g=>`<span class="chip">${x(g)}</span>`).join('')}</div>
  <div class="job-foot"><span class="muted">${agoTxt(j.days)}</span><div class="grow"><button class="save ${S.saved[j.id]?'on':''}" data-save="${j.id}" aria-label="${t('บันทึกงาน','Save job')}">${S.saved[j.id]?'♥':'♡'}</button>
  ${S.applied[j.id]?`<button class="btn ghost" disabled>✓ ${t('สมัครแล้ว','Applied')}</button>`:`<button class="btn" data-apply="${j.id}">${t('สมัครเลย','Apply')}</button>`}</div></div></article>`}
function jobs(){return `<div class="segs jsegs" style="margin-top:10px">${[['full',t('💼 งานประจำ / ฝึกงาน','💼 Jobs & internships'),t('💼 งาน','💼 Jobs')],['pt',t('⚡ งานด่วน พาร์ทไทม์','⚡ Quick part-time'),t('⚡ พาร์ทไทม์','⚡ Part-time')],['map',t('🗺️ แผนที่อาชีพ','🗺️ Career map'),t('🗺️ แผนที่','🗺️ Map')]].map(([k,n,sn])=>`<button class="${S.jobTab===k?'on':''}" data-jtab="${k}" aria-pressed="${S.jobTab===k}"><span class="ll">${n}</span><span class="ls">${sn}</span>${k==='map'&&!S.ob.mapSeen&&S.jobTab!=='map'?`<i class="cm-new">${t('ใหม่','New')}</i>`:''}</button>`).join('')}</div>`+(S.jobTab==='pt'?ptFeed():S.jobTab==='map'?careerMap():jobsFull())}
function jobsFull(){
 const F=S.jobF;const keys=Object.keys(IND);
 let list=JOBS.filter(j=>(F.type==='all'||j.type===F.type)&&(F.ind==='all'||getCo(j.co).ind===F.ind)&&(!F.min||(j.unit==='month'&&j.pay[0]>=F.min)));
 list=list.slice().sort((a,b)=>(b.spon-a.spon)||(a.days-b.days));
 return `<h1 style="font-size:28px;margin-top:8px">${t('งานและฝึกงาน','Jobs & internships')}</h1><p class="muted">${t('ทุกประกาศมีคะแนนรีวิวจริงของบริษัทแนบไว้ให้ดูก่อนสมัคร','Every listing shows the company’s real review score before you apply')}</p>
 <div class="filters"><div class="segs" style="margin:0">${[['all',t('ทั้งหมด','All')],['intern',t('ฝึกงาน','Internships')],['full',t('งานประจำ','Full-time')]].map(([k,n])=>`<button class="${F.type===k?'on':''}" data-jt="${k}">${n}</button>`).join('')}</div>
  <select class="field" id="jInd" aria-label="${t('อุตสาหกรรม','Industry')}"><option value="all">${t('ทุกอุตสาหกรรม','All industries')}</option>${keys.map(k=>`<option value="${k}" ${F.ind===k?'selected':''}>${x(IND[k])}</option>`).join('')}</select>
  <select class="field" id="jMin" aria-label="${t('เงินเดือนขั้นต่ำ','Minimum salary')}">${[0,20000,25000,30000].map(v=>`<option value="${v}" ${F.min===v?'selected':''}>${v?t(`เงินเดือน ${fmt(v)}+`,`Salary ${fmt(v)}+`):t('ทุกช่วงเงินเดือน','Any salary')}</option>`).join('')}</select>
  <span class="muted">${list.length} ${t('ตำแหน่ง','positions')}</span></div>
 <div class="grid g2" style="margin-top:16px">${list.length?list.map(jobCard).join(''):`<div class="card empty">${t('ไม่พบงานที่ตรงเงื่อนไข ลองปรับตัวกรองดูนะ','No jobs match. Try loosening the filters.')}</div>`}</div>
 <div class="card sec" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between"><div><h2 style="font-size:19px">${t('บริษัทของคุณกำลังหาคนอยู่?','Is your company hiring?')}</h2><p class="muted">${t('ลงประกาศข้าง ๆ รีวิวจริง เข้าถึงนักศึกษาและคนจบใหม่ที่ตั้งใจหางาน','Post next to real reviews and reach students and new grads who are actively looking')}</p></div><button class="btn y" data-go="employer">${t('ดูแพ็กเกจสำหรับบริษัท','See employer plans')}</button></div>`;
}
function plusBanner(){if(isPlus())return `<div class="plus"><div><h3>✨ ${t('คุณเป็นสมาชิก Maadoo Plus','You’re a Maadoo Plus member')}</h3><p>${t('ลด 20% ทุกการจองรุ่นพี่ และตรวจเรซูเม่ฟรีเดือนละ 1 ครั้ง','20% off every mentor session and one free resume review a month')}</p></div></div>`;
 return `<div class="plus"><div><h3>✨ Maadoo Plus · ${t('เริ่ม 99 บาท/เดือน','from 99 THB/mo')}</h3><p>${t('ถามรุ่นพี่ฟรี 5 คำถาม/เดือน · คุยสดลด 20% · 100 เหรียญทุกเดือน','5 free mentor questions/month · 20% off live calls · 100 coins monthly')}</p></div><button class="btn y" data-go="plus">${t('ดู Plus','See Plus')}</button></div>`}
function deckList(){const sw=S.sw;return MENTORS.filter(m=>!m.off&&!(S.user&&m.id===S.user.id)&&(sw.topic==='all'||m.top.includes(sw.topic))&&!sw.liked.includes(m.id)&&!sw.skipped.includes(m.id))}
function mRevs(m){return (S.mdb[m.id]||[]).slice().sort((a,b)=>b.at-a.at).concat(MREV[m.id]||[])}
function mStat(m){const r=mRevs(m),n=r.length,tc={};r.forEach(v=>v.tags.forEach(g=>{if(MTAGS[g])tc[g]=(tc[g]||0)+1}));
 return {n,avg:n?r.reduce((a,v)=>a+v.s,0)/n:0,dist:[5,4,3,2,1].map(k=>r.filter(v=>v.s===k).length),tc,top:Object.keys(tc).sort((a,b)=>tc[b]-tc[a]||Object.keys(MTAGS).indexOf(a)-Object.keys(MTAGS).indexOf(b))}}
const starRow=(v,cls)=>`<span class="stars-g ${cls||''}" aria-hidden="true">${[1,2,3,4,5].map(i=>`<i class="${v>=i-.25?'on':v>=i-.75?'half':''}">★</i>`).join('')}</span>`;
function mBadge(m,cls){const st=mStat(m),nw=st.n<3;
 return `<button type="button" class="s-rate ${nw?'new':''} ${cls||''}" data-mrevs="${m.id}" aria-label="${nw?t('รุ่นพี่ใหม่ ดูรีวิว','New mentor, see reviews'):t(`คะแนน ${st.avg.toFixed(1)} จาก 5 จาก ${st.n} รีวิว ดูรีวิว`,`Rated ${st.avg.toFixed(1)} of 5 from ${st.n} reviews, see reviews`)}">${nw?`<b>✨ ${t('รุ่นพี่ใหม่','New mentor')}</b>`:`<span class="st">★</span><b>${st.avg.toFixed(1)}</b><small>(${st.n} ${t('รีวิว','reviews')})</small>`}</button>`}
const mTopTags=m=>{const tp=mStat(m).top.slice(0,2);return tp.length?`<div class="s-top">${tp.map(g=>x([MTAGS[g][2],MTAGS[g][3]])).join(' · ')}</div>`:''};
function mprice(m){return isPlus()?Math.round(m.price*.8):m.price}
function scard(m,cls){const g=isPlus(),price=`<span class="s-price">${mprice(m)} ${t('บาท','THB')}/30 ${t('นาที','min')}</span>`;return `<div class="scard ${cls}${g?' gold':''}" data-mid="${m.id}"><div class="s-hero" style="background:linear-gradient(160deg,${m.bg},var(--surface))"><span class="stamp like">${t('สนใจ','LIKE')}</span><span class="stamp nope">${t('ข้าม','NOPE')}</span>${mBadge(m)}${g?'<span class="g-spark a" aria-hidden="true">✦</span><span class="g-spark b" aria-hidden="true">✦</span>':''}<span class="s-ava">${m.ava}</span>${g?`<div class="s-foot">${askBtn(m)}${price}</div>`:askBtn(m)+price}</div>
 <div class="s-info"><h2>${x(m.name)} ${m.real?`<span class="chip ver">✓ ${t('รุ่นพี่จริง','Real mentor')}</span>`:`<span class="chip">${t('ตัวอย่าง','Sample')}</span>`}</h2>${mTopTags(m)}<div class="muted" style="font-size:14px">${x(m.role)} · ${x(m.at)}${FAC[m.fac]?`<br>🎓 ${t('จบ','Studied')} ${x(FAC[m.fac].n)}`:''}</div><p class="s-bio">“${x(m.bio)}”</p>
 <div class="row" style="gap:6px">${m.tags.map(g=>`<span class="chip">${x(g)}</span>`).join('')}</div><span class="corate">${m.real?`🛡️ ${t('ตรวจสอบตัวตนโดยทีมมาดูจ็อบ','Verified by the Maadoo Job team')}`:`🗓️ ${m.n} ${t('ครั้งที่ให้คำปรึกษา','sessions')} · ${t('รุ่นพี่ตัวอย่าง ตอบอัตโนมัติ','sample mentor, auto-replies')}`}</span></div></div>`}
function swipe(){const sw=S.sw;const deck=deckList();const liked=MENTORS.filter(m=>sw.liked.includes(m.id));
 return `<div class="opts" style="margin-top:14px;justify-content:center"><button class="opt ${sw.topic==='all'?'on':''}" data-topic="all">${t('ทุกเรื่อง','Everything')}</button>${Object.keys(TOPICS).map(k=>`<button class="opt ${sw.topic===k?'on':''}" data-topic="${k}">${x(TOPICS[k])}</button>`).join('')}</div>
 <div class="deck">${deck.length?deck.slice(0,2).reverse().map((m,i,a)=>scard(m,i===a.length-1?'top':'back')).join(''):`<div class="scard empty-deck"><img src="${PUP()}" alt=""><h2>${t('ปัดครบแล้ว!','You’ve seen everyone!')}</h2><p class="muted">${t('ลองเปลี่ยนหัวข้อ หรือเริ่มปัดใหม่','Try another topic or start over')}</p><button class="btn y" data-swreset>${t('เริ่มปัดใหม่','Start over')}</button></div>`}</div>
 ${deck.length?`<div class="swipe-btns"><button class="sb nope" data-sw="left" aria-label="${t('ข้าม','Skip')}">✕</button><button class="sb book" data-sw="book" aria-label="${t('จองเลย','Book now')}">📅</button><button class="sb like" data-sw="right" aria-label="${t('สนใจ','Like')}">♥</button></div>
 <p class="muted" style="text-align:center;margin-top:8px">${(matchMedia('(hover:hover) and (pointer:fine)').matches?t('ลากการ์ดด้วยเมาส์ · ปัดสองนิ้วบนทัชแพด · หรือกด ← →','Drag with the mouse · two-finger swipe on the trackpad · or press ← →'):t('ปัดขวา = สนใจ · ปัดซ้าย = ข้าม · 📅 = จองทันที','Swipe right to like · left to skip · 📅 to book now'))}</p>`:''}
 ${liked.length?`<section class="sec"><div class="sec-h"><h2>${t('รุ่นพี่ที่คุณปัดขวา','Mentors you liked')} (${liked.length})</h2></div><div class="list">${liked.map(m=>`<div class="li"><span class="ava" style="width:40px;height:40px;font-size:20px;background:${m.bg}">${m.ava}</span><div><b>${x(m.name)}</b><div class="muted">${x(m.role)}</div></div><button class="btn grow" data-book="${m.id}">${t('จองเวลา','Book')}</button></div>`).join('')}</div></section>`:''}
 <div class="sec">${plusBanner()}</div><p class="muted" style="margin-top:8px">${t('Maadoo หักค่าธรรมเนียม 15% จากแต่ละการจอง รุ่นพี่ได้รับ 85%','Maadoo keeps a 15% fee per booking; mentors receive 85%')}</p>`}
function swipeGo(dir){const card=document.querySelector('.scard.top');if(!card||card.dataset.gone)return;const id=card.dataset.mid;if(dir!=='book')card.dataset.gone='1';
 if(dir==='book'){openBook(id);return}
 card.style.transition='transform .35s ease, opacity .35s';card.style.transform=`translateX(${dir==='right'?600:-600}px) rotate(${dir==='right'?24:-24}deg)`;card.style.opacity='0';
 const st=card.querySelector(dir==='right'?'.stamp.like':'.stamp.nope');if(st)st.style.opacity=1;
 setTimeout(()=>{if(dir==='right'){S.sw.liked.push(id);render();openModal({type:'match',id})}else{S.sw.skipped.push(id);render()}},300)}
function bindDeck(){const card=document.querySelector('.scard.top');if(!card)return;let sx=0,sy=0,dx=0,drag=false;
 const like=card.querySelector('.stamp.like'),nope=card.querySelector('.stamp.nope');
 card.addEventListener('pointerdown',e=>{if(e.target.closest('.s-rate,.s-ask'))return;drag=true;sx=e.clientX;sy=e.clientY;dx=0;card.setPointerCapture(e.pointerId);card.style.transition='none'});
 card.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;const dy=(e.clientY-sy)*.3;card.style.transform=`translate(${dx}px,${dy}px) rotate(${dx/18}deg)`;like.style.opacity=Math.max(0,Math.min(1,dx/100));nope.style.opacity=Math.max(0,Math.min(1,-dx/100))});
 const end=()=>{if(!drag)return;drag=false;if(Math.abs(dx)>100){swipeGo(dx>0?'right':'left')}else{card.style.transition='transform .25s';card.style.transform='';like.style.opacity=0;nope.style.opacity=0}};
 card.addEventListener('pointerup',end);card.addEventListener('pointercancel',end);
 /* trackpad two-finger swipe / horizontal wheel */
 const deck=document.querySelector('.deck');let wx=0,wt=null;
 const show=v=>{card.style.transition='none';card.style.transform=`translateX(${v}px) rotate(${v/18}deg)`;like.style.opacity=Math.max(0,Math.min(1,v/100));nope.style.opacity=Math.max(0,Math.min(1,-v/100))};
 deck.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();if(card.dataset.gone||drag)return;
  wx-=e.deltaX*(e.deltaMode===1?16:1);show(wx);clearTimeout(wt);
  if(Math.abs(wx)>130){const dir=wx>0?'right':'left';wx=0;swipeGo(dir);return}
  wt=setTimeout(()=>{wx=0;card.style.transition='transform .25s';card.style.transform='';like.style.opacity=0;nope.style.opacity=0},180)},{passive:false});
 card.addEventListener('dragstart',e=>e.preventDefault())}
function mentors(){return `<div class="grid" style="margin-top:16px">${plusBanner()}<div class="grid g2">${MENTORS.map(m=>{const pr=isPlus()?Math.round(m.price*.8):m.price;return `<article class="card mentor"><div class="mentor-top"><span class="ava" style="background:${m.bg}">${m.ava}</span><div style="flex:1"><h3 style="font-size:17px">${x(m.name)} <span class="chip ver">✓ ${t('ยืนยันแล้ว','Verified')}</span></h3><div class="muted">${x(m.role)} · ${x(m.at)}</div>${mTopTags(m)}</div></div>
 <div class="row" style="gap:6px">${m.tags.map(g=>`<span class="chip">${x(g)}</span>`).join('')}</div>
 <div class="row">${mBadge(m,'inline')}<span class="corate">${m.n} ${t('ครั้ง','sessions')}</span><span style="margin-left:auto" class="price">${pr!==m.price?`<s class="muted" style="font-size:13px">${m.price}</s> `:''}${pr} ${t('บาท','THB')}<span class="muted" style="font-family:var(--body);font-weight:400">/30 ${t('นาที','min')}</span></span></div>
 <button class="btn" data-book="${m.id}">${t('จองเวลาคุย','Book a session')}</button></article>`}).join('')}</div>
 <p class="muted">${t('Maadoo หักค่าธรรมเนียม 15% จากแต่ละการจอง รุ่นพี่ได้รับ 85%','Maadoo keeps a 15% fee per booking; mentors receive 85%')}</p></div>`}
