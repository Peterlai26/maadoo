/* Maadoo Job · js/onboard.js — career map view, welcome onboarding, home start card + first steps, coach marks. Classic script sharing one global scope; see CLAUDE.md for load order. */
/* ---------- onboarding: welcome (goal + fields) · start card · first steps · coach marks ---------- */
/* which role a mentor works in: samples carry `roles`; real mentors are matched from the free-text field */
function roleOfField(s){s=String(s||'').toLowerCase();if(!s)return null;let best=null,bl=0;Object.keys(ROLES).forEach(r=>{ROLES[r].n.concat(ROLES[r].sal).forEach(n=>{const k=String(n).toLowerCase().replace(/\s*\(.*\)$/,'');if(k.length>bl&&s.includes(k)){best=r;bl=k.length}})});return best}
const mRoles=m=>m.roles||(m.real&&m.field?[roleOfField(m.field)].filter(Boolean):[]);
function roleMentors(r){const L=MENTORS.filter(m=>!m.off&&!(S.user&&m.id===S.user.id)&&mRoles(m).includes(r));return {cross:L.filter(m=>m.fac&&fitOf(r,m.fac,null)!=='d'),same:L.filter(m=>!m.fac||fitOf(r,m.fac,null)==='d')}}
function worldInfo(w){const rs=worldRoles(w),f=S.ob.fac;if(!FAC[f])return {n:rs.length,tag:null};const L=rs.map(r=>fitOf(r)).filter(canReach);return {n:L.length,tag:L.includes('d')?'d':L.length?'b':null}}
/* ---------- career map view (jobs → 🗺️ tab) ---------- */
S.cm={w:null,g:null,r:null,dir:0,ox:50,oy:40,more:false};
function cmCrumbs(){const C=S.cm,L=[[t('ทั้งหมด','All'),'top']];if(C.w)L.push([x(WORLDS.find(v=>v[0]===C.w)[2]),'w']);if(C.g)L.push([x(GROUPS[C.g][2]),'g']);if(C.r)L.push([x(ROLES[C.r].n),'r']);
 return `<nav class="cm-crumbs" aria-label="${t('ตำแหน่งในแผนที่','Where you are on the map')}">${L.map((v,i)=>i===L.length-1?`<b aria-current="page">${esc(v[0])}</b>`:`<button class="link" data-cmup="${v[1]}">${esc(v[0])}</button><span aria-hidden="true">›</span>`).join('')}</nav>`}
function cmFacBar(){const f=S.ob.fac;return `<div class="cm-fac">${FAC[f]?`<span class="cm-fe" aria-hidden="true">${FAC[f].e}</span><span class="cm-ft"><small>${t('คณะของคุณ','Your faculty')}</small><b>${esc(facName())}</b></span><button class="btn ghost sm" data-cmfac>${t('เปลี่ยน','Change')}</button>`:
 `<span class="cm-fe" aria-hidden="true">🎓</span><span class="cm-ft"><small>${t('ยังไม่ได้เลือกคณะ','No faculty picked yet')}</small><b>${t('เลือกคณะ แล้วดูว่าไปทางไหนได้บ้าง','Pick your faculty to see where it can take you')}</b></span><button class="btn orange sm" data-cmfac>${t('เลือกคณะ','Pick faculty')}</button>`}</div>`}
function careerMap(){const C=S.cm;if(C.r&&!ROLES[C.r])C.r=null;if(C.g&&!GROUPS[C.g])C.g=null;
 const body=C.r?cmRole(C.r):C.g?cmGroup(C.g):C.w?cmWorld(C.w):cmWorlds();
 const anim=C.dir?` cm-anim ${C.dir>0?'cm-in':'cm-out'}`:'';C.dir=0;
 return `<div class="cm"><div class="cm-head"><h1>🗺️ ${t('แผนที่อาชีพ','Career map')}</h1><span class="chip">💡 ${t('ข้อมูลแนะนำเบื้องต้น','Starter guidance')}</span></div>
 ${C.r?'':cmFacBar()}${C.w||C.r?cmCrumbs():''}<div class="cm-body${anim}" style="--ox:${C.ox}%;--oy:${C.oy}%">${body}</div>
 <p class="muted cm-note">${t('ข้อมูลตัวอย่างเพื่อเป็นแนวทาง ความเข้ากันและเวลาที่ใช้ขึ้นกับแต่ละคน ลองถามรุ่นพี่ในสายนั้นก่อนตัดสินใจ','Sample guidance only. Fit and learning time vary by person, so ask a mentor in that field before you decide')}</p></div>`}
const CM_POS=[[50,50],[76,50],[24,50],[63,17],[37,17],[63,83],[37,83]];
function cmWorlds(){const f=FAC[S.ob.fac],info=WORLDS.map(w=>[w,worldInfo(w[0])]),max=Math.max(...info.map(v=>v[1].n),1),order=info.slice().sort((a,b)=>b[1].n-a[1].n);
 const fol=(S.ob.roles||[]).filter(r=>ROLES[r]);
 return `<p class="muted cm-lead">${f?t('วงยิ่งใหญ่ = ตำแหน่งที่คณะคุณเข้าได้ยิ่งเยอะ แตะวงเพื่อซูมเข้าไปดู','Bigger circle = more roles your faculty can reach. Tap a circle to zoom in'):t('7 โลกของงาน แตะวงเพื่อซูมเข้าไปดูกลุ่มงานและตำแหน่ง','7 worlds of work. Tap a circle to zoom into its job groups and roles')}</p>
 <div class="cm-cloud" role="list">${order.map(([w,v],i)=>{const d=v.n?150+80*v.n/max:145,p=CM_POS[i];return `<button role="listitem" class="cm-w${v.n?'':' dim'}" data-cmw="${w[0]}" style="--x:${p[0]}%;--y:${p[1]}%;--d:${d/10}%;--tone:var(${w[3]});--k:${(.72+.28*v.n/max).toFixed(2)}" aria-label="${esc(x(w[2]))}: ${v.n} ${t('ตำแหน่ง','roles')}${v.tag?' · '+x(v.tag==='d'?['ตรงสาย','Direct fit']:['ข้ามสายได้','Can cross over']):''}">
  <span class="cm-dot"><span class="cm-e" aria-hidden="true">${w[1]}</span><b class="num">${v.n}</b></span><span class="cm-wn">${x(w[2])}</span>${f?(v.tag?`<span class="chip ${v.tag==='d'?'good':'mid'}">${v.tag==='d'?t('ตรงสาย','Direct fit'):t('ข้ามสายได้ 🌉','Cross over 🌉')}</span>`:`<span class="chip">${t('ยังไม่มีข้อมูล','No data yet')}</span>`):''}</button>`}).join('')}</div>
 ${fol.length?`<div class="cm-fol"><b>📌 ${t('ตำแหน่งที่ติดตาม','Roles you follow')}</b><div class="opts">${fol.map(r=>`<button class="opt sm cm-opt" data-cmr="${r}">${x(ROLES[r].n)}</button>`).join('')}</div></div>`:''}`}
function lvCount(rs){const c={d:0,b:0,s:0,x:0};rs.forEach(r=>{const l=fitOf(r);if(l)c[l]++});return c}
function cmWorld(w){const W=WORLDS.find(v=>v[0]===w),f=FAC[S.ob.fac];
 return `<div class="cm-title" style="--tone:var(${W[3]})"><span class="cm-dot sm"><span class="cm-e" aria-hidden="true">${W[1]}</span></span><h2>${x(W[2])}</h2></div>
 <div class="cm-groups">${groupsIn(w).map(g=>{const rs=rolesIn(g),c=lvCount(rs),n=c.d+c.b+c.s;return `<button class="cm-g" data-cmg="${g}" style="--tone:var(${W[3]})"><span class="cm-dot sm"><span class="cm-e" aria-hidden="true">${GROUPS[g][1]}</span></span><span class="cm-gt"><b>${x(GROUPS[g][2])}</b><span class="muted">${f?t(`คณะคุณเข้าได้ ${n} จาก ${rs.length} ตำแหน่ง`,`${n} of ${rs.length} roles open to you`):t(`${rs.length} ตำแหน่ง`,`${rs.length} roles`)}</span>
  ${f&&(n||c.x)?`<span class="cm-lv">${['d','b','s','x'].filter(k=>c[k]).map(k=>`<span title="${esc(x(LVF[k][1]))}">${LVF[k][0]} ${c[k]}</span>`).join('')}</span>`:''}</span><span class="cm-go" aria-hidden="true">›</span></button>`}).join('')}</div>`}
function cmSkills(r){if(fitOf(r)==='x')return cmLock(r);const g=roleGap(r);return `<div class="cm-sk"><div><small>✅ ${t('ทักษะเดิมที่ใช้ได้','Skills you can reuse')}</small><div class="opts">${g.have.length?g.have.map(k=>`<span class="chip good">${x(SK[k])}</span>`).join(''):`<span class="chip">${t('เรียนรู้เร็ว ทำงานเป็นทีม','Fast learner, teamwork')}</span>`}</div></div>
 <div><small>➕ ${t('ทักษะที่ต้องเพิ่ม','Skills to add')}${g.need.length?` · ${t('รวม','total')} ${moTxt(g.mo)}`:''}</small><div class="opts">${g.need.length?g.need.map(k=>`<span class="chip cm-need">${x(SK[k])} · ${moTxt(SK[k][2])}</span>`).join(''):`<span class="chip good">${t('พร้อมสมัครได้เลย','Ready to apply')}</span>`}</div></div></div>`}
/* licensed job the user's faculty can't reach: say so plainly, never "learn ~12 months" */
const cmLock=r=>`<div class="cm-lock">🔒 <span>${t(`ต้องเรียนจบ${ROLES[r].lic[0]}โดยตรงและสอบใบประกอบวิชาชีพ เรียนเพิ่มระยะสั้นแทนไม่ได้`,`Requires a degree in ${ROLES[r].lic[1].toLowerCase()} and passing the licence exam; a short course can’t replace it`)}</span></div>`;
const cmNote=r=>ROLES[r].note?`<div class="cm-note-r">⚠️ <span>${x(ROLES[r].note)}</span></div>`:'';
function cmGroup(g){const W=WORLDS.find(v=>v[0]===GROUPS[g][0]),f=FAC[S.ob.fac],rs=rolesIn(g),ord={d:0,b:1,s:2,x:3};
 const mine=f?rs.filter(r=>fitOf(r)).sort((a,b)=>ord[fitOf(a)]-ord[fitOf(b)]):[],rest=rs.filter(r=>!mine.includes(r));
 const card=r=>{const sal=roleSal(r),l=fitOf(r);return `<article class="card cm-role"><button class="cm-rh" data-cmr="${r}"><span class="cm-rt"><b>${x(ROLES[r].n)}</b>${sal?`<span class="muted">💰 ${fmt(sal.lo)}–${fmt(sal.mid)} ${t('บาท','THB')}</span>`:''}</span>${fitBadge(l)}<span class="cm-go" aria-hidden="true">›</span></button>${l&&l!=='x'?cmSkills(r):''}</article>`};
 return `<div class="cm-title" style="--tone:var(${W[3]})"><span class="cm-dot sm"><span class="cm-e" aria-hidden="true">${GROUPS[g][1]}</span></span><h2>${x(GROUPS[g][2])}</h2></div>
 ${f?`<div class="cm-legend">${['d','b','s','x'].map(k=>`<span>${LVF[k][0]} ${x(LVF[k][1])}</span>`).join('')}</div>`:''}
 <div class="grid cm-roles">${(f?mine:rs).map(card).join('')||`<div class="card empty">${t('คณะของคุณยังไม่มีข้อมูลในกลุ่มนี้','No data for your faculty in this group yet')}</div>`}</div>
 ${f&&rest.length?`<div class="cm-more"><button class="link" data-cmmore aria-expanded="${S.cm.more}">${S.cm.more?'▾':'▸'} ${t(`ตำแหน่งอื่นในกลุ่มนี้ (${rest.length})`,`Other roles in this group (${rest.length})`)}</button>${S.cm.more?`<div class="opts">${rest.map(r=>`<button class="opt sm cm-opt" data-cmr="${r}">${x(ROLES[r].n)}</button>`).join('')}</div>`:''}</div>`:''}`}
function cmMentor(m,cross){const F=FAC[m.fac];return `<div class="li cm-m"><span class="ava" style="width:42px;height:42px;font-size:21px;background:${m.bg}">${m.ava}</span><div class="cm-mt"><b>${x(m.name)} ${m.real?`<span class="chip ver">✓ ${t('รุ่นพี่จริง','Real mentor')}</span>`:`<span class="chip">${t('ตัวอย่าง','Sample')}</span>`}</b>
 <span class="muted">${F?`🎓 ${t('จบ','Studied')} ${x(F.n)}${cross?' → 🌉':''} · `:''}${x(m.role)}</span></div><div class="row cm-mb"><button class="btn ghost sm" data-askm="${m.id}">💬 ${t('ถาม','Ask')}</button><button class="btn sm" data-book="${m.id}">📅 ${t('จองคุย','Book')}</button></div></div>`}
function cmRole(r){const R=ROLES[r],G=GROUPS[R.g],W=WORLDS.find(v=>v[0]===G[0]),l=fitOf(r),sal=roleSal(r),cos=roleCos(r),jobs=JOBS.filter(j=>R.jobs.includes(j.id)),M=roleMentors(r),fol=(S.ob.roles||[]).includes(r);
 return `<section class="card cm-rp" style="--tone:var(${W[3]})"><div class="cm-rph"><span class="cm-dot sm"><span class="cm-e" aria-hidden="true">${G[1]}</span></span><div class="cm-rt"><small class="muted">${x(W[2])} › ${x(G[2])}</small><h2>${x(R.n)}</h2></div></div>
 <div class="row" style="gap:8px">${l?fitBadge(l):FAC[S.ob.fac]?`<span class="chip">${t('ยังไม่มีข้อมูลสำหรับคณะคุณ','No data for your faculty yet')}</span>`:''}${FAC[S.ob.fac]?`<span class="muted">${t('สำหรับ','For')} ${esc(facName())}</span>`:`<button class="link" data-cmfac>${t('เลือกคณะเพื่อดูว่าเข้ากันแค่ไหน','Pick your faculty to see your fit')}</button>`}</div>
 ${FAC[S.ob.fac]?cmSkills(r):R.lic?cmLock(r):''}${cmNote(r)}
 <button class="btn ${fol?'ghost':'orange'} cm-follow" data-cmfollow="${r}" aria-pressed="${fol}">${fol?`✓ ${t('ติดตามตำแหน่งนี้แล้ว','Following this role')}`:`🔔 ${t('ติดตามตำแหน่งนี้','Follow this role')}`}</button>
 ${fol?`<small class="muted">${t('จะแจ้งเตือนที่กระดิ่งเมื่อมีงานใหม่ของตำแหน่งนี้','We’ll ring the bell when a new job for this role is posted')}</small>`:''}</section>
 <div class="grid g2 cm-grid">
 <section class="card cm-box"><h3>💰 ${t('เงินเดือนเริ่มต้น','Starting salary')}</h3>${sal?`<b class="cm-sal num">${fmt(sal.lo)}–${fmt(sal.mid)} <small>${t('บาท/เดือน','THB/month')}</small></b><span class="muted">${t(`สูงสุดที่เห็น ${fmt(sal.hi)} บาท · จากข้อมูลเงินเดือน ${fmt(sal.n)} รายการในเว็บ`,`Up to ${fmt(sal.hi)} THB seen · from ${fmt(sal.n)} salary reports on the site`)}</span>`:
  `<span class="muted">${t('ยังไม่มีข้อมูลเงินเดือนตำแหน่งนี้ในเว็บ','No salary data for this role on the site yet')}</span><button class="link" data-go="write" style="justify-self:start">${t('แชร์เงินเดือนของคุณ','Share your salary')}</button>`}</section>
 <section class="card cm-box"><h3>🏢 ${t('บริษัทที่มีตำแหน่งนี้','Companies with this role')}</h3>${cos.length?`<div class="opts">${cos.map(c=>`<button class="opt sm cm-opt cm-co" data-co="${c.id}"><span class="mark" style="background:${c.hue}">${x(c.mk)}</span>${x(c.name)}</button>`).join('')}</div>`:`<span class="muted">${t('ยังไม่มีบริษัทในเว็บที่มีตำแหน่งนี้','No company on the site lists this role yet')}</span>`}</section></div>
 <section class="sec"><div class="sec-h"><h2>${t('งานที่ประกาศอยู่','Open jobs')} (${jobs.length})</h2></div>${jobs.length?`<div class="grid g2">${jobs.map(jobCard).join('')}</div>`:`<div class="card empty">${t('ตอนนี้ยังไม่มีประกาศ กด “ติดตามตำแหน่งนี้” แล้วเราจะแจ้งเมื่อมีงานใหม่','No posts right now. Follow this role and we’ll tell you when one comes up')}</div>`}</section>
 <section class="sec"><div class="sec-h"><h2>🌉 ${t('รุ่นพี่ที่ข้ามสายมา','Mentors who crossed over')}</h2></div>
 ${M.cross.length?`<div class="list">${M.cross.map(m=>cmMentor(m,true)).join('')}</div>`:`<div class="card empty">${t('ยังไม่มีรุ่นพี่ที่ข้ามสายมาในตำแหน่งนี้','No mentor has crossed over into this role yet')}</div>`}
 ${M.same.length?`<p class="muted" style="margin:12px 0 6px">${t('รุ่นพี่ในสายนี้โดยตรง','Mentors from this field')}</p><div class="list">${M.same.map(m=>cmMentor(m,false)).join('')}</div>`:''}
 <button class="link" data-cmswipe style="margin-top:10px">${t('ปัดหารุ่นพี่ทั้งหมด →','Swipe through all mentors →')}</button></section>
 <p class="cm-fb"><button class="link" data-cmfb="${r}">⚠️ ${t('แจ้งข้อมูลไม่ถูกต้อง','Report incorrect info')}</button></p>`}
function cmNav(to,e,dir){const C=S.cm;if(e){const b=e.target.closest('button'),box=$('.cm-body');if(b&&box){const a=b.getBoundingClientRect(),o=box.getBoundingClientRect();C.ox=Math.round((a.left+a.width/2-o.left)/o.width*100);C.oy=Math.round((a.top+a.height/2-o.top)/Math.max(o.height,1)*100)}}
 Object.assign(C,to);C.dir=matchMedia('(prefers-reduced-motion: reduce)').matches?0:dir;S.jobTab='map';if(S.view!=='jobs')go('jobs');else{render();const h=$('.cm');if(h&&h.getBoundingClientRect().top<0)h.scrollIntoView({block:'start'})}}
function openRole(r){if(!S.ob.mapSeen){S.ob.mapSeen=true;obSave()}S.cm.w=GROUPS[ROLES[r].g][0];S.cm.g=ROLES[r].g;S.cm.r=r;S.cm.dir=0;S.jobTab='map';go('jobs')}
function openMap(){if(!S.ob.mapSeen){S.ob.mapSeen=true;obSave()}Object.assign(S.cm,{w:null,g:null,r:null,dir:0});S.jobTab='map';go('jobs')}
function followRole(r){const L=S.ob.roles||(S.ob.roles=[]),i=L.indexOf(r);if(i>=0){L.splice(i,1);obSave();render();toast(t('เลิกติดตามตำแหน่งนี้แล้ว','Unfollowed this role'));return}
 L.push(r);obSave();render();const n=JOBS.filter(j=>ROLES[r].jobs.includes(j.id)).length,R=ROLES[r].n;
 toast(t('ติดตามแล้ว จะแจ้งเตือนเมื่อมีงานใหม่','Following. We’ll let you know about new jobs'));
 pushNotif('📌',n?`${R[0]}: ตอนนี้เปิดรับอยู่ ${n} ตำแหน่ง จะแจ้งเมื่อมีงานใหม่`:`ติดตาม ${R[0]} แล้ว จะแจ้งเมื่อมีงานใหม่`,n?`${R[1]}: ${n} open now. We’ll tell you about new ones`:`Following ${R[1]}. We’ll tell you about new jobs`,['map',r])}
/* faculty picker (used in the welcome step 3 and in the map's "change") */
function facPicker(m){return `<div class="fp"><input class="field" id="facQ" type="search" value="${esc(m.q||'')}" placeholder="${t('ค้นหาสาขา เช่น จุลชีว เคมี คอมพิวเตอร์','Search majors, e.g. microbiology, chemistry')}" aria-label="${t('ค้นหาสาขา','Search majors')}" autocomplete="off"><div id="facRes">${facResults(m)}</div></div>`}
function facResults(m){const q=(m.q||'').trim().toLowerCase();
 if(q){const hits=[];Object.keys(FAC).forEach(f=>{const F=FAC[f];if(F.n.some(s=>s.toLowerCase().includes(q)))hits.push([f,null]);Object.keys(F.mj).forEach(k=>{if(F.mj[k][0].some(s=>s.toLowerCase().includes(q)))hits.push([f,k])})});
  return hits.length?`<div class="fp-hits" role="group" aria-label="${t('ผลการค้นหา','Results')}">${hits.slice(0,14).map(([f,k])=>{const on=m.fac===f&&(m.major||null)===k;return `<button class="opt sm cm-opt ${on?'on':''}" data-fpick="${f}" data-fmaj="${k||''}" aria-pressed="${on}">${FAC[f].e} ${k?`${x(FAC[f].mj[k][0])} <span class="muted">· ${x(FAC[f].n)}</span>`:x(FAC[f].n)}</button>`}).join('')}</div>`:`<p class="muted">${t('ไม่พบสาขานี้ ลองเลือกคณะที่ใกล้เคียงด้านล่างแทน','No match. Pick the closest faculty instead')}</p>${facGrid(m)}`}
 return facGrid(m)+(FAC[m.fac]?`<div class="fp-mj"><b>${FAC[m.fac].e} ${t('สาขา','Major')} <span class="muted">(${t('ไม่บังคับ','optional')})</span></b><div class="opts">${Object.keys(FAC[m.fac].mj).map(k=>`<button class="opt sm cm-opt ${m.major===k?'on':''}" data-fpick="${m.fac}" data-fmaj="${k}" aria-pressed="${m.major===k}">${x(FAC[m.fac].mj[k][0])}</button>`).join('')}</div></div>`:'')}
const facGrid=m=>`<div class="fp-grid" role="group" aria-label="${t('คณะ','Faculty')}">${Object.keys(FAC).map(f=>`<button class="fp-f ${m.fac===f?'on':''}" data-fpick="${f}" data-fmaj="" aria-pressed="${m.fac===f}"><span aria-hidden="true">${FAC[f].e}</span><b>${x(FAC[f].n)}</b></button>`).join('')}</div>`;
function facModal(m,head){return head(t('เรียนคณะ/สาขาอะไร?','What do you study?'),t('ใช้แสดงงานที่คณะคุณเข้าได้ในแผนที่อาชีพ','Used to show the roles your faculty can reach'))+facPicker(m)+
 `<div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>${t('ยกเลิก','Cancel')}</button><button class="btn y" data-fsave ${m.fac?'':'disabled'}>${t('บันทึก','Save')}</button></div>`}
function facSet(fac,major){S.ob.fac=FAC[fac]?fac:null;S.ob.major=S.ob.fac&&major&&FAC[fac].mj[major]?major:null;obSave();obSync()}
const OB_GOALS=[['intern','🎓',['หาที่ฝึกงาน','Find an internship']],['first','💼',['หางานแรกหลังจบ','Find my first job']],['pt','⚡',['หางานพาร์ทไทม์','Find part-time work']],['salary','💰',['อยากรู้เงินเดือนจริง','See real salaries']],['mentor','💬',['อยากปรึกษารุ่นพี่','Talk to a mentor']],['browse','👀',['แค่มาดูเฉยๆ','Just looking around']]];
const OB_STEPS=[['co','🏢',['ดูหน้าบริษัท 1 ที่','Open a company page'],5,'data-go="explore"'],['follow','➕',['ติดตามบริษัท 1 ที่','Follow a company'],5,'data-go="explore"'],['swipe','🐾',['ลองปัดหารุ่นพี่','Try swiping mentors'],5,'data-go="ask"'],['review','✍️',['เขียนรีวิวแรก','Write your first review'],30,'data-wopen']];
const OB_KEY='maadoo-onboard';
function obLoad(){let v=null;try{v=JSON.parse(store.get(OB_KEY)||'null')}catch(e){}const o={goal:null,inds:[],fac:null,major:null,roles:[],at:0,steps:{},paid:{},closed:false,done:false};if(!v||typeof v!=='object')return o;
 if(OB_GOALS.some(g=>g[0]===v.goal))o.goal=v.goal;if(Array.isArray(v.inds))o.inds=v.inds.filter(k=>IND[k]).slice(0,12);o.at=+v.at||0;
 {const [ff,mm]=facFix(v.fac,v.major);if(facOk(ff)){o.fac=ff;if(facOk(ff,mm))o.major=mm||null}}if(Array.isArray(v.roles))o.roles=v.roles.filter(r=>ROLES[r]).slice(0,30);o.mapSeen=!!v.mapSeen;o.startClosed=!!v.startClosed;
 ['steps','paid'].forEach(k=>{if(v[k]&&typeof v[k]==='object')OB_STEPS.forEach(s=>{if(v[k][s[0]])o[k][s[0]]=+v[k][s[0]]||1})});o.closed=!!v.closed;o.done=!!v.done;return o}
S.ob=obLoad();S.tour=null;
const obSave=()=>store.set(OB_KEY,JSON.stringify(S.ob));
const obNewDay=()=>!!(S.ob.at&&Date.now()-S.ob.at<DAY);
const welcomed=()=>!!store.get('maadoo-welcome');
function openOnboard(){S.tour=null;S.themeOpen=false;renderThemePop();tourRender();openModal({type:'onboard',step:1,goal:S.ob.goal,inds:S.ob.inds.slice(),fac:S.ob.fac,major:S.ob.major,q:''})}
function onboardModal(m){const dots=`<div class="ob-dots" role="img" aria-label="${t(`ขั้นที่ ${m.step} จาก 3`,`Step ${m.step} of 3`)}">${[1,2,3].map(i=>`<i class="${m.step===i?'on':''}"></i>`).join('')}</div>`;
 const top=`<div class="ob-top">${m.step>1?`<button class="link" data-obback>← ${t('ย้อน','Back')}</button>`:`<span class="ob-brand"><img src="maadoo-job-round.png" width="1182" height="1231" decoding="async" alt="">${t('มาดูจ็อบ','Maadoo Job')}</span>`}${dots}<span class="ob-n">${m.step}/3</span><button class="link" data-obskip>${t('ข้าม','Skip')}</button></div>`;
 if(m.step===1)return `<div class="ob">${top}<div class="ob-hero"><img class="ob-pup" src="${PUP()}" alt="${t('น้องมาดู','Maadoo the pup')}"><div class="ob-bubble"><b>${t('มาหาอะไรที่ Maadoo Job?','What brings you to Maadoo Job?')}</b><small>${t('เลือก 1 อย่าง น้องมาดูจะพาไปถูกที่','Pick one and Maadoo will take you to the right place')}</small></div></div>
  <div class="ob-goals" role="group" aria-label="${t('เป้าหมาย','Goal')}">${OB_GOALS.map(g=>`<button class="ob-goal ${m.goal===g[0]?'on':''}" data-obgoal="${g[0]}" aria-pressed="${m.goal===g[0]}"><span aria-hidden="true">${g[1]}</span><b>${x(g[2])}</b></button>`).join('')}</div>
  <p class="muted ob-note">${t('ไม่ต้องล็อกอิน เปลี่ยนทีหลังได้เสมอ','No login needed. You can change this any time')}</p></div>`;
 const G=OB_GOALS.find(g=>g[0]===m.goal);
 if(m.step===3)return `<div class="ob">${top}<div class="ob-hero"><img class="ob-pup" src="${PUP()}" alt=""><div class="ob-bubble"><b>${t('เรียนคณะ/สาขาอะไร?','What do you study?')}</b><small>${t('น้องมาดูจะวาดแผนที่อาชีพให้ว่าคณะคุณไปทางไหนได้บ้าง · ข้ามได้','Maadoo will draw a career map of where your faculty can go · you can skip this')}</small></div></div>
  ${facPicker(m)}<button class="btn orange big" data-obdone>${m.fac?t('เสร็จแล้ว ไปกันเลย','Done, let’s go'):t('ไปกันเลย','Let’s go')}</button></div>`;
 return `<div class="ob">${top}<div class="ob-hero"><img class="ob-pup" src="${PUP()}" alt=""><div class="ob-bubble"><b>${t('สนใจสายไหน?','Which fields interest you?')}</b><small>${G?`${G[1]} ${x(G[2])} · `:''}${t('เลือกได้หลายอัน','Pick as many as you like')}</small></div></div>
  <div class="ob-inds" role="group" aria-label="${t('สายงาน','Fields')}">${Object.keys(IND).map(k=>`<button class="opt ${m.inds.includes(k)?'on':''}" data-obind="${k}" aria-pressed="${m.inds.includes(k)}">${x(IND[k])}</button>`).join('')}</div>
  <button class="btn orange big" data-obnext>${m.inds.length?t(`ถัดไป (${m.inds.length})`,`Next (${m.inds.length})`):t('ถัดไป','Next')}</button></div>`}
function obFinish(m){const first=!S.ob.at;S.ob.goal=m.goal||S.ob.goal||null;S.ob.inds=(m.inds||[]).filter(k=>IND[k]);S.ob.startClosed=false;if(facOk(m.fac)){S.ob.fac=m.fac;S.ob.major=facOk(m.fac,m.major)?m.major||null:null}if(first)S.ob.at=Date.now();obSave();store.set('maadoo-welcome','1');
 S.modal=null;renderModal();obSync();S.q='';go('home');setTimeout(maybeTour,500)}
async function obSync(){if(!sbLive())return;try{await ensureProfile();const {error}=await SB.from('profiles').update({onboard_goal:S.ob.goal,onboard_inds:S.ob.inds}).eq('id',S.user.id);if(error)console.warn('[Maadoo Job] onboarding answers not saved (run the SQL, section 10):',error.code,error.message);
 const r=await SB.from('profiles').update({onboard_fac:S.ob.fac,onboard_major:S.ob.major}).eq('id',S.user.id);if(r.error)console.warn('[Maadoo Job] faculty not saved (run the SQL, section 11):',r.error.code,r.error.message)}catch(e){}}
async function obAfterLogin(){obPay();if(!sbLive())return;try{const {data,error}=await SB.from('profiles').select('onboard_goal,onboard_inds').eq('id',S.user.id).maybeSingle();if(error){console.warn('[Maadoo Job] onboarding answers not loaded (run the SQL, section 10):',error.code,error.message);return}
 if(data&&data.onboard_goal&&!S.ob.goal){S.ob.goal=OB_GOALS.some(g=>g[0]===data.onboard_goal)?data.onboard_goal:null;S.ob.inds=(data.onboard_inds||[]).filter(k=>IND[k]);obSave();if(S.view==='home')render()}
 else if(S.ob.goal&&!(data&&data.onboard_goal))obSync();
 const f=await SB.from('profiles').select('onboard_fac,onboard_major').eq('id',S.user.id).maybeSingle();if(f.error){console.warn('[Maadoo Job] faculty not loaded (run the SQL, section 11):',f.error.code,f.error.message);return}
 const [ff,fm]=f.data?facFix(f.data.onboard_fac,f.data.onboard_major):[null,null];
 if(facOk(ff)&&!S.ob.fac){S.ob.fac=ff;S.ob.major=facOk(ff,fm)?fm||null:null;obSave();if(ff!==f.data.onboard_fac||S.ob.major!==(f.data.onboard_major||null))obSync();if(S.view==='home'||S.view==='jobs')render()}
 else if(S.ob.fac&&!(f.data&&f.data.onboard_fac))obSync()}catch(e){}}
/* ---------- home: start card (by goal) + compact first steps ---------- */
function firstInd(pred){const hit=S.ob.inds.find(k=>JOBS.some(j=>pred(j)&&getCo(j.co).ind===k));return hit||'all'}
const OB_CTA={intern:['ดูที่ฝึกงาน','See internships'],first:['ดูแผนที่อาชีพของคณะคุณ','See your career map'],pt:['ดูงานพาร์ทไทม์ด่วน','See quick part-time jobs'],salary:['เช็กเงินเดือนจริง','Check real salaries'],mentor:['ปัดหารุ่นพี่','Swipe for mentors'],browse:['สำรวจบริษัท','Explore companies']};
function startCard(){if(!welcomed()||S.ob.startClosed)return '';const X=`<button class="x sm sc-x" data-scclose aria-label="${t('ปิดการ์ดนี้','Close this card')}">×</button>`;const g=OB_GOALS.find(v=>v[0]===S.ob.goal);
 if(!g)return `<div class="card start-card"><img class="sc-pup" src="${PUP()}" alt=""><div class="sc-t"><small>${t('เริ่มตรงนี้','Start here')}</small><b>${t('บอกน้องมาดูหน่อย มาหาอะไร?','Tell Maadoo what you’re looking for')}</b></div><button class="btn orange sc-go" data-obopen>${t('เลือกเป้าหมาย','Pick a goal')}</button>${X}</div>`;
 const inds=(g[0]==='first'&&FAC[S.ob.fac]?[facName()]:[]).concat(S.ob.inds.map(k=>x(IND[k])));
 return `<div class="card start-card"><span class="sc-ic" aria-hidden="true">${g[1]}</span><div class="sc-t"><small>${t('เริ่มตรงนี้','Start here')} · <button class="link" data-obopen>${t('เปลี่ยน','Change')}</button></small><b>${x(g[2])}</b>${inds.length?`<span class="muted">${inds.slice(0,3).join(' · ')}${inds.length>3?` +${inds.length-3}`:''}</span>`:''}</div>
 <button class="btn orange sc-go" data-obstart>${x(OB_CTA[g[0]])} →</button>${X}</div>`}
function obStart(){const g=S.ob.goal;
 if(g==='first'){openMap();return}
 if(g==='intern'){const type='intern',ind=firstInd(j=>j.type===type);S.jobTab='full';S.jobF={type,ind,min:0};go('jobs');if(S.ob.inds.length&&ind==='all')toast(t('ยังไม่มีประกาศในสายที่เลือก แสดงทั้งหมดแทน','No posts in your fields yet, showing everything'));return}
 if(g==='pt'){S.jobTab='pt';go('jobs');return}
 if(g==='mentor'){S.askTab='swipe';go('ask');return}
 if(g==='browse'){const keys=Object.keys(IND),k=S.ob.inds.find(v=>CO.some(c=>c.ind===v));S.filter=k?keys.indexOf(k):-1;go('explore');return}
 if(g==='salary'){const roles=allRoles(),c=CO.find(v=>S.ob.inds.includes(v.ind));if(c){const r=c.salary.find(s=>!s[5]);const i=r?roles.findIndex(v=>v[1]===r[0][1]):-1;if(i>=0)S.sal.role=i}
  S.jobTab='sal';go('jobs');setTimeout(()=>{const v=$('#salV');if(v)v.focus({preventScroll:true})},200)}}
/* first steps: one line with a progress bar; tap to open the list */
function firstSteps(){if(!welcomed()||S.ob.closed||S.ob.done)return '';const n=OB_STEPS.filter(s=>S.ob.steps[s[0]]).length,member=S.user&&!S.user.anon,op=!!S.fsOpen;
 return `<div class="card fs-card ${op?'open':''}"><div class="fs-h"><button class="fs-tg" data-fstoggle aria-expanded="${op}" aria-controls="fsList"><b>🐾 ${t('ก้าวแรกของฉัน','My first steps')}</b><span class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${n}"><i style="width:${n/4*100}%"></i></span><span class="muted num">${n}/4</span><span class="fs-car" aria-hidden="true">▾</span></button><button class="x sm" data-obclose aria-label="${t('ปิดการ์ดนี้','Close this card')}">×</button></div>
 ${op?`<div class="fs-list" id="fsList">${OB_STEPS.map(s=>{const done=!!S.ob.steps[s[0]];return `<button class="fs-item ${done?'done':''}" ${done?'aria-disabled="true"':s[4]}><span class="fs-chk" aria-hidden="true">${done?'✓':s[1]}</span><span class="fs-l">${x(s[2])}</span><span class="muted fs-p">+${s[3]} ${s[0]==='review'?t('เหรียญ','coins'):t('แต้ม','pts')}</span></button>`}).join('')}</div>
 ${member?'':`<small class="muted">${t('เข้าสู่ระบบเพื่อรับแต้มและเหรียญ (ติ๊กได้เลยโดยไม่ต้องล็อกอิน)','Log in to collect the points and coins (the ticks work without logging in)')}</small>`}`:''}</div>`}
function obMark(k){if(S.ob.steps[k]||!welcomed())return;S.ob.steps[k]=Date.now();obSave();const s=OB_STEPS.find(v=>v[0]===k),n=OB_STEPS.filter(v=>S.ob.steps[v[0]]).length;
 toast(`✓ ${t('ก้าวแรก','First steps')} ${n}/4 · ${x(s[2])}`);obPay();if(n===4&&!S.ob.done){S.ob.done=true;obSave();setTimeout(()=>toast(t('ครบ 4 ก้าวแรกแล้ว! 🎉','All 4 first steps done! 🎉')),2400)}}
async function obPay(){if(!S.user||S.user.anon)return;for(const s of OB_STEPS){const k=s[0];if(!S.ob.steps[k]||S.ob.paid[k])continue;S.ob.paid[k]=Date.now();obSave();
  if(k!=='review'){addPoints(s[3]);continue}
  try{await addCoins(30,'review','onboard:first-review');toast(t('+30 เหรียญจากรีวิวแรก (เข้ากระเป๋าหลังรีวิวผ่านการตรวจ)','+30 coins for your first review (they arrive once it’s approved)'))}catch(e){if(!(e&&(e.code==='23505'||e.message==='duplicate'))){delete S.ob.paid[k];obSave()}}}}
function obTrack(){if(!welcomed())return;if(S.view==='company')obMark('co');if(Object.values(S.follow).some(Boolean))obMark('follow');if(S.myReviews.length)obMark('review')}
/* ---------- coach marks ---------- */
const vis=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'?e:null};
/* steps: [target, text, view (default = the tour's view), go]. A "go" step opens its target on tap or "Next"
   and the tour carries on in the next page, so Home → Write → Jobs → career map is one continuous walk. */
const JOBS_BTN=()=>vis('#bnav [data-go="jobs"]')||vis('#topnav [data-go="jobs"]');
const T_MAPTAB=[()=>vis('.jsegs [data-jtab="map"]'),['🗺️ แผนที่อาชีพอยู่ตรงนี้นะ! แตะเพื่อดูว่าคณะคุณไปทางไหนได้บ้าง','🗺️ The career map is right here! Tap it to see where your faculty can take you'],'jobs',1];
const T_WORLD=[()=>vis('.cm-w'),['แตะวงเพื่อซูมเข้าไปดูกลุ่มงานและตำแหน่ง วงยิ่งใหญ่ = คณะคุณเข้าได้ยิ่งเยอะ','Tap a circle to zoom into its job groups and roles. Bigger circle = more roles your faculty can reach'],'jobs'];
const TOUR_VIEW={map:'home',nav2:'home',jobsmap:'jobs'},tourView=k=>TOUR_VIEW[k]||k;
const REV_BTN=()=>vis('#bnav [data-go="reviews"]')||vis('#topnav [data-go="reviews"]');
const T_REV=[REV_BTN,['รีวิวอยู่ตรงนี้ อ่านและเขียนรีวิวได้ในหน้าเดียว ได้แต้มและเหรียญด้วย','Reviews live here: read and write them on one page, and earn points and coins']];
/* Home: search → start card → the Reviews tab (bottom nav on phones, top nav on desktop): 3 targets, the most a page may have */
const TOURS={home:[[()=>vis('#q'),['ค้นหาบริษัท ตำแหน่ง หรือย่านที่อยากทำงาน','Search for companies, roles or areas']],
  [()=>vis('.start-card'),['เริ่มตรงนี้! ปุ่มนี้พาไปยังสิ่งที่คุณบอกว่าอยากหา เปลี่ยนเป้าหมายได้ทุกเมื่อ','Start here! This button takes you straight to what you said you’re looking for. Change your goal anytime']],T_REV],
 nav2:[T_REV,[JOBS_BTN,['บริษัท งานด่วน และเงินเดือน ย้ายมาเป็นแท็บในหน้า “งาน” แล้ว','Companies, part-time and salaries are now tabs in “Jobs”']]],
 reviews:[[()=>vis('.rv-in'),['แตะตรงนี้เพื่อเขียนรีวิว 5 ข้อ ไม่ถึง 1 นาที','Tap here to write a 5-question review in under a minute']],[()=>vis('.rv-filters'),['กรองรีวิว: มีประโยชน์ ล่าสุด ฝึกงาน หรือสายของคุณ','Filter reviews: helpful, latest, internships or your fields']]],
 map:[[JOBS_BTN,['🗺️ ยังไม่รู้ว่าอยากทำงานอะไร? ที่เมนู “งาน” มีแผนที่อาชีพ ช่วยวางแผนจากคณะที่เรียน ว่าไปทางไหนได้บ้าง','🗺️ Not sure what you want to do yet? “Jobs” has a career map that plans from your faculty and shows where it can take you'],'home',1],T_MAPTAB,T_WORLD],
 jobsmap:[T_MAPTAB,T_WORLD],
 ask:[[()=>vis('.scard.top'),['ปัดขวา = สนใจ · ปัดซ้าย = ข้าม (หรือกดปุ่มด้านล่าง)','Swipe right to like, left to skip (or use the buttons below)']],[()=>vis('.scard.top .s-rate'),['ดาวมาจากคนที่ปรึกษาจริง แตะเพื่ออ่านรีวิว','Stars come from real sessions. Tap to read the reviews']],[()=>vis('.scard.top .s-ask'),['ถามรุ่นพี่ฟรีได้เดือนละ 5 คำถามกับ Plus','Ask mentors for free: 5 questions a month with Plus']]]};
const stView=(p,st)=>st[2]||tourView(p);
function coachSeen(){const v=store.get('maadoo-coach');if(v==='1')return {home:1,ask:1};try{const o=JSON.parse(v||'{}');return o&&typeof o==='object'?o:{}}catch(e){return {}}}
const setSeen=o=>store.set('maadoo-coach',JSON.stringify(o));
function maybeTour(){if(S.tour||S.modal||!welcomed())return;const v=S.view==='ask'&&S.askTab!=='swipe'?null:S.view,seen=coachSeen();const p=v==='home'?(!seen.home?'home':!seen.map?'map':'nav2'):v==='jobs'?(S.jobTab==='map'||S.ob.mapSeen?null:'jobsmap'):v;if(!p||!TOURS[p]||seen[p])return;
 setTimeout(()=>{if(S.tour||S.modal||S.view!==v||coachSeen()[p])return;S.tour={p,i:0};tourStep()},450)}
/* the free band between the sticky header and the bottom nav: targets are scrolled into it and the tip never covers either bar */
function tourBand(){const h=document.querySelector('header.top'),bn=vis('#bnav');return {top:h?Math.max(0,h.getBoundingClientRect().bottom):0,bottom:bn?bn.getBoundingClientRect().top:innerHeight}}
const inBar=e=>!!e.closest('header.top,#bnav');
function tourStep(){const T=S.tour;if(!T)return;const steps=TOURS[T.p];while(T.i<steps.length&&stView(T.p,steps[T.i])===S.view&&!steps[T.i][0]())T.i++;
 if(T.i>=steps.length||S.view!==stView(T.p,steps[T.i])){tourEnd(false);return}const e=steps[T.i][0]();
 /* bring the target into the free band first (instant scroll), then measure on the next frames */
 if(!inBar(e)){const B=tourBand(),r=e.getBoundingClientRect(),room=B.bottom-B.top;if(r.top<B.top+8||r.bottom>B.bottom-8){const want=r.height>room-16?r.top-B.top-8:r.top-(B.top+(room-r.height)/2);window.scrollBy({top:want,behavior:'instant'})}}
 el0().innerHTML='';requestAnimationFrame(()=>requestAnimationFrame(tourRender))}
function tourEnd(all){const o=coachSeen();if(all)Object.keys(TOURS).forEach(k=>o[k]=1);else if(S.tour){o[S.tour.p]=1;if(S.tour.p==='home'){o.nav2=1;o.map=1}if(S.tour.p==='map')o.jobsmap=1}setSeen(o);S.tour=null;tourRender()}
function el0(){let el=$('#tour');if(!el){document.body.insertAdjacentHTML('beforeend','<div id="tour"></div>');el=$('#tour')}return el}
function tourRender(){const el=el0(),T=S.tour;if(!T||S.modal){el.innerHTML='';return}
 const steps=TOURS[T.p],st=steps[T.i];if(!st||stView(T.p,st)!==S.view){el.innerHTML='';return}
 const tg=st[0]();if(!tg){el.innerHTML='';clearTimeout(tourRender.skip);tourRender.skip=setTimeout(()=>{if(S.tour===T&&!st[0]())tourStep()},250);return}   // target gone: skip this step
 const r=tg.getBoundingClientRect(),B=tourBand(),W=Math.min(300,innerWidth-24),pad=6,last=T.i>=steps.length-1;
 const same=el.firstElementChild&&el.dataset.k===T.p+T.i+S.lang+S.skin;
 if(!same){el.dataset.k=T.p+T.i+S.lang+S.skin;
  el.innerHTML=`<div class="tour-catch" data-tournext aria-hidden="true"></div><div class="tour-ring"></div>
 <div class="tour-tip" role="dialog" aria-live="polite" aria-label="${t('คำแนะนำ','Tip')}" style="width:${W}px"><img src="${PUP()}" alt=""><div><small>${T.i+1}/${steps.length}</small><p>${x(st[1])}</p>
 <div class="row"><button class="btn y sm" data-tournext>${last?t('เข้าใจแล้ว','Got it'):st[3]?t('ไปกันเลย →','Let’s go →'):t('ถัดไป','Next')}</button><button class="link" data-tourskip>${t('ข้ามทั้งหมด','Skip all')}</button></div></div></div>`}
 const ring=el.querySelector('.tour-ring'),tip=el.querySelector('.tour-tip');
 Object.assign(ring.style,{left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px'});
 tip.style.width=W+'px';const h=tip.offsetHeight,gap=14;
 /* side with room: below the target, else above it; always inside the band (never over the header or bottom nav) */
 const lo=B.top+8,hi=B.bottom-8,spB=hi-(r.bottom+gap),spA=(r.top-gap)-lo;
 const below=inBar(tg)&&tg.closest('#bnav')?false:spB>=h||spB>=spA;
 let top=below?r.bottom+gap:r.top-gap-h;top=Math.max(lo,Math.min(hi-h,top));
 const left=Math.max(12,Math.min(innerWidth-W-12,r.left+r.width/2-W/2)),ax=Math.max(18,Math.min(W-18,r.left+r.width/2-left));
 tip.classList.toggle('below',below);tip.classList.toggle('above',!below);
 Object.assign(tip.style,{left:left+'px',top:top+'px',bottom:'auto'});tip.style.setProperty('--ax',ax+'px');
 if(!same){const b=tip.querySelector('[data-tournext]');if(b)b.focus({preventScroll:true})}}
/* re-measure on resize/scroll and when the layout shifts (images, fonts, bars appearing) */
function tourSched(){if(!S.tour||tourSched.f)return;tourSched.f=requestAnimationFrame(()=>{tourSched.f=0;tourRender()})}
try{new ResizeObserver(tourSched).observe(document.body)}catch(e){}
setInterval(()=>{if(S.tour&&!document.hidden)tourSched()},600);
function tourHit(e){const T=S.tour,st=T&&TOURS[T.p][T.i],tg=st&&st[0]();if(!tg)return false;const r=tg.getBoundingClientRect(),p=8;return e.clientX>=r.left-p&&e.clientX<=r.right+p&&e.clientY>=r.top-p&&e.clientY<=r.bottom+p}
/* hit = the tap landed on the highlighted target. A "go" step (or a tap on the last step's target) opens the target; the walk goes on. */
function tourNext(hit){const T=S.tour;if(!T)return;const steps=TOURS[T.p],st=steps[T.i],tg=st&&st[0](),last=T.i>=steps.length-1;
 if(tg&&(st[3]||(hit&&last))){if(last)tourEnd(false);else T.i++;tg.click();if(!last)setTimeout(tourStep,350);return}
 if(last){tourEnd(false);return}T.i++;tourStep()}
addEventListener('resize',tourSched);addEventListener('scroll',tourSched,{passive:true});
document.addEventListener('keydown',e=>{if(S.tour&&e.key==='Escape'){e.preventDefault();tourEnd(true)}});
/* ---------- events ---------- */
document.addEventListener('click',e=>{const el=e.target.closest('[data-obgoal],[data-obind],[data-obback],[data-obskip],[data-obdone],[data-obnext],[data-fpick],[data-obopen],[data-obstart],[data-fstoggle],[data-scclose],[data-obclose],[data-tournext],[data-tourskip],[data-tourreplay]');if(!el)return;const d=el.dataset,m=S.modal;
 if(d.tournext!==undefined){e.preventDefault();e.stopPropagation();tourNext(el.classList.contains('tour-catch')&&tourHit(e));return}
 if(d.tourskip!==undefined){e.preventDefault();e.stopPropagation();tourEnd(true);return}
 if(d.tourreplay!==undefined){setSeen({});S.themeOpen=false;renderThemePop();S.q='';go('home');maybeTour();return}
 if(d.obopen!==undefined){openOnboard();return}
 if(d.obstart!==undefined){obStart();return}
 if(d.fstoggle!==undefined){S.fsOpen=!S.fsOpen;render();return}
 if(d.scclose!==undefined){S.ob.startClosed=true;obSave();render();toast(t('ซ่อนแล้ว เปลี่ยนเป้าหมายได้ที่หน้า “ฉัน”','Hidden. You can change your goal on the “Me” page'));return}
 if(d.obclose!==undefined){S.ob.closed=true;obSave();render();toast(t('ซ่อนการ์ดก้าวแรกแล้ว','First-steps card hidden'));return}
 if(!m||m.type!=='onboard')return;
 if(d.obgoal){m.goal=d.obgoal;m.step=2;renderModal();const f=document.querySelector('.ob [data-obind]');if(f)f.focus({preventScroll:true});return}
 if(d.obind){const i=m.inds.indexOf(d.obind);if(i>=0)m.inds.splice(i,1);else m.inds.push(d.obind);renderModal();return}
 if(d.fpick){m.fac=d.fpick;m.major=d.fmaj||null;if(d.fmaj)m.q='';renderModal();return}
 if(d.obback!==undefined){m.step--;renderModal();return}
 if(d.obnext!==undefined){m.step=3;renderModal();return}
 if(d.obskip!==undefined){obFinish(m);return}
 if(d.obdone!==undefined){obFinish(m);return}},true);
/* ---------- "report incorrect info" on a role page → Supabase `feedback` (anyone may send; only admins read) ---------- */
const FB_WHY={fit:['ระดับความเข้ากันไม่ถูก','The fit level is wrong'],skill:['ทักษะไม่ถูกต้อง','The skills are wrong'],lic:['เงื่อนไข/ใบอนุญาตไม่ถูก','The licence/conditions are wrong'],sal:['เงินเดือนไม่ตรง','The salary is off'],other:['อื่น ๆ','Something else']};
function cmfbModal(m,head){const R=ROLES[m.r];return head(t('แจ้งข้อมูลไม่ถูกต้อง','Report incorrect info'),`${esc(x(R.n))}${FAC[S.ob.fac]?` · ${esc(facName())}`:''}`)+
 `<div class="opts" role="radiogroup" aria-label="${t('เรื่องที่ไม่ถูก','What’s wrong')}">${Object.keys(FB_WHY).map(k=>`<button type="button" role="radio" aria-checked="${m.why===k}" class="opt sm ${m.why===k?'on':''}" data-cmfbwhy="${k}">${x(FB_WHY[k])}</button>`).join('')}</div>
 <textarea class="field" id="cmfbTxt" maxlength="500" rows="3" placeholder="${t('ข้อมูลที่ถูกต้องคืออะไร? (ไม่บังคับ)','What’s the correct info? (optional)')}">${esc(m.txt||'')}</textarea>
 ${m.err?`<p class="form-err" role="alert">${x(m.err)}</p>`:''}
 <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>${t('ยกเลิก','Cancel')}</button><button class="btn y" data-cmfbsend ${m.why&&!m.busy?'':'disabled'}>${m.busy?t('กำลังส่ง…','Sending…'):t('ส่ง','Send')}</button></div>`}
async function cmfbSend(){const m=S.modal;if(!m||m.type!=='cmfb'||!m.why||m.busy)return;const el=$('#cmfbTxt');m.txt=el?el.value.trim().slice(0,500):'';
 if(SB){m.busy=true;renderModal();try{const {error}=await SB.from('feedback').insert({kind:'career_map',target:m.r,faculty:S.ob.fac||null,major:S.ob.major||null,reason:m.why,message:m.txt||null});if(error)throw error}
  catch(e){console.warn('[Maadoo Job] feedback not sent (run the SQL, section 13):',e&&e.code,e&&e.message);m.busy=false;m.err=['ส่งไม่สำเร็จ ลองใหม่อีกครั้ง','Couldn’t send. Please try again'];if(S.modal===m)renderModal();return}}
 S.modal=null;renderModal();toast(SB?t('ขอบคุณที่แจ้ง ทีมจะตรวจสอบข้อมูลนี้ 🙏','Thanks! The team will check this 🙏'):t('ขอบคุณที่แจ้ง (เดโม ไม่ได้ส่งจริง)','Thanks! (demo, not actually sent)'))}
document.addEventListener('click',e=>{const el=e.target.closest('[data-cmfb],[data-cmfbwhy],[data-cmfbsend]');if(!el)return;const d=el.dataset,m=S.modal;
 if(d.cmfb){if(ROLES[d.cmfb])openModal({type:'cmfb',r:d.cmfb,why:null,txt:''});return}
 if(!m||m.type!=='cmfb')return;const tx=$('#cmfbTxt');if(tx)m.txt=tx.value;
 if(d.cmfbwhy){m.why=d.cmfbwhy;m.err=null;renderModal();return}
 if(d.cmfbsend!==undefined)cmfbSend()});
/* career map events */
document.addEventListener('click',e=>{const el=e.target.closest('[data-cmw],[data-cmg],[data-cmr],[data-cmup],[data-cmfac],[data-cmmore],[data-cmfollow],[data-cmswipe],[data-cmopen],[data-fsave]');if(!el){const f=e.target.closest('[data-fpick]');if(f&&S.modal&&S.modal.type==='fac'){S.modal.fac=f.dataset.fpick;S.modal.major=f.dataset.fmaj||null;if(f.dataset.fmaj)S.modal.q='';renderModal()}return}const d=el.dataset;
 if(d.cmopen!==undefined){openMap();return}
 if(d.cmw){S.cm.more=false;cmNav({w:d.cmw,g:null,r:null},e,1);return}
 if(d.cmg){S.cm.more=false;cmNav({g:d.cmg,r:null},e,1);return}
 if(d.cmr){const g=ROLES[d.cmr].g;cmNav({w:GROUPS[g][0],g,r:d.cmr},e,1);return}
 if(d.cmup){const u=d.cmup;cmNav(u==='top'?{w:null,g:null,r:null}:u==='w'?{g:null,r:null}:{r:null},null,-1);return}
 if(d.cmmore!==undefined){S.cm.more=!S.cm.more;render();return}
 if(d.cmfollow){followRole(d.cmfollow);return}
 if(d.cmswipe!==undefined){S.askTab='swipe';go('ask');return}
 if(d.cmfac!==undefined){openModal({type:'fac',fac:S.ob.fac,major:S.ob.major,q:''});return}
 if(d.fsave!==undefined){const m=S.modal;if(!m||!m.fac)return;facSet(m.fac,m.major);S.modal=null;renderModal();render();toast(t(`บันทึกแล้ว: ${facName()}`,`Saved: ${facName()}`));return}});
document.addEventListener('input',e=>{if(e.target.id!=='facQ'||!S.modal||!['fac','onboard'].includes(S.modal.type))return;S.modal.q=e.target.value;const r=$('#facRes');if(r)r.innerHTML=facResults(S.modal)});
