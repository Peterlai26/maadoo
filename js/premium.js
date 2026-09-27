/* Maadoo Job · js/premium.js — Maadoo Plus, coins, simulated payment, ask a mentor, promotions, Me + employer pages. Classic script sharing one global scope; see CLAUDE.md for load order. */
/* ---------- premium: Maadoo Plus · Maadoo coins · Ask a mentor (DEMO: payments are simulated, no money is taken) ---------- */
const DAY=864e5;
const PLANS={m:{price:99,days:30,n:['รายเดือน','Monthly'],per:['/เดือน','/month']},y:{price:990,days:365,n:['รายปี','Yearly'],per:['/ปี','/year'],best:true},t:{price:249,days:90,n:['เทอมฝึกงาน','Internship term'],per:['/3 เดือน','/3 months']}};
const PACKS=[[100,99],[300,279],[600,529]];
const Q_MAX=5,Q_OPEN=2,MISSION_CAP=300;
const MISSIONS=[
 {k:'review',ic:'✍️',kind:'review',coins:30,need:1,n:['เขียนรีวิวบริษัท','Write a company review'],how:['ได้เหรียญหลังรีวิวผ่านการตรวจ','Coins arrive after the review is approved'],go:'write'},
 {k:'salary',ic:'💰',kind:'review',coins:20,need:1,n:['เพิ่มเงินเดือน','Add your salary'],how:['ใส่เงินเดือนในรีวิวบริษัท (ไม่ระบุตัวตน)','Add your salary in a company review (anonymous)'],go:'write'},
 {k:'interview',ic:'🎤',kind:'mission',coins:20,need:1,n:['รีวิวการสัมภาษณ์','Review an interview'],how:['แชร์คำถามสัมภาษณ์ในหน้าบริษัท แท็บ “สัมภาษณ์”','Share interview questions on a company’s “Interviews” tab'],go:'explore'},
 {k:'answers',ic:'💬',kind:'mission',coins:15,need:3,n:['ตอบคำถามรุ่นน้อง 3 ข้อ','Answer 3 questions from juniors'],how:['ตอบในบอร์ดพูดคุย หน้า “ปรึกษา”','Answer on the board in the “Ask” page'],go:'ask'},
 {k:'invite',ic:'🤝',kind:'mission',coins:50,need:1,n:['ชวนเพื่อน','Invite a friend'],how:['แชร์ลิงก์ชวนเพื่อนของคุณ','Share your invite link'],act:'invite'}];
const blankPrem=()=>({inviteCode:null,referredBy:null,rev:0,plusUntil:0,coins:0,freeClaimed:false,ledger:[],qs:[],interviews:[],comments:[],invites:[],loaded:false});
S.prem=blankPrem();S.planSel='y';
const isPlus=()=>!!(S.user&&S.prem.plusUntil>Date.now());
const monthKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
function weekKey(d=new Date()){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return `${t.getUTCFullYear()}-W${String(Math.ceil(((t-y)/DAY+1)/7)).padStart(2,'0')}`}
const weekStart=()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()};
const monthStart=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1).getTime()};
const fmtDate=ts=>new Date(ts).toLocaleDateString(S.lang==='en'?'en-GB':'th-TH',{day:'numeric',month:'short',year:'numeric'});
const sbLive=()=>!!(SB&&S.user&&S.user.id&&!S.user.anon);
const pendingCoins=()=>S.prem.ledger.filter(l=>l.status==='pending').reduce((a,l)=>a+l.delta,0);
const missionEarned=()=>{const ms=monthStart();return S.prem.ledger.filter(l=>['mission','review'].includes(l.kind)&&l.at>=ms).reduce((a,l)=>a+l.delta,0)};
function missionProgress(k){const ws=weekStart(),P=S.prem;
 if(k==='review')return S.myReviews.filter(r=>(r.at||0)>=ws).length;
 if(k==='salary')return S.myReviews.filter(r=>(r.at||0)>=ws&&r.sal).length;
 if(k==='interview')return P.interviews.filter(v=>v.at>=ws).length;
 if(k==='answers')return P.comments.filter(v=>v>=ws).length;
 if(k==='invite')return P.invites.filter(v=>v>=ws).length;return 0}
const missionRef=k=>`mission:${k}:${weekKey()}`;
const claimed=ref=>S.prem.ledger.some(l=>l.ref===ref);
/* premium actions need a real (non-guest) account */
function needMember(fn){needLogin(()=>{if(S.user.anon){S.after=fn;openModal({type:'link',why:'premium'});return}fn()})}
const premErr=e=>{const m=String((e&&e.message)||'');if(e&&e.code)console.warn('[Maadoo Job] premium error:',e.code,e.message);if(e&&(e.code==='PGRST205'||e.code==='42P01'||/does not exist|schema cache/.test(m))){const w=(m.match(/['"]([a-z_]+\.)?([a-z_]+)['"]/i)||[])[2];return t('ยังไม่ได้ตั้งค่าตารางพรีเมียมใน Supabase (รัน SQL)','Premium tables aren’t set up in Supabase yet (run the SQL)')+(w?` · ${w}`:'')}if(/invalid plus coins/.test(m))return t('ยังไม่ได้เป็น Plus ในระบบ จึงรับเหรียญ Plus ไม่ได้','Plus isn’t active on your account yet, so the Plus coins can’t be added');if(/profile/.test(m))return t('สร้างโปรไฟล์ไม่สำเร็จ ลองออกจากระบบแล้วเข้าใหม่','Couldn’t create your profile. Try logging out and in again');if(/cap/.test(m))return t('เดือนนี้รับเหรียญจากภารกิจครบ 300 แล้ว','You’ve reached this month’s 300-coin mission limit');if(/not enough/.test(m))return t('เหรียญไม่พอ','Not enough coins');if(/duplicate|23505/.test(m)||e&&e.code==='23505')return t('รับไปแล้ว','Already claimed');if(/plus required/.test(m))return t('ต้องเป็นสมาชิก Plus ก่อน','You need Plus first');if(/max 2/.test(m))return t('เปิดคำถามค้างได้ไม่เกิน 2 ข้อ','You can have at most 2 open questions');if(/quota/.test(m))return t('สิทธิ์ถามฟรีเดือนนี้หมดแล้ว','No free questions left this month');return t('ทำรายการไม่สำเร็จ ลองใหม่อีกครั้ง','Something went wrong. Please try again.')};
async function selectProfile(){const full=await SB.from('profiles').select('plus_until,free_month_claimed,invite_code,referred_by').eq('id',S.user.id).maybeSingle();
 if(!full.error)return full;if(!/invite_code|referred_by|42703|column/i.test(String(full.error.code)+' '+String(full.error.message)))return full;
 console.warn('[Maadoo Job] promotions SQL not installed yet (profiles.invite_code missing); loading basic profile');return SB.from('profiles').select('plus_until,free_month_claimed').eq('id',S.user.id).maybeSingle()}
async function ensureProfile(){const r=await SB.from('profiles').select('id').eq('id',S.user.id).maybeSingle();if(r.error)throw r.error;if(r.data)return;
 const ins=await SB.from('profiles').insert({id:S.user.id});if(ins.error&&ins.error.code!=='23505')throw ins.error}
async function refreshAll(){if(!sbLive())return;const P=S.prem;await refreshCoins();
 try{const l=await SB.from('coin_ledger').select('id,delta,kind,ref,status,created_at').order('created_at',{ascending:false}).limit(200);if(!l.error&&S.prem===P)P.ledger=(l.data||[]).map(r=>({id:r.id,delta:r.delta,kind:r.kind,ref:r.ref,status:r.status,at:Date.parse(r.created_at)||0}))}catch(e){}}
async function refreshCoins(){if(!sbLive())return;const P=S.prem;
 try{const [pr,cb]=await Promise.all([selectProfile(),SB.from('my_coins').select('coins,pending').maybeSingle()]);
  if(pr.error)console.warn('[Maadoo Job] could not read profile:',pr.error.code,pr.error.message);if(cb.error)console.warn('[Maadoo Job] could not read coin balance (my_coins):',cb.error.code,cb.error.message);
  if(S.prem!==P)return;if(pr.data){P.plusUntil=pr.data.plus_until?Date.parse(pr.data.plus_until):0;P.freeClaimed=!!pr.data.free_month_claimed}if(cb.data)P.coins=cb.data.coins|0}catch(e){}}
/* add a coin ledger entry (mirrors the rules enforced in supabase/setup.sql) */
async function addCoins(delta,kind,ref){const P=S.prem;
 if(ref&&claimed(ref))throw {message:'duplicate'};
 if(['mission','review'].includes(kind)&&missionEarned()+delta>MISSION_CAP)throw {message:'cap'};
 if(kind==='spend'&&P.coins+delta<0)throw {message:'not enough'};
 const status=kind==='review'?'pending':'ok';let id='l-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),at=Date.now();
 if(sbLive()){P.rev++;const before=P.coins;await ensureProfile();const {data,error}=await SB.from('coin_ledger').insert({delta,kind,ref:ref||null}).select('id,created_at,status');if(error)throw error;if(!data||!data.length)throw {message:'ledger not saved'};id=data[0].id;at=Date.parse(data[0].created_at)||at;
  P.ledger.unshift({id,delta,kind,ref,status:data[0].status,at});await refreshCoins();P.rev++;
  if(data[0].status==='ok'&&P.coins!==before+delta)console.warn('[Maadoo Job] coin balance check: expected',before+delta,'got',P.coins)}
 else{P.ledger.unshift({id,delta,kind,ref,status,at});if(status==='ok')P.coins+=delta;
  else setTimeout(()=>{const l=P.ledger.find(v=>v.id===id);if(l&&l.status==='pending'){l.status='ok';P.coins+=l.delta;toast(t(`รีวิวผ่านการตรวจแล้ว (จำลอง) +${l.delta} เหรียญ`,`Review approved (simulated) +${l.delta} coins`));rerender()}},6000)}
 return id}
async function setPlusUntil(until,extra){const P=S.prem;
 if(sbLive()){P.rev++;await ensureProfile();const upd=Object.assign({plus_until:new Date(until).toISOString()},extra||{});
  const {data,error}=await SB.from('profiles').update(upd).eq('id',S.user.id).select('plus_until');if(error)throw error;if(!data||!data.length)throw {message:'profile not updated'}}
 P.plusUntil=until;if(extra&&extra.free_month_claimed)P.freeClaimed=true;return grantPlusCoins()}
async function grantPlusCoins(){if(!isPlus())return 0;const ref='plus:'+monthKey();if(claimed(ref))return 0;try{await addCoins(100,'plus',ref);return 100}catch(e){console.warn('[Maadoo Job] monthly Plus coins not added:',e&&(e.code||''),e&&(e.message||e));if(!(e&&e.code==='23505'))toast(premErr(e));return 0}}
async function loadPrem(){const P=S.prem;if(!sbLive()){P.loaded=true;return}const rev0=P.rev;
 try{let {data}=await selectProfile();
  if(!data){await ensureProfile();({data}=await selectProfile())}
  const l=await SB.from('coin_ledger').select('id,delta,kind,ref,status,created_at').order('created_at',{ascending:false}).limit(200);
  const q=await SB.from('questions').select('*').order('created_at',{ascending:false}).limit(100);
  const cb=await SB.from('my_coins').select('coins,pending').maybeSingle();if(cb.error)console.warn('[Maadoo Job] could not read coin balance (my_coins):',cb.error.code,cb.error.message);
  if(S.prem!==P)return;
  const lq=q.error?[]:(q.data||[]).map(r=>({id:r.id,mid:r.mentor_id,status:r.status,counted:r.counted,refunded:r.refunded,msgs:Array.isArray(r.messages)?r.messages:[],createdAt:Date.parse(r.created_at),answeredAt:r.answered_at?Date.parse(r.answered_at):0,lastAt:Date.parse(r.last_activity_at),closedAt:r.closed_at?Date.parse(r.closed_at):0}));const seen=new Set(P.qs.map(v=>v.id));P.qs=P.qs.concat(lq.filter(v=>!seen.has(v.id)));
  if(P.rev!==rev0){P.loaded=true;await refreshAll();rerender();return}
  if(data){P.plusUntil=data.plus_until?Date.parse(data.plus_until):0;P.freeClaimed=!!data.free_month_claimed;P.inviteCode=data.invite_code||null;P.referredBy=data.referred_by||null}if(cb.data)P.coins=cb.data.coins|0;
  if(!l.error)P.ledger=(l.data||[]).map(r=>({id:r.id,delta:r.delta,kind:r.kind,ref:r.ref,status:r.status,at:Date.parse(r.created_at)||0}));
 }catch(e){console.warn('[Maadoo Job] could not load premium data (profiles / coin_ledger / questions):',e&&(e.message||e))}
 P.loaded=true;await grantPlusCoins();syncQs();P.qs.forEach(q=>{if(q.status==='waiting')scheduleReply(q)});qTick();rerender()}
function resetPrem(){S.prem=blankPrem();resetChat()}
/* ---------- simulated payment (DEMO) ---------- */
function openPay(o){needMember(()=>openModal(Object.assign({type:'pay',method:'qr',step:'form'},o)))}
function payModal(m,head){const busy=m.step==='processing';
 const what=m.what==='emp'?`${m.tier} · ${esc(m.company)}`:m.what==='plus'?`Maadoo Plus · ${x(PLANS[m.plan].n)}`:m.what==='topup'?t(`เติม ${m.coins} เหรียญ`,`Top up ${m.coins} coins`):t(`จองคุยกับ${x(MENTORS.find(v=>v.id===m.mid).name)}`,`Session with ${x(MENTORS.find(v=>v.id===m.mid).name)}`);
 if(m.step==='done')return `<div class="pay-done"><div class="pay-ok">✓</div><h2>${t('ชำระเงินสำเร็จ (จำลอง)','Payment complete (simulated)')}</h2><p class="muted">${what} · ${fmt(m.amount)} ${t('บาท','THB')}</p><div class="demo-badge">🧪 ${t('เดโม · ไม่มีการตัดเงินจริง','DEMO · no money was taken')}</div><button class="btn y" data-close>${t('เรียบร้อย','Done')}</button></div>`;
 return `<div class="demo-banner">🧪 ${t('หน้าชำระเงินจำลอง · เดโม ไม่มีการตัดเงินจริง','Simulated checkout · DEMO, no real payment')}</div>`+head(t('ชำระเงิน','Checkout'),what)+
 `<div class="pay-sum"><span>${what}</span><b>${fmt(m.amount)} ${t('บาท','THB')}</b></div>${m.coinsUsed?`<div class="pay-sum sub"><span>🪙 ${t('ใช้เหรียญเป็นส่วนลด','Coins used as discount')}</span><b>−${fmt(m.coinsUsed)}</b></div>`:''}
 <div class="pay-methods" role="radiogroup" aria-label="${t('วิธีชำระเงิน','Payment method')}">${[['qr','📱',t('พร้อมเพย์ QR','PromptPay QR')],['card','💳',t('บัตรเครดิต/เดบิต','Credit/debit card')]].map(([k,i,n])=>`<button type="button" role="radio" aria-checked="${m.method===k}" class="pay-m ${m.method===k?'on':''}" data-paym="${k}" ${busy?'disabled':''}><span>${i}</span>${n}</button>`).join('')}</div>
 ${m.method==='qr'?`<div class="pay-qr" aria-hidden="true"><div class="qr-fake"></div><small>${t('QR ตัวอย่าง สแกนไม่ได้จริง','Sample QR, not scannable')}</small></div>`:`<div class="grid" style="gap:8px"><input class="field" value="4242 4242 4242 4242" disabled aria-label="${t('เลขบัตรตัวอย่าง','Sample card number')}"><div class="row"><input class="field" style="flex:1;min-width:0" value="12/30" disabled aria-label="MM/YY"><input class="field" style="flex:1;min-width:0" value="123" disabled aria-label="CVC"></div><small class="muted">${t('ข้อมูลบัตรตัวอย่าง ไม่ต้องกรอกจริง','Sample card details, don’t enter a real card')}</small></div>`}
 <button class="btn y big" data-paynow ${busy?'disabled':''}>${busy?t('กำลังชำระ (จำลอง)…','Processing (simulated)…'):t(`จ่าย ${fmt(m.amount)} บาท (จำลอง)`,`Pay ${fmt(m.amount)} THB (simulated)`)}</button>`}
async function payNow(){const m=S.modal;if(!m||m.type!=='pay'||m.step!=='form')return;m.step='processing';renderModal();await new Promise(r=>setTimeout(r,1100));
 try{
  if(m.what==='plus'){const pl=PLANS[m.plan];m.gotCoins=await setPlusUntil(Math.max(Date.now(),S.prem.plusUntil)+pl.days*DAY)}
  else if(m.what==='topup'){await addCoins(m.coins,'topup')}
  else if(m.what==='emp'){await saveEmp(m.company,m.tier)}
  else if(m.what==='live'){await bookLive(m)}
 }catch(e){m.step='form';renderModal();toast(m.what==='live'?(e&&e.message&&!e.code?e.message:liveErr(e)):premErr(e));return}
 m.step='done';if(S.modal===m)renderModal();render();
 if(m.what==='plus')toast(m.gotCoins?t('ยินดีต้อนรับสู่ Maadoo Plus ✨ +100 เหรียญ','Welcome to Maadoo Plus ✨ +100 coins'):t('ยินดีต้อนรับสู่ Maadoo Plus ✨','Welcome to Maadoo Plus ✨'));else if(m.what==='topup')toast(t(`เติม ${m.coins} เหรียญแล้ว`,`Added ${m.coins} coins`));else if(m.what==='emp')toast(t(`เปิดใช้ Pro ให้ ${m.company} แล้ว`,`Pro is on for ${m.company}`))}
async function claimFreeMonth(){needMember(async()=>{if(S.prem.freeClaimed||S.myReviews.length<3)return;
 try{await setPlusUntil(Math.max(Date.now(),S.prem.plusUntil)+30*DAY,{free_month_claimed:true});await refreshCoins();render();toast(t('รับ Plus ฟรี 1 เดือนแล้ว ✨','Free month of Plus unlocked ✨'))}catch(e){toast(premErr(e))}})}
async function claimMission(k){needMember(async()=>{const ms=MISSIONS.find(v=>v.k===k);if(missionProgress(k)<ms.need)return;
 try{await addCoins(ms.coins,ms.kind,missionRef(k));render();toast(ms.kind==='review'?t(`+${ms.coins} เหรียญ จะเข้ากระเป๋าหลังรีวิวผ่านการตรวจ`,`+${ms.coins} coins will arrive once your review is approved`):t(`+${ms.coins} เหรียญ!`,`+${ms.coins} coins!`))}catch(e){toast(premErr(e))}})}
function invite(){needMember(shareInvite)}
/* ---------- Plus page ---------- */
const PERKS=[['💬',['ถามรุ่นพี่ฟรี 5 คำถาม/เดือน','Ask mentors free: 5 questions/month']],['🎥',['คุยสดกับรุ่นพี่ลด 20%','20% off live mentor calls']],['📄',['ตรวจเรซูเม่ฟรี 1 ครั้ง/เดือน','1 free resume review/month']],['⏰',['แจ้งเตือนงานใหม่ก่อน 24 ชม.','New job alerts 24 h early']],['📊',['เทียบเงินเดือนละเอียด','Detailed salary comparisons']],['🎨',['ธีม + เพลงพิเศษ','Special themes + music']],['🪙',['100 เหรียญทุกเดือน','100 coins every month']]];
const CMP=[[['อ่านรีวิว เงินเดือน คำถามสัมภาษณ์','Read reviews, salaries, interview Qs'],'✓','✓'],[['เขียนรีวิว และสมัครงาน','Write reviews and apply to jobs'],'✓','✓'],[['ถามรุ่นพี่ฟรี','Free mentor questions'],'—',['5/เดือน','5/month']],[['ส่วนลดคุยสดกับรุ่นพี่','Live mentor call discount'],'—','20%'],[['ตรวจเรซูเม่','Resume review'],'—',['1 ครั้ง/เดือน','1/month']],[['แจ้งเตือนงานใหม่','New job alerts'],['ปกติ','Standard'],['ก่อน 24 ชม.','24 h early']],[['เทียบเงินเดือน','Salary comparison'],['พื้นฐาน','Basic'],['ละเอียด','Detailed']],[['ธีม + เพลงพิเศษ','Special themes + music'],'—','✓'],[['เหรียญทุกเดือน','Monthly coins'],'—','100']];
function plusPage(){const P=S.prem,on=isPlus(),rv=Math.min(3,S.myReviews.length);
 return `<div class="plus-wrap"><section class="ticket">
  <div class="tk-top"><img class="tk-pup" src="${PUP()}" alt=""><span class="tk-chip">✨ ${t('สมาชิกพรีเมียม','Premium membership')}</span><h1>Maadoo Plus</h1><p>${t('ตัวช่วยหางานแบบจัดเต็ม ถามรุ่นพี่ได้ทุกเดือน','Your all-in job-hunt sidekick, with mentor questions every month')}</p>
   ${on?`<div class="tk-status">✨ ${t(`เป็นสมาชิกถึง ${fmtDate(P.plusUntil)}`,`Member until ${fmtDate(P.plusUntil)}`)}</div>`:''}</div>
  <div class="tk-cut" aria-hidden="true"></div>
  <div class="tk-plans" role="radiogroup" aria-label="${t('เลือกแพ็กเกจ','Choose a plan')}">${Object.keys(PLANS).map(k=>{const p=PLANS[k];return `<button type="button" role="radio" aria-checked="${S.planSel===k}" class="tk-plan ${S.planSel===k?'on':''}" data-plansel="${k}">${p.best?`<span class="tk-best">${t('คุ้มสุด','Best value')}</span>`:''}<b>${x(p.n)}</b><span class="tk-price">${planPrice(k)!==p.price?`<s class="tk-was">${fmt(p.price)}</s>`:''}${fmt(planPrice(k))}<small>${t('บาท','THB')}${x(p.per)}</small></span>${k==='y'?`<small class="tk-note">${yearlyDeal()?t('ลด 30% เดือนนี้','30% off this month'):t('ฟรี 2 เดือน','2 months free')}</small>`:k==='t'?`<small class="tk-note">${t('3 เดือน','3 months')}</small>`:`<small class="tk-note">${t('ยกเลิกได้ทุกเมื่อ','Cancel anytime')}</small>`}</button>`}).join('')}</div>
 </section>
 <section class="card perks"><h2>${t('สิทธิ์ของสมาชิก Plus','What you get with Plus')}</h2><ul>${PERKS.map(p=>`<li><span>${p[0]}</span>${x(p[1])}</li>`).join('')}</ul></section>
 <section class="card quest"><div class="row"><span class="q-ic">🎯</span><div style="flex:1;min-width:0"><b>${t('ภารกิจ: เขียน 3 รีวิว รับ Plus ฟรี 1 เดือน','Mission: write 3 reviews, get 1 month of Plus free')}</b><div class="muted" style="font-size:13px">${t('นับจากรีวิวบริษัทที่คุณเขียนจริง','Counts the company reviews you actually wrote')}</div></div></div>
  <div class="bar"><i style="width:${rv/3*100}%"></i></div><div class="row"><span class="muted">${rv}/3 ${t('รีวิว','reviews')}</span>${P.freeClaimed?`<span class="chip ver grow">✓ ${t('รับแล้ว','Claimed')}</span>`:rv>=3?`<button class="btn y sm grow" data-freemonth>${t('รับ Plus ฟรี','Claim free Plus')}</button>`:`<button class="btn ghost sm grow" data-go="write">${t('เขียนรีวิว','Write a review')}</button>`}</div></section>
 <button class="btn orange big" data-plusbuy>${on?t(`ต่ออายุ Plus · ${fmt(planPrice(S.planSel))} บาท`,`Renew Plus · ${fmt(planPrice(S.planSel))} THB`):t(`สมัคร Plus · ${fmt(planPrice(S.planSel))} บาท`,`Get Plus · ${fmt(planPrice(S.planSel))} THB`)}</button>
 <p class="free-note">💙 ${t('รีวิว เงินเดือน และการสมัครงาน ใช้ฟรีตลอด','Reviews, salaries and job applications are always free')}</p>
 <section class="card cmp-card"><h2>${t('ฟรี vs Plus','Free vs Plus')}</h2><div class="scroll"><table class="cmp"><thead><tr><th></th><th>${t('ฟรี','Free')}</th><th class="pl">Plus ✨</th></tr></thead><tbody>${CMP.map(r=>`<tr><td>${x(r[0])}</td><td>${x(r[1])}</td><td class="pl">${x(r[2])}</td></tr>`).join('')}</tbody></table></div></section>
 <p class="demo-note">${t('เดโม: กดสมัครแล้วจะเห็นหน้าชำระเงินจำลอง ไม่มีการตัดเงินจริง ยกเลิกได้ทุกเมื่อ และจ่ายเงินไม่ช่วยลบหรือซ่อนรีวิวใด ๆ','Demo: subscribing shows a simulated checkout, no money is taken. Cancel anytime. Paying never removes or hides any review.')}</p></div>`}
/* ---------- coin wallet ---------- */
function coinCard(compact){const P=S.prem,pend=pendingCoins();
 return `<section class="coin-card ${compact?'compact':''}"><div class="cc-top"><span class="cc-lbl">🪙 ${t('กระเป๋าเหรียญมาดู','Maadoo coin wallet')}</span>${isPlus()?`<span class="cc-plus">✨ Plus</span>`:''}</div>
  <div class="cc-bal"><b>${fmt(P.coins)}</b><span>${t('เหรียญ','coins')}</span></div><div class="cc-eq">= ${t(`ส่วนลด ${fmt(P.coins)} บาท`,`${fmt(P.coins)} THB off`)}${pend?` · ${t(`รอตรวจ +${pend}`,`+${pend} pending`)}`:''}</div>
  ${compact?`<button class="btn sm cc-btn" data-go="wallet">${t('เปิดกระเป๋า','Open wallet')} →</button>`:`${sbLive()?`<button class="link cc-sync" data-ccsync>🔄 ${t('ดึงยอดล่าสุดจากระบบ','Reload balance from the server')}</button>`:''}<div class="cc-acts"><button class="cc-act" data-ccbook><span>📅</span>${t('จองรุ่นพี่','Book a mentor')}</button><button class="cc-act" data-ccthemes><span>🎨</span>${t('ปลดล็อกธีม','Unlock themes')}</button><button class="cc-act" data-cctopup><span>➕</span>${t('เติมเหรียญ','Top up')}</button></div>`}</section>`}
function wallet(){const P=S.prem,earned=missionEarned();
 if(!S.user)return `<div class="wallet">${coinCard()}<div class="card" style="display:grid;gap:10px;justify-items:start"><b>${t('เข้าสู่ระบบเพื่อเก็บเหรียญ','Log in to collect coins')}</b><button class="btn y" data-login>${t('เข้าสู่ระบบ','Log in')}</button></div></div>`;
 return `<div class="wallet">${coinCard()}
 <section class="card"><div class="sec-h" style="margin:0"><h2>${t('ภารกิจสัปดาห์นี้','This week’s missions')}</h2><span class="muted" style="font-size:13px">${t(`เดือนนี้ ${earned}/${MISSION_CAP} เหรียญ`,`This month ${earned}/${MISSION_CAP} coins`)}</span></div>
  <div class="bar thin"><i style="width:${Math.min(100,earned/MISSION_CAP*100)}%"></i></div>
  <div class="missions">${MISSIONS.map(ms=>{const pr=Math.min(ms.need,missionProgress(ms.k)),done=claimed(missionRef(ms.k)),l=S.prem.ledger.find(v=>v.ref===missionRef(ms.k));
   return `<div class="ms ${done?'done':''}"><span class="ms-ic">${ms.ic}</span><div class="ms-b"><div class="row" style="gap:6px"><b>${x(ms.n)}</b><span class="ms-coin">+${ms.coins}</span></div><small class="muted">${x(ms.how)}</small>
    <div class="bar thin"><i style="width:${pr/ms.need*100}%"></i></div><small class="muted">${pr}/${ms.need}</small></div>
    <div class="ms-a">${done?(l&&l.status==='pending'?`<span class="chip mid">⏳ ${t('รอตรวจ','Pending')}</span>`:`<span class="chip ver">✓ ${t('ได้แล้ว','Earned')}</span>`):pr>=ms.need?`<button class="btn y sm" data-claim="${ms.k}">${t('รับเหรียญ','Claim')}</button>`:ms.act==='invite'?`<button class="btn ghost sm" data-invite>${t('ชวนเลย','Invite')}</button>`:`<button class="btn ghost sm" data-go="${ms.go}">${t('ไปทำ','Go')}</button>`}</div></div>`}).join('')}</div></section>
 <section class="card rules-c"><b>📌 ${t('กติกาเหรียญ','Coin rules')}</b><ul><li>${t('1 เหรียญ = ส่วนลด 1 บาท ใช้จองรุ่นพี่หรือปลดล็อกธีม','1 coin = 1 THB off mentor sessions or theme unlocks')}</li><li>${t('เหรียญจากรีวิวจะได้หลังรีวิวผ่านการตรวจ','Coins from reviews arrive after the review is approved')}</li><li>${t('เหรียญจากภารกิจได้ไม่เกิน 300 เหรียญ/เดือน','Mission coins are capped at 300 a month')}</li><li>${t('เหรียญแลกเป็นเงินสดไม่ได้','Coins can’t be exchanged for cash')}</li></ul></section>
 ${P.ledger.length?`<section class="card"><h2 style="font-size:18px">${t('ประวัติเหรียญ','Coin history')}</h2><div class="list">${P.ledger.slice(0,10).map(l=>`<div class="li"><span>${{mission:'🎯',review:'✍️',topup:'➕',plus:'✨',spend:'📅'}[l.kind]}</span><span class="muted">${fmtDate(l.at)}</span><b class="grow" style="color:${l.delta>0?'var(--good)':'var(--bad)'}">${l.delta>0?'+':''}${l.delta}</b>${l.status==='pending'?`<span class="chip mid">${t('รอตรวจ','Pending')}</span>`:''}</div>`).join('')}</div></section>`:''}
 <p class="demo-note">${t('เดโม: การเติมเหรียญใช้หน้าชำระเงินจำลอง ไม่มีการตัดเงินจริง','Demo: top-ups use a simulated checkout, no money is taken')}</p></div>`}
function topupModal(m,head){return head(t('เติมเหรียญ','Top up coins'),t('1 เหรียญ = ส่วนลด 1 บาท','1 coin = 1 THB off'))+`<div class="packs">${PACKS.map(([c,p],i)=>`<button class="pack" data-pack="${i}"><b>🪙 ${c}</b><span>${fmt(p)} ${t('บาท','THB')}</span>${i?`<small>${t(`ประหยัด ${c-p} บาท`,`Save ${c-p} THB`)}</small>`:''}</button>`).join('')}</div><p class="demo-note">${t('เดโม: ไม่มีการตัดเงินจริง','Demo: no money is taken')}</p>`}
function themesModal(m,head){return head(t('ธีมพิเศษ','Special themes'),t('ใช้ 150 เหรียญ หรือฟรีสำหรับสมาชิก Plus','150 coins, or free with Plus'))+`<div class="packs">${[['🌌',['ออโรร่า','Aurora']],['🍡',['ขนมหวาน','Sweets']]].map(([i,n])=>`<div class="pack soon"><b>${i} ${x(n)}</b><span class="chip">${t('เร็ว ๆ นี้','Coming soon')}</span></div>`).join('')}</div><p class="muted" style="margin:0">${t('ธีมพิเศษพร้อมเพลงประจำธีมกำลังทำอยู่ ตอนนี้ธีมทั้ง 9 แบบใช้ได้ฟรี','Special themes with their own music are in the works. All 9 current themes are free.')}</p><button class="btn ghost" data-close>${t('ตกลง','OK')}</button>`}
/* ---------- ask a mentor (Plus) ---------- */
const qOpen=()=>S.prem.qs.filter(q=>q.status!=='closed').length;
const qUsed=()=>{const ms=monthStart();return S.prem.qs.filter(q=>q.counted&&q.closedAt>=ms).length};
const qLeft=()=>Math.max(0,Q_MAX-qUsed()-qOpen());
const Q_ST={waiting:['รอคำตอบ','Waiting','mid'],answered:['ตอบแล้ว','Answered','good'],closed:['ปิดแล้ว','Closed','']};
function askBtn(m){return isPlus()?`<button type="button" class="btn orange sm s-ask s-askp" data-askm="${m.id}" aria-label="${t(`ถามฟรี เหลือ ${qLeft()} จาก ${Q_MAX}`,`Ask free, ${qLeft()} of ${Q_MAX} left`)}">💬 ${t(`ถามฟรี ${qLeft()}/${Q_MAX}`,`Ask free ${qLeft()}/${Q_MAX}`)}</button>`:`<button type="button" class="s-ask s-ask-off" data-askm="${m.id}">💬 ${t('ถามรุ่นพี่ · Plus','Ask · Plus')}</button>`}
function askMentor(mid){needMember(()=>{if(!isPlus()){go('plus');toast(t('ถามรุ่นพี่ฟรีเป็นสิทธิ์ของสมาชิก Plus','Free mentor questions are a Plus perk'));return}
 qTick();if(qOpen()>=Q_OPEN){toast(t('เปิดคำถามค้างได้ไม่เกิน 2 ข้อ ปิดข้อเก่าก่อนนะ','You can have at most 2 open questions. Close one first.'));return}
 if(qLeft()<=0){toast(t('สิทธิ์ถามฟรีเดือนนี้หมดแล้ว รีเซ็ตต้นเดือนหน้า','No free questions left this month. They reset next month.'));return}
 openModal({type:'qnew',mid,text:''})})}
function qnewModal(m,head){const mt=MENTORS.find(v=>v.id===m.mid);return head(t(`ถาม${x(mt.name)}`,`Ask ${x(mt.name)}`),`${x(mt.role)} · ${t(`เหลือ ${qLeft()}/${Q_MAX} คำถามเดือนนี้`,`${qLeft()}/${Q_MAX} questions left this month`)}`)+
 `<textarea class="field" id="qtext" maxlength="500" rows="4" placeholder="${t('เล่าสถานการณ์สั้น ๆ แล้วถามได้เลย เช่น ควรเลือกฝึกงานที่ไหนดี','Describe your situation and ask, e.g. which internship should I pick?')}">${esc(m.text||'')}</textarea>
 <ul class="q-rules"><li>${t('แชทต่อได้เรื่อย ๆ จนได้คำตอบ','Keep chatting until you get your answer')}</li><li>${t('กด “ได้คำตอบแล้ว” เมื่อพอใจ = ใช้ 1 สิทธิ์','Tap “Got my answer” when happy = uses 1 question')}</li><li>${t('รุ่นพี่ไม่ตอบใน 48 ชม. = คืนสิทธิ์','No reply within 48 h = refunded')}</li><li>${t('เงียบ 7 วันหลังรุ่นพี่ตอบ = ปิดเอง ใช้ 1 สิทธิ์','Quiet for 7 days after a reply = closes, uses 1')}</li></ul>
 ${authFormErr(m)}<div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>${t('ยกเลิก','Cancel')}</button><button class="btn y" data-qsend ${m.busy?'disabled':''}>${t('ส่งคำถาม','Send question')}</button></div>`}
const REPLY={intern:[['ฝึกงานเลือกที่ที่ได้ลงมือจริงก่อนนะ ถามเขาเลยว่าเด็กฝึกงานได้ทำอะไรบ้างในแต่ละสัปดาห์','Pick an internship where you get hands-on work. Ask them what interns actually do each week.']],resume:[['เรซูเม่ให้ใส่ผลงานเป็นตัวเลข เช่น “ลดเวลาตรวจ 20%” แล้วตัดส่วนที่ไม่เกี่ยวกับงานออก','Put results as numbers, like “cut testing time by 20%”, and drop anything unrelated to the job.']],salary:[['ลองดูช่วงเงินเดือนในหน้าบริษัทก่อน แล้วขอสูงกว่าค่ากลางประมาณ 5–10% พร้อมเหตุผล','Check the salary range on the company page, then ask 5–10% above the median with a reason.']],switch:[['ย้ายสายได้ เริ่มจากทำโปรเจกต์เล็ก ๆ 1–2 ชิ้นให้มีของโชว์ก่อน','You can switch. Start with 1–2 small projects so you have something to show.']],rights:[['OT ต้องได้ค่าล่วงเวลา และลาป่วยได้ตามกฎหมาย ถ้าไม่แน่ใจให้ขอสัญญาจ้างมาอ่านก่อนเซ็น','Overtime must be paid and sick leave is your right. If unsure, ask to read the contract before signing.']]};
const FOLLOW=[['ได้เลย ถ้ายังติดตรงไหนถามต่อได้นะ','Sure! Ask more if anything’s still unclear.'],['คำถามดีมาก ลองทำตามนี้ก่อน แล้วมาเล่าให้ฟังว่าเป็นยังไง','Great question. Try this first and tell me how it goes.']];
function mentorReply(q){const mt=ensureMentor(q.mid);const first=!q.answeredAt;const r=first?(REPLY[mt.top[0]]||REPLY.intern)[0]:pick2(FOLLOW);
 return {f:'mt',t:first?[`สวัสดีครับ/ค่ะ ${r[0]}`,`Hi! ${r[1]}`]:r,at:Date.now()}}
const pick2=a=>a[Math.floor(Math.random()*a.length)];
const qTimers={};
function scheduleReply(q){if(qTimers[q.id]||isUuid(q.mid))return;qTimers[q.id]=setTimeout(async()=>{delete qTimers[q.id];if(q.status!=='waiting'||q.skipped)return;
 q.msgs.push(mentorReply(q));q.status='answered';q.answeredAt=q.answeredAt||Date.now();q.lastAt=Date.now();await qSave(q);
 const mt=ensureMentor(q.mid);pushNotif('💬',`${mt.name[0]}ตอบคำถามของคุณแล้ว`,`${mt.name[1]} answered your question`,['me']);
 if(S.modal&&S.modal.type==='qchat'&&S.modal.id===q.id)renderModal();if(['me','ask'].includes(S.view))rerender()},rnd2(3000,5500))}
const rnd2=(a,b)=>a+Math.random()*(b-a);
async function qSave(q,insert){if(!sbLive())return true;
 try{const row={status:q.status,counted:q.counted,refunded:q.refunded,messages:q.msgs,answered_at:q.answeredAt?new Date(q.answeredAt).toISOString():null,last_activity_at:new Date(q.lastAt).toISOString(),closed_at:q.closedAt?new Date(q.closedAt).toISOString():null};
  const {error}=await SB.from('questions').update(row).eq('id',q.id);return !error}catch(e){return false}}
async function qSend(){const m=S.modal;if(!m||m.type!=='qnew'||m.busy)return;const txt=($('#qtext').value||'').trim().slice(0,500);if(!txt){m.err=['พิมพ์คำถามก่อนนะ','Type your question first.'];renderModal();return}
 m.text=txt;m.busy=true;renderModal();const now=Date.now();const msgs=[{f:'me',t:txt,at:now}];let id='q-local-'+now.toString(36);
 if(isUuid(m.mid)){await qSendReal(m,txt,msgs);return}
 if(sbLive()){try{const {data,error}=await SB.from('questions').insert({mentor_id:m.mid,messages:msgs}).select('id,created_at');if(error)throw error;id=data[0].id}catch(e){m.busy=false;m.err=[premErr(e),premErr(e)];if(S.modal===m)renderModal();return}}
 const q={id,mid:m.mid,status:'waiting',counted:false,refunded:false,msgs,createdAt:now,answeredAt:0,lastAt:now,closedAt:0};S.prem.qs.unshift(q);scheduleReply(q);
 openModal({type:'qchat',id});rerender();toast(t('ส่งคำถามแล้ว รุ่นพี่จะตอบเร็ว ๆ นี้','Question sent. The mentor will reply soon'))}
async function qSendReal(m,txt,msgs){const now=Date.now();let qid=null;
 const fail=e=>{m.busy=false;const s=chatErr(e);m.err=[s,s];if(S.modal===m)renderModal()};
 if(!sbLive()){fail({message:'offline'});return}
 try{const {data,error}=await SB.from('questions').insert({mentor_id:m.mid,messages:msgs}).select('id,created_at');if(error)throw error;qid=data[0].id;
  const nm=S.user.email&&S.user.name===S.user.email.split('@')[0]?'':String(S.user.name||'').slice(0,30);
  const rr=await SB.from('chat_rooms').insert({question_id:qid,mentor_id:m.mid,student_name:nm}).select('*').single();if(rr.error)throw rr.error;
  const mm=await SB.from('messages').insert({room_id:rr.data.id,body:txt}).select('*').single();if(mm.error)throw mm.error;
  const q={id:qid,mid:m.mid,status:'waiting',counted:false,refunded:false,msgs,createdAt:now,answeredAt:0,lastAt:now,closedAt:0};S.prem.qs.unshift(q);
  S.rooms.unshift(rr.data);S.msgs[rr.data.id]=[mm.data];subscribeChat();closeModal();S.chatDraft='';go('chat',{chat:rr.data.id});
  toast(mm.data.masked?t('ส่งคำถามแล้ว · 🔒 ซ่อนช่องทางติดต่อไว้จนกว่าจะคุยสดครั้งแรก','Question sent · 🔒 contact details hidden until your first live call'):t('ส่งคำถามแล้ว รอรุ่นพี่ตอบภายใน 48 ชม.','Question sent. The mentor has 48 h to reply'))}
 catch(e){if(qid){try{await SB.from('questions').update({status:'closed',refunded:true,closed_at:new Date().toISOString()}).eq('id',qid)}catch(_){}}fail(e)}}
function qchatModal(m,head){const q=S.prem.qs.find(v=>v.id===m.id);if(!q)return head('','');const mt=ensureMentor(q.mid),st=Q_ST[q.status];
 return head(`${mt.ava} ${x(mt.name)}`,`${x(mt.role)} · <span class="chip ${st[2]}">${x(st)}</span>`)+
 `<div class="chat" id="chatBox">${q.msgs.map(g=>`<div class="bub ${g.f==='me'?'me':''}">${esc(Array.isArray(g.t)?x(g.t):g.t)}<small>${new Date(g.at).toLocaleTimeString(S.lang==='en'?'en-GB':'th-TH',{hour:'2-digit',minute:'2-digit'})}</small></div>`).join('')}${q.status==='waiting'?`<div class="bub typing">${t(`${x(mt.name)}กำลังพิมพ์…`,`${x(mt.name)} is typing…`)}</div>`:''}</div>
 ${q.status==='closed'?`<p class="muted" style="margin:0;text-align:center">${q.refunded?t('ปิดแล้ว · รุ่นพี่ไม่ได้ตอบใน 48 ชม. คืนสิทธิ์ให้แล้ว','Closed · no reply within 48 h, question refunded'):t('ปิดแล้ว · ใช้ 1 สิทธิ์','Closed · used 1 question')}</p>`:
 `<form id="qmsgForm" class="row" style="flex-wrap:nowrap"><input class="field" id="qmsg" maxlength="500" autocomplete="off" placeholder="${t('ถามต่อได้เลย…','Ask a follow-up…')}" style="flex:1;min-width:0"><button class="btn" aria-label="${t('ส่ง','Send')}">➤</button></form>
 <button class="btn y" data-qdone ${q.answeredAt?'':'disabled'}>✓ ${t('ได้คำตอบแล้ว พอใจ','Got my answer')}</button>
 <div class="demo-row">🧪 ${t('เดโม:','Demo:')} ${!q.answeredAt?`<button class="link" data-qskip="48">${t('จำลองผ่านไป 48 ชม.','Skip 48 h')}</button>`:`<button class="link" data-qskip="168">${t('จำลองผ่านไป 7 วัน','Skip 7 days')}</button>`}</div>`}`}
function qTick(){let ch=false;const now=Date.now();
 S.prem.qs.forEach(q=>{if(q.status==='closed')return;
  if(!q.answeredAt&&now-q.createdAt>=48*36e5){q.status='closed';q.refunded=true;q.closedAt=now;ch=true;qSave(q);toast(t('รุ่นพี่ไม่ได้ตอบใน 48 ชม. คืนสิทธิ์ถามให้แล้ว','No reply within 48 h, your question was refunded'))}
  else if(q.status==='answered'&&now-q.lastAt>=7*DAY){q.status='closed';q.counted=true;q.closedAt=now;ch=true;qSave(q)}});
 return ch}
async function qDone(id){const q=S.prem.qs.find(v=>v.id===id);if(!q||q.status==='closed'||!q.answeredAt)return;q.status='closed';q.counted=true;q.closedAt=Date.now();q.lastAt=Date.now();await qSave(q);
 const mt=ensureMentor(q.mid),rm=roomOfQ(q),bid=rm?rm.id:q.id;let b=S.booked.find(v=>v.id===bid);if(!b){b={id:bid,m:mt,mid:mt.id,slot:null,at:Date.now(),st:'done',rid:null,q:true};S.booked.push(b)}
 if(rm)rm.status='closed';rerender();openMrev(b.id);toast(t('ปิดคำถามแล้ว ให้ดาวรุ่นพี่หน่อยนะ','Question closed. Rate your mentor?'))}
function myQuestions(){const qs=S.prem.qs;if(!qs.length)return '';
 return `<div class="row" style="gap:8px;margin-bottom:8px"><span class="chip">${t(`เดือนนี้เหลือ ${qLeft()}/${Q_MAX}`,`${qLeft()}/${Q_MAX} left this month`)}</span><span class="chip">${t(`เปิดค้าง ${qOpen()}/${Q_OPEN}`,`${qOpen()}/${Q_OPEN} open`)}</span></div><div class="list">${qs.map(q=>{const mt=ensureMentor(q.mid),st=Q_ST[q.status];const first=q.msgs[0];
  return `<button class="li q-li" data-qopen="${q.id}"><span class="ava" style="width:36px;height:36px;font-size:18px;background:${mt.bg}">${mt.ava}</span><div class="bk-t"><b>${x(mt.name)}</b><span class="muted q-prev">${esc(first?(Array.isArray(first.t)?x(first.t):first.t):'')}</span></div><span class="chip ${st[2]}">${x(st)}${q.refunded?` · ${t('คืนสิทธิ์','refunded')}`:''}</span></button>`}).join('')}</div>`}
/* ---------- interview review (for the weekly mission) ---------- */
function ivModal(m,head){const c=getCo(m.co);return head(t('รีวิวการสัมภาษณ์','Review your interview'),x(c.name))+
 `<b style="font-size:14px">${t('ความยาก','Difficulty')}</b><div class="opts">${Object.keys(DIFF).map(k=>`<button type="button" class="opt ${m.diff===k?'on':''}" data-ivdiff="${k}">${x(DIFF[k])}</button>`).join('')}</div>
 <label class="grid" style="gap:4px"><b style="font-size:14px">${t('คำถามที่เจอ','A question they asked')}</b><input class="field" id="ivq" maxlength="140" value="${esc(m.q||'')}" placeholder="${t('เช่น ทำไมถึงอยากทำงานที่นี่','e.g. Why do you want to work here?')}"></label>
 ${authFormErr(m)}<div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>${t('ยกเลิก','Cancel')}</button><button class="btn y" data-ivsend>${t('ส่ง','Submit')}</button></div>
 <p class="demo-note">${t('เดโม: เก็บไว้ในเครื่องนี้เท่านั้น','Demo: kept on this device only')}</p>`}
/* ---------- promotions: home carousel, pioneers, invite codes, seasonal offer, employer early-bird ---------- */
const PIONEER_MAX=1000,EARLY_MAX=50;
S.pioneer=null;S.earlyLeft=null;S.promoIdx=0;S.refCode=null;S.empLocal=0;
S.promoHidden=(()=>{const v=+store.get('maadoo-promo-hide');return v&&Date.now()-v<7*DAY})();
try{const u=new URL(location.href),r=(u.searchParams.get('ref')||'').trim().toUpperCase();if(/^MAADOO-[A-Z0-9]{4,8}$/.test(r)){S.refCode=r;u.searchParams.delete('ref');history.replaceState(null,'',u.pathname+(u.search?u.search:'')+u.hash)}}catch(e){}
const promoMonth=()=>{try{const m=+new URL(location.href).searchParams.get('promo_month');if(m>=1&&m<=12)return m}catch(e){}return new Date().getMonth()+1};
const yearlyDeal=()=>promoMonth()===12;
const planPrice=k=>k==='y'&&yearlyDeal()?Math.round(PLANS.y.price*.7):PLANS[k].price;
function demoCode(){const s=String((S.user&&(S.user.id||S.user.email))||'demo');let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return 'MAADOO-'+h.toString(16).toUpperCase().padStart(6,'0').slice(-6)}
const myCode=()=>S.prem.inviteCode||(S.user?demoCode():null);
function seasonal(){const m=promoMonth();
 if(m<=3)return {ic:'🎓',h:['เทอมฝึกงานมาแล้ว!','Internship season is here!'],p:['Plus เทอมฝึกงาน 3 เดือน เพียง 249 บาท','Plus for a 3-month internship term, only 249 THB'],b:['ดู Plus เทอมฝึกงาน','See the internship plan'],act:'plan-t'};
 if(m===4)return {ic:'💦',h:['สงกรานต์นี้ เย็นสบายกับธีมพิเศษ','Cool off this Songkran with a special theme'],p:['ธีมสงกรานต์กำลังมา ระหว่างนี้ลองธีมทะเลก่อนนะ','A Songkran theme is coming. Try the Ocean theme meanwhile'],b:['ลองธีมทะเล','Try the Ocean theme'],act:'theme-sea'};
 if(m===7||m===8)return {ic:'⚡',h:['เปิดเทอม หางานพาร์ทไทม์','New semester, new part-time jobs'],p:['งานใกล้มหาลัย สมัคร 1 แตะ นายจ้างห้ามเก็บเงินผู้สมัคร','Jobs near campus, one-tap apply, employers never charge you'],b:['ดูงานด่วน','See quick jobs'],act:'pt'};
 if(m===11)return {ic:'🪷',h:['ลอยกระทง ลอยความกังวลเรื่องงาน','Loy Krathong: float your job worries away'],p:['ถามรุ่นพี่ตัวจริงได้เลย','Ask a real senior'],b:['ถามรุ่นพี่','Ask a mentor'],act:'ask'};
 if(m===12)return {ic:'🎁',h:['ส่งท้ายปี Plus รายปีลด 30%','Year-end: yearly Plus 30% off'],p:[`จาก 990 เหลือ ${planPrice('y')} บาท ถึงสิ้นเดือนนี้`,`From 990 to ${planPrice('y')} THB until the end of this month`],b:['รับส่วนลด','Get the deal'],act:'plan-y'};
 return {ic:'🪙',h:['ภารกิจสัปดาห์นี้ รับเหรียญฟรี','This week’s missions: free coins'],p:['เขียนรีวิว ตอบคำถามรุ่นน้อง ชวนเพื่อน แลกเป็นส่วนลด','Write reviews, help juniors, invite friends and turn coins into discounts'],b:['ดูภารกิจ','See missions'],act:'wallet'}}
const MONTHS=[['ม.ค.','Jan'],['ก.พ.','Feb'],['มี.ค.','Mar'],['เม.ย.','Apr'],['พ.ค.','May'],['มิ.ย.','Jun'],['ก.ค.','Jul'],['ส.ค.','Aug'],['ก.ย.','Sep'],['ต.ค.','Oct'],['พ.ย.','Nov'],['ธ.ค.','Dec']];
function pioneerInfo(){const p=S.pioneer;if(!p)return null;const left=Math.max(0,PIONEER_MAX-p.members);return {left,members:Math.min(p.members,PIONEER_MAX),me:p.sample?!!(S.user&&!S.user.anon):p.rank>0&&p.rank<=PIONEER_MAX,sample:!!p.sample}}
function promoSection(){if(S.promoHidden)return '';const se=seasonal(),pi=pioneerInfo(),rv=S.myReviews.length;
 const slides=[
  `<div class="pslide ps-review"><img class="ps-pup" src="${PUP()}" alt=""><div class="ps-b"><span class="ps-tag">✨ ${t('โปรเปิดตัว','Launch offer')}</span><h3>${t('รีวิวแรก แลก Plus ฟรี!','Your first review unlocks free Plus!')}</h3><p>${t(`เขียนครบ 3 รีวิว รับ Plus ฟรี 1 เดือน · ตอนนี้ ${Math.min(rv,3)}/3`,`Write 3 reviews for 1 free month of Plus · now ${Math.min(rv,3)}/3`)}</p><button class="btn ps-btn" data-go="write">${t('เขียนรีวิวเลย','Write a review')}</button></div></div>`,
  `<div class="pslide ps-pioneer"><span class="ps-ic">🚩</span><div class="ps-b"><span class="ps-tag">${t('1,000 คนแรก','First 1,000')}</span><h3>${t('ป้ายผู้บุกเบิก ติดโปรไฟล์ถาวร','A permanent Pioneer badge')}</h3><p>${pi?t(`เหลืออีก ${fmt(pi.left)} ที่`,`${fmt(pi.left)} spots left`):t('สำหรับสมาชิก 1,000 คนแรก','For our first 1,000 members')}</p><button class="btn ps-btn" data-pgo="pioneer">${t('ดูรายละเอียด','Details')}</button></div></div>`,
  `<div class="pslide ps-invite"><span class="ps-ic">🤝</span><div class="ps-b"><span class="ps-tag">${t('ชวนเพื่อน','Invite friends')}</span><h3>${t('ชวนเพื่อน ได้คนละ 50 เหรียญ','Invite a friend, you both get 50 coins')}</h3><p>${t('เมื่อเพื่อนสมัครด้วยโค้ดของคุณแล้วเขียนรีวิวแรก','When they sign up with your code and write their first review')}</p><button class="btn ps-btn" data-pgo="invite">${t('ดูโค้ดของฉัน','See my code')}</button></div></div>`,
  `<div class="pslide ps-season"><span class="ps-ic">${se.ic}</span><div class="ps-b"><span class="ps-tag">${t('โปรตามฤดูกาล','Seasonal')} · ${x(MONTHS[promoMonth()-1])}</span><h3>${x(se.h)}</h3><p>${x(se.p)}</p><button class="btn ps-btn" data-season="${se.act}">${x(se.b)}</button></div></div>`];
 if(obNewDay())return `<section class="sec promo-wrap promo-solo" aria-label="${t('โปรโมชัน','Promotions')}">${slides[0]}</section>`;
 const code=myCode();
 return `<section class="sec promo-wrap" aria-label="${t('โปรโมชัน','Promotions')}"><div class="promo-top"><b>🎉 ${t('โปรโมชัน','Promotions')}</b><button class="x sm" data-promohide aria-label="${t('ซ่อนโปรโมชัน 7 วัน','Hide promotions for 7 days')}" title="${t('ซ่อน 7 วัน','Hide for 7 days')}">×</button></div>
 <div class="promo" id="promo" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${t('แบนเนอร์โปรโมชัน','Promotion banners')}">${slides.map((sl,i)=>`<div class="pcell" role="group" aria-roledescription="slide" aria-label="${i+1} / ${slides.length}">${sl}</div>`).join('')}</div>
 <div class="pdots">${slides.map((_,i)=>`<button class="pdot ${i===S.promoIdx?'on':''}" data-pdot="${i}" aria-label="${t(`แบนเนอร์ที่ ${i+1}`,`Banner ${i+1}`)}" aria-current="${i===S.promoIdx}"></button>`).join('')}</div>
 <div class="promo-cards">
  ${pioneerCard(pi)}
  ${inviteCard(code)}
 </div></section>`}
function pioneerCard(pi){return `<div class="card pcard" id="pioneerCard"><div class="row" style="gap:10px;flex-wrap:nowrap"><span class="pc-ic">🚩</span><div style="min-width:0"><b>${t('ป้ายผู้บุกเบิก ถาวร','Permanent Pioneer badge')}</b><div class="muted" style="font-size:13px">${t('สำหรับสมาชิก 1,000 คนแรก','For the first 1,000 members')}</div></div>${pi&&pi.me?`<span class="chip ver" style="margin-left:auto">✓ ${t('คุณได้แล้ว','Yours')}</span>`:''}</div>
   <div class="bar"><i style="width:${pi?pi.members/PIONEER_MAX*100:0}%"></i></div>
   <div class="muted" style="font-size:13px">${pi?t(`สมาชิกแล้ว ${fmt(pi.members)}/1,000 · <b>เหลืออีก ${fmt(pi.left)} ที่</b>`,`${fmt(pi.members)}/1,000 joined · <b>${fmt(pi.left)} spots left</b>`)+(pi.sample?` · ${t('ตัวเลขตัวอย่าง','sample figure')}`:''):t('กำลังโหลด…','Loading…')}</div>
   ${S.user?'':`<button class="btn y sm" data-login style="justify-self:start">${t('สมัครรับป้าย','Join to get it')}</button>`}</div>`}
function inviteCard(code,full){return `<div class="card pcard" id="inviteCard"><div class="row" style="gap:10px;flex-wrap:nowrap"><span class="pc-ic">🤝</span><div style="min-width:0"><b>${t('ชวนเพื่อน ได้คนละ 50 เหรียญ','Invite friends: 50 coins each')}</b><div class="muted" style="font-size:13px">${t('เพื่อนสมัครด้วยโค้ดแล้วเขียนรีวิวแรก','When a friend joins with your code and writes a first review')}</div></div></div>
   ${code?`<div class="icode"><code>${esc(code)}</code><button class="btn sm" data-share>${t('แชร์','Share')}</button></div>${full?`<button class="link" data-copycode style="justify-self:start">📋 ${t('คัดลอกเฉพาะโค้ด','Copy the code only')}</button>`:`<button class="link" data-go="invite" style="justify-self:start">${t('ดูหน้าชวนเพื่อนของฉัน','Open my invite page')} →</button>`}`:`<button class="btn y sm" data-login style="justify-self:start">${t('เข้าสู่ระบบเพื่อรับโค้ด','Log in to get your code')}</button>`}
   ${S.user&&!S.prem.referredBy?`<form id="refForm" class="row ref-form"><input class="field" id="refIn" maxlength="14" autocomplete="off" placeholder="${t('มีโค้ดจากเพื่อน? MAADOO-…','Got a friend’s code? MAADOO-…')}" value="${esc(S.refCode||'')}" aria-label="${t('โค้ดจากเพื่อน','Friend’s code')}"><button class="btn ghost sm">${t('ใช้โค้ด','Apply')}</button></form>`:S.prem.referredBy?`<span class="chip ver" style="justify-self:start">✓ ${t('ใช้โค้ดเพื่อนแล้ว','Friend’s code applied')}</span>`:''}</div>`}
function invitePage(){const code=myCode(),pi=pioneerInfo(),mine=['referral:me',S.user?'referral:'+S.user.id:''];
 const refs=S.user?S.prem.ledger.filter(l=>l.kind==='referral'&&l.status==='ok'):[],coins=refs.reduce((a,l)=>a+l.delta,0),friends=refs.filter(l=>!mine.includes(l.ref)).length;
 const steps=[['🔗',['แชร์โค้ดหรือลิงก์ให้เพื่อน','Share your code or link'],['ส่งทางแชต โซเชียล หรือให้เพื่อนพิมพ์โค้ดเอง','Send it in a chat or on social, or let them type the code']],['✍️',['เพื่อนสมัครแล้วใส่โค้ด','Your friend joins with the code'],['จากนั้นเขียนรีวิวบริษัทแรก','then writes their first company review']],['🪙',['ได้คนละ 50 เหรียญ','You both get 50 coins'],['ครั้งเดียวต่อเพื่อน 1 คน ชวนได้ไม่จำกัด','Once per friend, invite as many as you like']]];
 return `<div class="inv-page"><section class="inv-head"><span class="chip" style="justify-self:start">🎉 ${t('โปรโมชัน','Promotions')}</span><h1>${t('ชวนเพื่อน & ผู้บุกเบิก','Invite friends & Pioneers')}</h1><p class="muted">${t('โค้ดชวนเพื่อนของคุณอยู่ที่นี่เสมอ แม้จะซ่อนแบนเนอร์บนหน้าแรกไว้','Your invite code always lives here, even when the home banners are hidden.')}</p></section>
 <section class="sec">${inviteCard(code,true)}</section>
 ${S.user?`<section class="sec"><div class="inv-stats"><div class="card"><b>${fmt(friends)}</b><span class="muted">${t('เพื่อนที่ชวนสำเร็จ','Friends who joined')}</span></div><div class="card"><b>🪙 ${fmt(coins)}</b><span class="muted">${t('เหรียญจากการชวนเพื่อน','Coins from invites')}</span></div></div></section>`:''}
 <section class="sec"><div class="sec-h"><h2>${t('ทำงานยังไง','How it works')}</h2></div><ol class="inv-steps">${steps.map((st,i)=>`<li class="card"><span class="inv-n">${i+1}</span><span class="pc-ic">${st[0]}</span><b>${x(st[1])}</b><span class="muted">${x(st[2])}</span></li>`).join('')}</ol>
  <p class="demo-note">${t('ใช้โค้ดของตัวเองไม่ได้ · บัญชีชั่วคราวต้องผูกอีเมลก่อน · เหรียญแลกเป็นเงินสดไม่ได้','You can’t use your own code · guest accounts need an email first · coins can’t be exchanged for cash')}</p></section>
 <section class="sec"><div class="sec-h"><h2>${t('ป้ายผู้บุกเบิก','Pioneer badge')}</h2></div>${pioneerCard(pi)}</section>
 ${S.promoHidden?`<section class="sec"><div class="card inv-hid"><span>🙈 ${t('แบนเนอร์โปรโมชันบนหน้าแรกถูกซ่อนไว้ 7 วัน','The home promotion banners are hidden for 7 days')}</span><button class="btn ghost sm" data-promoshow>${t('แสดงอีกครั้ง','Show again')}</button></div></section>`:''}
 </div>`}
function bindPromo(){const el=$('#promo');if(!el)return;const n=el.children.length;el.scrollLeft=S.promoIdx*el.clientWidth;
 let tm=0;el.addEventListener('scroll',()=>{clearTimeout(tm);tm=setTimeout(()=>{const i=Math.round(el.scrollLeft/Math.max(1,el.clientWidth));if(i!==S.promoIdx){S.promoIdx=Math.max(0,Math.min(n-1,i));document.querySelectorAll('.pdot').forEach((d,k)=>{d.classList.toggle('on',k===S.promoIdx);d.setAttribute('aria-current',k===S.promoIdx)})}},60)},{passive:true});
 el.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();promoGo(S.promoIdx+(e.key==='ArrowRight'?1:-1))}})}
function promoGo(i){const el=$('#promo');if(!el)return;const n=el.children.length;S.promoIdx=(i+n)%n;el.scrollTo({left:S.promoIdx*el.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});document.querySelectorAll('.pdot').forEach((d,k)=>{d.classList.toggle('on',k===S.promoIdx);d.setAttribute('aria-current',k===S.promoIdx)})}
async function shareInvite(){const code=myCode();if(!code)return;const url=location.origin+location.pathname+'?ref='+encodeURIComponent(code);let ok=false;
 try{if(navigator.share){await navigator.share({title:'Maadoo Job',text:t(`ใช้โค้ด ${code} สมัครมาดูจ็อบ แล้วเขียนรีวิวแรก รับ 50 เหรียญทั้งคู่`,`Use code ${code} to join Maadoo Job and write your first review. We both get 50 coins`),url});ok=true}}catch(e){if(e&&e.name==='AbortError')return}
 if(!ok){try{await navigator.clipboard.writeText(url);ok=true}catch(e){}}
 if(S.user)S.prem.invites.push(Date.now());render();toast(ok?t('คัดลอกลิงก์ชวนเพื่อนแล้ว','Invite link copied'):t('ลิงก์ชวนเพื่อน: ','Invite link: ')+url)}
async function applyRef(code){code=String(code||'').trim().toUpperCase();if(!/^MAADOO-[A-Z0-9]{4,8}$/.test(code)){toast(t('รูปแบบโค้ดไม่ถูกต้อง เช่น MAADOO-1A2B3C','That code doesn’t look right, e.g. MAADOO-1A2B3C'));return false}
 if(code===myCode()){toast(t('ใช้โค้ดของตัวเองไม่ได้นะ','You can’t use your own code'));return false}
 if(sbLive()){try{const {error}=await SB.rpc('use_invite_code',{code});if(error)throw error}catch(e){const m=String(e&&e.message||'');toast(/invalid code/.test(m)?t('ไม่พบโค้ดนี้','We couldn’t find that code'):/own code/.test(m)?t('ใช้โค้ดของตัวเองไม่ได้นะ','You can’t use your own code'):premErr(e));return false}
  S.prem.referredBy=code}else S.prem.referredBy=code;
 S.refCode=null;render();toast(t('ใช้โค้ดเพื่อนแล้ว! เขียนรีวิวแรกเพื่อรับ 50 เหรียญทั้งคู่','Code applied! Write your first review and you both get 50 coins'));claimReferral();return true}
async function claimReferral(){if(!S.user||!S.prem.referredBy||!S.myReviews.length)return;
 if(sbLive()){try{const {data,error}=await SB.rpc('claim_referral_reward');if(error)throw error;if(data>0){await refreshAll();render();toast(t('+50 เหรียญจากการชวนเพื่อน 🎉','+50 coins from your invite 🎉'))}}catch(e){console.warn('[Maadoo Job] referral reward:',e&&(e.message||e))}return}
 const ref='referral:me';if(claimed(ref))return;S.prem.ledger.unshift({id:'l-ref',delta:50,kind:'referral',ref,status:'ok',at:Date.now()});S.prem.coins+=50;render();toast(t('+50 เหรียญจากการชวนเพื่อน 🎉','+50 coins from your invite 🎉'))}
async function loadPromoStats(){
 if(SB){try{const [a,b]=await Promise.all([SB.rpc('pioneer_stats'),SB.rpc('early_bird_left')]);
   if(!a.error&&a.data)S.pioneer={members:+a.data.members||0,rank:+a.data.rank||0};if(!b.error&&b.data!=null)S.earlyLeft=+b.data}catch(e){}}
 if(!S.pioneer)S.pioneer={members:236,rank:0,sample:true};
 if(S.earlyLeft==null)S.earlyLeft=Math.max(0,EARLY_MAX-12-S.empLocal);
 if(['home','employer','me'].includes(S.view))rerender()}
async function afterLoginPromo(){await loadPromoStats();if(S.refCode&&sbLive()&&!S.prem.referredBy)await applyRef(S.refCode);else claimReferral()}
/* employer sign-ups (demo payment for Pro) */
const EMP={Starter:{plan:'starter',price:0},Pro:{plan:'pro',price:3900,early:1950},Enterprise:{plan:'enterprise',price:15000}};
const proPrice=()=>S.earlyLeft>0?EMP.Pro.early:EMP.Pro.price;
async function saveEmp(company,tier){const e=EMP[tier];
 if(sbLive()){const {error}=await SB.from('employer_signups').insert({company,plan:e.plan});if(error)throw error;const r=await SB.rpc('early_bird_left');if(!r.error&&r.data!=null)S.earlyLeft=+r.data}
 else if(e.plan==='pro'&&S.earlyLeft>0){S.empLocal++;S.earlyLeft--}}
const LEVELS=[[0,['มือใหม่','Newbie']],[100,['รุ่นพี่','Senior']],[300,['ผู้เชี่ยวชาญ','Expert']]];
function me(){
 if(!S.user)return `<div class="card" style="max-width:520px;margin:24px auto 0;display:grid;gap:14px;justify-items:center;text-align:center;padding:28px"><img src="${PUP()}" alt="" style="width:110px;height:110px;border-radius:50%"><h1 style="font-size:24px">${t('เข้าสู่ระบบเพื่อใช้ Maadoo เต็ม ๆ','Log in to get the most out of Maadoo')}</h1>
  <ul style="text-align:left;margin:0;padding-left:20px;display:grid;gap:4px;color:var(--ink-2)"><li>${t('เก็บแต้ม เลื่อนระดับ และสะสมเหรียญ','Earn points, level up and collect badges')}</li><li>${t('ติดตามบริษัทและบันทึกงานที่สนใจ','Follow companies and save jobs')}</li><li>${t('สมัครงานและจองเวลาคุยกับรุ่นพี่','Apply to jobs and book mentors')}</li><li>${t('ยืนยันตัวตนด้วยอีเมลมหาลัย/บริษัท รับป้าย ✓','Verify with a university or work email for the ✓ badge')}</li></ul>
  <button class="btn y" data-login>${t('เข้าสู่ระบบ / สมัครสมาชิก','Log in / Sign up')}</button></div>`;
 const u=S.user;const lv=LEVELS.filter(l=>u.points>=l[0]).pop();const nx=LEVELS.find(l=>l[0]>u.points);
 const prog=nx?Math.round((u.points-lv[0])/(nx[0]-lv[0])*100):100;
 const B=[['🐣',['สมาชิกใหม่','New member'],true],['✍️',['นักรีวิวมือใหม่','First review'],S.myReviews.length>0],['🙋',['นักถาม','Curious mind'],S.asked>0],['💼',['ผู้สมัครงาน','Job seeker'],Object.keys(S.applied).length>0],['✨',['สมาชิก Plus','Plus member'],isPlus()],['🚩',['ผู้บุกเบิก','Pioneer'],!!(pioneerInfo()&&pioneerInfo().me)]];
 const followed=CO.filter(c=>S.follow[c.id]),saved=JOBS.filter(j=>S.saved[j.id]),applied=JOBS.filter(j=>S.applied[j.id]);
 const sec=(h,body,empty)=>`<section class="sec"><div class="sec-h"><h2>${h}</h2></div>${body||`<p class="muted">${empty}</p>`}</section>`;
 return `<div class="me-head"><span class="me-ava">${esc(u.name.slice(0,1).toUpperCase())}</span><div><h1 style="font-size:26px">${esc(u.name)}</h1><div class="row" style="gap:6px">${u.anon?`<span class="chip">⏳ ${t('บัญชีชั่วคราว','Guest account')}</span>`:`<span class="muted">${esc(u.email)}</span>${u.verified?`<span class="chip ver">✓ ${t('ยืนยันแล้ว','Verified')}</span>`:`<span class="chip">${t('ยังไม่ยืนยัน','Not verified')}</span>`}`}${isPlus()?'<span class="chip plus-chip">✨ Plus</span>':''}</div></div>
  <div class="lvl card"><div class="row"><b style="font-family:var(--display);color:var(--navy)">${t('ระดับ','Level')}: ${x(lv[1])}</b><span class="muted" style="margin-left:auto">${u.points} ${t('แต้ม','pts')}</span></div><div class="progress"><i style="width:${prog}%"></i></div><span class="muted">${nx?t(`อีก ${nx[0]-u.points} แต้มถึงระดับ “${nx[1][0]}”`,`${nx[0]-u.points} pts to “${nx[1][1]}”`):t('ระดับสูงสุดแล้ว 🎉','Top level 🎉')}</span></div></div>
 ${mentorCta()}
 ${myLiveCalls()}
 ${u.anon?`<section class="sec"><div class="card" style="display:grid;gap:10px"><b>${t('บัญชีนี้เป็นแบบชั่วคราว','This is a guest account')}</b><p class="muted" style="margin:0">${t('ถ้าออกจากระบบหรือล้างข้อมูลเบราว์เซอร์ บัญชีนี้จะหายไป และยังเขียนรีวิวไม่ได้ ผูกอีเมลไว้เพื่อเก็บบัญชีและเริ่มเขียนรีวิว','Logging out or clearing browser data loses this account, and guests can’t write reviews. Add an email to keep it and start reviewing.')}</p><button class="btn y" data-linkacct style="justify-self:start">${t('เก็บบัญชีไว้ด้วยอีเมล','Keep this account with email')}</button></div></section>`:''}
 <section class="sec"><div class="sec-h"><h2>${t('ป้ายของฉัน','My badges')}</h2></div><div class="badges">${B.map(b=>`<div class="bdg ${b[2]?'':'off'}"><span>${b[0]}</span>${x(b[1])}</div>`).join('')}</div></section>
 <section class="sec prem-row">${coinCard(true)}${isPlus()?`<div class="plus-mini"><b>✨ Maadoo Plus</b><span>${t(`เป็นสมาชิกถึง ${fmtDate(S.prem.plusUntil)}`,`Member until ${fmtDate(S.prem.plusUntil)}`)}</span><span class="muted">${t(`ถามรุ่นพี่ฟรีเหลือ ${qLeft()}/${Q_MAX}`,`${qLeft()}/${Q_MAX} free questions left`)}</span><button class="btn ghost sm" data-go="plus">${t('ดูสิทธิ์','See perks')}</button></div>`:plusBanner()}</section>
 <section class="sec"><button class="card inv-link" data-go="invite"><span class="pc-ic">🤝</span><span class="inv-lt"><b>${t('ชวนเพื่อน ได้คนละ 50 เหรียญ','Invite friends: 50 coins each')}</b><span class="muted">${u.anon?t('ผูกอีเมลเพื่อรับโค้ดของคุณ','Add an email to get your code'):t(`โค้ดของฉัน ${esc(myCode()||'')}`,`My code ${esc(myCode()||'')}`)}</span></span><span aria-hidden="true">→</span></button></section>
 ${sec(t('⚡ งานพาร์ทไทม์ที่สมัคร','⚡ Part-time applications'),Object.keys(S.ptApps).length?`<div class="list">${Object.keys(S.ptApps).map(id=>{const p=PT.find(v=>v.id===id);const a=S.ptApps[id];return `<div class="li"><span class="dot" style="background:${PT_ST[a.st][3]}"></span><div><b>${esc(x(p.title))}</b><div class="muted">${x(ptOrg(p).name)} · ${PT_ST[a.st][0]} ${t(PT_ST[a.st][1],PT_ST[a.st][2])}</div></div>${a.st===2?`<button class="btn y grow" data-ptrate="${id}">${t('จบงานแล้ว · ให้คะแนน','Done · rate employer')}</button>`:`<button class="btn ghost grow" data-pt="${id}">${t('ดู','View')}</button>`}</div>`}).join('')}</div>`:'',t('ยังไม่ได้สมัครงานพาร์ทไทม์ ลองดูแท็บ “⚡ งานด่วน” ในหน้างาน','No part-time applications yet. Try “⚡ Quick part-time” in Jobs.'))}
 ${sec(t('งานที่สมัคร','Applications'),applied.length?`<div class="list">${applied.map(j=>`<div class="li"><b>${x(j.title)}</b><span class="muted">${x(getCo(j.co).name)}</span><span class="chip mid grow">${t('รอบริษัทตอบกลับ','Awaiting reply')}</span></div>`).join('')}</div>`:'',t('ยังไม่ได้สมัครงาน ลองดูหน้า “งาน”','No applications yet. Try the Jobs tab.'))}
 ${S.prem.qs.length||isPlus()?sec(t('คำถามของฉัน','My questions'),myQuestions(),t('ยังไม่ได้ถามรุ่นพี่ กด “ถามฟรี” บนการ์ดรุ่นพี่ได้เลย','No questions yet. Tap “Ask free” on a mentor card.')):''}
 ${sec(t('การปรึกษาของฉัน','My mentor sessions'),S.booked.length?`<div class="list">${S.booked.map(bookingRow).join('')}</div><p class="demo-note">${t('เดโม: ยังไม่มีวิดีโอคอลจริง กด “จำลองว่าปรึกษาเสร็จแล้ว” เพื่อลองรีวิวรุ่นพี่','Demo: there’s no real video call yet. Tap “Mark as done (demo)” to try reviewing a mentor.')}</p>`:'',t('ยังไม่มีนัด ลองปัดหารุ่นพี่ในหน้า “ปรึกษา”','No sessions yet. Swipe for a mentor on the “Ask” page.'))}
 ${sec(t('งานที่บันทึกไว้','Saved jobs'),saved.length?`<div class="grid g2">${saved.map(jobCard).join('')}</div>`:'',t('กด ♡ ที่ประกาศงานเพื่อบันทึก','Tap ♡ on a job to save it'))}
 ${sec(t('บริษัทที่ติดตาม','Following'),followed.length?`<div class="grid g3">${followed.map(coCard).join('')}</div>`:'',t('ยังไม่ได้ติดตามบริษัทไหน','Not following any companies yet'))}
 ${sec(t('รีวิวของฉัน','My reviews'),S.myReviews.length?`<div class="list">${S.myReviews.map(r=>`<div class="li"><b>${x(getCo(r.co).name)}</b><span class="stars">${stars(r.r)}</span>${r.status==='approved'?`<span class="chip ver grow">✓ ${t('เผยแพร่แล้ว','Published')}</span>`:`<span class="chip mid grow">${t('รอตรวจ','In review')}</span>`}${canDelete(r.id)?`<button class="del-rv" data-delrev="${esc(r.id)}">🗑️ ${t('ลบ','Delete')}</button>`:''}</div>`).join('')}</div>`:'',t('ยังไม่มีรีวิว เขียนรีวิวแรกรับ 50 แต้ม','No reviews yet. Your first one earns 50 pts.'))}
 <section class="sec row"><button class="btn ghost" data-logout>${t('ออกจากระบบ','Log out')}</button><button class="link" data-go="rules">${t('แนวทางรีวิวและความเป็นส่วนตัว','Review guidelines & privacy')}</button></section>`;
}
function employer(){
 const days=[['จ','Mon',320],['อ','Tue',410],['พ','Wed',380],['พฤ','Thu',520],['ศ','Fri',610],['ส','Sat',290],['อา','Sun',700]];const mx=700;const left=S.earlyLeft,eb=left==null||left>0;
 return `<div class="eb-bar">🚀 <span>${t('<b>50 บริษัทแรก:</b> Pro ลด 50% นาน 3 เดือน + ประกาศงานฟรี 3 เดือน','<b>First 50 companies:</b> Pro 50% off for 3 months + 3 months of free job posts')}</span><span class="eb-left">${left==null?'…':left>0?t(`เหลือ ${fmt(left)} สิทธิ์`,`${fmt(left)} spots left`):t('สิทธิ์เต็มแล้ว','All spots taken')}</span></div>
 <section class="hero" style="grid-template-columns:1fr"><div class="hero-txt"><span class="chip" style="justify-self:start">${t('สำหรับบริษัท','For employers')}</span>
  <h1>${t('ให้คนเก่ง <em>มาดู</em> บริษัทคุณ','Let great people <em>see</em> your company')}</h1>
  <p>${t('ตอบรีวิว เล่าเรื่องวัฒนธรรมองค์กร และลงประกาศงานในที่ที่นักศึกษาและคนจบใหม่ตัดสินใจเลือกที่ทำงาน','Respond to reviews, show your culture and post jobs where students and new grads decide where to work.')}</p>
  <div class="stats"><div><b>48,000+</b><span>${t('ผู้ใช้ต่อเดือน','monthly users')}</span></div><div><b>72%</b><span>${t('อายุ 20–27 ปี','aged 20–27')}</span></div><div><b>3.4×</b><span>${t('ใบสมัครเมื่อตอบรีวิว','more applicants when you reply')}</span></div></div>
  <p class="muted" style="color:var(--ink-3)">${t('* ตัวเลขตัวอย่างสำหรับเดโม','* Sample figures for the demo')}</p></div></section>
 <div class="promise cream sec"><span style="font-size:24px">🛡️</span><div><b>${t('ทุกแพ็กเกจตอบรีวิวได้ แต่ลบหรือซ่อนรีวิวไม่ได้','Every plan can reply to reviews, but none can delete or hide them')}</b><p>${t('ไม่มีแพ็กเกจไหนซื้อสิทธิ์ลบ ซ่อน หรือแก้รีวิวได้ บริษัททำได้แค่ตอบกลับอย่างสุภาพ รีวิวถูกลบเมื่อผิดแนวทางเท่านั้น','No plan can buy the right to delete, hide or edit reviews. Companies can only reply publicly. Reviews are removed only when they break the guidelines.')}</p></div></div>
 <section class="sec"><div class="sec-h"><h2>${t('แพ็กเกจ','Plans')}</h2><span class="muted">${t('ราคาต่อเดือน ไม่รวม VAT','Monthly, excl. VAT')}</span></div>
 <div class="price-grid">
  <div class="tier"><h3>Starter</h3><div class="amt">${t('ฟรี','Free')}</div><ul><li>${t('ยืนยันเป็นเจ้าของหน้าบริษัท','Claim your company page')}</li><li>${t('ตอบรีวิวได้ 5 ครั้ง/เดือน','Reply to 5 reviews/month')}</li><li>${t('สถิติผู้เข้าชมพื้นฐาน','Basic visitor stats')}</li><li class="no">${t('แต่งหน้าบริษัท','Branded page')}</li></ul><button class="btn ghost" data-emp="Starter">${t('เริ่มใช้ฟรี','Start free')}</button></div>
  <div class="tier hot pro"><span class="pop">⭐ ${t('ยอดนิยม','Most popular')}</span><h3>Pro</h3><div class="amt">${eb?`<s class="was">3,900</s> 1,950`:'3,900'} <span class="muted" style="font-size:14px;font-family:var(--body);font-weight:400">${t('บาท/เดือน','THB/mo')}</span></div>${eb?`<div class="eb-note">${t('ราคานี้ 3 เดือนแรก สำหรับ 50 บริษัทแรก','For the first 3 months, first 50 companies')}</div>`:''}<ul><li>${t('ตอบรีวิวไม่จำกัด','Unlimited review replies')}</li><li>${t('แต่งหน้าบริษัท รูปออฟฟิศ วิดีโอ','Branded page with photos and video')}</li><li>${eb?t('ประกาศงานฟรี 3 เดือน','3 months of free job posts'):t('ประกาศงานฟรี 3 ตำแหน่ง','3 free job posts')}</li><li>${t('แดชบอร์ดผู้สมัครและผู้ติดตาม','Applicant & follower dashboard')}</li></ul><button class="btn orange" data-emp="Pro">${t('สมัคร Pro','Get Pro')}</button></div>
  <div class="tier"><h3>Enterprise</h3><div class="amt"><span class="muted" style="font-size:14px;font-family:var(--body);font-weight:400">${t('เริ่ม','from')}</span> 15,000 <span class="muted" style="font-size:14px;font-family:var(--body);font-weight:400">${t('บาท/เดือน','THB/mo')}</span></div><ul><li>${t('ทุกอย่างใน Pro','Everything in Pro')}</li><li>${t('ประกาศงานไม่จำกัด','Unlimited job posts')}</li><li>${t('รายงานเงินเดือนตามตลาดรายไตรมาส','Quarterly market salary reports')}</li><li>${t('บูธใน Maadoo Job Fair','Booth at the Maadoo Job Fair')}</li></ul><button class="btn ghost" data-emp="Enterprise">${t('ติดต่อทีมขาย','Talk to sales')}</button></div>
 </div></section>
 <section class="sec"><div class="sec-h"><h2>${t('บริการเสริม','Add-ons')}</h2></div><div class="list">
  ${[[t('ประกาศงาน / ฝึกงาน','Job / internship post'),t('1,500 บาท / 30 วัน','1,500 THB / 30 days')],[t('โปรโมตประกาศขึ้นอันดับต้น (ติดป้าย “โฆษณา”)','Promoted listing (labeled “Sponsored”)'),t('490 บาท / สัปดาห์','490 THB / week')],[t('รายงานเงินเดือนตามตำแหน่ง','Salary report by role'),t('4,900 บาท / ฉบับ','4,900 THB / report')],[t('สปอนเซอร์ควิซหรือบทความแนะแนว','Sponsor a quiz or career article'),t('เริ่ม 9,000 บาท','From 9,000 THB')]].map(a=>`<div class="li"><span>${a[0]}</span><b class="grow" style="color:var(--navy)">${a[1]}</b></div>`).join('')}</div></section>
 <section class="sec"><div class="sec-h"><h2>${t('ตัวอย่างแดชบอร์ดบริษัท','Employer dashboard preview')}</h2><span class="muted">${t('ไบโอเฟรช ฟู้ดส์ · 7 วันล่าสุด','BioFresh Foods · last 7 days')}</span></div>
 <div class="card dash"><div class="kpis"><div class="kpi"><b>3,230</b><span>${t('ผู้เข้าชมหน้าบริษัท','page views')}</span> <em>+18%</em></div><div class="kpi"><b>214</b><span>${t('ผู้ติดตามใหม่','new followers')}</span> <em>+9%</em></div><div class="kpi"><b>47</b><span>${t('ผู้สมัครงาน','applicants')}</span> <em>+32%</em></div><div class="kpi"><b>4.1</b><span>${t('คะแนนเฉลี่ย','avg. rating')}</span> <em>+0.1</em></div></div>
 <div><span class="muted">${t('ผู้เข้าชมรายวัน','Daily views')}</span><div class="bars">${days.map(d=>`<div><small>${d[2]}</small><i style="height:${d[2]/mx*80}%"></i><span>${S.lang==='en'?d[1]:d[0]}</span></div>`).join('')}</div></div></div></section>`;
}
