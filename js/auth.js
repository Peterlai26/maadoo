/* Maadoo Job · js/auth.js — Supabase login (password · email code · guest) + reviews. Classic script sharing one global scope; see CLAUDE.md for load order. */
/* ---------- Supabase: real login (password · email code · guest) + reviews · falls back to the demo when unavailable ---------- */
// Publishable key only. Never put a secret / service_role key here. Tables & rules: supabase/setup.sql
const SB_URL='https://tzltoimzpzlpzjljmxla.supabase.co',SB_KEY='sb_publishable_jv0Orjkw0FwOQBnRc13Idw_8jgjcqoS';
let SB=null;
const MOOD_T=[['ที่นี่น่าอยู่','A great place to stay'],['ที่นี่พอไหว','It’s OK here'],['ที่นี่ต้องคิดดี ๆ','Think twice']];
const isFreeMail=em=>/@(gmail|googlemail|hotmail|yahoo|ymail|outlook|live|msn|icloud|me|aol|proton|protonmail)\./i.test(em);
const quarter=ts=>{const d=new Date(ts);return `Q${Math.floor(d.getMonth()/3)+1} ${d.getFullYear()}`};
const revs=c=>(S.dbRev[c.id]||[]).concat(c.reviews);
function rerender(){if(S.modal&&S.modal.type==='write')syncForm();if(S.view==='ask'){const a=$('#askq');if(a)S.askText=a.value}render()}
function initSB(){
 if(SB||!window.supabase||!window.supabase.createClient)return;
 try{SB=window.supabase.createClient(SB_URL,SB_KEY)}catch(e){SB=null;return}
 if(S.user&&!S.user.id){S.user=null;S.myReviews=[]}
 SB.auth.onAuthStateChange((ev,session)=>{setTimeout(()=>sbUser(ev,session),0)});
 loadApproved();loadRealMentors();loadMentorReviews();loadPromoStats();rerender();
}
function mkUser(u,prev){
 const anon=!!u.is_anonymous,em=u.email||'',dn=u.user_metadata&&u.user_metadata.display_name;
 const o={id:u.id,anon,email:em,verified:!anon&&!!em&&!isFreeMail(em),points:prev?prev.points:20,plus:prev?prev.plus:false};
 Object.defineProperty(o,'name',{enumerable:true,get:()=>anon?t('ผู้ใช้ชั่วคราว','Guest'):(dn||em.split('@')[0]||t('ผู้ใช้','User'))});
 return o;
}
async function sbUser(ev,session){
 const u=session&&session.user;
 if(!u){if(S.user&&S.user.id){S.user=null;S.myReviews=[];forgetMine();resetPrem();rerender()}return}
 const same=S.user&&S.user.id===u.id;
 if(same&&S.user.anon===!!u.is_anonymous&&S.user.email===(u.email||''))return;
 const wasGuest=same&&S.user.anon;S.user=mkUser(u,same?S.user:null);
 /* a guest who just added an email is a member now: load their premium data and apply a pending friend's code */
 if(same){if(wasGuest&&!S.user.anon){resetPrem();loadPrem().then(afterLoginPromo)}rerender();return}
 await loadMine();loadApproved();loadMentorReviews();resetPrem();loadPrem().then(afterLoginPromo).then(obAfterLogin);loadChat();
 if(ev==='SIGNED_IN'){if(S.modal&&(S.modal.type==='login'||S.modal.type==='otp'))S.modal=null;const fn=S.after;S.after=null;rerender();
  toast(S.user.anon?t('เข้าใช้แบบชั่วคราวแล้ว · ถ้าออกจากระบบ บัญชีนี้จะหายไป','You’re in as a guest · this account is gone once you log out'):t(`สวัสดี ${S.user.name}! รับ 20 แต้มต้อนรับ`,`Hi ${S.user.name}! +20 welcome points`));if(fn)fn()}
 else rerender();
}
/* auth modal helpers: password · email code · guest */
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERR_EMAIL=['อีเมลไม่ถูกต้อง ลองเช็กอีกครั้ง','That email address isn’t valid. Please check it.'];
const ERR_PW=['รหัสผ่านสั้นไป ต้องมีอย่างน้อย 6 ตัว','Password is too short. Use at least 6 characters.'];
function authErr(e,ctx){
 const c=String((e&&e.code)||''),m=String((e&&e.message)||'').toLowerCase(),s=e&&e.status;
 if(c==='over_email_send_rate_limit'||m.includes('email rate limit')||(s===429&&ctx==='email'))return ['ระบบส่งอีเมลเต็มชั่วคราว ลองใช้รหัสผ่านแทน หรือรอสักครู่','Our email sender is full for now. Try a password instead, or wait a moment.'];
 if(s===429||c.startsWith('over_'))return ['ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่','Too many tries. Wait a moment and try again.'];
 if(c==='invalid_credentials'||m.includes('invalid login credentials'))return ['อีเมลหรือรหัสผ่านไม่ถูกต้อง','Wrong email or password.'];
 if(c==='user_already_exists'||c==='email_exists'||m.includes('already registered')||m.includes('already been registered'))
  return ctx==='link'?['อีเมลนี้มีบัญชีอยู่แล้ว ออกจากระบบแล้วเข้าสู่ระบบด้วยอีเมลนี้แทน','This email already has an account. Log out, then log in with that email.']:['อีเมลนี้สมัครแล้ว ลองกด “เข้าสู่ระบบ” แทน','This email is already registered. Try “Log in” instead.'];
 if(c==='weak_password'||m.includes('password should'))return ['รหัสผ่านสั้นหรือเดาง่ายไป ใช้อย่างน้อย 6 ตัว','Password is too short or too easy to guess. Use at least 6 characters.'];
 if(c==='email_address_invalid'||(m.includes('email')&&m.includes('invalid')))return ERR_EMAIL;
 if(c==='email_not_confirmed')return ['ยังไม่ได้ยืนยันอีเมล เช็กกล่องจดหมายของคุณ','Your email isn’t confirmed yet. Check your inbox.'];
 if(c==='anonymous_provider_disabled')return ['ตอนนี้ยังลองใช้แบบไม่สมัครไม่ได้ ลองสมัครด้วยอีเมลแทน','Guest mode is off right now. Sign up with email instead.'];
 if(c==='signup_disabled'||c==='email_provider_disabled')return ['ตอนนี้ปิดรับสมัครชั่วคราว','Sign-ups are turned off right now.'];
 if(!s||(e&&e.name==='AuthRetryableFetchError'))return ['เชื่อมต่อไม่ได้ เช็กอินเทอร์เน็ตแล้วลองใหม่','Can’t connect. Check your internet and try again.'];
 return ['เกิดข้อผิดพลาด ลองใหม่อีกครั้ง','Something went wrong. Please try again.'];
}
function keepAuth(){const m=S.modal;if(!m)return;const map={lname:'name',lemail:'email',lpw:'pw',kemail:'email',kpw:'pw'};
 for(const id in map){const el=document.getElementById(id);if(el)m[map[id]]=el.value}}
async function authRun(fn,ctx){
 const m=S.modal;if(!m||m.busy)return null;keepAuth();m.err=null;m.busy=true;renderModal();
 let r;try{r=await fn()}catch(e){r={error:e}}
 m.busy=false;if(r&&r.error){m.err=authErr(r.error,ctx);if(S.modal===m)renderModal();return null}
 if(S.modal===m)renderModal();return r||{};
}
const pwField=(id,ac,val)=>`<div class="pw"><input class="field" id="${id}" type="password" autocomplete="${ac}" placeholder="${t('รหัสผ่าน','Password')}" aria-describedby="${id}-hint" value="${esc(val||'')}"><button type="button" class="pw-t" data-pwtoggle="${id}" aria-controls="${id}" aria-pressed="false">${t('แสดง','Show')}</button></div><small class="muted" id="${id}-hint" style="margin-top:-6px">${t('อย่างน้อย 6 ตัว','At least 6 characters')}</small>`;
const authFormErr=m=>m.err?`<p class="form-err" role="alert">${esc(x(m.err))}</p>`:'';
function sbLoginModal(m,head){
 const H=head(t('เข้าสู่ระบบมาดูจ็อบ','Log in to Maadoo Job'),'');
 if(m.sent)return H+`<p>${m.sentKind==='confirm'?t(`ส่งอีเมลยืนยันไปที่ <b>${esc(m.sent)}</b> แล้ว กดยืนยันในอีเมล แล้วกลับมาเข้าสู่ระบบ`,`We sent a confirmation email to <b>${esc(m.sent)}</b>. Confirm it, then come back and log in.`):t(`ส่งลิงก์เข้าสู่ระบบไปที่ <b>${esc(m.sent)}</b> แล้ว กดลิงก์ในอีเมลเพื่อเข้าสู่ระบบ ไม่ต้องใช้รหัสผ่าน`,`We sent a login link to <b>${esc(m.sent)}</b>. Tap the link in the email to log in. No password needed.`)}</p>
  <p class="muted">${t('ไม่เจออีเมล? ลองดูในโฟลเดอร์สแปมหรือโปรโมชัน','Can’t find it? Check your spam or promotions folder.')}</p>
  <div class="row"><button class="btn ghost" data-resend>${t('ใช้อีเมลอื่น','Use another email')}</button><button class="btn y" data-close>${t('ตกลง','OK')}</button></div>`;
 const up=m.mode==='up',dis=m.busy?'disabled':'';
 return H+`<div class="segs" role="tablist" style="margin-top:0;justify-self:start">${[['in',t('เข้าสู่ระบบ','Log in')],['up',t('สมัครใหม่','Sign up')]].map(([k,n])=>`<button type="button" role="tab" aria-selected="${(up?'up':'in')===k}" class="${(up?'up':'in')===k?'on':''}" data-lmode="${k}" ${dis}>${n}</button>`).join('')}</div>
  <form id="loginForm" class="grid" novalidate>
   ${up?`<input class="field" id="lname" autocomplete="nickname" maxlength="40" placeholder="${t('ชื่อที่ใช้แสดง','Display name')}" value="${esc(m.name||'')}">`:''}
   <input class="field" id="lemail" type="email" autocomplete="email" inputmode="email" placeholder="${t('อีเมล','Email')}" value="${esc(m.email||'')}">
   ${pwField('lpw',up?'new-password':'current-password',m.pw)}
   ${authFormErr(m)}
   <button class="btn y" ${dis}>${m.busy?t('กำลังดำเนินการ…','Working…'):up?t('สมัครสมาชิก','Create account'):t('เข้าสู่ระบบ','Log in')}</button></form>
  <div class="or">${t('หรือ','or')}</div>
  <div class="auth-alt"><button type="button" class="btn ghost" data-magic ${dis}>✉️ ${t('รับโค้ดทางอีเมล (ไม่ต้องใช้รหัสผ่าน)','Get a code by email (no password)')}</button>
   <button type="button" class="btn ghost" data-anon ${dis}>👀 ${t('ลองใช้แบบไม่สมัคร','Try it without signing up')}</button></div>
  <p class="demo-note">${t('แบบไม่สมัคร: ดูเว็บ ปัดรุ่นพี่ และสมัครงานได้ แต่ต้องผูกอีเมลก่อนเขียนรีวิว','As a guest you can browse, swipe mentors and apply to jobs; add an email before writing reviews.')}</p>`;
}
function linkModal(m,head){
 const H=head(t('เก็บบัญชีไว้ด้วยอีเมล','Keep your account with email'),m.why==='review'?t('บัญชีชั่วคราวเขียนรีวิวไม่ได้ ผูกอีเมลก่อน แล้วรีวิวของคุณจะถูกส่งต่อทันที','Guest accounts can’t post reviews. Add an email and your review is sent right after.'):t('ตั้งอีเมลและรหัสผ่าน แล้วใช้บัญชีนี้ต่อได้ทุกเครื่อง','Add an email and password to keep this account on any device.'));
 if(m.sent)return H+`<p>${t(`ส่งอีเมลยืนยันไปที่ <b>${esc(m.sent)}</b> แล้ว กดยืนยันในอีเมล แล้วกลับมาตั้งรหัสผ่านอีกครั้ง`,`We sent a confirmation email to <b>${esc(m.sent)}</b>. Confirm it, then come back to set your password.`)}</p><button class="btn y" data-close>${t('ตกลง','OK')}</button>`;
 const dis=m.busy?'disabled':'';
 return H+`<form id="linkForm" class="grid" novalidate>
   <input class="field" id="kemail" type="email" autocomplete="email" inputmode="email" placeholder="${t('อีเมล','Email')}" value="${esc(m.email||'')}">
   ${pwField('kpw','new-password',m.pw)}
   ${authFormErr(m)}
   <button class="btn y" ${dis}>${m.busy?t('กำลังดำเนินการ…','Working…'):t('เก็บบัญชีไว้','Keep my account')}</button></form>`;
}
/* email code login (OTP): step 1 send code → step 2 verify code */
const OTP_WAIT=60,OTP_RE=/^\d{6,8}$/;let otpTimer=null;
function otpErr(e,ctx){
 const c=String((e&&e.code)||''),m=String((e&&e.message)||'').toLowerCase(),st=e&&e.status;
 if(st===429||c.startsWith('over_')||m.includes('rate limit'))return ctx==='send'?['ส่งโค้ดบ่อยเกินไป รอสักครู่แล้วลองใหม่นะ','You’ve asked for codes too often. Wait a moment and try again.']:['ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่นะ','Too many tries. Wait a moment and try again.'];
 if(ctx==='verify'&&(c==='otp_expired'||c==='otp_disabled'||m.includes('expired')||m.includes('invalid')||st===403||st===401))return ['โค้ดไม่ถูกต้องหรือหมดอายุแล้ว เช็กตัวเลขอีกครั้ง หรือกด “ส่งโค้ดใหม่”','That code is wrong or has expired. Check the numbers, or tap “Send a new code”.'];
 return authErr(e,'email');
}
function otpModal(m,head){
 const H=head(t('รับโค้ดทางอีเมล','Log in with an email code'),t('ไม่ต้องจำรหัสผ่าน ใส่โค้ดตัวเลขจากอีเมลก็เข้าได้เลย','No password to remember. Just enter the number code we email you.'));
 const dis=m.busy?'disabled':'';
 if(m.step!=='code')return H+`<form id="otpEmailForm" class="grid" novalidate>
   <label class="grid" style="gap:6px"><b>${t('อีเมลของคุณ','Your email')}</b><input class="field" id="oemail" type="email" autocomplete="email" inputmode="email" placeholder="${t('อีเมล','Email')}" value="${esc(m.email||'')}"></label>
   ${authFormErr(m)}
   <button class="btn y" ${dis}>${m.busy?t('กำลังส่ง…','Sending…'):t('ส่งโค้ด','Send code')}</button></form>
  <button type="button" class="link" data-otpback style="justify-self:center">← ${t('กลับไปใช้รหัสผ่าน','Back to password login')}</button>`;
 const left=otpLeft();
 return H+`<p style="margin:0">${t(`ส่งโค้ดไปที่ <b>${esc(m.email)}</b> แล้ว ใส่โค้ดตัวเลขจากอีเมลด้านล่าง`,`We sent a code to <b>${esc(m.email)}</b>. Enter the number code from the email below.`)}</p>
  <form id="otpCodeForm" class="grid" novalidate>
   <label class="grid" style="gap:6px"><b>${t('โค้ดจากอีเมล','Code from the email')}</b><input class="field otp-code" id="ocode" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="8" placeholder="••••••" aria-describedby="ocode-hint" value="${esc(m.code||'')}"></label>
   <small class="muted" id="ocode-hint" style="margin-top:-6px">${t('โค้ดเป็นตัวเลข 6–8 หลัก · ไม่เจออีเมล? ลองดูในสแปมหรือโปรโมชัน','The code is 6–8 digits · Can’t find the email? Check spam or promotions.')}</small>
   ${authFormErr(m)}
   <button class="btn y" ${dis}>${m.busy?t('กำลังตรวจ…','Checking…'):t('ยืนยัน','Confirm')}</button></form>
  <div class="otp-links"><button type="button" class="link" id="otpResend" data-otpresend ${left>0||m.busy?'disabled':''}>${otpResendTxt(left)}</button><button type="button" class="link" data-otpchange ${dis}>${t('เปลี่ยนอีเมล','Change email')}</button></div>`;
}
const otpLeft=()=>{const m=S.modal;return m&&m.until?Math.max(0,Math.ceil((m.until-Date.now())/1000)):0};
const otpResendTxt=n=>n>0?t(`ส่งโค้ดใหม่ได้ใน ${n} วิ`,`Send a new code in ${n}s`):t('ส่งโค้ดใหม่','Send a new code');
function otpTick(){
 clearInterval(otpTimer);otpTimer=null;const m=S.modal;if(!m||m.type!=='otp'||m.step!=='code'||otpLeft()<=0)return;
 otpTimer=setInterval(()=>{const b=document.getElementById('otpResend'),n=otpLeft();
  if(!S.modal||S.modal.type!=='otp'||S.modal.step!=='code'||!b){clearInterval(otpTimer);otpTimer=null;return}
  b.textContent=otpResendTxt(n);if(n<=0){if(!S.modal.busy)b.disabled=false;clearInterval(otpTimer);otpTimer=null}},1000);
}
function keepOtp(){const m=S.modal;if(!m)return;const e=document.getElementById('oemail'),c=document.getElementById('ocode');if(e)m.email=e.value;if(c)m.code=c.value}
async function otpRun(fn,ctx){
 const m=S.modal;if(!m||m.busy)return null;keepOtp();m.err=null;m.busy=true;renderModal();
 let r;try{r=await fn()}catch(e){r={error:e}}
 m.busy=false;if(r&&r.error){m.err=otpErr(r.error,ctx);if(S.modal===m){renderModal();otpTick()}return null}
 if(S.modal===m){renderModal();otpTick()}return r||{};
}
function otpSend(){
 keepOtp();const m=S.modal;if(!m||m.type!=='otp')return;const em=(m.email||'').trim();
 if(!EMAIL_RE.test(em)){m.err=ERR_EMAIL;renderModal();return}
 otpRun(()=>SB.auth.signInWithOtp({email:em,options:{data:{display_name:em.split('@')[0]}}}),'send')
  .then(r=>{if(!r||S.modal!==m)return;m.email=em;m.step='code';m.code='';m.until=Date.now()+OTP_WAIT*1000;renderModal();otpTick()});
}
function otpVerify(){
 keepOtp();const m=S.modal;if(!m||m.type!=='otp')return;const code=(m.code||'').replace(/\D/g,'');
 if(!OTP_RE.test(code)){m.err=['ใส่โค้ดตัวเลข 6–8 หลักจากอีเมล','Enter the 6–8 digit code from the email.'];renderModal();return}
 otpRun(()=>SB.auth.verifyOtp({email:m.email,token:code,type:'email'}),'verify');
 // success: onAuthStateChange → SIGNED_IN closes this popup and says hi
}
async function linkAccount(){
 keepAuth();const m=S.modal;const em=(m.email||'').trim(),pw=m.pw||'';
 if(!EMAIL_RE.test(em)){m.err=ERR_EMAIL;renderModal();return}
 if(pw.length<6){m.err=ERR_PW;renderModal();return}
 const r=await authRun(()=>SB.auth.updateUser({email:em,data:{display_name:em.split('@')[0]}}),'link');if(!r)return;
 const u=r.data&&r.data.user;
 if(!u||(u.email||'').toLowerCase()!==em.toLowerCase()){if(S.modal===m){m.sent=em;renderModal()}return}
 const r2=await authRun(()=>SB.auth.updateUser({password:pw}),'link');if(!r2)return;
 // new token so the database sees the account is no longer a guest
 try{await SB.auth.refreshSession()}catch(e){}
 const nu=(r2.data&&r2.data.user)||u;S.user=mkUser(Object.assign({},nu,{is_anonymous:false}),S.user);
 if(S.modal===m)S.modal=null;const fn=S.after;S.after=null;rerender();
 toast(t('เก็บบัญชีแล้ว! ครั้งหน้าเข้าสู่ระบบด้วยอีเมลนี้ได้เลย','Account saved! Log in with this email next time.'));if(fn)fn();
}
function reviewOrLink(f){if(S.user&&S.user.anon){S.after=()=>sendReview(f);openModal({type:'link',why:'review'});return}sendReview(f)}
async function loadMine(){
 const uid=S.user&&S.user.id;if(!uid)return;
 try{const {data,error}=await SB.from('reviews').select('id,user_id,company_id,rating,salary,status,created_at,role,type,mood,title,pros,cons').eq('user_id',uid).order('created_at',{ascending:false});if(error)throw error;
  S.myReviews=data.filter(r=>r.user_id===uid&&getCo(r.company_id)).map(r=>({id:r.id,uid:r.user_id,co:r.company_id,r:r.rating,status:r.status,at:Date.parse(r.created_at)||0,sal:r.salary!=null,mood:r.mood,type:r.type,role:r.role,title:r.title,pro:r.pros,con:r.cons}))}catch(e){}
}
async function loadApproved(){
 if(!SB||S.dbState==='loading')return;S.dbState='loading';S.dbAt=Date.now();
 try{const {data,error}=await SB.from('approved_reviews').select('id,company_id,role,type,rating,mood,title,pros,cons,created_at').order('created_at',{ascending:false}).limit(500);if(error)throw error;
  const m={},same=v=>v?[v,v]:null;
  (data||[]).forEach(r=>{const co=String(r.company_id||'').trim();if(!getCo(co))return;const mood=[0,1,2].includes(r.mood)?r.mood:1;
   (m[co]=m[co]||[]).push({id:r.id,real:true,role:same(r.role)||['ไม่ระบุตำแหน่ง','Role not given'],type:r.type==='intern'?'intern':'emp',mood,r:Math.max(1,Math.min(5,r.rating|0)),t:same(r.title)||MOOD_T[mood],p:same(r.pros)||['—','—'],c:same(r.cons)||['—','—'],d:quarter(r.created_at),v:false,h:0})});
  S.dbRev=m;S.dbState='ok';
 }catch(e){S.dbState='error';console.warn('[Maadoo] could not load approved reviews from Supabase (approved_reviews view):',e&&(e.message||e),e)}
 if(S.view==='company'||S.view==='reviews')rerender();
}
async function sendReview(f){
 if(S.sending)return;S.sending=true;
 const s=(v,n)=>(v||'').trim().slice(0,n)||null;const sal=parseInt(String(f.sal).replace(/[^\d]/g,''),10);
 const row={company_id:f.co,role:s(f.role,80),type:f.type,rating:f.r,mood:f.mood,ot:f.ot,recommend:f.rec,title:s(f.title,120),pros:s(f.pro,1000),cons:s(f.con,1000),salary:sal>=0&&sal<=1000000?sal:null};
 let ok=false,id=null;try{const {data,error}=await SB.from('reviews').insert(row).select('id');ok=!error;id=data&&data[0]&&data[0].id||null}catch(e){}
 S.sending=false;
 if(!ok){toast(t('ส่งรีวิวไม่สำเร็จ ลองใหม่อีกครั้ง','Couldn’t submit your review. Please try again.'));return}
 S.unlocked=true;S.myReviews.unshift({id,uid:S.user&&S.user.id,co:f.co,r:f.r,at:Date.now(),sal:!!row.salary,status:'pending',mood:f.mood,type:f.type,role:row.role,title:row.title,pro:row.pros,con:row.cons});claimReferral();addPoints(50);reviewSent();
}

/* delete your own review · only rows whose user_id is the logged-in user (also enforced by RLS in supabase/setup.sql) */
const canDelete=id=>!!(SB&&id&&S.user&&S.user.id&&!S.user.anon&&S.myReviews.some(r=>r.id===id&&r.uid===S.user.id));
function delRevModal(m,head){const r=S.myReviews.find(v=>v.id===m.id);const c=r&&getCo(r.co);const dis=m.busy?'disabled':'';
 return head(t('ลบรีวิวนี้?','Delete this review?'),c?`${x(c.name)} · ${stars(r.r)}`:'')+`<p style="margin:0">${t('รีวิวจะถูกลบถาวร กู้คืนไม่ได้ และแต้มที่ได้จากรีวิวนี้จะไม่ถูกหักคืน','The review is deleted for good and can’t be restored. You keep the points you earned for it.')}</p>
  ${authFormErr(m)}
  <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close ${dis}>${t('ยกเลิก','Cancel')}</button><button class="btn danger" data-delrevok ${dis}>${m.busy?t('กำลังลบ…','Deleting…'):t('ลบรีวิว','Delete review')}</button></div>`}
async function deleteReview(){
 const m=S.modal;if(!m||m.type!=='delrev'||m.busy)return;const id=m.id;
 if(!canDelete(id)){m.err=['ลบได้เฉพาะรีวิวของคุณเองเท่านั้น','You can only delete your own reviews.'];renderModal();return}
 m.err=null;m.busy=true;renderModal();
 let ok=false,err=null;try{const {data,error}=await SB.from('reviews').delete().eq('id',id).eq('user_id',S.user.id).select('id');if(error)err=error;else ok=Array.isArray(data)&&data.length>0}catch(e){err=e}
 m.busy=false;
 if(!ok){m.err=err&&(err.status===429)?['ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่','Too many tries. Wait a moment and try again.']:err&&!err.status?['เชื่อมต่อไม่ได้ เช็กอินเทอร์เน็ตแล้วลองใหม่','Can’t connect. Check your internet and try again.']:['ลบรีวิวไม่สำเร็จ รีวิวนี้อาจถูกลบไปแล้ว ลองรีเฟรชหน้า','Couldn’t delete the review. It may already be gone. Try refreshing.'];if(S.modal===m)renderModal();return}
 S.myReviews=S.myReviews.filter(r=>r.id!==id);
 for(const k in S.dbRev)S.dbRev[k]=S.dbRev[k].filter(r=>r.id!==id);
 if(S.modal===m)S.modal=null;rerender();toast(t('ลบรีวิวแล้ว','Review deleted'));
}

