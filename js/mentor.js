/* Maadoo Job · js/mentor.js — mentor reviews, real mentors (apply, admin, chat), live-call booking + room. Classic script sharing one global scope; see CLAUDE.md for load order. */
/* ---------- mentor sessions & reviews ---------- */
const findRev=id=>{for(const k in S.mdb){const r=S.mdb[k].find(v=>v.id===id);if(r)return r}return null};
function bookingRow(b){const r=b.rid&&findRev(b.rid),when=b.slot!=null?x(SLOTS[b.slot]):b.at?quarterDate(b.at):'';
 const st=r?`<span class="chip ver">✓ ${t('รีวิวแล้ว','Reviewed')} · ★${r.s}</span>`:b.st==='done'?`<span class="chip good">${t('เสร็จแล้ว','Done')}</span>`:`<span class="chip mid">${t('รอปรึกษา','Upcoming')}</span>`;
 const act=r?`<button class="btn ghost sm" data-mrevedit="${b.id}">${t('แก้ไข','Edit')}</button><button class="del-rv" data-mrevdel="${b.id}">🗑️ ${t('ลบ','Delete')}</button>`
  :b.st==='done'?`<button class="btn y sm" data-mrevopen="${b.id}">⭐ ${t('เขียนรีวิว','Write a review')}</button>`
  :`<button class="btn ghost sm" data-mdone="${b.id}">${t('จำลองว่าปรึกษาเสร็จแล้ว','Mark as done (demo)')}</button>`;
 return `<div class="li bk"><span class="ava" style="width:36px;height:36px;font-size:18px;background:${b.m.bg}">${b.m.ava}</span><div class="bk-t"><b>${x(b.m.name)}</b><span class="muted">${when}</span></div>${st}<div class="bk-a">${act}</div></div>`}
const quarterDate=ts=>{const d=new Date(ts);return d.toLocaleDateString(S.lang==='en'?'en-GB':'th-TH',{month:'short',year:'numeric'})};
function mrevsModal(m,head){const mt=MENTORS.find(v=>v.id===m.id),st=mStat(mt),rv=mRevs(mt),mx=Math.max(1,...st.dist);
 return head(`${t('รีวิว','Reviews for')} ${x(mt.name)}`,`${x(mt.role)} · ${x(mt.at)}`)+
 `<div class="mr-sum"><div class="mr-avg"><b>${st.n?st.avg.toFixed(1):'–'}</b>${starRow(st.avg)}<small>${st.n} ${t('รีวิว','reviews')}${st.n<3?` · ✨ ${t('รุ่นพี่ใหม่','New mentor')}`:''}</small></div>
  <div class="mr-dist">${st.dist.map((c,i)=>`<div class="mr-bar"><span>${5-i}★</span><i><em style="width:${c/mx*100}%"></em></i><small>${c}</small></div>`).join('')}</div></div>
 ${st.top.length?`<div class="row" style="gap:6px">${st.top.map(g=>`<span class="chip">${x(MTAGS[g])} · ${st.tc[g]}</span>`).join('')}</div>`:''}
 <div class="mr-list">${rv.map(r=>`<article class="mrv"><div class="row" style="gap:6px">${starRow(r.s,'sm')}<span class="chip ver">✓ ${r.live?t('คุยสดจริง','Live call'):t('ปรึกษาจริง','Real session')}</span>${r.mine?`<span class="chip mid">${t('รีวิวของคุณ','Your review')}</span>`:''}</div>
  ${r.c&&(Array.isArray(r.c)?r.c[0]:r.c)?`<p>${esc(x(r.c))}</p>`:''}${r.tags.length?`<div class="mr-tags">${r.tags.filter(g=>MTAGS[g]).map(g=>x(MTAGS[g])).join(' · ')}</div>`:''}
  <small class="muted">${r.who?x(r.who):t('ผู้ใช้มาดูจ็อบ','Maadoo Job member')} · ${r.d?x(r.d):quarterDate(r.at)}</small>
  ${r.reply?`<div class="reply"><b>💬 ${t(`คำตอบจาก${x(mt.name)}`,`Reply from ${x(mt.name)}`)}</b><span>${esc(x(r.reply))}</span></div>`:''}</article>`).join('')||`<p class="muted">${t('ยังไม่มีรีวิว','No reviews yet')}</p>`}</div>
 <p class="demo-note">${t('รีวิวมาจากคนที่ปรึกษาจริงเท่านั้น รุ่นพี่ตอบรีวิวได้ แต่ลบหรือซ่อนรีวิวไม่ได้','Reviews come only from real sessions. Mentors can reply but can’t delete or hide reviews.')}</p>
 <button class="btn y" data-book="${mt.id}">${t('จองเวลาคุย','Book a session')}</button>`}
const STAR_TXT=[['แตะดาวเพื่อให้คะแนน','Tap a star to rate'],['ควรปรับปรุง','Needs work'],['พอใช้','Fair'],['ดี','Good'],['ดีมาก','Very good'],['ยอดเยี่ยม','Excellent']];
function mreviewModal(m,head){const b=S.booked.find(v=>v.id===m.bid);const dis=m.busy?'disabled':'';
 return head(m.edit?t('แก้ไขรีวิว','Edit your review'):t('ปรึกษาเป็นยังไงบ้าง?','How was your session?'),`${x(b.m.name)} · ${x(b.m.role)}`)+
 `<div class="rstars-w"><div class="rstars" id="rstars" role="slider" tabindex="0" aria-label="${t('ให้คะแนนดาว','Star rating')}" aria-valuemin="1" aria-valuemax="5" aria-valuenow="${m.stars||0}" aria-valuetext="${m.stars?`${m.stars} ${t('ดาว','stars')} · ${x(STAR_TXT[m.stars])}`:x(STAR_TXT[0])}">${[1,2,3,4,5].map(i=>`<span class="rst ${m.stars>=i?'on':''}" data-rst="${i}">★</span>`).join('')}</div><div class="rst-lbl" id="rstLbl">${x(STAR_TXT[m.stars||0])}</div></div>
 <div><b style="font-size:14px">${t('เด่นเรื่องไหน (เลือกได้หลายอัน)','What stood out? (pick any)')}</b><div class="mtags">${Object.keys(MTAGS).map(g=>`<button type="button" class="mtag" data-mtag="${g}" aria-pressed="${m.tags.includes(g)}">${x(MTAGS[g])}</button>`).join('')}</div></div>
 <label class="grid" style="gap:4px"><b style="font-size:14px">${t('ความเห็นเพิ่มเติม (ไม่บังคับ)','Anything else? (optional)')}</b><textarea class="field" id="mcomment" maxlength="300" rows="3" placeholder="${t('เล่าสั้น ๆ ว่าได้อะไรจากการคุย','A line about what helped')}">${esc(m.comment||'')}</textarea><small class="muted" id="mcount" style="justify-self:end">${(m.comment||'').length}/300</small></label>
 ${authFormErr(m)}
 <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close ${dis}>${t('ไว้ทีหลัง','Later')}</button><button class="btn y" data-mrevsend ${dis}>${m.busy?t('กำลังส่ง…','Sending…'):m.edit?t('บันทึก','Save'):t('ส่งรีวิว','Send review')}</button></div>`}
function mrevdelModal(m,head){const dis=m.busy?'disabled':'';return head(t('ลบรีวิวนี้?','Delete this review?'),'')+`<p style="margin:0">${t('ลบแล้วกู้คืนไม่ได้ แต่เขียนรีวิวใหม่ให้การจองนี้ได้','This can’t be undone, but you can review this session again.')}</p>${authFormErr(m)}
 <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close ${dis}>${t('ยกเลิก','Cancel')}</button><button class="btn danger" data-mrevdelok ${dis}>${m.busy?t('กำลังลบ…','Deleting…'):t('ลบรีวิว','Delete review')}</button></div>`}
function setStars(v){const m=S.modal;if(!m||m.type!=='mreview')return;m.stars=Math.max(1,Math.min(5,v));m.err=null;const w=$('#rstars');if(!w)return;
 w.querySelectorAll('.rst').forEach(e=>e.classList.toggle('on',+e.dataset.rst<=m.stars));w.setAttribute('aria-valuenow',m.stars);w.setAttribute('aria-valuetext',`${m.stars} ${t('ดาว','stars')} · ${x(STAR_TXT[m.stars])}`);$('#rstLbl').textContent=x(STAR_TXT[m.stars]);const er=document.querySelector('.modal .form-err');if(er)er.remove()}
function bindStars(){const w=$('#rstars');if(!w)return;let down=false;const at=e=>{const r=w.getBoundingClientRect();return Math.ceil(Math.max(.01,Math.min(.999,(e.clientX-r.left)/r.width))*5)};
 w.addEventListener('pointerdown',e=>{down=true;try{w.setPointerCapture(e.pointerId)}catch(_){}setStars(at(e))});
 w.addEventListener('pointermove',e=>{if(down)setStars(at(e))});['pointerup','pointercancel'].forEach(ev=>w.addEventListener(ev,()=>{down=false}));
 w.addEventListener('keydown',e=>{const v=S.modal.stars||0,k=e.key;let n=null;if(k==='ArrowRight'||k==='ArrowUp')n=v+1;else if(k==='ArrowLeft'||k==='ArrowDown')n=v-1;else if(k==='Home')n=1;else if(k==='End')n=5;else if(/^[1-5]$/.test(k))n=+k;if(n!=null){e.preventDefault();setStars(n)}})}
function openMrev(bid){const b=S.booked.find(v=>v.id===bid);if(!b)return;const r=b.rid&&findRev(b.rid);
 openModal(r?{type:'mreview',bid,edit:r.id,stars:r.s,tags:r.tags.slice(),comment:typeof r.c==='string'?r.c:''}:{type:'mreview',bid,stars:0,tags:[],comment:''})}
function mrevSubmit(){const m=S.modal;if(!m||m.type!=='mreview'||m.busy)return;const c=$('#mcomment');if(c)m.comment=c.value.slice(0,300);
 if(!m.stars){m.err=['เลือกดาวก่อนส่งนะ','Pick a star rating first.'];renderModal();return}
 needLogin(()=>{if(SB&&S.user&&S.user.anon){S.after=()=>mrevSave(m);openModal({type:'link',why:'review'});return}mrevSave(m)})}
async function mrevSave(m){const b=S.booked.find(v=>v.id===m.bid);if(!b)return;const first=!m.edit;
 if(S.modal!==m){S.modal=m;}m.busy=true;m.err=null;renderModal();
 const tags=m.tags.filter(g=>MTAGS[g]),comment=(m.comment||'').trim().slice(0,300)||null;let id=m.edit||null,at=Date.now(),err=null;
 if(SB&&S.user&&S.user.id){try{
   const q=m.edit&&!String(m.edit).startsWith('local-')?SB.from('mentor_reviews').update({stars:m.stars,tags,comment}).eq('id',m.edit).select('id,created_at'):SB.from('mentor_reviews').insert({mentor_id:b.mid,booking_id:b.id,stars:m.stars,tags,comment}).select('id,created_at');
   const {data,error}=await q;if(error)err=error;else if(!data||!data.length)err={message:'no row'};else{id=data[0].id;at=Date.parse(data[0].created_at)||at}}catch(e){err=e}}
 else if(!id)id='local-'+b.id;
 m.busy=false;
 if(err){m.err=err.code==='23505'?['การจองนี้รีวิวไปแล้ว','You’ve already reviewed this session.']:err.status===429?['ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่','Too many tries. Wait a moment and try again.']:!err.status&&!err.code?['เชื่อมต่อไม่ได้ เช็กอินเทอร์เน็ตแล้วลองใหม่','Can’t connect. Check your internet and try again.']:['ส่งรีวิวไม่สำเร็จ ลองใหม่อีกครั้ง','Couldn’t send your review. Please try again.'];if(S.modal===m)renderModal();return}
 const list=S.mdb[b.mid]=(S.mdb[b.mid]||[]).filter(v=>v.id!==m.edit&&v.id!==id);const old=m.edit&&findRev(m.edit);
 list.push({id,s:m.stars,tags,c:comment||'',at:old&&old.at||at,reply:old&&old.reply||null,mine:true,real:true,live:!!(b.live||old&&old.live)});
 b.rid=id;b.st='done';if(S.modal===m)S.modal=null;if(first)addPoints(20);render();
 toast(first?t('ขอบคุณสำหรับรีวิว! +20 แต้ม','Thanks for your review! +20 pts'):t('บันทึกรีวิวแล้ว','Review saved'))}
async function mrevDelete(){const m=S.modal;if(!m||m.type!=='mrevdel'||m.busy)return;const b=S.booked.find(v=>v.id===m.bid);if(!b||!b.rid)return;const id=b.rid;
 m.busy=true;m.err=null;renderModal();let ok=true;
 if(SB&&S.user&&S.user.id&&!String(id).startsWith('local-')){try{const {data,error}=await SB.from('mentor_reviews').delete().eq('id',id).select('id');ok=!error&&data&&data.length>0}catch(e){ok=false}}
 m.busy=false;if(!ok){m.err=['ลบรีวิวไม่สำเร็จ ลองใหม่อีกครั้ง','Couldn’t delete the review. Please try again.'];if(S.modal===m)renderModal();return}
 for(const k in S.mdb)S.mdb[k]=S.mdb[k].filter(v=>v.id!==id);b.rid=null;if(S.modal===m)S.modal=null;render();toast(t('ลบรีวิวแล้ว','Review deleted'))}
async function loadMentorReviews(){if(!SB)return;if(RM.p)await RM.p;
 try{let {data,error}=await SB.from('mentor_reviews_public').select('id,mentor_id,stars,tags,comment,reply,created_at,live').order('created_at',{ascending:false}).limit(1000);if(error&&/live|42703|column/i.test(String(error.code)+' '+String(error.message)))({data,error}=await SB.from('mentor_reviews_public').select('id,mentor_id,stars,tags,comment,reply,created_at').order('created_at',{ascending:false}).limit(1000));if(error)throw error;
  const m={};(data||[]).forEach(r=>{if(!MENTORS.some(v=>v.id===r.mentor_id))return;(m[r.mentor_id]=m[r.mentor_id]||[]).push({id:r.id,s:Math.max(1,Math.min(5,r.stars|0)),tags:Array.isArray(r.tags)?r.tags:[],c:r.comment||'',at:Date.parse(r.created_at)||0,reply:r.reply||null,real:true,mine:false,live:!!r.live})});
  const local=[];for(const k in S.mdb)S.mdb[k].forEach(v=>{if(String(v.id).startsWith('local-'))local.push([k,v])});S.mdb=m;local.forEach(([k,v])=>(S.mdb[k]=S.mdb[k]||[]).push(v));
 }catch(e){console.warn('[Maadoo Job] could not load mentor reviews (mentor_reviews_public view):',e&&(e.message||e))}
 await loadMyMentorReviews();if(['ask','me'].includes(S.view)||(S.modal&&S.modal.type==='mrevs'))rerender()}
async function loadMyMentorReviews(){const uid=S.user&&S.user.id;if(!SB||!uid)return;
 try{const {data,error}=await SB.from('mentor_reviews').select('id,user_id,mentor_id,booking_id,created_at').eq('user_id',uid);if(error)throw error;
  (data||[]).filter(r=>r.user_id===uid).forEach(r=>{const rv=findRev(r.id);if(rv)rv.mine=true;const mt=MENTORS.find(v=>v.id===r.mentor_id);if(!mt)return;
   let b=S.booked.find(v=>v.id===r.booking_id);if(!b){b={id:r.booking_id,m:mt,mid:mt.id,slot:null,at:Date.parse(r.created_at)||Date.now(),st:'done',rid:null,db:true};S.booked.push(b)}b.rid=r.id;b.st='done'})}catch(e){}}
function forgetMine(){for(const k in S.mdb)S.mdb[k].forEach(v=>{v.mine=false});S.booked=S.booked.filter(b=>!b.db)}
/* ---------- real mentors, step 1: applications · admin · realtime chat · mentor inbox ---------- */
const RM={rows:[],loaded:false,p:null};
let chatCh=null,roomCh=null,roomChId=null,lastTyping=0;
const PRICE_MIN=99,PRICE_MAX=249,FILE_MAX=5*1024*1024,FILE_TYPES=['image/png','image/jpeg','image/webp','image/gif','application/pdf'],REPLY_H=48,PAYOUT=40;
const blankMform=()=>({nick:'',field:'',company:'',years:'',fac:'',topics:[],contact:'',price:149,bio:'',rules:false,age:false});
function resetChat(){unsubscribeChat();Object.assign(S,{mApp:null,isAdmin:false,myMentor:null,adminApps:[],adminReports:[],rooms:[],msgs:{},typing:{},chat:null,chatDraft:'',chatBusy:false,fileUrls:{},adminMsgs:null,bookings:[],notes:{},availEdit:null,bk:null})}
S.mform=blankMform();S.inboxTab='waiting';S.adminTab='pending';resetChat();
const isUuid=s=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(String(s||''));
const MRULES=[['ใช้ชื่อเล่นเท่านั้น ไม่เปิดเผยข้อมูลส่วนตัวของตัวเองหรือผู้ถาม','Use a nickname only and never share your own or the asker’s personal details'],['ห้ามเก็บเงินนอกระบบ ขายคอร์ส หรือชวนลงทุน','Never take payment outside Maadoo Job, sell courses or pitch investments'],['ห้ามขอเบอร์ LINE หรือช่องทางติดต่อก่อนคุยสดครั้งแรก','Don’t ask for phone numbers, LINE or other contacts before the first live call'],['ตอบคำถามภายใน 48 ชม. ถ้าไม่ตอบ ผู้ถามได้สิทธิ์คืน','Reply within 48 hours, or the asker gets their question back'],['ห้ามเปิดเผยความลับของบริษัท','Never share your company’s confidential information'],['ตอบรีวิวได้ แต่ลบหรือซ่อนรีวิวไม่ได้','You can reply to reviews but never delete or hide them']];
const QUICK=[[['📄 ช่วยดูเรซูเม่','📄 Resume check'],['รบกวนช่วยดูเรซูเม่ให้หน่อยได้ไหม แนบไฟล์ไว้ให้แล้ว','Could you take a look at my resume? I’ve attached it.']],[['🎤 สัมภาษณ์ถามอะไร','🎤 Interview questions'],['ตอนสัมภาษณ์ตำแหน่งนี้ มักโดนถามอะไรบ้าง ควรเตรียมตัวยังไง','What do they usually ask in interviews for this role, and how should I prepare?']],[['💰 เงินเดือนเริ่มต้น','💰 Starting salary'],['เงินเดือนเริ่มต้นของเด็กจบใหม่สายนี้ประมาณเท่าไหร่ และขอได้แค่ไหน','What’s a typical starting salary for new grads in this field, and how much can I ask for?']]];
const REPORT_WHY={spam:['สแปม / โฆษณา','Spam / ads'],harass:['คุกคาม / ไม่สุภาพ','Harassment / rude'],scam:['หลอกลวง / ขอเงิน','Scam / asking for money'],contact:['ขอข้อมูลติดต่อส่วนตัว','Asking for personal contacts'],other:['อื่น ๆ','Something else']};
function mentorName(nick){nick=String(nick||'').trim();return [/^พี่/.test(nick)?nick:'พี่'+nick,nick]}
function realMentor(r){const tp=(r.topics||[]).filter(k=>TOPICS[k]);return {id:r.id,real:true,off:!r.available,fac:FAC[r.faculty]?r.faculty:null,field:r.field,name:mentorName(r.nickname),role:[`${r.field} · ${r.years} ปี`,`${r.field} · ${r.years} yrs`],at:r.company?[r.company,r.company]:['ไม่ระบุบริษัท','Company not listed'],ava:'🧑‍💼',bg:'var(--sky)',n:0,price:r.price,top:tp.length?tp:['intern'],tags:tp.map(k=>TOPICS[k]),bio:r.bio?[r.bio,r.bio]:['รุ่นพี่จริงที่ผ่านการตรวจสอบจากทีมมาดูจ็อบ','A real mentor checked by the Maadoo Job team']}}
function ensureMentor(id){let m=MENTORS.find(v=>v.id===id);if(m)return m;
 m=S.myMentor&&S.myMentor.id===id?realMentor(S.myMentor):{id,real:true,name:['รุ่นพี่','Mentor'],role:['รุ่นพี่','Mentor'],at:['',''],ava:'🧑‍💼',bg:'var(--sky)',n:0,price:0,top:['intern'],tags:[],bio:['','']};
 m.off=true;MENTORS.push(m);return m}
function loadRealMentors(){if(!SB)return Promise.resolve();RM.p=(async()=>{try{const q=cols=>SB.from('mentors').select(cols).eq('active',true).order('approved_at',{ascending:false}).limit(200);let {data,error}=await q('id,nickname,field,company,years,topics,price,bio,available,active,faculty');if(error&&(error.code==='42703'||/faculty/.test(error.message||'')))({data,error}=await q('id,nickname,field,company,years,topics,price,bio,available,active'));if(error)throw error;
  RM.rows=data||[];for(let i=MENTORS.length-1;i>=0;i--)if(MENTORS[i].real)MENTORS.splice(i,1);MENTORS.unshift(...RM.rows.map(realMentor));RM.loaded=true;if(S.view==='ask')rerender()}
 catch(e){console.warn('[Maadoo Job] could not load real mentors (mentors table):',e&&(e.message||e))}})();return RM.p}
/* contact masking (the server does the same on save; this keeps the optimistic bubble honest) */
function maskContacts(s){return String(s||'').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,'[hidden]').replace(/(https?:\/\/|www\.)\S+|\b[A-Za-z0-9-]+\.(com|net|org|me|co|th|io|ly|gl|gg|link)(\/\S*)?/gi,'[hidden]').replace(/(line|ไลน์|ig|ไอจี|instagram|facebook|fb|เฟส|telegram|discord|tel|โทร)\s*(id)?\s*[:：]?\s*@?[A-Za-z0-9._-]{3,}/gi,'[hidden]').replace(/@[A-Za-z0-9._-]{3,}/g,'[hidden]').replace(/\+?\d([-. ]?\d){8,11}/g,'[hidden]')}
const renderBody=s=>esc(s).replace(/\[hidden\]/g,`<span class="hid">🔒 ${t('ซ่อนไว้','hidden')}</span>`);
const hhmm=ts=>new Date(ts).toLocaleTimeString(S.lang==='en'?'en-GB':'th-TH',{hour:'2-digit',minute:'2-digit'});
const amMentor=r=>!!(S.user&&r.mentor_id===S.user.id);
const roomUnread=r=>!!(S.user&&r.last_sender&&r.last_sender!==S.user.id&&Date.parse(r.last_msg_at)>Date.parse(amMentor(r)?r.mentor_read_at:r.student_read_at));
const chatUnread=()=>S.rooms.filter(roomUnread).length;
const roomOfQ=q=>S.rooms.find(r=>r.question_id===q.id);
const studentName=r=>r.student_name?esc(r.student_name):t('น้อง (ไม่ระบุชื่อ)','A student');
const roomTitle=r=>amMentor(r)?studentName(r):x(ensureMentor(r.mentor_id).name);
function hoursLeft(r){return REPLY_H*36e5-(Date.now()-Date.parse(r.created_at))}
function leftTxt(ms){if(ms<=0)return t('หมดเวลาแล้ว','Time’s up');const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4);return h?t(`เหลือ ${h} ชม.`,`${h} h left`):t(`เหลือ ${m} นาที`,`${m} min left`)}
function chatErr(e){const m=String(e&&e.message||'');console.warn('[Maadoo Job] chat error:',e&&e.code,m);
 if(e&&(e.code==='PGRST205'||e.code==='42P01'||/does not exist|schema cache/.test(m)))return premErr(e);
 if(/mentor unavailable/.test(m))return t('รุ่นพี่ปิดรับคำถามอยู่ตอนนี้','This mentor isn’t taking questions right now');
 if(/cannot ask yourself/.test(m))return t('ถามตัวเองไม่ได้นะ','You can’t ask yourself');
 if(/row-level security|violates/.test(m))return t('ส่งไม่ได้ ห้องนี้ปิดหรือถูกบล็อกแล้ว','Couldn’t send. This chat is closed or blocked');
 if(/mime|size|Payload too large|exceeded/i.test(m))return t('ไฟล์ต้องเป็นรูปหรือ PDF ไม่เกิน 5MB','Files must be an image or PDF up to 5 MB');
 if(/bucket/i.test(m))return t('ยังไม่ได้สร้างที่เก็บไฟล์ใน Supabase (รัน SQL)','File storage isn’t set up in Supabase yet (run the SQL)');
 return t('ส่งไม่สำเร็จ ลองใหม่อีกครั้ง','Couldn’t send. Please try again')}
/* ---------- loading + realtime ---------- */
async function loadChat(){if(!sbLive())return;const uid=S.user.id;
 try{const [r,a,ad,mm]=await Promise.all([SB.from('chat_rooms').select('*').order('last_msg_at',{ascending:false}).limit(200),
   SB.from('mentor_applications').select('id,status,nickname,admin_note,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(1),
   SB.from('admins').select('user_id').eq('user_id',uid).maybeSingle(),SB.from('mentors').select('*').eq('id',uid).maybeSingle()]);
  if(!S.user||S.user.id!==uid)return;
  [r,a,ad,mm].forEach(v=>{if(v.error)console.warn('[Maadoo Job] mentor chat not ready (run the SQL, section 8):',v.error.code,v.error.message)});
  if(!r.error)S.rooms=r.data||[];S.mApp=a.error?null:(a.data&&a.data[0])||null;S.isAdmin=!ad.error&&!!ad.data;S.myMentor=mm.error?null:mm.data||null;
  if(S.myMentor)ensureMentor(uid);S.rooms.forEach(v=>ensureMentor(v.mentor_id));syncQs();
  if(!r.error)subscribeChat();if(S.isAdmin)loadAdmin();loadBookings()}catch(e){console.warn('[Maadoo Job] could not load mentor chat:',e&&(e.message||e))}
 chatRefresh()}
function syncQs(){if(!S.user)return;S.rooms.forEach(r=>{if(amMentor(r))return;const q=S.prem.qs.find(v=>v.id===r.question_id);if(!q)return;
 q.status=r.status;if(r.first_reply_at)q.answeredAt=q.answeredAt||Date.parse(r.first_reply_at);q.lastAt=Math.max(q.lastAt||0,Date.parse(r.last_msg_at)||0)})}
function subscribeChat(){if(!SB||!SB.channel||!sbLive()||chatCh)return;
 try{chatCh=SB.channel('maadoo-chat-'+S.user.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},p=>onMsg(p.new)).on('postgres_changes',{event:'*',schema:'public',table:'chat_rooms'},p=>onRoom(p.new)).on('postgres_changes',{event:'*',schema:'public',table:'bookings'},p=>onBooking(p.new)).on('postgres_changes',{event:'*',schema:'public',table:'session_notes'},p=>onNote(p.new)).subscribe()}catch(e){chatCh=null}}
function unsubscribeChat(){try{if(chatCh&&SB)SB.removeChannel(chatCh)}catch(e){}chatCh=null;leaveRoomCh()}
function joinRoomCh(id){if(!SB||!SB.channel||roomChId===id)return;leaveRoomCh();roomChId=id;
 try{roomCh=SB.channel('room-typing:'+id).on('broadcast',{event:'typing'},p=>{if(!p.payload||!S.user||p.payload.u===S.user.id)return;S.typing[id]=Date.now();chatListRefresh();setTimeout(chatListRefresh,4200)}).subscribe()}catch(e){roomCh=null}}
function leaveRoomCh(){try{if(roomCh&&SB)SB.removeChannel(roomCh)}catch(e){}roomCh=null;roomChId=null}
function sendTyping(){const n=Date.now();if(!roomCh||!S.user||n-lastTyping<2000)return;lastTyping=n;try{roomCh.send({type:'broadcast',event:'typing',payload:{u:S.user.id}})}catch(e){}}
function onRoom(row){if(!row||!row.id||!S.user)return;const i=S.rooms.findIndex(v=>v.id===row.id),isNew=i<0;
 if(isNew)S.rooms.unshift(row);else S.rooms[i]=Object.assign(S.rooms[i],row);ensureMentor(row.mentor_id);syncQs();
 if(isNew&&amMentor(row))notifyChat(row,t('มีคำถามใหม่จากน้อง','New question from a student'),'📥');
 chatRefresh(true)}
async function onMsg(g){if(!g||!g.room_id||!S.user)return;let r=S.rooms.find(v=>v.id===g.room_id);
 if(!r){try{const {data}=await SB.from('chat_rooms').select('*').eq('id',g.room_id).maybeSingle();if(!data)return;S.rooms.unshift(data);r=data;ensureMentor(r.mentor_id)}catch(e){return}}
 const L=S.msgs[r.id];if(L&&!L.some(v=>v.id===g.id)){const tmp=L.findIndex(v=>v.pending&&v.sender_id===g.sender_id&&v.body===g.body);if(tmp>=0&&g.sender_id===S.user.id)L[tmp]=g;else L.push(g)}
 r.last_msg_at=g.created_at;r.last_sender=g.sender_id;r.last_preview=(g.body||g.file_name||'📎').slice(0,80);if(S.typing[r.id]&&g.sender_id!==S.user.id)S.typing[r.id]=0;
 if(g.sender_id!==S.user.id){const here=S.view==='chat'&&S.chat===r.id&&!document.hidden;
  if(here)markRead(r);else notifyChat(r,g.body?maskPreview(g.body):t('ส่งไฟล์มา 📎','Sent a file 📎'),'💬')}
 syncQs();chatRefresh(true)}
const maskPreview=s=>String(s).replace(/\[hidden\]/g,'🔒').slice(0,80);
function notifyChat(r,text,ic){const who=amMentor(r)?(r.student_name||'น้อง'):ensureMentor(r.mentor_id).name[0],whoEn=amMentor(r)?(r.student_name||'A student'):ensureMentor(r.mentor_id).name[1];
 NOTIFS.unshift({ic,t:[`${who}: ${text}`,`${whoEn}: ${text}`],w:['เมื่อสักครู่','Just now'],go:['chat',r.id],read:false});renderBell();nav();
 try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted'){const n=new Notification('Maadoo Job · '+(S.lang==='en'?whoEn:who),{body:text,icon:'maadoo-job-icon-512.png',tag:'maadoo-'+r.id});n.onclick=()=>{window.focus();go('chat',{chat:r.id});n.close()}}else if(!document.hidden)toast(`${ic} ${S.lang==='en'?whoEn:who}: ${text}`)}catch(e){}}
async function markRead(r){if(!r||!sbLive())return;const col=amMentor(r)?'mentor_read_at':'student_read_at';r[col]=new Date().toISOString();nav();try{await SB.rpc('chat_mark_read',{room:r.id})}catch(e){}}
async function loadMsgs(id){if(!SB)return;try{const {data,error}=await SB.from('messages').select('*').eq('room_id',id).order('created_at',{ascending:true}).limit(500);if(error)throw error;S.msgs[id]=data||[]}catch(e){S.msgs[id]=[];toast(chatErr(e))}chatRefresh()}
function fileUrl(path){if(!path||path==='…')return '';const c=S.fileUrls[path];if(c&&c!=='…')return c;if(!c&&SB){S.fileUrls[path]='…';SB.storage.from('chat-files').createSignedUrl(path,3600).then(({data})=>{S.fileUrls[path]=data&&data.signedUrl||'';chatListRefresh()}).catch(()=>{S.fileUrls[path]=''})}return ''}
/* re-render helpers that keep the chat input and scroll position */
function chatRefresh(){if(['chat','me','ask','admin'].includes(S.view))render();else nav()}
function chatListRefresh(){const el=$('#cvList');const r=S.rooms.find(v=>v.id===S.chat);if(!el||!r)return;const near=el.scrollHeight-el.scrollTop-el.clientHeight<80;el.innerHTML=chatList(r);if(near)el.scrollTop=el.scrollHeight}
/* ---------- chat room view ---------- */
function bubble(g,me,otherRead){const mine=g.sender_id===me,at=Date.parse(g.created_at),read=otherRead>=at;
 let f='';if(g.file_path){const u=fileUrl(g.file_path),img=/^image\//.test(g.file_type||'');
  f=img?(u?`<a href="${esc(u)}" target="_blank" rel="noopener"><img class="cv-img" src="${esc(u)}" alt="${esc(g.file_name||'')}"></a>`:`<span class="cv-file">🖼️ ${esc(g.file_name||'')}</span>`):`<a class="cv-file" ${u?`href="${esc(u)}" target="_blank" rel="noopener"`:''}>📄 ${esc(g.file_name||'PDF')}<small>${g.file_size?Math.max(1,Math.round(g.file_size/1024))+' KB':''}</small></a>`}
 return `<div class="bub ${mine?'me':''} ${g.pending?'pend':''}">${f}${g.body?`<span>${renderBody(g.body)}</span>`:''}<small>${g.pending?t('กำลังส่ง…','Sending…'):hhmm(at)}${mine&&!g.pending?` <span class="rd ${read?'on':''}" title="${read?t('อ่านแล้ว','Read'):t('ส่งแล้ว','Sent')}">${read?'✓✓':'✓'}</span>`:''}</small></div>`}
function chatList(r){const me=S.user.id,L=S.msgs[r.id],oth=Date.parse(amMentor(r)?r.student_read_at:r.mentor_read_at)||0,typing=S.typing[r.id]&&Date.now()-S.typing[r.id]<4000;
 return (L?L.length?L.map(g=>bubble(g,me,oth)).join(''):`<p class="muted cv-end">${t('ยังไม่มีข้อความ','No messages yet')}</p>`:`<p class="muted cv-end">${t('กำลังโหลด…','Loading…')}</p>`)+(typing?`<div class="bub typing" aria-live="polite">🐾🐾🐾 ${t('กำลังพิมพ์...','typing...')}</div>`:'')}
function notifAsk(){try{if(!('Notification' in window)||Notification.permission!=='default'||!sbLive())return ''}catch(e){return ''}
 return `<button class="card notif-ask" data-notifask><span>🔔</span><span><b>${t('เปิดแจ้งเตือนบนเบราว์เซอร์','Turn on browser notifications')}</b><small class="muted">${t('รู้ทันทีเมื่อมีข้อความใหม่ ตอนเปิดเว็บค้างไว้','Know right away when a new message arrives while the site is open')}</small></span></button>`}
function chatView(){const r=S.rooms.find(v=>v.id===S.chat);
 if(!S.user||!r)return `<div class="card empty" style="margin-top:20px;display:grid;gap:10px;justify-items:center">${t('ไม่พบห้องแชทนี้ หรือยังไม่ได้เข้าสู่ระบบ','Chat not found, or you’re not logged in')}<button class="btn ghost sm" data-go="ask">${t('กลับไปหน้าปรึกษา','Back to Ask')}</button></div>`;
 const me=S.user.id,ms=amMentor(r),mt=ensureMentor(r.mentor_id),st=Q_ST[r.status],left=hoursLeft(r),open=r.status!=='closed';
 const unlocked=r.student_live&&r.mentor_live,myLive=ms?r.mentor_live:r.student_live,blocked=!!r.blocked_by,byMe=r.blocked_by===me;
 return `<div class="chatv"><header class="cv-h" id="cvHead"><button class="cv-ib" data-go="${ms?'me':'ask'}" aria-label="${t('ย้อนกลับ','Back')}">←</button><span class="ava cv-ava" style="background:${ms?'var(--sky)':mt.bg}">${ms?'🙂':mt.ava}</span>
  <div class="cv-t"><b>${roomTitle(r)}</b><span class="muted">${ms?t('ผู้ถาม · 1 คำถาม = 1 ห้อง','Asker · 1 question = 1 chat'):`<span class="chip ver">✓ ${t('รุ่นพี่จริง','Real mentor')}</span> ${x(mt.role)}`} · <span class="chip ${st[2]}">${x(st)}</span></span></div>
  <div class="cv-menu"><button class="cv-ib" data-chatreport aria-label="${t('รายงาน','Report')}" title="${t('รายงาน','Report')}">⚑</button><button class="cv-ib ${byMe?'on':''}" data-chatblock="${byMe?0:1}" aria-label="${byMe?t('เลิกบล็อก','Unblock'):t('บล็อก','Block')}" title="${byMe?t('เลิกบล็อก','Unblock'):t('บล็อก','Block')}">🚫</button></div></header>
 ${!ms&&r.status==='answered'?`<div class="cv-bar good"><span>${t('ได้คำตอบแล้ว? พอใจ ปิดคำถาม','Got your answer? Happy? Close the question')}</span><button class="btn y sm" data-chatclose>✓ ${t('ปิดคำถาม','Close it')}</button></div>`:''}
 ${r.status==='waiting'?`<div class="cv-bar ${left<6*36e5?'hot':''}">⏳ <span>${ms?t(`ตอบภายใน 48 ชม. · ${leftTxt(left)}`,`Reply within 48 h · ${leftTxt(left)}`):t(`รอรุ่นพี่ตอบ · ${leftTxt(left)} · ไม่ตอบใน 48 ชม. คืนสิทธิ์`,`Waiting for a reply · ${leftTxt(left)} · no reply in 48 h = refunded`)}</span></div>`:''}
 ${!unlocked&&open?`<div class="cv-bar cv-lock">🔒 <span>${t('เบอร์โทร LINE อีเมล และลิงก์ติดต่อจะถูกซ่อนจนกว่าจะคุยสดครั้งแรก','Phone numbers, LINE IDs, emails and contact links stay hidden until your first live call')}</span>${myLive?`<span class="chip">${t('คุณยืนยันแล้ว รออีกฝ่าย','You confirmed · waiting for them')}</span>`:`<button class="link" data-chatlive>${t('เราคุยสดกันแล้ว','We’ve had our live call')}</button>`}</div>`:''}
 <div class="cv-list" id="cvList" aria-live="polite">${chatList(r)}</div>
 ${!open?`<p class="muted cv-end">${t('ปิดคำถามแล้ว · เก็บประวัติแชทไว้ให้อ่านย้อนหลัง','This question is closed · the chat history is kept')}</p>`:blocked?`<p class="cv-end form-err">${byMe?`${t('คุณบล็อกห้องนี้ไว้','You blocked this chat')} <button class="link" data-chatblock="0">${t('เลิกบล็อก','Unblock')}</button>`:t('อีกฝ่ายบล็อกห้องนี้ ส่งข้อความไม่ได้','The other side blocked this chat')}</p>`:
 `${ms?'':`<div class="cv-quick">${QUICK.map((q,i)=>`<button class="opt sm" data-chatquick="${i}">${x(q[0])}</button>`).join('')}</div>`}
 <form id="chatForm" class="cv-form"><label class="cv-ib cv-att" title="${t('แนบรูปหรือ PDF','Attach an image or PDF')}"><input type="file" id="chatFile" accept="${FILE_TYPES.join(',')}" class="sr-only">📎</label><input class="field" id="chatIn" maxlength="2000" autocomplete="off" aria-label="${t('ข้อความ','Message')}" placeholder="${t('พิมพ์ข้อความ…','Type a message…')}" value="${esc(S.chatDraft)}"><button class="btn" aria-label="${t('ส่ง','Send')}" ${S.chatBusy?'disabled':''}>➤</button></form>
 <p class="muted cv-hint">📎 ${t('รูปหรือ PDF ไม่เกิน 5MB · เปิดได้เฉพาะคนในห้อง','Images or PDF up to 5 MB · only the two of you can open them')}</p>`}
 ${notifAsk()}</div>`}
function bindChat(){const r=S.rooms.find(v=>v.id===S.chat);if(!r){leaveRoomCh();return}
 if(!S.msgs[r.id])loadMsgs(r.id);joinRoomCh(r.id);if(roomUnread(r)&&!document.hidden)markRead(r);
 const el=$('#cvList');if(el)el.scrollTop=el.scrollHeight;
 const inp=$('#chatIn');if(inp){inp.addEventListener('input',()=>{S.chatDraft=inp.value;sendTyping()});if(S.chatFocus){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length)}inp.addEventListener('focus',()=>{S.chatFocus=true});inp.addEventListener('blur',()=>{setTimeout(()=>{if(document.activeElement!==$('#chatIn'))S.chatFocus=false},0)})}
 const f=$('#chatFile');if(f)f.addEventListener('change',()=>{const file=f.files&&f.files[0];f.value='';if(file)chatSend(S.chatDraft,file)})}
const safeName=n=>String(n||'file').normalize('NFKD').replace(/[^\w.-]+/g,'_').replace(/_+/g,'_').slice(-60)||'file';
const rid=()=>{try{return crypto.randomUUID()}catch(e){return Date.now().toString(36)+Math.random().toString(36).slice(2,10)}};
async function chatSend(body,file){const r=S.rooms.find(v=>v.id===S.chat);if(!r||S.chatBusy||!sbLive())return;body=String(body||'').trim().slice(0,2000);if(!body&&!file)return;
 if(file){if(file.size>FILE_MAX){toast(t('ไฟล์ใหญ่เกิน 5MB','That file is larger than 5 MB'));return}if(!FILE_TYPES.includes(file.type)){toast(t('ส่งได้เฉพาะรูปหรือ PDF','Only images or PDF files'));return}}
 S.chatBusy=true;const L=S.msgs[r.id]=S.msgs[r.id]||[];const tmp={id:'tmp-'+rid(),room_id:r.id,sender_id:S.user.id,body:r.student_live&&r.mentor_live?body:maskContacts(body),created_at:new Date().toISOString(),pending:true,file_path:file?'…':null,file_name:file?file.name:null,file_type:file?file.type:null,file_size:file?file.size:null};
 L.push(tmp);S.chatDraft='';chatRefresh();
 try{let fp=null;if(file){fp=`${r.id}/${rid()}-${safeName(file.name)}`;const up=await SB.storage.from('chat-files').upload(fp,file,{contentType:file.type,upsert:false});if(up.error)throw up.error}
  const {data,error}=await SB.from('messages').insert({room_id:r.id,body,file_path:fp,file_name:file?file.name.slice(0,120):null,file_type:file?file.type:null,file_size:file?file.size:null}).select('*').single();if(error)throw error;
  const i=L.indexOf(tmp);if(L.some(v=>v.id===data.id))L.splice(i,1);else L[i]=data;r.last_msg_at=data.created_at;r.last_sender=S.user.id;r.last_preview=(data.body||data.file_name||'').slice(0,80);
  if(data.masked)toast(t('🔒 ซ่อนช่องทางติดต่อไว้ จนกว่าจะคุยสดครั้งแรก','🔒 Contact details were hidden until your first live call'))}
 catch(e){const i=L.indexOf(tmp);if(i>=0)L.splice(i,1);S.chatDraft=body;toast(chatErr(e))}
 S.chatBusy=false;chatRefresh()}
async function chatClose(){const r=S.rooms.find(v=>v.id===S.chat);if(!r)return;const q=S.prem.qs.find(v=>v.id===r.question_id);
 if(!q){toast(t('กำลังโหลดข้อมูลคำถาม ลองอีกครั้ง','Still loading your question, try again'));loadPrem();return}
 q.answeredAt=q.answeredAt||Date.parse(r.first_reply_at)||Date.now();await qDone(q.id);r.status='closed';chatRefresh()}
async function chatRpc(fn,args,ok){try{const {error}=await SB.rpc(fn,args);if(error)throw error;if(ok)toast(ok);const {data}=await SB.from('chat_rooms').select('*').eq('id',args.room).maybeSingle();if(data)onRoom(data)}catch(e){toast(chatErr(e))}}
/* ---------- report / block modals ---------- */
function creportModal(m,head){return head(t('รายงานห้องแชท','Report this chat'),t('ทีมแอดมินจะอ่านข้อความในห้องนี้เพื่อตรวจสอบ','Our admins will read this chat to check it'))+
 `<div class="opts">${Object.keys(REPORT_WHY).map(k=>`<button type="button" class="opt ${m.why===k?'on':''}" data-crwhy="${k}">${x(REPORT_WHY[k])}</button>`).join('')}</div>
 <textarea class="field" id="crnote" maxlength="300" rows="3" placeholder="${t('เล่าเพิ่มเติม (ไม่บังคับ)','Tell us more (optional)')}">${esc(m.note||'')}</textarea>
 <label class="row" style="gap:8px;font-size:14px"><input type="checkbox" id="crblock" ${m.block?'checked':''} style="width:18px;height:18px;accent-color:var(--blue)">${t('บล็อกห้องนี้ด้วย','Also block this chat')}</label>
 ${authFormErr(m)}<div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>${t('ยกเลิก','Cancel')}</button><button class="btn danger" data-crsend ${m.busy?'disabled':''}>⚑ ${t('ส่งรายงาน','Send report')}</button></div>`}
async function sendReport(){const m=S.modal;if(!m||m.busy)return;m.note=($('#crnote').value||'').slice(0,300);m.block=$('#crblock').checked;if(!m.why){m.err=['เลือกเหตุผลก่อนนะ','Pick a reason first'];renderModal();return}
 m.busy=true;renderModal();try{const {error}=await SB.from('chat_reports').insert({room_id:m.room,reason:m.why,note:m.note||null});if(error)throw error;if(m.block)await SB.rpc('chat_set_block',{room:m.room,blocked:true});closeModal();toast(t('ส่งรายงานแล้ว ขอบคุณที่ช่วยดูแลชุมชน','Report sent. Thanks for looking out for everyone'));chatRpc('chat_mark_read',{room:m.room})}
 catch(e){m.busy=false;m.err=[chatErr(e),chatErr(e)];if(S.modal===m)renderModal()}}
function cblockModal(m,head){return head(t('บล็อกห้องนี้?','Block this chat?'),t('ทั้งสองฝั่งจะส่งข้อความในห้องนี้ไม่ได้ จนกว่าคุณจะเลิกบล็อก','Neither of you can send messages here until you unblock'))+
 `<div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>${t('ยกเลิก','Cancel')}</button><button class="btn danger" data-cblockok>🚫 ${t('บล็อก','Block')}</button></div>`}
/* ---------- chats strip on the Ask page ---------- */
function chatStrip(){if(!S.user||!S.rooms.length)return '';const mine=S.rooms.filter(r=>!amMentor(r)).slice(0,6),mentorNew=S.rooms.filter(r=>amMentor(r)&&(roomUnread(r)||r.status==='waiting')).length;
 return `<section class="sec cv-strip"><div class="sec-h"><h2>💬 ${t('แชทกับรุ่นพี่จริง','Chats with real mentors')}</h2>${S.myMentor?`<button class="link" data-go="me">📥 ${t(`กล่องข้อความรุ่นพี่${mentorNew?` (${mentorNew})`:''}`,`Mentor inbox${mentorNew?` (${mentorNew})`:''}`)}</button>`:''}</div>
 ${mine.length?`<div class="list">${mine.map(roomRow).join('')}</div>`:''}</section>`}
function roomRow(r){const ms=amMentor(r),mt=ensureMentor(r.mentor_id),st=Q_ST[r.status],u=roomUnread(r),left=hoursLeft(r);
 return `<button class="li q-li room-li ${u?'unread':''}" data-chat="${r.id}"><span class="ava" style="width:38px;height:38px;font-size:18px;background:${ms?'var(--sky)':mt.bg}">${ms?'🙂':mt.ava}</span><div class="bk-t"><b>${roomTitle(r)}${u?'<i class="ndot" aria-label="new"></i>':''}</b><span class="muted q-prev">${renderBody(r.last_preview||'')}</span></div>
 ${r.status==='waiting'?`<span class="chip ${left<6*36e5?'bad hot':'mid'}">⏳ ${leftTxt(left)}</span>`:`<span class="chip ${st[2]}">${x(st)}</span>`}</button>`}
/* ---------- mentor mode in "Me" ---------- */
function mentorInbox(){const mm=S.myMentor,me=S.user.id,rooms=S.rooms.filter(r=>r.mentor_id===me),ms=monthStart(),mt=ensureMentor(me),stt=mStat(mt);
 const closedM=rooms.filter(r=>r.status==='closed'&&Date.parse(r.last_msg_at)>=ms).length,rts=rooms.filter(r=>r.first_reply_at).map(r=>Date.parse(r.first_reply_at)-Date.parse(r.created_at)),avg=rts.length?rts.reduce((a,v)=>a+v,0)/rts.length:0;
 const avgTxt=!rts.length?'—':avg<36e5?t(`${Math.max(1,Math.round(avg/6e4))} นาที`,`${Math.max(1,Math.round(avg/6e4))} min`):t(`${(avg/36e5).toFixed(1)} ชม.`,`${(avg/36e5).toFixed(1)} h`);
 const tabs={waiting:rooms.filter(r=>r.status==='waiting'),active:rooms.filter(r=>r.status==='answered'),closed:rooms.filter(r=>r.status==='closed')};
 const TN={waiting:['รอตอบ','Waiting'],active:['กำลังคุย','Active'],closed:['ปิดแล้ว','Closed']},list=tabs[S.inboxTab]||[];
 return `<section class="sec mentor-box"><div class="sec-h"><h2>📥 ${t('โหมดรุ่นพี่','Mentor mode')}</h2><span class="chip ver">✓ ${t('รุ่นพี่จริง','Real mentor')}</span></div>
 <div class="card mb-card"><button class="fx-row mb-sw" data-mavail role="switch" aria-checked="${mm.available}"><span><b>${mm.available?t('🟢 ว่าง รับคำถาม','🟢 Available for questions'):t('⚪ ไม่ว่าง','⚪ Not available')}</b><small>${mm.available?t('น้อง ๆ เห็นการ์ดของคุณในหน้าปรึกษา','Students can see your card on the Ask page'):t('ซ่อนการ์ดไว้ชั่วคราว คำถามที่เปิดอยู่ยังตอบได้','Your card is hidden; open questions can still be answered')}</small></span><i class="tg ${mm.available?'on':''}"></i></button>
  <div class="mb-stats"><div><b>฿${fmt(closedM*PAYOUT+liveEarned())}</b><span class="muted">${t('รายได้เดือนนี้ (จำลอง)','Earned this month (simulated)')}</span></div><div><b>${stt.n<3?'✨':'★ '+stt.avg.toFixed(1)}</b><span class="muted">${stt.n<3?t('รุ่นพี่ใหม่','New mentor'):t(`คะแนน (${stt.n} รีวิว)`,`Rating (${stt.n} reviews)`)}</span></div><div><b>${avgTxt}</b><span class="muted">${t('เวลาตอบเฉลี่ย','Avg. reply time')}</span></div></div>
  <label class="mb-fac"><b>🎓 ${t('คณะที่จบ','Faculty you graduated from')}</b>${facSelect('mbFac',mm.faculty||'',t('คณะที่จบ','Faculty you graduated from'))}</label>
  <p class="demo-note" style="margin:0">${t(`เดโม: คำถามที่ปิดแล้วข้อละ ${PAYOUT} บาท + คุยสด 80% ของราคาหลังหักส่วนลด Plus (ส่วนที่จ่ายด้วยเหรียญ แพลตฟอร์มจ่ายแทน) ยังไม่มีการจ่ายเงินจริง`,`Demo: ${PAYOUT} THB per closed question + 80% of each live call’s Plus price (the platform covers the coin part). No real payouts yet`)}</p></div>
 ${mentorBookings()}${availEditor()}
 <div class="segs" role="tablist">${Object.keys(TN).map(k=>`<button role="tab" aria-selected="${S.inboxTab===k}" class="${S.inboxTab===k?'on':''}" data-inbox="${k}">${x(TN[k])} (${tabs[k].length})${tabs[k].some(roomUnread)?'<i class="ndot"></i>':''}</button>`).join('')}</div>
 ${list.length?`<div class="list">${list.map(roomRow).join('')}</div>`:`<p class="muted">${S.inboxTab==='waiting'?t('ยังไม่มีคำถามรอตอบ','No questions waiting'):S.inboxTab==='active'?t('ยังไม่มีห้องที่คุยอยู่','No active chats'):t('ยังไม่มีคำถามที่ปิดแล้ว','No closed questions yet')}</p>`}
 ${notifAsk()}</section>`}
function mentorCta(){if(!S.user||S.user.anon)return '';if(S.myMentor)return mentorInbox();const a=S.mApp;
 const admin=S.isAdmin?`<button class="card inv-link" data-go="admin"><span class="pc-ic">🛡️</span><span class="inv-lt"><b>${t('หน้าแอดมิน','Admin page')}</b><span class="muted">${t('อนุมัติรุ่นพี่ และดูรายงานห้องแชท','Approve mentors and read chat reports')}</span></span><span aria-hidden="true">→</span></button>`:'';
 const card=!a?`<button class="card inv-link" data-go="mentorApply"><span class="pc-ic">🎓</span><span class="inv-lt"><b>${t('อยากเป็นรุ่นพี่ให้คำปรึกษา?','Want to be a mentor?')}</b><span class="muted">${t('สมัครด้วยชื่อเล่น ทีมงานตรวจแล้วขึ้นการ์ดในหน้าปรึกษา','Apply with a nickname; once approved your card shows on the Ask page')}</span></span><span aria-hidden="true">→</span></button>`:
  `<div class="card ma-status"><span class="pc-ic">🎓</span><div class="inv-lt"><b>${t('ใบสมัครรุ่นพี่','Mentor application')}${a.demo?` · ${t('เดโม','demo')}`:''}</b><span>${a.status==='pending'?`<span class="chip mid">⏳ ${t('รออนุมัติ','Pending review')}</span>`:a.status==='approved'?`<span class="chip ver">✓ ${t('อนุมัติแล้ว','Approved')}</span>`:`<span class="chip bad">✕ ${t('ไม่ผ่าน','Not approved')}</span>`}</span>${a.admin_note&&a.status==='rejected'?`<span class="muted">${esc(a.admin_note)}</span>`:''}</div>${a.status==='rejected'?`<button class="btn ghost sm" data-go="mentorApply">${t('สมัครใหม่','Apply again')}</button>`:''}</div>`;
 return `<section class="sec" style="display:grid;gap:10px">${card}${admin}</section>`}
/* ---------- mentor application form ---------- */
const facSelect=(id,v,lbl)=>`<select class="field" id="${id}" aria-label="${lbl}"><option value="">${t('— ไม่ระบุ —','— Not set —')}</option>${Object.keys(FAC).map(f=>`<option value="${f}" ${v===f?'selected':''}>${FAC[f].e} ${x(FAC[f].n)}</option>`).join('')}</select>`;
function mentorApply(){const f=S.mform;
 if(!S.user||S.user.anon)return `<div class="card" style="max-width:520px;margin:24px auto 0;display:grid;gap:12px;justify-items:center;text-align:center"><h1 style="font-size:24px">🎓 ${t('สมัครเป็นรุ่นพี่','Become a mentor')}</h1><p class="muted">${t('ต้องเข้าสู่ระบบด้วยอีเมลก่อนสมัคร','Log in with an email to apply')}</p><button class="btn y" data-mlogin>${t('เข้าสู่ระบบ','Log in')}</button></div>`;
 if(S.myMentor)return `<div class="card" style="max-width:520px;margin:24px auto 0;display:grid;gap:12px;justify-items:center;text-align:center"><h1 style="font-size:24px">✓ ${t('คุณเป็นรุ่นพี่แล้ว','You’re already a mentor')}</h1><button class="btn y" data-go="me">${t('ไปที่กล่องข้อความรุ่นพี่','Open the mentor inbox')}</button></div>`;
 if(S.mApp&&S.mApp.status==='pending')return `<div class="card" style="max-width:520px;margin:24px auto 0;display:grid;gap:12px;justify-items:center;text-align:center"><h1 style="font-size:24px">⏳ ${t('ส่งใบสมัครแล้ว รออนุมัติ','Application sent, pending review')}</h1><p class="muted">${t('ทีมงานจะตรวจอีเมลที่ทำงานหรือมหาลัยของคุณ แล้วแจ้งผลในหน้า “ฉัน”','We’ll check your work or university email and show the result on your “Me” page')}</p><button class="btn ghost" data-go="me">${t('ไปหน้าฉัน','Go to Me')}</button></div>`;
 return `<div class="ma-page"><section class="inv-head"><span class="chip" style="justify-self:start">🎓 ${t('รุ่นพี่จริง','Real mentors')}</span><h1>${t('สมัครเป็นรุ่นพี่ให้คำปรึกษา','Apply to be a mentor')}</h1><p class="muted">${t('ใช้ชื่อเล่นเท่านั้น ข้อมูลติดต่อใช้ตรวจสอบตัวตนและเห็นเฉพาะแอดมิน','Nickname only. Your contact is used to verify you and only admins can see it')}</p></section>
 <form id="mApplyForm" class="card ma-form" novalidate>
  <div class="ma-grid"><label><b>${t('ชื่อเล่น','Nickname')} *</b><input class="field" id="ma-nick" maxlength="30" value="${esc(f.nick)}" placeholder="${t('เช่น มิ้นท์','e.g. Mint')}" autocomplete="nickname"></label>
  <label><b>${t('สายงาน / ตำแหน่ง','Field / role')} *</b><input class="field" id="ma-field" maxlength="60" value="${esc(f.field)}" placeholder="${t('เช่น QA Officer','e.g. QA Officer')}"></label>
  <label><b>${t('บริษัท','Company')} <span class="muted">(${t('ไม่บังคับ','optional')})</span></b><input class="field" id="ma-company" maxlength="60" value="${esc(f.company)}" placeholder="${t('เว้นว่างได้','You can leave this blank')}"></label>
  <label><b>${t('ประสบการณ์ (ปี)','Experience (years)')} *</b><input class="field" id="ma-years" type="number" inputmode="numeric" min="0" max="50" value="${esc(f.years)}" placeholder="3"></label>
  <label><b>🎓 ${t('คณะที่จบ','Faculty you graduated from')} <span class="muted">(${t('ไม่บังคับ','optional')})</span></b>${facSelect('ma-fac',f.fac,t('คณะที่จบ','Faculty you graduated from'))}<small class="muted">${t('ใช้โชว์ในแผนที่อาชีพ ถ้าคุณข้ามสายมา น้อง ๆ จะเจอคุณในหัวข้อ “รุ่นพี่ที่ข้ามสายมา”','Shown on the career map. If you crossed over, students find you under “Mentors who crossed over”')}</small></label></div>
  <div class="grid" style="gap:6px"><b>${t('หัวข้อที่ช่วยได้','Topics you can help with')} *</b><div class="opts">${Object.keys(TOPICS).map(k=>`<button type="button" class="opt sm ${f.topics.includes(k)?'on':''}" data-matopic="${k}" aria-pressed="${f.topics.includes(k)}">${x(TOPICS[k])}</button>`).join('')}</div></div>
  <label><b>${t('อีเมลที่ทำงานหรือมหาลัย','Work or university email')} *</b><input class="field" id="ma-contact" type="email" inputmode="email" maxlength="200" value="${esc(f.contact)}" placeholder="name@company.co.th · name@uni.ac.th" autocomplete="email"><small class="muted">${t('ใช้ตรวจสอบตัวตนเท่านั้น ไม่แสดงบนเว็บ','Only used to verify you, never shown on the site')}</small></label>
  <label><b>${t('ราคาคุยสด 30 นาที','Live call price, 30 min')} * <span class="ma-price" id="ma-pv">${fmt(f.price)} ${t('บาท','THB')}</span></b><input type="range" id="ma-price" min="${PRICE_MIN}" max="${PRICE_MAX}" step="10" value="${f.price}" aria-valuetext="${f.price} THB"><small class="muted">${PRICE_MIN}–${PRICE_MAX} ${t('บาท · มาดูจ็อบหัก 15% รุ่นพี่ได้ 85%','THB · Maadoo Job keeps 15%, you get 85%')}</small></label>
  <label><b>${t('แนะนำตัวสั้น ๆ','Short intro')} <span class="muted">(${t('ไม่บังคับ','optional')})</span></b><textarea class="field" id="ma-bio" maxlength="200" rows="2" placeholder="${t('เช่น ย้ายจากสายอาหารมาสายยา เล่าให้ฟังได้','e.g. I moved from food to pharma and can tell you how')}">${esc(f.bio)}</textarea></label>
  <div class="ma-rules"><b>📜 ${t('กฎรุ่นพี่','Mentor rules')}</b><ul class="q-rules">${MRULES.map(r=>`<li>${x(r)}</li>`).join('')}</ul></div>
  <label class="ma-check"><input type="checkbox" id="ma-rules" ${f.rules?'checked':''}>${t('ฉันอ่านและยอมรับกฎรุ่นพี่','I’ve read and accept the mentor rules')} *</label>
  <label class="ma-check"><input type="checkbox" id="ma-age" ${f.age?'checked':''}>${t('ฉันอายุ 18 ปีขึ้นไป','I’m 18 or older')} *</label>
  ${f.err?`<p class="form-err" role="alert">${esc(x(f.err))}</p>`:''}
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-go="me">${t('ยกเลิก','Cancel')}</button><button class="btn y" ${f.busy?'disabled':''}>${f.busy?t('กำลังส่ง…','Sending…'):t('ส่งใบสมัคร','Send application')}</button></div>
  ${SB?'':`<p class="demo-note">${t('เดโม: ยังไม่ได้เชื่อมฐานข้อมูล ใบสมัครเก็บไว้ในเครื่องนี้เท่านั้น','Demo: no database connected, the application stays on this device')}</p>`}</form></div>`}
function readMform(){const f=S.mform,v=id=>(document.getElementById(id)||{}).value;if(!$('#mApplyForm'))return f;
 Object.assign(f,{nick:v('ma-nick')||'',field:v('ma-field')||'',company:v('ma-company')||'',years:v('ma-years')||'',fac:FAC[v('ma-fac')]?v('ma-fac'):'',contact:(v('ma-contact')||'').trim(),price:+v('ma-price')||149,bio:v('ma-bio')||'',rules:$('#ma-rules').checked,age:$('#ma-age').checked});return f}
async function sendMApply(){const f=readMform();f.err=null;const yr=+f.years;
 if(!f.nick.trim()||f.nick.trim().length>30)f.err=['ใส่ชื่อเล่น (ไม่เกิน 30 ตัว)','Add a nickname (up to 30 characters)'];
 else if(f.field.trim().length<2)f.err=['ใส่สายงานหรือตำแหน่ง','Add your field or role'];
 else if(f.years===''||!Number.isInteger(yr)||yr<0||yr>50)f.err=['ใส่ประสบการณ์เป็นจำนวนปี 0–50','Enter your experience in years, 0–50'];
 else if(!f.topics.length)f.err=['เลือกหัวข้อที่ช่วยได้อย่างน้อย 1 หัวข้อ','Pick at least one topic'];
 else if(!EMAIL_RE.test(f.contact))f.err=['ใส่อีเมลให้ถูกต้อง','Add a valid email'];
 else if(isFreeMail(f.contact))f.err=['ใช้อีเมลที่ทำงานหรือมหาลัย ไม่ใช่ Gmail/Hotmail','Use a work or university email, not Gmail/Hotmail'];
 else if(f.price<PRICE_MIN||f.price>PRICE_MAX)f.err=[`ราคาต้องอยู่ระหว่าง ${PRICE_MIN}–${PRICE_MAX} บาท`,`Price must be ${PRICE_MIN}–${PRICE_MAX} THB`];
 else if(!f.rules||!f.age)f.err=['ติ๊กยอมรับกฎรุ่นพี่ และยืนยันว่าอายุ 18 ปีขึ้นไป','Accept the mentor rules and confirm you’re 18 or older'];
 if(f.err){render();const e=$('.ma-form .form-err');if(e)e.scrollIntoView({block:'center'});return}
 if(!sbLive()){S.mApp={status:'pending',nickname:f.nick.trim(),demo:true};S.mform=blankMform();go('me');toast(t('ส่งใบสมัครแล้ว (เดโม)','Application sent (demo)'));return}
 f.busy=true;render();try{const row={nickname:f.nick.trim(),field:f.field.trim(),company:f.company.trim()||null,years:yr,topics:f.topics,contact:f.contact,price:f.price,bio:f.bio.trim()||null,rules_ok:true,age18:true};if(f.fac)row.faculty=f.fac;
  const ins=r=>SB.from('mentor_applications').insert(r).select('id,status,nickname,admin_note,created_at').single();let {data,error}=await ins(row);
  if(error&&row.faculty&&(error.code==='PGRST204'||error.code==='42703'||/faculty/.test(error.message||''))){console.warn('[Maadoo Job] faculty column missing (run the SQL, section 11); sending without it');delete row.faculty;({data,error}=await ins(row))}if(error)throw error;
  S.mApp=data;S.mform=blankMform();go('me');toast(t('ส่งใบสมัครแล้ว รอทีมงานอนุมัตินะ','Application sent. We’ll review it soon'))}
 catch(e){f.busy=false;const m=String(e&&e.message||'');f.err=/one_pending|duplicate/.test(m)?['คุณมีใบสมัครที่รออนุมัติอยู่แล้ว','You already have an application waiting for review']:e&&(e.code==='PGRST205'||e.code==='42P01')?[premErr(e),premErr(e)]:['ส่งไม่สำเร็จ ลองใหม่อีกครั้ง','Couldn’t send. Please try again'];console.warn('[Maadoo Job] mentor application:',e&&e.code,m);render()}}
/* ---------- admin ---------- */
async function loadAdmin(){if(!S.isAdmin||!SB)return;try{const [a,r]=await Promise.all([SB.from('mentor_applications').select('*').order('created_at',{ascending:false}).limit(200),SB.from('chat_reports').select('*').order('created_at',{ascending:false}).limit(200)]);
 if(!a.error)S.adminApps=a.data||[];if(!r.error)S.adminReports=r.data||[]}catch(e){}if(S.view==='admin')render()}
function admin(){if(!S.isAdmin)return `<div class="card empty" style="margin-top:20px">${t('หน้านี้สำหรับแอดมินเท่านั้น','This page is for admins only')}</div>`;
 const tabs={pending:S.adminApps.filter(a=>a.status==='pending'),done:S.adminApps.filter(a=>a.status!=='pending'),reports:S.adminReports};const TN={pending:['รออนุมัติ','Pending'],done:['ตรวจแล้ว','Reviewed'],reports:['รายงานแชท','Chat reports']};
 const L=tabs[S.adminTab]||[];
 return `<div class="ma-page"><section class="inv-head"><span class="chip" style="justify-self:start">🛡️ Admin</span><h1>${t('หน้าแอดมิน','Admin')}</h1><p class="muted">${t('เห็นเฉพาะผู้ใช้ที่อยู่ในตาราง admins','Only users in the admins table can see this')}</p></section>
 <div class="segs">${Object.keys(TN).map(k=>`<button class="${S.adminTab===k?'on':''}" data-admtab="${k}">${x(TN[k])} (${tabs[k].length})</button>`).join('')}<button data-admreload aria-label="${t('โหลดใหม่','Reload')}">🔄</button></div>
 <div class="grid" style="gap:12px;margin-top:12px">${!L.length?`<p class="muted">${t('ยังไม่มีรายการ','Nothing here yet')}</p>`:S.adminTab==='reports'?L.map(r=>`<div class="card adm-card"><div class="row" style="gap:8px"><b>⚑ ${x(REPORT_WHY[r.reason]||['',''])}</b><span class="muted" style="margin-left:auto">${fmtDate(Date.parse(r.created_at))}</span></div>${r.note?`<p style="margin:0">${esc(r.note)}</p>`:''}<span class="muted" style="font-size:12px;overflow-wrap:anywhere">${t('ห้อง','Room')} ${esc(r.room_id)}</span><button class="btn ghost sm" data-admmsgs="${esc(r.room_id)}" style="justify-self:start">${t('อ่านข้อความในห้อง','Read the chat')}</button></div>`).join(''):
  L.map(a=>`<div class="card adm-card"><div class="row" style="gap:8px"><b>${esc(mentorName(a.nickname)[0])}</b><span class="chip ${a.status==='pending'?'mid':a.status==='approved'?'ver':'bad'}">${a.status==='pending'?t('รออนุมัติ','Pending'):a.status==='approved'?t('อนุมัติแล้ว','Approved'):t('ไม่ผ่าน','Rejected')}</span><span class="muted" style="margin-left:auto">${fmtDate(Date.parse(a.created_at))}</span></div>
  <div class="muted">${esc(a.field)} · ${a.years} ${t('ปี','yrs')}${a.company?` · ${esc(a.company)}`:''}${FAC[a.faculty]?` · 🎓 ${x(FAC[a.faculty].n)}`:''} · ${fmt(a.price)} ${t('บาท/30 นาที','THB/30 min')}</div>
  <div class="row" style="gap:6px">${(a.topics||[]).filter(k=>TOPICS[k]).map(k=>`<span class="chip">${x(TOPICS[k])}</span>`).join('')}</div>
  ${a.bio?`<p style="margin:0">“${esc(a.bio)}”</p>`:''}<div class="adm-contact">🔎 ${EMAIL_RE.test(a.contact)?`<a href="mailto:${esc(a.contact)}">${esc(a.contact)}</a>`:esc(a.contact)}</div>
  ${a.status==='pending'?`<input class="field" id="an-${a.id}" maxlength="300" placeholder="${t('หมายเหตุถึงผู้สมัคร (ไม่บังคับ)','Note to the applicant (optional)')}"><div class="row" style="justify-content:flex-end"><button class="btn ghost sm" data-admrev="${a.id}:0">✕ ${t('ปฏิเสธ','Reject')}</button><button class="btn y sm" data-admrev="${a.id}:1">✓ ${t('อนุมัติ','Approve')}</button></div>`:a.admin_note?`<span class="muted">📝 ${esc(a.admin_note)}</span>`:''}</div>`).join('')}</div></div>`}
async function adminReview(id,ok){const note=(($('#an-'+id)||{}).value||'').trim()||null;try{const {error}=await SB.rpc('review_mentor_application',{app:id,approve:ok,note});if(error)throw error;toast(ok?t('อนุมัติแล้ว การ์ดขึ้นในหน้าปรึกษาทันที','Approved. Their card is on the Ask page now'):t('ปฏิเสธแล้ว','Rejected'));await Promise.all([loadAdmin(),loadRealMentors()])}catch(e){toast(chatErr(e))}}
function amsgsModal(m,head){const L=S.adminMsgs;return head(t('ข้อความในห้องที่ถูกรายงาน','Messages in the reported chat'),t('อ่านอย่างเดียว','Read only'))+
 `<div class="chat">${!L?`<p class="muted">${t('กำลังโหลด…','Loading…')}</p>`:!L.length?`<p class="muted">${t('ไม่มีข้อความ','No messages')}</p>`:L.map(g=>`<div class="bub ${g.sender_id===m.mentor?'me':''}">${g.body?`<span>${renderBody(g.body)}</span>`:''}${g.file_name?`<span>📎 ${esc(g.file_name)}</span>`:''}<small>${g.sender_id===m.mentor?t('รุ่นพี่','Mentor'):t('ผู้ถาม','Asker')} · ${fmtDate(Date.parse(g.created_at))} ${hhmm(Date.parse(g.created_at))}</small></div>`).join('')}</div>`}
async function adminMsgs(room){S.adminMsgs=null;openModal({type:'amsgs',room});try{const [m,r]=await Promise.all([SB.from('messages').select('*').eq('room_id',room).order('created_at').limit(500),SB.from('chat_rooms').select('mentor_id').eq('id',room).maybeSingle()]);S.adminMsgs=m.data||[];if(S.modal&&S.modal.type==='amsgs'){S.modal.mentor=r.data&&r.data.mentor_id;renderModal()}}catch(e){S.adminMsgs=[];renderModal()}}
/* ---------- events ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-chat],[data-chatquick],[data-chatclose],[data-chatlive],[data-chatreport],[data-chatblock],[data-cblockok],[data-crwhy],[data-crsend],[data-inbox],[data-mavail],[data-matopic],[data-mlogin],[data-admtab],[data-admrev],[data-admmsgs],[data-admreload],[data-notifask]');if(!b)return;const d=b.dataset;
 if(d.chat){S.chatDraft='';go('chat',{chat:d.chat});return}
 if(d.chatquick!==undefined){const q=QUICK[+d.chatquick];S.chatDraft=x(q[1]);const i=$('#chatIn');if(i){i.value=S.chatDraft;i.focus()}return}
 if(d.chatclose!==undefined){chatClose();return}
 if(d.chatlive!==undefined){chatRpc('chat_confirm_live',{room:S.chat},t('ยืนยันแล้ว ถ้าอีกฝ่ายยืนยันด้วย จะแลกช่องทางติดต่อกันได้','Confirmed. Once they confirm too, you can share contacts'));return}
 if(d.chatreport!==undefined){openModal({type:'creport',room:S.chat,why:null});return}
 if(d.chatblock!==undefined){if(d.chatblock==='1')openModal({type:'cblock',room:S.chat});else chatRpc('chat_set_block',{room:S.chat,blocked:false},t('เลิกบล็อกแล้ว','Unblocked'));return}
 if(d.cblockok!==undefined){const room=S.modal&&S.modal.room;closeModal();if(room)chatRpc('chat_set_block',{room,blocked:true},t('บล็อกห้องนี้แล้ว','Chat blocked'));return}
 if(d.crwhy){const m=S.modal;if(!m)return;m.note=($('#crnote')||{}).value||'';m.block=!!($('#crblock')||{}).checked;m.why=d.crwhy;m.err=null;renderModal();return}
 if(d.crsend!==undefined){sendReport();return}
 if(d.inbox){S.inboxTab=d.inbox;render();return}
 if(d.mavail!==undefined){const mm=S.myMentor;if(!mm)return;const v=!mm.available;mm.available=v;render();SB.from('mentors').update({available:v}).eq('id',mm.id).then(({error})=>{if(error){mm.available=!v;render();toast(chatErr(error))}else{const m=MENTORS.find(x2=>x2.id===mm.id);if(m&&!m.off)m.off=!v;loadRealMentors();toast(v?t('เปิดรับคำถามแล้ว','You’re taking questions'):t('ปิดรับคำถามชั่วคราว','Questions paused'))}});return}
 if(d.matopic){readMform();const f=S.mform,i=f.topics.indexOf(d.matopic);if(i>=0)f.topics.splice(i,1);else if(f.topics.length<5)f.topics.push(d.matopic);render();return}
 if(d.mlogin!==undefined){needMember(()=>render());return}
 if(d.admtab){S.adminTab=d.admtab;render();return}
 if(d.admreload!==undefined){loadAdmin();return}
 if(d.admrev){const [id,ok]=d.admrev.split(':');adminReview(id,ok==='1');return}
 if(d.admmsgs){adminMsgs(d.admmsgs);return}
 if(d.notifask!==undefined){try{Notification.requestPermission().then(p=>{toast(p==='granted'?t('เปิดแจ้งเตือนแล้ว 🔔','Notifications on 🔔'):t('ไม่ได้เปิดแจ้งเตือน','Notifications stay off'));render()})}catch(e){}return}});
document.addEventListener('submit',e=>{if(e.target.id==='chatForm'){e.preventDefault();const i=$('#chatIn');chatSend(i?i.value:'');return}if(e.target.id==='mApplyForm'){e.preventDefault();sendMApply()}});
document.addEventListener('change',e=>{if(e.target.id!=='mbFac'||!S.myMentor)return;const mm=S.myMentor,old=mm.faculty||null,v=FAC[e.target.value]?e.target.value:null;mm.faculty=v;
 const sync=()=>{const m=MENTORS.find(x2=>x2.id===mm.id);if(m)m.fac=mm.faculty};sync();if(!sbLive()){toast(t('บันทึกแล้ว (เดโม)','Saved (demo)'));return}
 SB.from('mentors').update({faculty:v}).eq('id',mm.id).then(({error})=>{if(error){mm.faculty=old;sync();render();toast(/faculty/.test(error.message||'')||error.code==='PGRST204'?t('ยังบันทึกไม่ได้ ต้องรัน SQL ส่วนที่ 11 ก่อน','Can’t save yet: run SQL section 11 first'):chatErr(error))}else toast(t('บันทึกคณะที่จบแล้ว','Faculty saved'))})});
document.addEventListener('input',e=>{if(e.target.id==='ma-price'){const v=+e.target.value,o=$('#ma-pv');S.mform.price=v;e.target.setAttribute('aria-valuetext',v+' THB');if(o)o.textContent=`${fmt(v)} ${t('บาท','THB')}`}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.view==='chat'){const r=S.rooms.find(v=>v.id===S.chat);if(r&&roomUnread(r))markRead(r)}});
/* ---------- real mentors, step 2: availability · booking page · live call room · session notes ---------- */
const SLOT_MIN=16,SLOT_MAX=43,LIVE_MIN=30,COIN_CAP=.5,EARN_RATE=.8;
S.bookings=[];S.notes={};S.avail={};S.bk=null;S.liveId=null;S.availEdit=null;
const TZ='Asia/Bangkok';
const bkkDay=(ts=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ts));
const dayAdd=(day,n)=>bkkDay(Date.parse(day+'T12:00:00+07:00')+n*DAY);
const isoDow=day=>{const d=new Date(Date.parse(day+'T12:00:00+07:00')).getUTCDay();return d||7};
const slotStart=(day,slot)=>Date.parse(day+'T00:00:00+07:00')+slot*18e5;
const slotTxt=s=>`${String(Math.floor(s/2)).padStart(2,'0')}:${s%2?'30':'00'}`;
const WD=[null,['จ.','Mon'],['อ.','Tue'],['พ.','Wed'],['พฤ.','Thu'],['ศ.','Fri'],['ส.','Sat'],['อา.','Sun']];
const WDL=[null,['จันทร์','Monday'],['อังคาร','Tuesday'],['พุธ','Wednesday'],['พฤหัสบดี','Thursday'],['ศุกร์','Friday'],['เสาร์','Saturday'],['อาทิตย์','Sunday']];
const whenTxt=ts=>new Date(ts).toLocaleString(S.lang==='en'?'en-GB':'th-TH',{timeZone:TZ,weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const randHex=n=>{try{const a=new Uint8Array(n/2);crypto.getRandomValues(a);return [...a].map(v=>v.toString(16).padStart(2,'0')).join('')}catch(e){let s='';while(s.length<n)s+=Math.random().toString(16).slice(2);return s.slice(0,n)}};
const BK_ST={booked:['นัดแล้ว','Booked','mid'],done:['คุยเสร็จแล้ว','Done','good'],cancelled:['ยกเลิกแล้ว','Cancelled',''],mentor_noshow:['รุ่นพี่ไม่มา','Mentor no-show','bad'],student_noshow:['น้องไม่มา','Student no-show','bad']};
const BK_TERMS=[['ยกเลิกฟรีก่อนเวลานัด 12 ชม. (คืนเหรียญเต็ม)','Free cancellation up to 12 h before (coins refunded)'],['รุ่นพี่ไม่มา = คืนเต็ม','Mentor no-show = full refund'],['น้องไม่มา = ไม่คืน','Student no-show = no refund']];
function bkPrice(mt,coins){const full=mt.price,disc=isPlus()?Math.round(full*.2):0,after=full-disc,maxC=Math.max(0,Math.min(S.prem.coins|0,Math.floor(after*COIN_CAP))),c=Math.max(0,Math.min(coins|0,maxC));return {full,disc,after,maxC,coins:c,total:after-c,earn:Math.round(after*EARN_RATE)}}
/* sample mentors get a made-up weekly schedule so the booking page works in the demo */
function hashStr(s){let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h}
function demoAvail(mt){const h=hashStr(mt.id),slots=new Set();for(let w=1;w<=7;w++){const range=w<=5?[37,42]:[20,31];for(let s=range[0];s<=range[1];s++)slots.add(w+':'+s)}
 const taken=new Set();for(let i=0;i<8;i++){const day=dayAdd(bkkDay(),i);for(let s=SLOT_MIN;s<=SLOT_MAX;s++)if(hashStr(mt.id+day+s)%4===0)taken.add(slotStart(day,s))}
 S.bookings.filter(b=>b.mentor_id===mt.id&&b.status!=='cancelled').forEach(b=>taken.add(Date.parse(b.starts_at)));
 return {slots,off:[1+h%5],daysOff:new Set(),taken,loaded:true,demo:true}}
async function loadAvail(mid){if(!isUuid(mid)||!SB){S.avail[mid]=demoAvail(ensureMentor(mid));return}
 S.avail[mid]=S.avail[mid]||{slots:new Set(),off:[],daysOff:new Set(),taken:new Set(),loaded:false};
 try{const [a,o,m,tk]=await Promise.all([SB.from('mentor_availability').select('weekday,slot').eq('mentor_id',mid),SB.from('mentor_days_off').select('day').eq('mentor_id',mid),SB.from('mentors').select('off_weekdays').eq('id',mid).maybeSingle(),SB.rpc('mentor_taken_slots',{mentor:mid})]);
  [a,o,m,tk].forEach(v=>{if(v.error)console.warn('[Maadoo Job] booking data not ready (run the SQL, section 9):',v.error.code,v.error.message)});
  S.avail[mid]={slots:new Set((a.data||[]).map(r=>r.weekday+':'+r.slot)),off:(m.data&&m.data.off_weekdays)||[],daysOff:new Set((o.data||[]).map(r=>r.day)),taken:new Set((tk.data||[]).map(v=>Date.parse(typeof v==='string'?v:v.mentor_taken_slots||v))),loaded:true,err:!!(a.error||tk.error)}}
 catch(e){S.avail[mid]={slots:new Set(),off:[],daysOff:new Set(),taken:new Set(),loaded:true,err:true}}
 if(['book','me'].includes(S.view))render()}
function daySlots(av,day){if(!av||av.off.includes(isoDow(day))||av.daysOff.has(day))return [];const w=isoDow(day),out=[];for(let s=0;s<48;s++)if(av.slots.has(w+':'+s))out.push(s);return out}
const slotFree=(av,day,s)=>{const st=slotStart(day,s);return st>=Date.now()+36e5&&!av.taken.has(st)};
/* ---------- booking page ---------- */
function openBook(mid){const mt=ensureMentor(mid);if(S.user&&mid===S.user.id){toast(t('จองตัวเองไม่ได้นะ','You can’t book yourself'));return}
 S.bk={mid,day:null,slot:null,coins:0,topic:''};if(!S.avail[mid]||S.avail[mid].demo)loadAvail(mid);go('book')}
function bookView(){const b=S.bk;if(!b)return `<div class="card empty" style="margin-top:20px">${t('เลือกรุ่นพี่ที่จะจองก่อนนะ','Pick a mentor to book first')} <button class="btn ghost sm" data-go="ask">${t('ไปหน้าปรึกษา','Go to Ask')}</button></div>`;
 const mt=ensureMentor(b.mid),av=S.avail[b.mid],today=bkkDay(),days=[...Array(7)].map((_,i)=>dayAdd(today,i+1));
 const freeOf=d=>av&&av.loaded?daySlots(av,d).filter(s=>slotFree(av,d,s)):[];
 if(av&&av.loaded&&!b.day)b.day=days.find(d=>freeOf(d).length)||days[0];
 const P=bkPrice(mt,b.coins);b.coins=P.coins;const sl=b.day&&av?daySlots(av,b.day).filter(s=>slotStart(b.day,s)>=Date.now()+36e5):[];
 return `<div class="bkv"><header class="card bk-head"><button class="cv-ib" data-go="ask" aria-label="${t('ย้อนกลับ','Back')}">←</button><span class="ava" style="width:48px;height:48px;font-size:24px;background:${mt.bg}">${mt.ava}</span><div class="cv-t"><b>${t(`จองคุยสดกับ${x(mt.name)}`,`Book a live call with ${x(mt.name)}`)}</b><span class="muted">${mt.real?`<span class="chip ver">✓ ${t('รุ่นพี่จริง','Real mentor')}</span>`:`<span class="chip">${t('ตัวอย่าง','Sample')}</span>`} ${x(mt.role)} · ${t('วิดีโอคอล 30 นาที','30-min video call')}</span></div></header>
 <section class="card bk-sec"><b>📅 ${t('เลือกวัน','Pick a day')}</b>
  ${!av||!av.loaded?`<p class="muted">${t('กำลังโหลดเวลาว่าง…','Loading free times…')}</p>`:`<div class="bk-days" role="listbox" aria-label="${t('วัน','Day')}">${days.map(d=>{const n=freeOf(d).length,dt=new Date(Date.parse(d+'T12:00:00+07:00'));return `<button class="bk-day ${b.day===d?'on':''} ${n?'':'off'}" data-bkday="${d}" role="option" aria-selected="${b.day===d}" ${n?'':'aria-disabled="true"'}><small>${x(WD[isoDow(d)])}</small><b>${dt.getUTCDate()}</b><small>${n?t(`${n} ช่อง`,`${n} free`):t('ไม่ว่าง','Full')}</small></button>`}).join('')}</div>`}
  <b>🕒 ${t('เลือกเวลา','Pick a time')}</b>
  ${av&&av.loaded?(sl.length?`<div class="bk-slots">${sl.map(s=>{const free=slotFree(av,b.day,s);return `<button class="bk-slot ${b.slot===s?'on':''} ${free?'':'taken'}" data-bkslot="${s}" ${free?'':`disabled aria-label="${slotTxt(s)} ${t('ถูกจองแล้ว','taken')}"`}>${slotTxt(s)}</button>`}).join('')}</div>`:`<p class="muted">${t('วันนี้ไม่มีเวลาว่าง ลองเลือกวันอื่น','No free times this day. Try another day')}</p>`):''}
  ${av&&av.err?`<p class="form-err">${t('ยังโหลดเวลาว่างไม่ได้ (ยังไม่ได้รัน SQL ขั้นที่ 2)','Couldn’t load free times (the step 2 SQL isn’t installed yet)')}</p>`:''}</section>
 <section class="card bk-sec"><b>💬 ${t('อยากคุยเรื่องอะไร','What do you want to talk about?')} <span class="muted">(${t('ไม่บังคับ','optional')})</span></b><textarea class="field" id="bkTopic" maxlength="300" rows="2" placeholder="${t('เช่น ขอดูเรซูเม่ฝึกงาน QC','e.g. review my QC internship resume')}">${esc(b.topic)}</textarea></section>
 <section class="card bk-sec bk-price"><div class="bk-row"><span>${t('ราคาเต็ม (30 นาที)','Full price (30 min)')}</span><span>${fmt(P.full)} ${t('บาท','THB')}</span></div>
  <div class="bk-row ${P.disc?'good':'muted'}"><span>✨ ${t('ส่วนลด Plus 20%','Plus 20% off')}</span><span>${P.disc?`−${fmt(P.disc)}`:`<button class="link" data-go="plus">${t('สมัคร Plus','Get Plus')}</button>`}</span></div>
  <div class="bk-coins"><div class="bk-row"><span>🪙 ${t('ใช้เหรียญ','Use coins')} <small class="muted">${t(`(สูงสุด 50% · มี ${fmt(S.prem.coins|0)})`,`(up to 50% · you have ${fmt(S.prem.coins|0)})`)}</small></span><span id="bkCoinsV">−${fmt(P.coins)}</span></div>
   <input type="range" id="bkCoins" min="0" max="${P.maxC}" step="1" value="${P.coins}" ${P.maxC?'':'disabled'} aria-label="${t('จำนวนเหรียญที่ใช้','Coins to use')}"></div>
  <div class="bk-total"><span>${t('ยอดชำระ','Total')}</span><b id="bkTotal">${fmt(P.total)} ${t('บาท','THB')}</b></div>
  <ul class="bk-terms">${BK_TERMS.map(v=>`<li>${x(v)}</li>`).join('')}</ul>
  <button class="btn orange big" data-bkpay ${b.slot==null?'disabled':''}>${b.slot==null?t('เลือกวันและเวลาก่อน','Pick a day and time first'):t(`ชำระเงิน ${fmt(P.total)} บาท`,`Pay ${fmt(P.total)} THB`)}</button>
  <p class="demo-note">${t('เดโม: ชำระเงินจำลอง ไม่มีการตัดเงินจริง แต่เหรียญถูกหักจริง','Demo: the payment is simulated, but coins are really deducted')}</p></section></div>`}
function bkCoinsInput(v){const b=S.bk;if(!b)return;const P=bkPrice(ensureMentor(b.mid),+v);b.coins=P.coins;const c=$('#bkCoinsV'),tt=$('#bkTotal'),btn=$('[data-bkpay]');if(c)c.textContent='−'+fmt(P.coins);if(tt)tt.textContent=`${fmt(P.total)} ${t('บาท','THB')}`;if(btn&&b.slot!=null)btn.textContent=t(`ชำระเงิน ${fmt(P.total)} บาท`,`Pay ${fmt(P.total)} THB`)}
function bkPay(){const b=S.bk;if(!b||b.slot==null)return;b.topic=(($('#bkTopic')||{}).value||'').slice(0,300);const mt=ensureMentor(b.mid);
 needMember(()=>{if(mt.real&&!sbLive()){toast(t('ต้องเข้าสู่ระบบก่อนจองรุ่นพี่จริง','Log in to book a real mentor'));return}const P=bkPrice(mt,b.coins);openPay({what:'live',mid:b.mid,day:b.day,slot:b.slot,coinsUsed:P.coins,amount:P.total,topic:b.topic})})}
function liveErr(e){const m=String(e&&e.message||'');console.warn('[Maadoo Job] booking error:',e&&e.code,m);
 if(/slot taken/.test(m))return t('ช่องนี้เพิ่งถูกจองไป เลือกเวลาอื่นนะ','Someone just booked that slot. Pick another time');
 if(/not enough coins/.test(m))return t('เหรียญไม่พอ','Not enough coins');if(/too many coins/.test(m))return t('ใช้เหรียญได้ไม่เกิน 50% ของราคาหลังหัก Plus','Coins can cover at most 50% of the Plus price');
 if(/not available|not bookable|mentor unavailable/.test(m))return t('เวลานี้จองไม่ได้แล้ว เลือกเวลาอื่นนะ','That time can’t be booked any more. Pick another');
 if(/too early/.test(m))return t('ยังไม่ถึงเวลา ลองใหม่อีกสักครู่','It’s too early for that. Try again a bit later');
 if(/already started/.test(m))return t('เริ่มนัดไปแล้ว ยกเลิกไม่ได้','The call has started, so it can’t be cancelled');
 if(/invalid meet link/.test(m))return t('ลิงก์ต้องเป็น https://meet.google.com/…','The link must be https://meet.google.com/…');
 return chatErr(e)}
async function bookLive(m){const mt=ensureMentor(m.mid),P=bkPrice(mt,m.coinsUsed),st=slotStart(m.day,m.slot);let b;
 if(isUuid(m.mid)){const nm=S.user.email&&S.user.name===S.user.email.split('@')[0]?'':String(S.user.name||'').slice(0,30);
  const {data,error}=await SB.rpc('book_session',{mentor:m.mid,day:m.day,slot:m.slot,coins:m.coinsUsed,topic:m.topic||null,sname:nm});if(error){if(/slot taken/.test(error.message||''))loadAvail(m.mid);throw {message:liveErr(error)}}
  b=Array.isArray(data)?data[0]:data;await Promise.all([refreshAll(),loadChat()])}
 else{const id='demo-'+randHex(12);if(P.coins)await addCoins(-P.coins,'spend','booking:'+id);
  b={id,demo:true,mentor_id:m.mid,student_id:S.user.id||'me',room_id:null,starts_at:new Date(st).toISOString(),price:P.full,plus_discount:P.disc,coins_used:P.coins,paid:P.total,mentor_earn:P.earn,topic:m.topic||null,status:'booked',refund_coins:0,meet_url:'https://meet.jit.si/maadoojob-'+randHex(40),meet_custom:null,student_saved_note:false,created_at:new Date().toISOString()};
  const av=S.avail[m.mid];if(av)av.taken.add(st)}
 S.bookings=S.bookings.filter(v=>v.id!==b.id);S.bookings.unshift(b);addPoints(10);S.bk=null;
 pushNotif('📅',`นัดคุยสดกับ${mt.name[0]} ${whenTxt(st)}`,`Live call with ${mt.name[1]}, ${whenTxt(st)}`,['live',b.id]);S.liveId=b.id;S.view='live'}
/* ---------- live call room ---------- */
const bkMine=b=>!!(S.user&&(b.student_id===S.user.id||(b.demo&&b.student_id==='me')));
const bkMentorSide=b=>!!(S.user&&b.mentor_id===S.user.id);
function bkOther(b){if(bkMentorSide(b)){const r=S.rooms.find(v=>v.id===b.room_id);return r&&r.student_name?esc(r.student_name):t('น้อง (ไม่ระบุชื่อ)','A student')}return x(ensureMentor(b.mentor_id).name)}
function livePhase(b){const st=Date.parse(b.starts_at),n=Date.now();if(b.status!=='booked')return b.status;if(n<st-6e5)return 'before';if(n<st+LIVE_MIN*6e4)return 'open';return 'over'}
function ringSvg(b){const st=Date.parse(b.starts_at),n=Date.now(),dur=LIVE_MIN*6e4,el=Math.max(0,Math.min(dur,n-st)),p=n<st?0:el/dur,C=2*Math.PI*52,left=dur-el;
 const center=b.status!=='booked'?x(BK_ST[b.status]):n<st?(st-n>DAY?t(`อีก ${Math.ceil((st-n)/DAY)} วัน`,`in ${Math.ceil((st-n)/DAY)} d`):st-n>=36e5?t(`อีก ${Math.floor((st-n)/36e5)} ชม. ${Math.floor((st-n)%36e5/6e4)} น.`,`in ${Math.floor((st-n)/36e5)}h ${Math.floor((st-n)%36e5/6e4)}m`):t(`อีก ${Math.ceil((st-n)/6e4)} นาที`,`in ${Math.ceil((st-n)/6e4)} min`)):left>0?`${String(Math.floor(left/6e4)).padStart(2,'0')}:${String(Math.floor(left%6e4/1e3)).padStart(2,'0')}`:t('หมดเวลา','Time’s up');
 return `<svg viewBox="0 0 120 120" class="lv-ring ${n>=st&&left<=5*6e4&&left>0&&b.status==='booked'?'hot':''}" role="img" aria-label="${esc(String(center))}"><circle cx="60" cy="60" r="52" class="lv-track"/><circle cx="60" cy="60" r="52" class="lv-prog" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-p)).toFixed(1)}" transform="rotate(-90 60 60)"/><text x="60" y="58" text-anchor="middle" class="lv-big ${String(center).length>7?'sm':''}">${esc(String(center))}</text><text x="60" y="78" text-anchor="middle" class="lv-small">${t('30 นาที','30 min')}</text></svg>`}
function noteCard(b,mine){const n=S.notes[b.id];if(!n)return '';return `<section class="card lv-note"><div class="row" style="gap:8px"><b>📝 ${t('สรุปจากรุ่นพี่','Summary from your mentor')}</b>${mine?`<button class="btn ${b.student_saved_note?'ghost':'y'} sm" style="margin-left:auto" data-bksave="${b.id}">${b.student_saved_note?`✓ ${t('บันทึกแล้ว','Saved')}`:`🔖 ${t('บันทึกเก็บไว้','Save')}`}</button>`:''}</div><ol>${n.tips.map(v=>`<li>${esc(v)}</li>`).join('')}</ol><small class="muted">${x(ensureMentor(b.mentor_id).name)} · ${whenTxt(Date.parse(b.starts_at))}</small></section>`}
function liveView(){const b=S.bookings.find(v=>v.id===S.liveId);
 if(!S.user||!b)return `<div class="card empty" style="margin-top:20px;display:grid;gap:10px;justify-items:center">${t('ไม่พบนัดนี้ หรือยังไม่ได้เข้าสู่ระบบ','Booking not found, or you’re not logged in')}<button class="btn ghost sm" data-go="me">${t('ไปหน้าฉัน','Go to Me')}</button></div>`;
 const ms=bkMentorSide(b),mt=ensureMentor(b.mentor_id),st=Date.parse(b.starts_at),n=Date.now(),ph=livePhase(b),stt=BK_ST[b.status],link=b.meet_custom||b.meet_url,canJoin=b.status==='booked'&&n>=st-6e5&&n<st+90*6e4;
 const refund=b.coins_used>0?t(`คืน ${b.coins_used} เหรียญ`,`${b.coins_used} coins back`):t('ไม่มีเหรียญต้องคืน','no coins to refund');
 return `<div class="lvv"><header class="card bk-head"><button class="cv-ib" data-go="me" aria-label="${t('ย้อนกลับ','Back')}">←</button><span class="ava" style="width:48px;height:48px;font-size:24px;background:${ms?'var(--sky)':mt.bg}">${ms?'🙂':mt.ava}</span><div class="cv-t"><b>🎥 ${t('คุยสดกับ','Live call with')} ${bkOther(b)}</b><span class="muted">${whenTxt(st)} · ${t('30 นาที','30 min')} · <span class="chip ${stt[2]}">${x(stt)}</span>${b.demo?` · <span class="chip">${t('เดโม','demo')}</span>`:''}</span></div></header>
 <section class="card lv-main"><div class="lv-ringbox" id="lvRing">${ringSvg(b)}</div><div class="lv-join">
  ${b.status==='booked'?(canJoin?`<a class="btn orange big" href="${esc(link)}" target="_blank" rel="noopener noreferrer" data-lvjoin>🎥 ${t('เข้าห้องวิดีโอ','Join the video call')}</a><small class="muted lv-link">${esc(link.replace(/^https:\/\//,''))}</small>`:`<button class="btn big" disabled>🎥 ${t('เข้าห้องวิดีโอ','Join the video call')}</button><small class="muted">${n<st?t('เปิดได้ก่อนเวลานัด 10 นาที','Opens 10 minutes before the call'):t('ห้องปิดแล้ว','The room has closed')}</small>`):''}
  ${b.room_id?`<button class="btn ghost" data-chat="${b.room_id}">💬 ${t('เปิดแชท (ใช้ต่อได้)','Open the chat')}</button>`:''}
  ${b.topic?`<p class="lv-topic">💭 ${esc(b.topic)}</p>`:''}</div></section>
 ${ms&&b.status==='booked'?`<form id="meetForm" class="card bk-sec"><b>🔗 ${t('ใช้ลิงก์ Google Meet ของคุณเอง (ไม่บังคับ)','Use your own Google Meet link (optional)')}</b><div class="row" style="flex-wrap:nowrap"><input class="field" id="meetIn" style="flex:1;min-width:0" maxlength="80" placeholder="https://meet.google.com/abc-defg-hij" value="${esc(b.meet_custom||'')}"><button class="btn ghost sm">${t('บันทึก','Save')}</button></div><small class="muted">${t('เว้นว่าง = ใช้ห้อง Jitsi ที่สร้างให้อัตโนมัติ','Leave empty to use the auto-created Jitsi room')}</small></form>`:''}
 ${b.status==='booked'?`<section class="card bk-sec lv-acts">${n<st?`<button class="btn ghost" data-bkcancel="${b.id}">✕ ${ms?t('ยกเลิกนัด (คืนเต็มให้น้อง)','Cancel (full refund to the student)'):st-n>=12*36e5?t(`ยกเลิกฟรี (${refund})`,`Cancel for free (${refund})`):t('ยกเลิก (ไม่คืนเงิน · เหลือไม่ถึง 12 ชม.)','Cancel (no refund · under 12 h left)')}</button>`:''}
  ${n>=st+10*6e4?`<button class="btn ghost" data-bknoshow="${b.id}">🙈 ${ms?t('น้องไม่มา','The student didn’t show up'):t('รุ่นพี่ไม่มา (คืนเต็ม)','The mentor didn’t show up (full refund)')}</button>`:''}
  ${n>=st+15*6e4?`<button class="btn y" data-bkdone="${b.id}">✓ ${t('คุยเสร็จแล้ว','We’re done')}</button>`:''}
  ${n<st+10*6e4?`<small class="muted">${t('ปุ่ม “ไม่มาตามนัด” จะขึ้นหลังเวลานัด 10 นาที และ “คุยเสร็จแล้ว” หลัง 15 นาที','“No-show” appears 10 minutes after the start, and “We’re done” after 15 minutes')}</small>`:''}
  ${b.demo?`<div class="demo-row">🧪 ${t('เดโม:','Demo:')} <button class="link" data-bkskip="${b.id}">${n<st?t('ข้ามไปเวลานัด','Skip to the start'):t('ข้ามไป 20 นาที','Skip 20 minutes')}</button></div>`:''}</section>`:''}
 ${b.status==='cancelled'?`<p class="cv-end muted">${t(`ยกเลิกแล้ว · คืน ${b.refund_coins} เหรียญ`,`Cancelled · ${b.refund_coins} coins refunded`)}</p>`:''}
 ${b.status==='mentor_noshow'?`<p class="cv-end muted">${t(`รุ่นพี่ไม่มาตามนัด · คืน ${b.refund_coins} เหรียญแล้ว`,`The mentor didn’t show up · ${b.refund_coins} coins refunded`)}</p>`:''}
 ${b.status==='student_noshow'?`<p class="cv-end muted">${t('น้องไม่มาตามนัด · ไม่มีการคืนเงิน','The student didn’t show up · no refund')}</p>`:''}
 ${ms&&['booked','done'].includes(b.status)&&n>=st?`<form id="noteForm" class="card bk-sec"><b>📝 ${t('สรุป 3 ข้อแนะนำให้น้อง','3 tips for your student')}</b>${[0,1,2].map(i=>`<input class="field" id="note${i}" maxlength="200" placeholder="${t(`ข้อ ${i+1}`,`Tip ${i+1}`)}" value="${esc((S.notes[b.id]&&S.notes[b.id].tips[i])||'')}">`).join('')}<button class="btn y">${S.notes[b.id]?t('อัปเดตสรุป','Update the summary'):t('ส่งสรุปให้น้อง','Send to the student')}</button><small class="muted">${t('ส่งสรุปแล้ว นัดนี้จะถือว่าคุยเสร็จ','Sending the summary marks the call as done')}</small></form>`:''}
 ${noteCard(b,!ms)}
 ${!ms&&b.status==='done'?(()=>{const bb=S.booked.find(v=>v.id===b.id),r=bb&&bb.rid&&findRev(bb.rid);return `<section class="card bk-sec">${r?`<span class="chip ver">✓ ${t('รีวิวแล้ว','Reviewed')} · ★${r.s}</span>`:`<button class="btn y" data-bkrev="${b.id}">⭐ ${t('ให้ดาวและรีวิวรุ่นพี่','Rate and review your mentor')}</button><small class="muted">${t('รีวิวจะติดป้าย “✓ คุยสดจริง”','Your review gets the “✓ Live call” badge')}</small>`}</section>`})():''}
 <section class="card bk-sec"><b>📜 ${t('เงื่อนไข','Terms')}</b><ul class="bk-terms">${BK_TERMS.map(v=>`<li>${x(v)}</li>`).join('')}</ul><small class="muted">${t(`ชำระ ${fmt(b.paid)} บาท (จำลอง) · ใช้ ${b.coins_used} เหรียญ${ms?` · รายได้คุณ ${fmt(b.mentor_earn)} บาท (จำลอง)`:''}`,`Paid ${fmt(b.paid)} THB (simulated) · ${b.coins_used} coins${ms?` · you earn ${fmt(b.mentor_earn)} THB (simulated)`:''}`)}</small></section>
 ${notifAsk()}</div>`}
let lvPhase='';
setInterval(()=>{if(S.view!=='live')return;const b=S.bookings.find(v=>v.id===S.liveId);if(!b)return;const ph=livePhase(b)+':'+(Date.now()>=Date.parse(b.starts_at)+10*6e4)+':'+(Date.now()>=Date.parse(b.starts_at)+15*6e4);
 if(ph!==lvPhase){const first=!lvPhase;lvPhase=ph;if(!first&&!document.activeElement.matches('input,textarea')){render();return}}const r=$('#lvRing');if(r)r.innerHTML=ringSvg(b)},1000);
/* reminders: 1 h before, at the start, and 5 minutes left (both sides, while the site is open) */
const bkSeen=new Set();
function bkRemind(){if(!S.user)return;const n=Date.now();S.bookings.forEach(b=>{if(b.status!=='booked'||!(bkMine(b)||bkMentorSide(b)))return;const st=Date.parse(b.starts_at),who=bkMentorSide(b)?[t('น้อง','your student'),'your student']:ensureMentor(b.mentor_id).name;
 const fire=(k,ic,th,en)=>{if(bkSeen.has(b.id+k))return;bkSeen.add(b.id+k);NOTIFS.unshift({ic,t:[th,en],w:['เมื่อสักครู่','Just now'],go:['live',b.id],read:false});renderBell();toast(`${ic} ${S.lang==='en'?en:th}`);
  try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted'){const nn=new Notification('Maadoo Job',{body:S.lang==='en'?en:th,icon:'maadoo-job-icon-512.png',tag:'maadoo-bk-'+b.id+k});nn.onclick=()=>{window.focus();go('live',{liveId:b.id});nn.close()}}}catch(e){}};
 if(st-n<=36e5&&st-n>5*6e4)fire('h','⏰',`อีกไม่ถึง 1 ชม. ถึงเวลาคุยสดกับ${who[0]}`,`Less than an hour until your live call with ${who[1]}`);
 if(n>=st&&n<st+LIVE_MIN*6e4-5*6e4)fire('s','🎥',`ถึงเวลาคุยสดกับ${who[0]}แล้ว เข้าห้องได้เลย`,`Your live call with ${who[1]} is starting. Join now`);
 if(n>=st+(LIVE_MIN-5)*6e4&&n<st+LIVE_MIN*6e4)fire('5','⏳','เหลือเวลาคุยอีก 5 นาที','5 minutes left in your call')})}
setInterval(bkRemind,15000);
/* ---------- booking actions ---------- */
async function bkRpc(fn,args,ok,local){const b=S.bookings.find(v=>v.id===args.bk);if(!b)return;
 if(b.demo){local(b);render();if(ok)toast(ok);return}
 try{const {error}=await SB.rpc(fn,args);if(error)throw error;const {data}=await SB.from('bookings').select('*').eq('id',b.id).maybeSingle();if(data)Object.assign(b,data);if(fn==='cancel_booking'||fn==='report_noshow')refreshAll();if(ok)toast(ok);loadChat()}catch(e){toast(liveErr(e))}render()}
function demoFinish(b,st){b.status=st;b.ended_at=new Date().toISOString();if(st==='cancelled'||st==='mentor_noshow'){b.mentor_earn=0;b.refund_coins=st==='mentor_noshow'||Date.parse(b.starts_at)-Date.now()>=12*36e5?b.coins_used:0;if(b.refund_coins){S.prem.ledger.unshift({id:'l-rf-'+b.id,delta:b.refund_coins,kind:'refund',ref:'refund:'+b.id,status:'ok',at:Date.now()});S.prem.coins+=b.refund_coins}}}
function bkCancel(id){const b=S.bookings.find(v=>v.id===id);if(!b)return;openModal({type:'bkcancel',bk:id})}
function bkcancelModal(m,head){const b=S.bookings.find(v=>v.id===m.bk);if(!b)return head('','');const ms=bkMentorSide(b),free=ms||Date.parse(b.starts_at)-Date.now()>=12*36e5;
 return head(t('ยกเลิกนัดนี้?','Cancel this call?'),whenTxt(Date.parse(b.starts_at)))+`<p style="margin:0">${ms?t('น้องจะได้เหรียญคืนเต็มจำนวน','The student gets all their coins back'):free?t(`ยกเลิกฟรี ได้คืน ${b.coins_used} เหรียญ`,`Free cancellation: ${b.coins_used} coins back`):t('เหลือไม่ถึง 12 ชม. ยกเลิกตอนนี้จะไม่ได้เงินหรือเหรียญคืน','Less than 12 h left, so cancelling now gives no refund')}</p>
 <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>${t('ไม่ยกเลิก','Keep it')}</button><button class="btn danger" data-bkcancelok>✕ ${t('ยกเลิกนัด','Cancel the call')}</button></div>`}
function bkReview(b){const mt=ensureMentor(b.mentor_id);let bb=S.booked.find(v=>v.id===b.id);if(!bb){bb={id:b.id,m:mt,mid:mt.id,slot:null,at:Date.parse(b.starts_at),st:'done',rid:null,live:true};S.booked.push(bb)}bb.live=true;bb.st='done';openMrev(bb.id)}
async function bkSaveNote(b){const tips=[0,1,2].map(i=>(($('#note'+i)||{}).value||'').trim().slice(0,200)).filter(Boolean);if(!tips.length){toast(t('เขียนอย่างน้อย 1 ข้อนะ','Write at least one tip'));return}
 if(b.demo){S.notes[b.id]={booking_id:b.id,tips};if(b.status==='booked')demoFinish(b,'done');render();toast(t('ส่งสรุปแล้ว','Summary sent'));return}
 try{const {error}=await SB.rpc('save_session_notes',{bk:b.id,tips});if(error)throw error;S.notes[b.id]={booking_id:b.id,tips};b.status='done';toast(t('ส่งสรุปให้น้องแล้ว','Summary sent to your student'));loadChat()}catch(e){toast(liveErr(e))}render()}
function onBooking(row){if(!row||!row.id||!S.user)return;const i=S.bookings.findIndex(v=>v.id===row.id),old=i>=0?S.bookings[i]:null;
 if(old)Object.assign(old,row);else S.bookings.unshift(row);
 if(!old&&row.mentor_id===S.user.id)notifyBk(row,'📅',`มีนัดคุยสดใหม่ ${whenTxt(Date.parse(row.starts_at))}`,`New live call booked for ${whenTxt(Date.parse(row.starts_at))}`);
 else if(old&&old.status!==row.status||old&&row.status!=='booked'&&!bkSeen.has(row.id+row.status)){bkSeen.add(row.id+row.status);if(row.status==='cancelled'&&row.cancelled_by!==S.user.id)notifyBk(row,'✕','นัดคุยสดถูกยกเลิก','A live call was cancelled');if(row.status==='done'&&bkMine(row))notifyBk(row,'✓','คุยสดเสร็จแล้ว ให้ดาวรุ่นพี่ได้เลย','Your live call is done. Rate your mentor')}
 const av=S.avail[row.mentor_id];if(av&&row.status!=='cancelled')av.taken.add(Date.parse(row.starts_at));if(['live','me','book'].includes(S.view))render();else nav()}
function onNote(row){if(!row||!row.booking_id)return;S.notes[row.booking_id]=row;const b=S.bookings.find(v=>v.id===row.booking_id);if(b&&bkMine(b)&&!bkSeen.has(b.id+'note')){bkSeen.add(b.id+'note');notifyBk(b,'📝','รุ่นพี่ส่งสรุป 3 ข้อแนะนำมาแล้ว','Your mentor sent a 3-point summary')}if(['live','me'].includes(S.view))render()}
function notifyBk(b,ic,th,en){NOTIFS.unshift({ic,t:[th,en],w:['เมื่อสักครู่','Just now'],go:['live',b.id],read:false});renderBell();if(!document.hidden)toast(`${ic} ${S.lang==='en'?en:th}`)}
async function loadBookings(){if(!sbLive())return;const uid=S.user.id;try{const [b,n]=await Promise.all([SB.from('bookings').select('*').order('starts_at',{ascending:false}).limit(200),SB.from('session_notes').select('*').limit(200)]);
 if(!S.user||S.user.id!==uid)return;if(b.error)console.warn('[Maadoo Job] bookings not ready (run the SQL, section 9):',b.error.code,b.error.message);else S.bookings=(b.data||[]).concat(S.bookings.filter(v=>v.demo));
 if(!n.error)(n.data||[]).forEach(r=>{S.notes[r.booking_id]=r});S.bookings.forEach(v=>ensureMentor(v.mentor_id));bkRemind()}catch(e){}if(['live','me'].includes(S.view))render()}
/* ---------- lists in "Me" ---------- */
function bkRow(b){const ms=bkMentorSide(b),mt=ensureMentor(b.mentor_id),st=BK_ST[b.status],soon=b.status==='booked'&&Date.parse(b.starts_at)-Date.now()<36e5;
 return `<button class="li q-li room-li" data-live="${b.id}"><span class="ava" style="width:38px;height:38px;font-size:18px;background:${ms?'var(--sky)':mt.bg}">${ms?'🙂':mt.ava}</span><div class="bk-t"><b>🎥 ${bkOther(b)}</b><span class="muted">${whenTxt(Date.parse(b.starts_at))}</span></div><span class="chip ${soon?'bad hot':st[2]}">${soon?t('ใกล้ถึงเวลา','Starting soon'):x(st)}</span></button>`}
function myLiveCalls(){if(!S.user)return '';const L=S.bookings.filter(bkMine);if(!L.length)return '';const up=L.filter(b=>b.status==='booked').sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at)),past=L.filter(b=>b.status!=='booked');const saved=L.filter(b=>b.student_saved_note&&S.notes[b.id]);
 return `<section class="sec"><div class="sec-h"><h2>🎥 ${t('นัดคุยสดของฉัน','My live calls')}</h2></div><div class="list">${up.concat(past.slice(0,5)).map(bkRow).join('')}</div></section>${saved.length?`<section class="sec"><div class="sec-h"><h2>📝 ${t('สรุปที่บันทึกไว้','Saved summaries')}</h2></div><div class="grid" style="gap:10px">${saved.map(b=>noteCard(b,true)).join('')}</div></section>`:''}`}
function mentorBookings(){const me=S.user.id,L=S.bookings.filter(b=>b.mentor_id===me),up=L.filter(b=>b.status==='booked').sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at));
 return `<div class="mb-bk"><b>📅 ${t('นัดคุยสดที่กำลังจะถึง','Upcoming live calls')} (${up.length})</b>${up.length?`<div class="list">${up.map(bkRow).join('')}</div>`:`<p class="muted" style="margin:0">${t('ยังไม่มีนัด ตั้งเวลาว่างไว้ น้อง ๆ จะจองได้','No calls yet. Set your free times so students can book')}</p>`}</div>`}
const liveEarned=()=>{const ms=monthStart(),me=S.user&&S.user.id;return S.bookings.filter(b=>b.mentor_id===me&&['done','student_noshow'].includes(b.status)&&Date.parse(b.ended_at||b.starts_at)>=ms).reduce((a,b)=>a+(b.mentor_earn|0),0)};
/* ---------- availability editor (mentor mode) ---------- */
async function openAvailEdit(){const me=S.user.id;await loadAvail(me);const av=S.avail[me]||{slots:new Set(),off:[],daysOff:new Set()};S.availEdit={wd:isoDow(bkkDay()),slots:new Set(av.slots),off:[...av.off],daysOff:[...av.daysOff].filter(d=>d>=bkkDay()).sort(),busy:false};render()}
function availEditor(){const A=S.availEdit;if(!A)return `<button class="btn ghost" data-avopen>🗓️ ${t('ตั้งเวลาว่างรายสัปดาห์','Set weekly free times')}</button>`;const off=A.off.includes(A.wd),n=w=>[...A.slots].filter(k=>k.startsWith(w+':')).length;
 return `<div class="card av-ed"><div class="row" style="gap:8px"><b>🗓️ ${t('เวลาว่างรายสัปดาห์ (ช่องละ 30 นาที)','Weekly free times (30-minute slots)')}</b></div>
 <div class="av-wd" role="tablist">${[1,2,3,4,5,6,7].map(w=>`<button role="tab" aria-selected="${A.wd===w}" class="${A.wd===w?'on':''} ${A.off.includes(w)?'off':''}" data-avwd="${w}">${x(WD[w])}<small>${A.off.includes(w)?t('ปิด','off'):n(w)}</small></button>`).join('')}</div>
 <button class="fx-row mb-sw" data-avoff role="switch" aria-checked="${!off}"><span><b>${t(`รับนัดวัน${WDL[A.wd][0]}`,`Take calls on ${WDL[A.wd][1]}s`)}</b><small>${off?t('ปิดทั้งวัน','Closed all day'):t(`${n(A.wd)} ช่อง`,`${n(A.wd)} slots`)}</small></span><i class="tg ${off?'':'on'}"></i></button>
 ${off?'':`<div class="av-slots">${[...Array(SLOT_MAX-SLOT_MIN+1)].map((_,i)=>{const s=SLOT_MIN+i,on=A.slots.has(A.wd+':'+s);return `<button class="bk-slot ${on?'on':''}" data-avslot="${s}" aria-pressed="${on}">${slotTxt(s)}</button>`}).join('')}</div>`}
 <div class="av-off"><b>🏖️ ${t('ปิดบางวัน (วันหยุด)','Days off')}</b><div class="row" style="flex-wrap:nowrap"><input type="date" class="field" id="avDay" min="${bkkDay()}" style="flex:1;min-width:0"><button class="btn ghost sm" data-avdayadd>${t('เพิ่ม','Add')}</button></div>
  ${A.daysOff.length?`<div class="row" style="gap:6px">${A.daysOff.map(d=>`<span class="chip">${new Date(Date.parse(d+'T12:00:00+07:00')).toLocaleDateString(S.lang==='en'?'en-GB':'th-TH',{weekday:'short',day:'numeric',month:'short'})} <button class="link" data-avdaydel="${d}" aria-label="${t('ลบ','Remove')}">×</button></span>`).join('')}</div>`:''}</div>
 <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-avclose>${t('ปิด','Close')}</button><button class="btn y" data-avsave ${A.busy?'disabled':''}>${t('บันทึกเวลาว่าง','Save free times')}</button></div></div>`}
async function saveAvail(){const A=S.availEdit,me=S.user.id;if(!A||A.busy)return;A.busy=true;render();
 try{const rows=[...A.slots].map(k=>{const [w,s]=k.split(':');return {mentor_id:me,weekday:+w,slot:+s}});
  let r=await SB.from('mentor_availability').delete().eq('mentor_id',me);if(r.error)throw r.error;if(rows.length){r=await SB.from('mentor_availability').insert(rows);if(r.error)throw r.error}
  r=await SB.from('mentor_days_off').delete().eq('mentor_id',me);if(r.error)throw r.error;if(A.daysOff.length){r=await SB.from('mentor_days_off').insert(A.daysOff.map(day=>({mentor_id:me,day})));if(r.error)throw r.error}
  r=await SB.from('mentors').update({off_weekdays:A.off}).eq('id',me);if(r.error)throw r.error;
  S.availEdit=null;await loadAvail(me);toast(t('บันทึกเวลาว่างแล้ว','Free times saved'))}catch(e){A.busy=false;toast(liveErr(e))}render()}
/* ---------- events ---------- */
document.addEventListener('click',e=>{const el=e.target.closest('[data-bkday],[data-bkslot],[data-bkpay],[data-live],[data-bkcancel],[data-bkcancelok],[data-bknoshow],[data-bkdone],[data-bksave],[data-bkrev],[data-bkskip],[data-lvjoin],[data-avopen],[data-avclose],[data-avwd],[data-avoff],[data-avslot],[data-avdayadd],[data-avdaydel],[data-avsave]');if(!el)return;const d=el.dataset;
 if(d.bkday){if(el.classList.contains('off'))return;S.bk.topic=(($('#bkTopic')||{}).value||'');S.bk.day=d.bkday;S.bk.slot=null;render();return}
 if(d.bkslot){S.bk.topic=(($('#bkTopic')||{}).value||'');S.bk.slot=+d.bkslot;render();return}
 if(d.bkpay!==undefined){bkPay();return}
 if(d.live){go('live',{liveId:d.live});return}
 if(d.bkcancel){bkCancel(d.bkcancel);return}
 if(d.bkcancelok!==undefined){const id=S.modal&&S.modal.bk;closeModal();bkRpc('cancel_booking',{bk:id},t('ยกเลิกนัดแล้ว','Call cancelled'),b=>demoFinish(b,'cancelled'));return}
 if(d.bknoshow){const b=S.bookings.find(v=>v.id===d.bknoshow);bkRpc('report_noshow',{bk:d.bknoshow},t('บันทึกแล้ว','Noted'),x2=>demoFinish(x2,bkMentorSide(b)?'student_noshow':'mentor_noshow'));return}
 if(d.bkdone){bkRpc('complete_booking',{bk:d.bkdone},t('คุยเสร็จแล้ว ช่องทางติดต่อในแชทไม่ถูกซ่อนแล้ว','Done. Contact details are no longer hidden in the chat'),b=>demoFinish(b,'done'));const b=S.bookings.find(v=>v.id===d.bkdone);if(b&&bkMine(b))setTimeout(()=>{if(b.status==='done')bkReview(b)},600);return}
 if(d.bksave){const b=S.bookings.find(v=>v.id===d.bksave);if(!b)return;const v=!b.student_saved_note;b.student_saved_note=v;render();toast(v?t('บันทึกสรุปไว้ในหน้าฉันแล้ว','Summary saved to your Me page'):t('เอาออกจากที่บันทึกแล้ว','Removed from saved'));if(!b.demo&&SB)SB.rpc('toggle_note_saved',{bk:b.id,saved:v}).then(({error})=>{if(error){b.student_saved_note=!v;render();toast(liveErr(error))}});return}
 if(d.bkrev){const b=S.bookings.find(v=>v.id===d.bkrev);if(b)bkReview(b);return}
 if(d.bkskip){const b=S.bookings.find(v=>v.id===d.bkskip);if(!b)return;const st=Date.parse(b.starts_at),n=Date.now();b.starts_at=new Date(n<st?n-3e4:st-20*6e4).toISOString();if(!ensureMentor(b.mentor_id).real&&!S.notes[b.id]&&n>=st)S.notes[b.id]={booking_id:b.id,tips:[t('ทำเรซูเม่ 1 หน้า ใส่ผลงานเป็นตัวเลข','Keep your resume to one page, with results as numbers'),t('ซ้อมตอบ “ทำไมถึงอยากทำงานที่นี่” ให้คล่อง','Practise answering “why do you want to work here?”'),t('สมัครอย่างน้อย 5 ที่ในสัปดาห์นี้','Apply to at least 5 places this week')]};lvPhase='';render();return}
 if(d.lvjoin!==undefined){toast(t('เปิดห้องวิดีโอในแท็บใหม่แล้ว แชทและตัวจับเวลายังอยู่ที่นี่','The video call opened in a new tab; the chat and timer stay here'));return}
 if(d.avopen!==undefined){openAvailEdit();return}
 if(d.avclose!==undefined){S.availEdit=null;render();return}
 const A=S.availEdit;if(!A)return;
 if(d.avwd){A.wd=+d.avwd;render();return}
 if(d.avoff!==undefined){const i=A.off.indexOf(A.wd);if(i>=0)A.off.splice(i,1);else A.off.push(A.wd);render();return}
 if(d.avslot){const k=A.wd+':'+d.avslot;if(A.slots.has(k))A.slots.delete(k);else A.slots.add(k);render();return}
 if(d.avdayadd!==undefined){const v=($('#avDay')||{}).value;if(v&&v>=bkkDay()&&!A.daysOff.includes(v)){A.daysOff.push(v);A.daysOff.sort();render()}return}
 if(d.avdaydel){A.daysOff=A.daysOff.filter(v=>v!==d.avdaydel);render();return}
 if(d.avsave!==undefined){saveAvail();return}});
document.addEventListener('submit',e=>{if(e.target.id==='meetForm'){e.preventDefault();const b=S.bookings.find(v=>v.id===S.liveId);if(!b)return;const url=(($('#meetIn')||{}).value||'').trim();
  if(url&&!/^https:\/\/meet\.google\.com\/[a-z0-9-]{3,40}$/.test(url)){toast(liveErr({message:'invalid meet link'}));return}
  if(b.demo){b.meet_custom=url||null;render();toast(t('บันทึกลิงก์แล้ว','Link saved'));return}
  SB.rpc('set_meet_link',{bk:b.id,url:url||null}).then(({error})=>{if(error){toast(liveErr(error));return}b.meet_custom=url||null;render();toast(t('บันทึกลิงก์แล้ว','Link saved'))});return}
 if(e.target.id==='noteForm'){e.preventDefault();const b=S.bookings.find(v=>v.id===S.liveId);if(b)bkSaveNote(b)}});
document.addEventListener('input',e=>{if(e.target.id==='bkCoins')bkCoinsInput(e.target.value);if(e.target.id==='bkTopic'&&S.bk)S.bk.topic=e.target.value});
