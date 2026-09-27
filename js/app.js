/* Maadoo Job · js/app.js — modals, bell, theme menu, render(), main event handlers, start-up (loads last). Classic script sharing one global scope; see CLAUDE.md for load order. */
/* ---------- modals & notifications ---------- */
function openModal(m){S.modal=m;renderModal()}
function closeModal(){const m=S.modal;if(m&&m.type==='onboard'){obFinish(m);return}S.modal=null;renderModal()}
function needLogin(fn){if(S.user){fn();return}S.after=fn;openModal({type:'login'})}
function pushNotif(ic,th,en,go){NOTIFS.unshift({ic,t:[th,en],w:['เมื่อสักครู่','Just now'],go,read:false});renderBell()}
function addPoints(n){if(S.user)S.user.points+=n}
function renderModal(){const m=S.modal;const el=$('#modal');if(!m){el.innerHTML='';return}
 const head=(h,sub)=>`<div class="modal-h"><img src="${PUP()}" alt=""><div><h2>${h}</h2>${sub?`<p class="muted">${sub}</p>`:''}</div><button class="x" data-close aria-label="${t('ปิด','Close')}">×</button></div>`;
 let body='';
 if(m.type==='login')body=SB?sbLoginModal(m,head):`${head(t('เข้าสู่ระบบมาดูจ็อบ','Log in to Maadoo Job'),t('ใช้อีเมลมหาลัยหรือบริษัทเพื่อรับป้าย ✓','Use a university or work email to get the ✓ badge'))}
  <form id="loginForm" class="grid"><input class="field" id="lname" placeholder="${t('ชื่อที่ใช้แสดง เช่น น้องมาดู','Display name')}" required><input class="field" id="lemail" type="email" placeholder="you@kmutt.ac.th" required>
  <button class="btn y">${t('เข้าสู่ระบบ / สมัคร','Log in / Sign up')}</button></form><p class="demo-note">${t('เดโม: ไม่มีการส่งอีเมลจริง อีเมลที่ไม่ใช่ gmail/hotmail/yahoo/outlook จะได้ป้ายยืนยัน','Demo: no email is sent. Emails not from gmail/hotmail/yahoo/outlook get verified.')}</p>`;
 if(m.type==='link')body=linkModal(m,head);
 if(m.type==='otp')body=otpModal(m,head);
 if(m.type==='mrevs')body=mrevsModal(m,head);
 if(m.type==='pay')body=payModal(m,head);
 if(m.type==='topup')body=topupModal(m,head);
 if(m.type==='themes')body=themesModal(m,head);
 if(m.type==='qnew')body=qnewModal(m,head);
 if(m.type==='qchat')body=qchatModal(m,head);
 if(m.type==='creport')body=creportModal(m,head);
 if(m.type==='cblock')body=cblockModal(m,head);
 if(m.type==='amsgs')body=amsgsModal(m,head);
 if(m.type==='bkcancel')body=bkcancelModal(m,head);
 if(m.type==='iv')body=ivModal(m,head);
 if(m.type==='mreview')body=mreviewModal(m,head);
 if(m.type==='mrevdel')body=mrevdelModal(m,head);
 if(m.type==='delrev')body=delRevModal(m,head);
 if(m.type==='pt')body=ptModal(m);
 if(m.type==='ptpost')body=ptPostModal();
 if(m.type==='ptappl')body=ptApplModal(m);
 if(m.type==='ptrate')body=ptRateModal(m);
 if(m.type==='report')body=`${head(t('รายงานรีวิวนี้','Report this review'),t('ทีมจะตรวจภายใน 48 ชั่วโมง','We’ll look at it within 48 hours'))}
  <div class="grid">${[['ระบุชื่อบุคคล','Names an individual'],['ข้อมูลเท็จ','False information'],['คำหยาบ / คุกคาม','Abusive or harassing'],['สแปม / ไม่ใช่ประสบการณ์จริง','Spam or not a real experience']].map((r,i)=>`<button class="opt" style="text-align:left;border-radius:16px" data-reason="${i}">${x(r)}</button>`).join('')}</div>`;
 if(m.type==='match'){const mt=MENTORS.find(v=>v.id===m.id);const ini=S.user?esc(S.user.name.slice(0,1).toUpperCase()):'🙂';
  body=`<div class="match"><button class="x" data-close aria-label="${t('ปิด','Close')}" style="justify-self:end">×</button><div class="match-t">${t('แมตช์แล้ว!','It’s a match!')}</div><div class="match-av"><span class="me-ava">${ini}</span><span class="me-ava" style="background:${mt.bg};font-size:38px">${mt.ava}</span></div><p>${t(`${x(mt.name)}พร้อมให้คำปรึกษาคุณแล้ว 🎉`,`${x(mt.name)} is ready to chat with you 🎉`)}</p><button class="btn y" data-book="${mt.id}">${t('จองเวลาคุยเลย','Book a session')}</button><button class="link" data-close>${t('ปัดต่อ','Keep swiping')}</button></div>`}
 if(m.type==='onboard')body=onboardModal(m);
 if(m.type==='fac')body=facModal(m,head);
 if(m.type==='emp'){const e=EMP[m.tier],pay=m.tier==='Pro'?proPrice():0;body=`${head(t(`แพ็กเกจ ${m.tier}`,`${m.tier} plan`),m.tier==='Enterprise'?t('ทีมมาดูจ็อบจะติดต่อกลับภายใน 1 วันทำการ','The Maadoo Job team will get back to you within 1 business day'):m.tier==='Pro'?t(`${fmt(pay)} บาท/เดือน${pay<3900?' · 3 เดือนแรก':''}`,`${fmt(pay)} THB/month${pay<3900?' · first 3 months':''}`):t('ฟรีตลอด','Free forever'))}
  <form id="empForm" class="grid"><input class="field" id="ecn" maxlength="120" placeholder="${t('ชื่อบริษัท','Company name')}" required><input class="field" id="eem" type="email" placeholder="${t('อีเมลที่ทำงาน','Work email')}" required>${m.tier==='Enterprise'?`<input class="field" id="eph" placeholder="${t('เบอร์โทร (ไม่บังคับ)','Phone (optional)')}">`:''}
  <button class="btn ${m.tier==='Pro'?'orange':''}">${m.tier==='Pro'?t('ไปหน้าชำระเงิน (จำลอง)','Continue to checkout (simulated)'):m.tier==='Starter'?t('เริ่มใช้ฟรี','Start free'):t('ส่งข้อมูล','Send')}</button></form>
  <p class="demo-note">${t('เดโม: ไม่มีการตัดเงินจริง','Demo: no money is taken')}</p>`}
 const fresh=el._m!==m;el._m=m;el.innerHTML=`<div class="modal-bg ${['mrevs','mreview','qchat','qnew','creport','amsgs'].includes(m.type)?'sheet-m':''} ${m.type==='onboard'?'ob-bg':''} ${fresh?'in':''}" data-bg><div class="modal ${m.type==='mrevs'?'wide':''} ${m.type==='onboard'?'ob-m':''}" role="dialog" aria-modal="true">${body}</div></div>`;if(m.type==='mreview'){bindStars();const w=$('#rstars');if(w){w.focus({preventScroll:true});return}}if(m.type==='qchat'){const cb=$('#chatBox');if(cb)cb.scrollTop=cb.scrollHeight;const qi=$('#qmsg');if(qi&&matchMedia('(hover:hover)').matches)qi.focus({preventScroll:true});return}
 const f=el.querySelector('input');if(f&&!['onboard','fac'].includes(m.type))f.focus();
}
function renderBell(){const n=NOTIFS.filter(v=>!v.read).length;
 $('#bellBtn').innerHTML=`<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>${n?`<span class="dot">${n}</span>`:''}`;
 $('#bellBtn').setAttribute('aria-label',t('การแจ้งเตือน','Notifications'));
 $('#notif').innerHTML=S.notifOpen?`<div class="notif"><div class="notif-h"><b>${t('การแจ้งเตือน','Notifications')}</b><button class="link" data-readall>${t('อ่านทั้งหมด','Mark all read')}</button></div>${NOTIFS.map((v,i)=>`<button class="nitem ${v.read?'':'unread'}" data-ni="${i}"><span class="ic">${v.ic}</span><span>${x(v.t)}<small>${x(v.w)}</small></span></button>`).join('')}</div>`:'';
}
function foot(){$('#foot').innerHTML=`<span class="brand-s"><img src="${PUP()}" alt="">Maadoo Job</span><button class="link" data-go="employer">${t('สำหรับบริษัท','For employers')}</button><button class="link" data-go="quiz">${t('ควิซหาบริษัทที่ใช่','Company-match quiz')}</button><button class="link" data-go="rules">${t('แนวทางรีวิวและความเป็นส่วนตัว','Guidelines & privacy')}</button><span style="margin-left:auto">© 2026 ${t('มาดูจ็อบ','Maadoo Job')} · ${t('เดโม','demo')}</span>`}

const fxPct=v=>v?`${v}%`:t('ปิด','Off');
const fxSlider=(k,ic,name,sub)=>{const v=fxLevel(k);return `<label class="fx-row fx-sl"><span><b>${ic} ${name} <em class="fx-v" id="fxv-${k}">${fxPct(v)}</em></b><small>${sub}</small></span><input type="range" id="fx-${k}" min="0" max="100" step="5" value="${v}" style="--p:${v}%" aria-label="${name}" aria-valuetext="${fxPct(v)}"></label>`};
function renderThemePop(){const el=$('#themePop');if(!el)return;if(!S.themeOpen){el.innerHTML='';return}
 const old=el.querySelector('.tpop'),top=old?old.scrollTop:0,gs=old?old.querySelector('.swatches'):null,gtop=gs?gs.scrollTop:null;
 el.innerHTML=`<div class="tpop"><div class="notif-h"><b>🎨 ${t('เลือกธีม','Choose a theme')}</b><small class="muted">${THEMES.length} ${t('ธีม','themes')}</small></div>
 <div class="fx-sec"><b>${t('เอฟเฟคและเสียง','Effects & sound')} · ${TH(S.skin).ic} ${x(TH(S.skin).n)}</b>
  ${fxSlider('amb','✨',t('เอฟเฟกต์พื้นหลัง','Background effect'),x(TH(S.skin).fx.n))}
  ${fxSlider('tap','👆',t('เอฟเฟกต์ตอนแตะ','Tap effect'),t('อนิเมชันเด้งออกมาตอนแตะ','A little burst when you tap'))}
  <button class="fx-row" data-snd role="switch" aria-checked="${S.snd}"><span><b>🎵 ${t('เสียงบรรยากาศ','Ambient sound')}</b><small>${x(TH(S.skin).snd.n)}</small></span><i class="tg ${S.snd?'on':''}"></i></button>
  ${S.snd?`<label class="snd-vol"><span aria-hidden="true">🔈</span><input type="range" id="sndVol" min="0" max="100" step="1" value="${Math.round(S.sndVol*100)}" style="--p:${Math.round(S.sndVol*100)}%" aria-label="${t('ระดับเสียง','Volume')}" aria-valuetext="${Math.round(S.sndVol*100)}%"><span aria-hidden="true">🔊</span></label>`:''}<button class="fx-row tour-again" data-obopen><span><b>🎯 ${t('เปลี่ยนเป้าหมาย / คณะ','Change goal / faculty')}</b><small>${t('ตอบคำถามต้อนรับใหม่','Answer the welcome questions again')}</small></span><span aria-hidden="true">→</span></button><button class="fx-row tour-again" data-tourreplay><span><b>❓ ${t('พาเที่ยวอีกครั้ง','Show me around again')}</b><small>${t('น้องมาดูชี้ปุ่มสำคัญให้ดูใหม่','Maadoo points out the key buttons again')}</small></span><span aria-hidden="true">→</span></button></div>
 <div class="swatches" role="radiogroup" aria-label="${t('ธีม','Themes')}">${THEMES.map(k=>`<button class="sw ${S.skin===k.k?'on':''}" data-skin="${k.k}" role="radio" aria-checked="${S.skin===k.k}" title="✨ ${esc(x(k.fx.n))}"><span class="sw-prev" style="background:${k.prev[0]}"><i style="background:${k.prev[1]}"></i><i style="background:${k.prev[2]}"></i><img src="${PUP(k.k)}" alt="" loading="lazy"></span><span class="sw-n">${k.ic} ${x(k.n)}</span></button>`).join('')}</div></div>`;
 const np=el.querySelector('.tpop');if(np){np.scrollTop=top;const g=np.querySelector('.swatches');if(g){if(gtop!=null)g.scrollTop=gtop;else{const on=g.querySelector('.sw.on');if(on&&on.offsetTop>g.clientHeight-20)g.scrollTop=on.offsetTop-g.clientHeight/3}}}}
function renderCoach(){tourRender()}
/* explore: category dropdown · popover on wide screens, bottom sheet on phones (≤600px) */
const isSheet=()=>matchMedia('(max-width:600px)').matches;
function indMenu(sheet){const keys=Object.keys(IND);const opt=(i,label,n)=>`<button type="button" class="dd-opt" role="option" id="indopt${i}" aria-selected="${S.filter===i}" data-indpick="${i}" tabindex="-1"><span>${label}</span>${n!=null?`<span class="dd-n">(${n})</span>`:''}<span class="dd-ck" aria-hidden="true">${S.filter===i?'✓':''}</span></button>`;
 return `<div class="dd-menu ${sheet?'sheet':''}" id="indMenu" role="dialog" aria-label="${t('หมวดหมู่บริษัท','Company categories')}">
  <div class="dd-sheet-h"><span>${t('เลือกหมวดหมู่','Choose a category')}</span><button type="button" class="x" data-indclose aria-label="${t('ปิด','Close')}">×</button></div>
  <div class="dd-list" role="listbox" aria-label="${t('หมวดหมู่บริษัท','Company categories')}">${opt(-1,t('ทั้งหมด','All'),CO.length)}${keys.map((k,i)=>opt(i,x(IND[k]),CO.filter(c=>c.ind===k).length)).join('')}</div></div>`}
function indDropdown(){const keys=Object.keys(IND);const set=S.filter!==-1;const name=set?x(IND[keys[S.filter]]):t('ทั้งหมด','All');
 return `<div class="dd"><div class="dd-pill ${set?'set':''} ${S.indOpen?'open':''}"><button type="button" class="dd-btn" id="indBtn" data-indtoggle aria-haspopup="listbox" aria-expanded="${!!S.indOpen}" aria-controls="indMenu"><span class="dd-k">${t('หมวดหมู่:','Category:')}</span><b>${name}</b><span class="dd-car" aria-hidden="true">▾</span></button>${set?`<button type="button" class="dd-x" data-indclear aria-label="${t('ล้างตัวกรองหมวดหมู่','Clear category filter')}">×</button>`:''}</div>
 ${S.indOpen&&!isSheet()?indMenu(false):''}</div>`}
function renderIndSheet(){const el=$('#sheet');if(!el)return;const on=S.view==='explore'&&S.indOpen&&isSheet();
 el.innerHTML=on?`<div class="sheet-bg" data-indclose></div>${indMenu(true)}`:'';document.body.classList.toggle('sheet-open',on)}
function indFocus(i){const o=document.getElementById('indopt'+i)||document.querySelector('#indMenu .dd-opt');if(!o)return;o.focus({preventScroll:true});
 const l=o.parentNode;if(o.offsetTop<l.scrollTop)l.scrollTop=o.offsetTop-6;else if(o.offsetTop+o.offsetHeight>l.scrollTop+l.clientHeight)l.scrollTop=o.offsetTop+o.offsetHeight-l.clientHeight+6}
function indOpen(){S.indOpen=true;render();indFocus(S.filter)}
function indClose(focusBtn){if(!S.indOpen)return;S.indOpen=false;render();if(focusBtn){const b=$('#indBtn');if(b)b.focus({preventScroll:true})}}
function indPick(i){S.filter=i;S.indOpen=false;render();const b=$('#indBtn');if(b)b.focus({preventScroll:true})}
addEventListener('resize',()=>{if(S.indOpen&&S.view==='explore'&&!!document.querySelector('#sheet .dd-menu')!==isSheet())render()});
function render(){if(S.view!=='explore')S.indOpen=false;applyPrefs();nav();$('#app').innerHTML={home,explore,company,write,ask,quiz,jobs,me,employer,rules,plus:plusPage,wallet,invite:invitePage,chat:chatView,admin,mentorApply,book:bookView,live:liveView}[S.view]();renderBell();foot();renderModal();if(S.view==='ask'&&S.askTab==='swipe')bindDeck();renderIndSheet();if(S.view==='home')bindPromo();if(S.view==='chat')bindChat();else if(roomChId)leaveRoomCh();obTrack();if(S.tour){const st=TOURS[S.tour.p][S.tour.i];if(!st||stView(S.tour.p,st)!==S.view)S.tour=null}tourRender();maybeTour();}
function syncForm(){const m={co:'fco',role:'frole',title:'ftitle',pro:'fpro',con:'fcon',sal:'fsal'};for(const k in m){const e=document.getElementById(m[k]);if(e)S.form[k]=e.value}}

document.addEventListener('click',e=>{
 if(e.target.matches('[data-bg]')){closeModal();return}
 if(S.indOpen&&!e.target.closest('#indMenu .dd-list,#indBtn,.dd-sheet-h')){indClose(false);if(!e.target.closest('#app'))return}
 if(S.indOpen&&e.target.closest('[data-indclose]')){indClose(true);return}
 const b=e.target.closest('button');
 if(S.notifOpen&&(!b||(b.id!=='bellBtn'&&!b.closest('#notif')))){S.notifOpen=false;renderBell()}
 if(S.themeOpen&&!e.target.closest('#themePop')&&(!b||b.id!=='themeBtn')){S.themeOpen=false;renderThemePop();renderCoach()}
 if(!b)return;const d=b.dataset;
 if(b.id==='bellBtn'){S.notifOpen=!S.notifOpen;S.themeOpen=false;renderThemePop();renderBell();return}
 if(d.readall!==undefined){NOTIFS.forEach(v=>v.read=true);renderBell();return}
 if(d.ni!==undefined){const v=NOTIFS[+d.ni];v.read=true;S.notifOpen=false;if(v.go[0]==='company')go('company',{co:v.go[1],tab:'overview'});else if(v.go[0]==='chat'){S.chatDraft='';go('chat',{chat:v.go[1]})}else if(v.go[0]==='live'){go('live',{liveId:v.go[1]})}else if(v.go[0]==='map'){openRole(v.go[1])}else go(v.go[0]);return}
 if(d.close!==undefined){closeModal();return}
 if(d.gopt!==undefined){S.jobTab='pt';go('jobs');return}
 if(d.jtab){if(d.jtab==='map'&&S.jobTab!=='map')Object.assign(S.cm,{w:null,g:null,r:null,dir:0});if(d.jtab==='map'&&!S.ob.mapSeen){S.ob.mapSeen=true;obSave()}S.jobTab=d.jtab;render();return}
 if(d.pt){openModal({type:'pt',id:d.pt});return}
 if(d.ptday){S.ptDay=d.ptday;render();return}
 if(d.ptpost!==undefined){openModal({type:'ptpost'});return}
 if(d.ptapply){const msg=($('#ptmsg')||{}).value||'';ptApply(d.ptapply);return}
 if(d.ptreport!==undefined){closeModal();toast(t('ส่งให้ทีมตรวจแล้ว งานจะถูกซ่อนถ้ามีคนรายงานหลายครั้ง','Sent to moderators. Jobs reported several times are hidden'));return}
 if(d.ptappl){openModal({type:'ptappl',id:d.ptappl});return}
 if(d.pthire){const [id,i]=d.pthire.split(':');const p=PT.find(v=>v.id===id);if(p.filled<p.need&&!p.appl[i].hired){p.appl[i].hired=true;p.filled++;toast(t(`รับ ${p.appl[i][0]} แล้ว · เปิดแชตให้แล้ว`,`Hired ${p.appl[i][0]} · chat opened`))}renderModal();if(S.view==='jobs')render();return}
 if(d.pfboost){syncPtForm();S.ptForm.boost=d.pfboost;renderModal();return}
 if(d.ptstar){S.ptRate.s=+d.ptstar;renderModal();return}
 if(d.pttag){S.ptRate.tags[d.pttag]=!S.ptRate.tags[d.pttag];renderModal();return}
 if(d.ptrate){S.ptRate={s:0,tags:{}};openModal({type:'ptrate',id:d.ptrate});return}
 if(d.ptratesend){S.ptApps[d.ptratesend].st=3;addPoints(3);closeModal();render();toast(t('ขอบคุณ! คะแนนของคุณช่วยคนถัดไป +3 แต้ม','Thanks! Your rating helps the next person +3 pts'));return}
 if(d.login!==undefined){openModal({type:'login'});return}
 if(d.lmode){keepAuth();S.modal.mode=d.lmode;S.modal.err=null;renderModal();const f=document.getElementById(d.lmode==='up'?'lname':'lemail');if(f)f.focus();return}
 if(d.pwtoggle){const i=document.getElementById(d.pwtoggle);if(i){const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?t('ซ่อน','Hide'):t('แสดง','Show');b.setAttribute('aria-pressed',String(show))}return}
 if(d.magic!==undefined){if(SB){keepAuth();const em=S.modal&&S.modal.email||'';openModal({type:'otp',step:'email',email:EMAIL_RE.test(em.trim())?em.trim():'',fromLogin:true})}return}
 if(d.otpresend!==undefined){if(SB&&otpLeft()<=0)otpSend();return}
 if(d.otpchange!==undefined){keepOtp();const m=S.modal;if(m){m.step='email';m.code='';m.err=null;renderModal()}return}
 if(d.otpback!==undefined){keepOtp();const em=S.modal&&S.modal.email;openModal({type:'login',mode:'in',email:em||''});return}
 if(d.delrev){needLogin(()=>openModal({type:'delrev',id:d.delrev}));return}
 if(d.delrevok!==undefined){deleteReview();return}
 if(d.anon!==undefined){if(SB)authRun(()=>SB.auth.signInAnonymously(),'anon');return}
 if(d.linkacct!==undefined){openModal({type:'link'});return}
 if(d.resend!==undefined){if(S.modal){S.modal.sent=null;renderModal()}return}
 if(d.logout!==undefined){if(SB&&S.user&&S.user.id){SB.auth.signOut().catch(()=>{});S.myReviews=[];forgetMine()}resetPrem();S.user=null;render();toast(t('ออกจากระบบแล้ว','Logged out'));return}
 if(d.report){openModal({type:'report'});return}
 if(d.reason!==undefined){closeModal();toast(t('ส่งให้ทีมตรวจแล้ว ขอบคุณที่ช่วยดูแลชุมชน','Sent to moderators. Thanks for keeping Maadoo safe'));return}
 if(d.save){S.saved[d.save]=!S.saved[d.save];render();toast(S.saved[d.save]?t('บันทึกงานแล้ว ดูได้ที่หน้า “ฉัน”','Saved. Find it under “Me”'):t('นำออกจากงานที่บันทึก','Removed from saved'));return}
 if(d.apply){const id=d.apply;needLogin(()=>{S.applied[id]=true;addPoints(10);const j=JOBS.find(v=>v.id===id);pushNotif('💼',`ส่งใบสมัคร ${j.title[0]} แล้ว`,`Application sent: ${j.title[1]}`,['me']);render();toast(t('ส่งใบสมัครแล้ว! +10 แต้ม','Application sent! +10 pts'))});return}
 if(d.jt){S.jobF.type=d.jt;render();return}
 if(d.asktab){S.askTab=d.asktab;render();return}
 if(d.sw){swipeGo(d.sw);return}
 if(d.topic){S.sw.topic=d.topic;render();return}
 if(d.swreset!==undefined){S.sw.skipped=[];render();return}
 if(d.book){if(S.modal)closeModal();openBook(d.book);return}
 if(d.slot!==undefined){S.modal.slot=+d.slot;renderModal();return}
 if(d.emp){openModal({type:'emp',tier:d.emp});return}
 if(b.id==='themeBtn'){S.themeOpen=!S.themeOpen;S.notifOpen=false;renderBell();applyPrefs();return}
 if(d.skin){S.skin=d.skin;store.set('maadoo-skin',S.skin);render();const sw=document.querySelector(`#themePop [data-skin="${S.skin}"]`);if(sw)sw.focus({preventScroll:true});const k=TH(S.skin);toast(`${k.ic} ${t('ธีม','Theme')}: ${x(k.n)}`);return}
 if(d.mrevs){openModal({type:'mrevs',id:d.mrevs});return}
 if(d.mdone){const bk=S.booked.find(v=>v.id===d.mdone);if(bk){bk.st='done';render();openMrev(bk.id)}return}
 if(d.mrevopen||d.mrevedit){openMrev(d.mrevopen||d.mrevedit);return}
 if(d.mrevdel){openModal({type:'mrevdel',bid:d.mrevdel});return}
 if(d.mrevdelok!==undefined){mrevDelete();return}
 if(d.mrevsend!==undefined){mrevSubmit();return}
 if(d.mtag){const m=S.modal;if(m&&m.type==='mreview'){const i=m.tags.indexOf(d.mtag);i<0?m.tags.push(d.mtag):m.tags.splice(i,1);b.setAttribute('aria-pressed',i<0)}return}
 if(d.pdot!==undefined){promoGo(+d.pdot);return}
 if(d.pgo){const c=document.getElementById(d.pgo==='invite'?'inviteCard':'pioneerCard');if(c){c.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});c.classList.add('flash');setTimeout(()=>c.classList.remove('flash'),1200)}return}
 if(d.season){const a=d.season;if(a==='plan-t'||a==='plan-y'){S.planSel=a.slice(5);go('plus')}else if(a==='theme-sea'){S.skin='sea';store.set('maadoo-skin','sea');render();toast(t('เปลี่ยนเป็นธีมทะเลแล้ว 🌊','Switched to the Ocean theme 🌊'))}else if(a==='pt'){S.jobTab='pt';go('jobs')}else if(a==='ask'){S.askTab='swipe';go('ask')}else go('wallet');return}
 if(d.promohide!==undefined){S.promoHidden=true;store.set('maadoo-promo-hide',String(Date.now()));render();toast(t('ซ่อนโปรโมชัน 7 วันแล้ว · ดูโค้ดชวนเพื่อนได้ที่หน้าโปรไฟล์','Promotions hidden for 7 days · your invite code is on your profile'));return}
 if(d.promoshow!==undefined){S.promoHidden=false;store.set('maadoo-promo-hide','0');render();toast(t('แสดงโปรโมชันบนหน้าแรกอีกครั้งแล้ว','Promotions are back on the home page'));return}
 if(d.copycode!==undefined){const c=myCode();if(!c)return;(async()=>{let ok=false;try{await navigator.clipboard.writeText(c);ok=true}catch(e){}toast(ok?t('คัดลอกโค้ดแล้ว','Code copied'):t('โค้ดของคุณ: ','Your code: ')+c)})();return}
 if(d.share!==undefined){shareInvite();return}
 if(d.plansel){S.planSel=d.plansel;render();const pb=document.querySelector(`[data-plansel="${d.plansel}"]`);if(pb)pb.focus({preventScroll:true});return}
 if(d.plusbuy!==undefined){const k=S.planSel;openPay({what:'plus',plan:k,amount:planPrice(k)});return}
 if(d.freemonth!==undefined){claimFreeMonth();return}
 if(d.claim){claimMission(d.claim);return}
 if(d.invite!==undefined){invite();return}
 if(d.ccsync!==undefined){(async()=>{const before=S.prem.coins;await refreshAll();render();toast(t(`ยอดในระบบ: ${fmt(S.prem.coins)} เหรียญ`,`Balance on the server: ${fmt(S.prem.coins)} coins`)+(S.prem.coins!==before?t(' (อัปเดตแล้ว)',' (updated)'):''))})();return}
 if(d.ccbook!==undefined){S.askTab='swipe';go('ask');return}
 if(d.ccthemes!==undefined){openModal({type:'themes'});return}
 if(d.cctopup!==undefined){needMember(()=>openModal({type:'topup'}));return}
 if(d.pack){const [c,pr]=PACKS[+d.pack];openPay({what:'topup',coins:c,amount:pr});return}
 if(d.paym){if(S.modal&&S.modal.type==='pay'&&S.modal.step==='form'){S.modal.method=d.paym;renderModal()}return}
 if(d.paynow!==undefined){payNow();return}
 if(d.askm){askMentor(d.askm);return}
 if(d.qsend!==undefined){qSend();return}
 if(d.qopen){qTick();const q=S.prem.qs.find(v=>v.id===d.qopen),rm=q&&roomOfQ(q);if(rm){S.chatDraft='';go('chat',{chat:rm.id});return}if(q&&isUuid(q.mid)){toast(t('กำลังโหลดห้องแชท…','Loading the chat…'));loadChat();return}openModal({type:'qchat',id:d.qopen});return}
 if(d.qdone!==undefined){if(S.modal&&S.modal.type==='qchat')qDone(S.modal.id);return}
 if(d.qskip){const q=S.modal&&S.prem.qs.find(v=>v.id===S.modal.id);if(q){const ms=+d.qskip*36e5;q.createdAt-=ms;q.lastAt-=ms;if(q.answeredAt)q.answeredAt-=ms;if(!q.answeredAt)q.skipped=true;qTick();renderModal();rerender()}return}
 if(d.ivopen){needMember(()=>openModal({type:'iv',co:d.ivopen,diff:'mid',q:''}));return}
 if(d.ivdiff){const m=S.modal;if(m&&m.type==='iv'){const v=$('#ivq');if(v)m.q=v.value;m.diff=d.ivdiff;renderModal()}return}
 if(d.ivsend!==undefined){const m=S.modal;if(!m||m.type!=='iv')return;const q=($('#ivq').value||'').trim().slice(0,140);if(!q){m.err=['พิมพ์คำถามที่เจอก่อนนะ','Type a question they asked first.'];renderModal();return}
  const c=getCo(m.co);c.interview.qs.push([q,q]);S.prem.interviews.push({co:m.co,at:Date.now()});addPoints(10);S.modal=null;render();toast(t('ขอบคุณที่แชร์! ภารกิจ “รีวิวการสัมภาษณ์” สำเร็จ','Thanks for sharing! “Review an interview” mission done'));return}
 if(d.snd!==undefined){SND.toggle();renderThemePop();return}
 if(b.id==='annBtn'){S.themeOpen=false;renderThemePop();openModal({type:'welcome'});return}
 if(b.id==='langBtn'){if(S.view==='write'&&!S.done)syncForm();if(S.view==='ask'){const a=$('#askq');if(a)S.askText=a.value}S.lang=S.lang==='th'?'en':'th';store.set('maadoo-lang',S.lang);render();toast(t('เปลี่ยนเป็นภาษาไทยแล้ว','Switched to English'));return}
 if(d.go){if(d.go==='write')S.done=null;go(d.go);return}
 if(d.co){go('company',{co:d.co,tab:d.tabto||'overview'});return}
 if(d.tab){S.tab=d.tab;render();return}
 if(d.clear!==undefined){S.q='';render();return}
 if(d.qk){if(d.qk==='ฝึกงาน'||d.qk==='intern'){S.q='';go('explore');toast(t('ทุกบริษัทมีรีวิวฝึกงานแยกให้ดู','Every company has separate intern reviews'));return}S.q=d.qk;render();return}
 if(d.poll!==undefined){if(S.poll===null){S.poll=+d.poll;render()}return}
 if(d.help){S.helped[d.help]=!S.helped[d.help];render();return}
 if(d.follow){S.follow[d.follow]=!S.follow[d.follow];render();toast(S.follow[d.follow]?t('จะแจ้งเตือนเมื่อมีรีวิวหรือเงินเดือนใหม่','We’ll notify you about new reviews and salaries'):t('เลิกติดตามแล้ว','Unfollowed'));return}
 if(d.writefor){S.done=null;S.form=blankForm();S.form.co=d.writefor;go('write');return}
 if(d.indtoggle!==undefined){S.indOpen?indClose(true):indOpen();return}
 if(d.indpick!==undefined){indPick(+d.indpick);return}
 if(d.indclear!==undefined){S.filter=-1;S.indOpen=false;render();const bb=$('#indBtn');if(bb)bb.focus({preventScroll:true});return}
 if(d.f){syncForm();S.form[d.f]=d.f==='mood'?+d.v:d.v;render();return}
 if(d.star){syncForm();S.form.r=+d.star;render();return}
 if(d.again!==undefined){S.done=null;S.form=blankForm();render();return}
 if(d.asktag){S.askText=$('#askq').value;S.askTag=+d.asktag;render();return}
 if(d.bkind){S.askText=$('#askq').value;S.bd.kind=d.bkind;render();return}
 if(d.bsort){S.bd.sort=d.bsort;render();return}
 if(d.btag){S.bd.tag=+d.btag;render();return}
 if(d.plike){S.pl[d.plike]=!S.pl[d.plike];render();return}
 if(d.clike){S.pl[d.clike]=!S.pl[d.clike];render();return}
 if(d.popen){S.bd.open[d.popen]=!S.bd.open[d.popen];render();return}
 if(d.reply){S.bd.open[d.reply]=true;render();const i=document.getElementById('cin-'+d.reply);if(i)i.focus();return}
 if(d.pshare){const p=POSTS.find(v=>v.id===d.pshare);const txt=x(p.text).slice(0,80)+'… — maadoo.app';
   const ok=()=>toast(t('คัดลอกลิงก์โพสต์แล้ว','Post link copied'));try{navigator.clipboard.writeText(txt).then(ok,ok)}catch(err){ok()}return}
 if(d.qa){S.quiz.a.push(d.qa);S.quiz.i++;render();return}
 if(d.quizreset!==undefined){S.quiz={i:0,a:[]};render();return}
 if(d.salcheck!==undefined){const ri=+$('#salRole').value,v=+String($('#salV').value).replace(/[^\d]/g,'');S.sal={role:ri,v:String(v||'')};
   const role=allRoles()[ri];const rows=CO.flatMap(c=>c.salary.filter(s=>s[0][1]===role[1]));
   if(!v){$('#salOut').innerHTML=`<p class="muted">${t('ใส่ตัวเลขเงินเดือนก่อนนะ','Enter your salary first')}</p>`;return}
   const lo=Math.min(...rows.map(r=>r[1])),hi=Math.max(...rows.map(r=>r[3])),med=rows.reduce((a,r)=>a+r[2],0)/rows.length;
   const pct=Math.max(1,Math.min(99,Math.round((v-lo)/(hi-lo)*100)));
   $('#salOut').innerHTML=`<div class="share" style="margin-top:4px">${brand()}<small>${esc(x(role))}</small><div class="big">${pct}%</div>
   <div style="font-family:var(--display);font-size:18px">${t(`เงินเดือนฉันสูงกว่าคนตำแหน่งเดียวกัน ${pct}%`,`I earn more than ${pct}% of people in my role`)}</div><small>${t('มัธยฐานตลาด','Market median')} ${fmt(Math.round(med))} ${t('บาท','THB')} · ${v>=med?t('เกินค่ากลางแล้ว 🎉','Above the median 🎉'):t('ยังต่อรองได้อีก 💪','Room to negotiate 💪')}</small></div><p class="muted" style="margin-top:8px">${t('แคปการ์ดนี้ไปแชร์ได้เลย','Screenshot this card to share')}</p>`;return}
});
document.addEventListener('submit',e=>{e.preventDefault();
 if(e.target.id==='searchForm'){S.q=$('#q').value;render();return}
 if(e.target.id==='loginForm'){const em=$('#lemail').value.trim(),nm=($('#lname')?$('#lname').value.trim():'')||em.split('@')[0];
  if(SB){keepAuth();const m=S.modal;const em2=(m.email||'').trim(),pw=m.pw||'';
   if(!EMAIL_RE.test(em2)){m.err=ERR_EMAIL;renderModal();return}
   if(pw.length<6){m.err=ERR_PW;renderModal();return}
   if(m.mode==='up'){const nm2=(m.name||'').trim()||em2.split('@')[0];
    authRun(()=>SB.auth.signUp({email:em2,password:pw,options:{data:{display_name:nm2}}}),'signup').then(r=>{if(!r||S.modal!==m)return;const d2=r.data||{};
     if(d2.user&&Array.isArray(d2.user.identities)&&!d2.user.identities.length){m.err=authErr({code:'user_already_exists'});renderModal();return}
     if(!d2.session){m.sent=em2;m.sentKind='confirm';renderModal()}})}
   else authRun(()=>SB.auth.signInWithPassword({email:em2,password:pw}),'signin');
   return}
  const verified=!isFreeMail(em);S.user={name:nm,email:em,verified,points:20,plus:false};S.modal=null;
  const fn=S.after;S.after=null;render();toast(t(`สวัสดี ${nm}! รับ 20 แต้มต้อนรับ`,`Hi ${nm}! +20 welcome points`));if(fn)fn();return}
 if(e.target.id==='ptForm'){syncPtForm();const f=S.ptForm;if(!f.title.trim()||!f.when.trim()||!+f.pay||!f.ok)return;
  needLogin(()=>{const u={h:['฿/ชม.','THB/h'],d:['฿/วัน','THB/day'],p:['฿/ชิ้น','THB/piece']}[f.unit];const id='m'+Date.now();
   const post={id,shop:'mine',title:[f.title,f.title],kind:f.kind,day:f.kind==='online'||f.kind==='piece'?'online':f.day,when:[f.when,f.when],pay:[`${f.pay} ${u[0]}`,`${f.pay} ${u[1]}`],dist:f.kind==='onsite'?1.0:null,need:Math.max(1,+f.need||1),filled:0,close:f.boost!=='none'?['เพิ่งโพสต์','Just posted']:null,boost:f.boost,req:[f.req||'—',f.req||'—'],how:f.how,desc:[f.req||'',f.req||''],mine:true,appl:[],newShop:true};
   SHOPS.mine={name:[S.user.name,S.user.name],mk:[S.user.name.slice(0,1).toUpperCase(),S.user.name.slice(0,1).toUpperCase()],hue:'#FFE7C7'};
   PT.unshift(post);S.ptForm={title:'',kind:'onsite',day:'today',when:'',pay:'',unit:'h',need:'1',how:'cash',req:'',boost:'none',ok:false};S.modal=null;S.view='jobs';S.jobTab='pt';S.ptDay='all';render();window.scrollTo({top:0});toast(t('โพสต์งานแล้ว! รอผู้สมัครสักครู่','Job posted! Applicants will arrive shortly'));
   FAKE_APPL.forEach((a,i)=>setTimeout(()=>{post.appl.push([...a]);pushNotif('🙋',`มีผู้สมัครใหม่: ${a[0]}`,`New applicant: ${a[0]}`,['jobs']);if(S.modal&&S.modal.type==='ptappl')renderModal();else if(S.view==='jobs')render()},2500+i*3000))});return}
 if(e.target.id==='linkForm'){if(SB)linkAccount();return}
 if(e.target.id==='refForm'){needMember(()=>applyRef($('#refIn').value));return}
 if(e.target.id==='qmsgForm'){const m=S.modal,q=m&&S.prem.qs.find(v=>v.id===m.id),inp=$('#qmsg'),v=(inp.value||'').trim().slice(0,500);if(!q||!v||q.status==='closed')return;
  q.msgs.push({f:'me',t:v,at:Date.now()});q.status='waiting';q.lastAt=Date.now();q.skipped=false;qSave(q);scheduleReply(q);renderModal();return}
 if(e.target.id==='otpEmailForm'){if(SB)otpSend();return}
 if(e.target.id==='otpCodeForm'){if(SB)otpVerify();return}
 if(e.target.id==='empForm'){const m=S.modal,co=($('#ecn').value||'').trim().slice(0,120);if(!m||!co)return;const tier=m.tier;
  if(tier==='Pro'){openPay({what:'emp',tier,company:co,amount:proPrice()});return}
  needMember(async()=>{try{await saveEmp(co,tier)}catch(err){toast(premErr(err));return}closeModal();render();
   toast(tier==='Starter'?t('เปิดใช้ Starter แล้ว! ยืนยันเจ้าของหน้าบริษัทได้เลย','Starter is on! You can claim your company page now'):t('ได้รับข้อมูลแล้ว ทีมจะติดต่อกลับเร็ว ๆ นี้','Got it. Our team will be in touch soon'))});return}
 if(e.target.id==='rvForm'){syncForm();const f=S.form;if(!(f.co&&f.r&&f.mood!==null&&f.ot!==null&&f.rec!==null))return;
  if(SB){needLogin(()=>reviewOrLink(f));return}
  const c=getCo(f.co);const def=MOOD_T[f.mood];
  const same=v=>v?[v,v]:null;
  c.reviews.unshift({role:same(f.role)||['ไม่ระบุตำแหน่ง','Role not given'],type:f.type,mood:f.mood,r:f.r,t:same(f.title)||def,p:same(f.pro)||['—','—'],c:same(f.con)||['—','—'],d:'Q3 2026',v:false,h:0});
  S.unlocked=true;S.done={co:f.co,r:f.r,mood:f.mood};S.myReviews.unshift({co:f.co,r:f.r,at:Date.now(),sal:!!String(f.sal||'').replace(/[^\d]/g,'')});claimReferral();addPoints(50);S.form=blankForm();render();window.scrollTo({top:0});return}
 if(e.target.id==='askForm'){const q=$('#askq').value.trim();if(!q){toast(t('พิมพ์คำถามก่อนนะ','Type a question first'));return}
  const an=$('#anon').checked;S.bd.anon=an;const nm=!an&&S.user?[S.user.name,S.user.name]:['คุณ (ไม่ระบุตัวตน)','You (anonymous)'];
  POSTS.unshift({id:'u'+Date.now(),kind:S.bd.kind,tag:S.askTag,by:nm,ava:'🙂',bg:'#CFEAFF',ver:!an&&S.user&&S.user.verified,ts:0,likes:0,text:[q,q],comments:[]});
  S.asked++;addPoints(10);S.askText='';S.bd.sort='new';S.bd.tag=-1;render();toast(t('โพสต์แล้ว · จะแจ้งเตือนเมื่อมีคนตอบ','Posted · we’ll notify you when someone answers'));return}
 if(e.target.classList.contains('cform')){const pid=e.target.dataset.pid;const inp=document.getElementById('cin-'+pid);const v=inp.value.trim();if(!v)return;
  const p=POSTS.find(z=>z.id===pid);const nm=S.user?[S.user.name,S.user.name]:['ผู้ใช้ไม่ระบุตัวตน','Anonymous'];
  p.comments.push({by:nm,ava:S.user?esc(S.user.name.slice(0,1).toUpperCase()):'🙂',bg:'#CFEAFF',ver:!!(S.user&&S.user.verified),ts:0,likes:0,text:[v,v]});
  S.bd.open[pid]=true;addPoints(5);if(S.user)S.prem.comments.push(Date.now());render();toast(t('ส่งความคิดเห็นแล้ว +5 แต้ม','Comment posted +5 pts'));}
});
function syncPtForm(){const g=id=>document.getElementById(id);if(!g('pf-title'))return;const f=S.ptForm;f.title=g('pf-title').value;f.kind=g('pf-kind').value;f.day=g('pf-day').value;f.when=g('pf-when').value;f.pay=g('pf-pay').value;f.unit=g('pf-unit').value;f.need=g('pf-need').value;f.how=g('pf-how').value;f.req=g('pf-req').value;f.ok=g('pf-ok').checked}
document.addEventListener('input',e=>{const fk=e.target.id==='fx-amb'?'amb':e.target.id==='fx-tap'?'tap':null;if(fk){fxSetLevel(fk,e.target.value);const v=fxLevel(fk),o=document.getElementById('fxv-'+fk);if(o)o.textContent=fxPct(v);e.target.style.setProperty('--p',v+'%');e.target.setAttribute('aria-valuetext',fxPct(v));if(fk==='tap'&&v){const r=e.target.getBoundingClientRect();FX.tap(r.left+r.width*v/100,r.top+r.height/2)}return}
 if(e.target.id==='mcomment'){if(S.modal)S.modal.comment=e.target.value;const c=$('#mcount');if(c)c.textContent=e.target.value.length+'/300';return}if(e.target.id==='sndVol'){const v=+e.target.value;SND.setVol(v/100);e.target.style.setProperty('--p',v+'%');e.target.setAttribute('aria-valuetext',v+'%');return}if(e.target.id==='ocode'){const v=e.target.value.replace(/\D/g,'').slice(0,8);if(v!==e.target.value)e.target.value=v;if(S.modal)S.modal.code=v;return}if(e.target.id&&e.target.id.startsWith('pf-')){syncPtForm();const w=document.getElementById('pf-wage');if(w)w.innerHTML=wageMsg(S.ptForm)}});
document.addEventListener('change',e=>{if(e.target.id&&e.target.id.startsWith('pf-')){syncPtForm();const w=document.getElementById('pf-wage');if(w)w.innerHTML=wageMsg(S.ptForm)}const id=e.target.id;if(id==='fco'){syncForm();render()}
 if(id==='jInd'){S.jobF.ind=e.target.value;render()}if(id==='jMin'){S.jobF.min=+e.target.value;render()}if(id==='onlyJobs'){S.coOnlyJobs=e.target.checked;render()}});
document.addEventListener('keydown',e=>{
 if(S.view==='explore'){const inMenu=e.target.closest&&e.target.closest('#indMenu'),onBtn=e.target.id==='indBtn';
  if(S.indOpen&&e.key==='Escape'){e.preventDefault();indClose(true);return}
  if(onBtn&&!S.indOpen&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();indOpen();return}
  if(S.indOpen&&(inMenu||onBtn)){const os=[...document.querySelectorAll('#indMenu .dd-opt')];const cur=os.indexOf(document.activeElement);
   const go=i=>{e.preventDefault();const o=os[Math.max(0,Math.min(os.length-1,i))];if(o)indFocus(+o.dataset.indpick)};
   if(e.key==='ArrowDown')return go(cur<0?0:cur+1);if(e.key==='ArrowUp')return go(cur<0?os.length-1:cur-1);
   if(e.key==='Home')return go(0);if(e.key==='End')return go(os.length-1);
   if(e.key==='Tab'){indClose(false);return}}}if(!S.modal&&S.view==='ask'&&S.askTab==='swipe'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){if(e.key==='ArrowRight')swipeGo('right');if(e.key==='ArrowLeft')swipeGo('left')}if(e.key==='Escape'){if(S.modal)closeModal();if(S.notifOpen){S.notifOpen=false;renderBell()}}});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(!S.theme)applyPrefs()})}catch(e){}
/* ---------- start ---------- */
render();
setInterval(()=>{if(qTick())rerender()},60000);
setTimeout(loadPromoStats,SB?0:300);
if(!welcomed())openOnboard();
if(window.supabase)initSB();else{const sbjs=document.getElementById('sbjs');if(sbjs)sbjs.addEventListener('load',initSB)}
