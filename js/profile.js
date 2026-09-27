/* Maadoo Job · js/profile.js — my profile: photo (upload + round crop, or a theme pup), display name, bio, faculty/year, fields, links, resume (private PDF);
   completeness card + the one-time "complete your profile +10" coin mission. Classic script sharing one global scope; see CLAUDE.md for load order.
   Privacy: none of this is ever shown on reviews (reviews stay anonymous). The resume opens only for its owner and whoever it was sent to (job application / chat room). */
const blankProf=()=>({uid:null,name:'',avatar:null,bio:'',year:null,links:{pf:'',li:''},resume:null,loading:false,loaded:false});
S.prof=blankProf();S.pe=null;
const PF_YEARS=['1','2','3','4','5','6','grad'];
const AVA_MAX=2*1024*1024,RES_MAX=5*1024*1024,AVA_TYPES=['image/jpeg','image/png','image/webp'],AVA_PX=256;
const yearName=y=>y==='grad'?t('จบแล้ว','Graduated'):y?t(`ปี ${y}`,`Year ${y}`):'';
const avaSrc=v=>!v?'':/^pup:/.test(v)?PUP(v.slice(4)):v;
/* the profile always belongs to the logged-in user; a different (or no) user gets a fresh one, loaded from Supabase when possible */
function prof(){if(!S.user)return blankProf();const u=S.user.id||'demo';if(S.prof.uid!==u){S.prof=blankProf();S.prof.uid=u;if(S.user.id&&!S.user.anon)loadProf()}return S.prof}
const myAvaSrc=()=>S.user?avaSrc(prof().avatar):'';
function avaHtml(cls){const src=myAvaSrc(),n=S.user?S.user.name:'';return src?`<img class="${cls} ava-img" src="${esc(src)}" alt="">`:`<span class="${cls}" aria-hidden="true">${esc([...String(n||'🙂')][0].toUpperCase())}</span>`}
const blen=s=>[...String(s||'')].length;
/* ---------- rude words (display names): Thai + English, checked after removing spaces, dots and look-alike digits ---------- */
const BAD_TH=['เหี้ย','สัส','ควย','เย็ด','จัญไร','ระยำ','ส้นตีน','ดอกทอง','อีดอก','ชาติหมา','แตด','หน้าหี','ไอ้สัตว์','อีสัตว์','เงี่ยน','กะหรี่','ร่านสวาท'];
const BAD_EN=['fuck','fuk','shit','bitch','cunt','asshole','bastard','slut','whore','nigg','fag','porn','rape','dickhead','motherf'];
function badWord(s){const v=String(s||'').toLowerCase().normalize('NFC').replace(/[0@4$15!3]/g,c=>({'0':'o','@':'a','4':'a','$':'s','1':'i','5':'s','!':'i','3':'e'}[c])).replace(/[\s._\-*+~'"`|/\\]+/g,'');
 return BAD_TH.some(w=>v.includes(w))||BAD_EN.some(w=>v.includes(w))}
function normUrl(s){s=String(s||'').trim();if(!s)return '';if(!/^https?:\/\//i.test(s))s='https://'+s;try{const u=new URL(s);if(!/^https?:$/.test(u.protocol)||!u.hostname.includes('.'))return null;u.protocol='https:';return u.href.length>198?null:u.href}catch(e){return null}}
/* ---------- completeness (links are optional and don't count) ---------- */
function profItems(){const P=prof();return [['ava',!!P.avatar,['รูปโปรไฟล์','Photo']],['name',!!P.name,['ชื่อที่ใช้แสดง','Display name']],['bio',!!P.bio,['แนะนำตัว','Bio']],['fac',!!FAC[S.ob.fac],['คณะ/สาขา','Faculty']],['year',!!P.year,['ชั้นปี','Year']],['inds',S.ob.inds.length>0,['สายงานที่สนใจ','Fields']],['resume',!!P.resume,['เรซูเม่','Resume']]]}
const profPct=()=>{const L=profItems();return Math.round(L.filter(v=>v[1]).length/L.length*100)};
const PROF_REF='profile:complete',PROF_COINS=10;
function profCard(){if(!S.user)return '';const pct=profPct(),miss=profItems().filter(v=>!v[1]),got=claimed(PROF_REF);if(pct>=100&&got)return '';
 return `<section class="sec"><div class="card pf-card"><div class="row" style="gap:10px"><b>🪪 ${t(`โปรไฟล์ครบ ${pct}%`,`Profile ${pct}% complete`)}</b>${got?'':`<span class="ms-coin">+${PROF_COINS} ${t('เหรียญ','coins')}</span>`}</div>
  <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
  ${miss.length?`<small class="muted">${t('ยังขาด','Still missing')}: ${miss.map(v=>x(v[2])).join(' · ')}</small>`:''}
  <button class="btn ${pct>=100?'y':'ghost'} sm" data-pfedit style="justify-self:start">${pct>=100?t(`รับ ${PROF_COINS} เหรียญ`,`Claim ${PROF_COINS} coins`):t('ทำโปรไฟล์ให้ครบ','Complete my profile')}</button></div></section>`}
/* Me page: bio, faculty · year, links under my name */
function meAbout(){const P=prof(),bits=[FAC[S.ob.fac]?`${FAC[S.ob.fac].e} ${facName()}`:'',yearName(P.year)].filter(Boolean),L=[[P.links.pf,'🔗 Portfolio'],[P.links.li,'💼 LinkedIn']].filter(v=>v[0]);
 return (P.bio?`<p class="me-bio">${esc(P.bio)}</p>`:'')+(bits.length||L.length?`<div class="me-meta muted">${bits.map(esc).join(' · ')}${L.map(v=>`<a class="link" href="${esc(v[0])}" target="_blank" rel="noopener nofollow">${v[1]}</a>`).join('')}</div>`:'')}
/* wallet: the one-time mission row */
function profMissionRow(){const pct=S.user?profPct():0,got=claimed(PROF_REF),l=S.prem.ledger.find(v=>v.ref===PROF_REF);
 return `<div class="ms ${got?'done':''}"><span class="ms-ic">🪪</span><div class="ms-b"><div class="row" style="gap:6px"><b>${t('ทำโปรไฟล์ให้ครบ','Complete your profile')}</b><span class="ms-coin">+${PROF_COINS}</span></div><small class="muted">${t('ครั้งเดียว · รูป ชื่อ แนะนำตัว คณะ ชั้นปี สายงาน เรซูเม่','Once · photo, name, bio, faculty, year, fields, resume')}</small>
  <div class="bar thin"><i style="width:${pct}%"></i></div><small class="muted">${pct}%</small></div>
  <div class="ms-a">${got?`<span class="chip ver">✓ ${t('ได้แล้ว','Earned')}</span>`:pct>=100?`<button class="btn y sm" data-pfclaim>${t('รับเหรียญ','Claim')}</button>`:`<button class="btn ghost sm" data-pfedit>${t('ไปทำ','Go')}</button>`}</div></div>`}
async function profClaim(quiet){if(!S.user||S.user.anon||profPct()<100||claimed(PROF_REF))return;
 try{await addCoins(PROF_COINS,'profile',PROF_REF);toast(t(`โปรไฟล์ครบแล้ว! +${PROF_COINS} เหรียญ 🎉`,`Profile complete! +${PROF_COINS} coins 🎉`));rerender()}
 catch(e){if(!quiet||!(e&&(e.code==='23505'||e.message==='duplicate')))toast(profErr(e))}}
function profErr(e){const m=String(e&&e.message||'');if(e&&e.code)console.warn('[Maadoo Job] profile error:',e.code,m);
 if(e&&(e.code==='42703'||e.code==='PGRST204'||/column|schema cache/i.test(m)))return t('ยังไม่ได้ตั้งค่าโปรไฟล์ใน Supabase (รัน SQL ส่วนที่ 12)','Profiles aren’t set up in Supabase yet (run the SQL, section 12)');
 if(/bucket/i.test(m))return t('ยังไม่ได้สร้างที่เก็บรูป/เรซูเม่ใน Supabase (รัน SQL ส่วนที่ 12)','Photo/resume storage isn’t set up in Supabase yet (run the SQL, section 12)');
 if(/mime|size|too large|exceeded/i.test(m))return t('ไฟล์ใหญ่หรือชนิดไม่ถูกต้อง','The file is too large or the wrong type');
 if(/profile incomplete/.test(m))return t('โปรไฟล์ยังไม่ครบในระบบ ลองบันทึกอีกครั้ง','Your saved profile isn’t complete yet. Try saving again');
 return premErr(e)}
/* ---------- Supabase ---------- */
const PROF_COLS='display_name,avatar_url,bio,year,links,resume_path,resume_name,resume_size,resume_at';
async function loadProf(){const P=S.prof;if(!sbLive()||P.loading)return;P.loading=true;
 try{const {data,error}=await SB.from('profiles').select(PROF_COLS).eq('id',S.user.id).maybeSingle();if(S.prof!==P)return;
  if(error){console.warn('[Maadoo Job] profile not loaded (run the SQL, section 12):',error.code,error.message);return}
  if(data){P.name=data.display_name||'';P.avatar=data.avatar_url||null;P.bio=data.bio||'';P.year=PF_YEARS.includes(data.year)?data.year:null;const L=data.links||{};P.links={pf:L.portfolio||'',li:L.linkedin||''};
   P.resume=data.resume_path?{path:data.resume_path,name:data.resume_name||'resume.pdf',size:data.resume_size||0,at:Date.parse(data.resume_at)||0}:null}
 }catch(e){}finally{P.loading=false;P.loaded=true}rerender()}
async function profRow(row){await ensureProfile();const {error}=await SB.from('profiles').update(row).eq('id',S.user.id);if(error)throw error}
/* my rooms as the asker carry my current name/photo (the database trigger updates them for the mentor too) */
function profToRooms(){if(!S.user||!S.rooms)return;const P=prof();S.rooms.forEach(r=>{if(r.student_id===S.user.id){r.student_name=P.name||'';r.student_avatar=P.avatar||null}})}
/* ---------- edit page (view "profile") ---------- */
function openProfile(){needMember(()=>{const P=prof();S.pe={name:P.name,bio:P.bio,year:P.year,inds:S.ob.inds.slice(),pf:P.links.pf,li:P.links.li,ava:undefined,pups:false,err:null,busy:false};go('profile')})}
const peAva=()=>{const e=S.pe;return e.ava===undefined?avaSrc(prof().avatar):e.ava===null?'':e.ava.url||avaSrc(e.ava)};
function profilePage(){if(!S.user)return me();const P=prof();if(!S.pe){S.pe={name:P.name,bio:P.bio,year:P.year,inds:S.ob.inds.slice(),pf:P.links.pf,li:P.links.li,ava:undefined,pups:false,err:null,busy:false}}const e=S.pe,src=peAva(),R=P.resume;
 const lbl=(th,en,opt)=>`<b>${t(th,en)}${opt?` <span class="muted">(${t('ไม่บังคับ','optional')})</span>`:''}</b>`;
 return `<div class="pf"><button class="link pf-back" data-go="me">← ${t('กลับหน้าฉัน','Back to Me')}</button><h1 class="pg-t">${t('แก้ไขโปรไฟล์','Edit profile')}</h1>
 <p class="muted pg-sub">🔒 ${t('ชื่อ รูป และโปรไฟล์ไม่แสดงบนรีวิว รีวิวยังไม่ระบุตัวตนเหมือนเดิม','Your name, photo and profile never appear on reviews. Reviews stay anonymous.')}</p>
 <section class="card pf-sec pf-ava-sec"><div class="pf-ava-wrap">${src?`<img class="pf-ava ava-img" src="${esc(src)}" alt="${t('รูปโปรไฟล์','Profile photo')}">`:`<span class="pf-ava" aria-hidden="true">${esc([...(e.name||S.user.name||'🙂')][0].toUpperCase())}</span>`}</div>
  <div class="pf-ava-acts">${lbl('รูปโปรไฟล์','Profile photo')}<small class="muted">${t('JPG, PNG หรือ WebP ไม่เกิน 2MB · ครอปเป็นวงกลม','JPG, PNG or WebP up to 2 MB · cropped to a circle')}</small>
   <div class="row" style="gap:8px"><label class="btn sm pf-up">📷 ${t('อัปโหลดรูป','Upload')}<input type="file" id="pfFile" accept="${AVA_TYPES.join(',')}" class="sr-only"></label><button class="btn ghost sm" data-pfpups aria-expanded="${e.pups}">🐶 ${t('ใช้รูปน้องหมา','Use a pup')}</button>${src?`<button class="link" data-pfavadel>${t('ลบรูป','Remove')}</button>`:''}</div></div>
  ${e.pups?`<div class="pf-pups" role="group" aria-label="${t('รูปน้องหมาตามธีม','Theme pups')}">${THEMES.map(th=>{const v='pup:'+th.k,on=(e.ava===undefined?P.avatar:e.ava)===v;return `<button class="pf-pup ${on?'on':''}" data-pfpup="${th.k}" aria-pressed="${on}" title="${esc(x(th.n))}"><img src="${PUP(th.k)}" alt="${esc(x(th.n))}"></button>`}).join('')}</div>`:''}</section>
 <section class="card pf-sec"><label class="pf-f">${lbl('ชื่อที่ใช้แสดง','Display name')}<input class="field" id="pf-name" maxlength="30" value="${esc(e.name)}" placeholder="${t('เช่น มิ้นท์','e.g. Mint')}" autocomplete="nickname"><small class="muted pf-cnt"><span>${t('2–30 ตัวอักษร · แสดงในแชทรุ่นพี่','2–30 characters · shown in mentor chats')}</span><span id="pf-name-n">${blen(e.name)}/30</span></small></label>
  <label class="pf-f">${lbl('แนะนำตัวสั้นๆ','Short bio')}<textarea class="field" id="pf-bio" maxlength="160" rows="3" placeholder="${t('เช่น ปี 3 จุลชีว ชอบงานแล็บ กำลังหาที่ฝึกงานภาคฤดูร้อน','e.g. 3rd-year microbiology, love lab work, looking for a summer internship')}">${esc(e.bio)}</textarea><small class="muted pf-cnt"><span></span><span id="pf-bio-n">${blen(e.bio)}/160</span></small></label></section>
 <section class="card pf-sec"><div class="pf-f">${lbl('คณะ/สาขา','Faculty / major')}<div class="row pf-fac"><span>${FAC[S.ob.fac]?`${FAC[S.ob.fac].e} ${facName()}`:`<span class="muted">${t('ยังไม่ได้เลือก','Not set yet')}</span>`}</span><button class="btn ghost sm" data-cmfac>${FAC[S.ob.fac]?t('เปลี่ยน','Change'):t('เลือก','Choose')}</button></div><small class="muted">${t('ใช้ข้อมูลเดียวกับแผนที่อาชีพ','The same one the career map uses')}</small></div>
  <div class="pf-f">${lbl('ชั้นปี','Year')}<div class="opts" role="radiogroup" aria-label="${t('ชั้นปี','Year')}">${PF_YEARS.map(y=>`<button type="button" role="radio" class="opt sm ${e.year===y?'on':''}" aria-checked="${e.year===y}" data-pfyear="${y}">${yearName(y)}</button>`).join('')}</div></div>
  <div class="pf-f">${lbl('สายงานที่สนใจ','Fields you’re into')}<div class="opts">${Object.keys(IND).map(k=>{const on=e.inds.includes(k);return `<button type="button" class="opt sm ${on?'on':''}" aria-pressed="${on}" data-pfind="${k}">${x(IND[k])}</button>`}).join('')}</div></div></section>
 <section class="card pf-sec"><label class="pf-f">${lbl('ลิงก์ Portfolio','Portfolio link',1)}<input class="field" id="pf-pf" type="url" inputmode="url" maxlength="200" value="${esc(e.pf)}" placeholder="https://…" autocomplete="url"></label>
  <label class="pf-f">${lbl('ลิงก์ LinkedIn','LinkedIn link',1)}<input class="field" id="pf-li" type="url" inputmode="url" maxlength="200" value="${esc(e.li)}" placeholder="https://www.linkedin.com/in/…"></label></section>
 <section class="card pf-sec"><div class="pf-f">${lbl('เรซูเม่ (PDF)','Resume (PDF)')}
  ${R?`<div class="pf-res"><span class="pf-res-ic" aria-hidden="true">📄</span><span class="pf-res-t"><b>${esc(R.name)}</b><small class="muted">${R.size?Math.max(1,Math.round(R.size/1024))+' KB · ':''}${R.at?fmtDate(R.at):''}</small></span><span class="chip">🔒 ${t('ส่วนตัว','Private')}</span></div>
   <div class="row" style="gap:8px"><button class="btn ghost sm" data-pfresview>👀 ${t('ดูตัวอย่าง','Preview')}</button><label class="btn ghost sm pf-up">🔄 ${t('เปลี่ยน','Replace')}<input type="file" id="pfResume" accept="application/pdf" class="sr-only"></label><button class="link" data-pfresdel>${t('ลบ','Delete')}</button></div>`
  :`<label class="btn sm pf-up" style="justify-self:start">⬆️ ${t('อัปโหลด PDF','Upload PDF')}<input type="file" id="pfResume" accept="application/pdf" class="sr-only"></label>`}
  <small class="muted">${S.pe.resBusy?`⏳ ${t('กำลังอัปโหลด…','Uploading…')}`:t('PDF ไม่เกิน 5MB · ส่วนตัวเสมอ: เปิดได้เฉพาะคุณ และคนที่คุณส่งให้ตอนสมัครงานหรือในแชทรุ่นพี่','PDF up to 5 MB · always private: only you, and whoever you send it to when applying or in a mentor chat, can open it')}</small></div></section>
 ${e.err?`<p class="form-err" role="alert">${x(e.err)}</p>`:''}
 <div class="row pf-save"><button class="btn ghost" data-go="me">${t('ยกเลิก','Cancel')}</button><button class="btn y" data-pfsave ${e.busy?'disabled':''}>${e.busy?t('กำลังบันทึก…','Saving…'):t('บันทึก','Save')}</button></div>
 ${sbLive()?'':`<p class="demo-note">${t('เดโม: ยังไม่ได้เชื่อม Supabase โปรไฟล์จะอยู่แค่ในหน้านี้จนกว่าจะรีเฟรช','Demo: without Supabase your profile lives only in this tab until you refresh')}</p>`}</div>`}
function peSync(){const e=S.pe;if(!e)return;const v=id=>{const el=document.getElementById(id);return el?el.value:null};const n=v('pf-name'),b=v('pf-bio'),p=v('pf-pf'),l=v('pf-li');if(n!=null)e.name=n;if(b!=null)e.bio=b;if(p!=null)e.pf=p;if(l!=null)e.li=l}
function peCheck(e){const name=e.name.trim().replace(/\s+/g,' '),bio=e.bio.trim(),pf=normUrl(e.pf),li=normUrl(e.li);
 if(name&&(blen(name)<2||blen(name)>30))return [['ชื่อต้องยาว 2–30 ตัวอักษร','Your name must be 2–30 characters']];
 if(badWord(name))return [['ชื่อนี้มีคำไม่สุภาพ ลองชื่ออื่นนะ','That name contains a rude word. Please pick another']];
 if(badWord(bio))return [['คำแนะนำตัวมีคำไม่สุภาพ','Your bio contains a rude word']];
 if(blen(bio)>160)return [['แนะนำตัวได้ไม่เกิน 160 ตัวอักษร','Your bio can be up to 160 characters']];
 if(pf===null)return [['ลิงก์ Portfolio ไม่ถูกต้อง','That portfolio link isn’t valid']];
 if(li===null||(li&&!/^https:\/\/([a-z0-9-]+\.)*linkedin\.com\//i.test(li)))return [['ลิงก์ LinkedIn ต้องเป็น linkedin.com','The LinkedIn link must be on linkedin.com']];
 return [null,{name,bio,pf,li}]}
async function profSave(){const e=S.pe;if(!e||e.busy)return;peSync();const [err,v]=peCheck(e);if(err){e.err=err;render();return}
 e.err=null;e.busy=true;render();const P=prof();
 try{let avatar=e.ava===undefined?P.avatar:e.ava===null?null:typeof e.ava==='string'?e.ava:null;
  if(e.ava&&e.ava.blob){if(sbLive()){const ext=e.ava.blob.type==='image/webp'?'webp':'png',path=`${S.user.id}/avatar.${ext}`;
    const up=await SB.storage.from('avatars').upload(path,e.ava.blob,{contentType:e.ava.blob.type,upsert:true,cacheControl:'3600'});if(up.error)throw up.error;
    avatar=SB.storage.from('avatars').getPublicUrl(path).data.publicUrl+'?v='+Date.now();avaClean(ext)}
   else avatar=e.ava.url}
  if(sbLive()){await profRow({display_name:v.name||null,avatar_url:avatar,bio:v.bio||null,year:e.year,links:{portfolio:v.pf||null,linkedin:v.li||null}});
   if(avatar===null||/^pup:/.test(avatar||''))avaClean();SB.auth.updateUser({data:{display_name:v.name||null}}).catch(()=>{})}
  Object.assign(P,{name:v.name,avatar,bio:v.bio,year:e.year,links:{pf:v.pf,li:v.li}});if(!S.user.id&&v.name)S.user.name=v.name;
  S.ob.inds=e.inds.filter(k=>IND[k]);obSave();await obSync();profToRooms();
  S.pe=null;go('me');toast(t('บันทึกโปรไฟล์แล้ว ✓','Profile saved ✓'));profClaim(true)}
 catch(er){e.busy=false;e.err=[profErr(er),profErr(er)];render()}}
/* remove my other stored avatar files (a photo replaced by a pup, or .png ↔ .webp) */
function avaClean(keep){if(!sbLive())return;const L=['webp','png'].filter(v=>v!==keep).map(v=>`${S.user.id}/avatar.${v}`);SB.storage.from('avatars').remove(L).catch(()=>{})}
/* ---------- avatar crop (modal "crop"): drag to move, slider/wheel to zoom, exported as a 256px circle ---------- */
function avaPick(file){if(!file)return;if(!AVA_TYPES.includes(file.type)){toast(t('ใช้ได้เฉพาะ JPG, PNG หรือ WebP','Only JPG, PNG or WebP'));return}if(file.size>AVA_MAX){toast(t('รูปใหญ่เกิน 2MB','That photo is larger than 2 MB'));return}
 const url=URL.createObjectURL(file),img=new Image();img.onload=()=>openModal({type:'crop',img,url,z:1,ox:0,oy:0});img.onerror=()=>{URL.revokeObjectURL(url);toast(t('เปิดรูปนี้ไม่ได้','Couldn’t open that image'))};img.src=url}
function cropModal(m,head){return head(t('ครอปรูปโปรไฟล์','Crop your photo'),t('ลากเพื่อเลื่อน · ปรับขนาดด้วยแถบด้านล่าง','Drag to move · use the slider to zoom'))+
 `<div class="crop-st"><canvas id="cropC" width="${AVA_PX}" height="${AVA_PX}" aria-label="${t('ตัวอย่างรูป','Photo preview')}"></canvas><i class="crop-ring" aria-hidden="true"></i></div>
 <label class="crop-z"><span aria-hidden="true">➖</span><input type="range" id="cropZ" min="1" max="3" step="0.01" value="${m.z}" aria-label="${t('ซูม','Zoom')}"><span aria-hidden="true">➕</span></label>
 <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>${t('ยกเลิก','Cancel')}</button><button class="btn y" data-cropok>${t('ใช้รูปนี้','Use this photo')}</button></div>`}
function cropGeo(m){const C=AVA_PX,iw=m.img.naturalWidth,ih=m.img.naturalHeight,s=Math.max(C/iw,C/ih)*m.z,w=iw*s,h=ih*s,mx=(w-C)/2,my=(h-C)/2;
 m.ox=Math.max(-mx,Math.min(mx,m.ox));m.oy=Math.max(-my,Math.min(my,m.oy));return {x:(C-w)/2+m.ox,y:(C-h)/2+m.oy,w,h}}
function cropDraw(cv,m,round){const c=cv.getContext('2d'),g=cropGeo(m);c.clearRect(0,0,AVA_PX,AVA_PX);c.save();if(round){c.beginPath();c.arc(AVA_PX/2,AVA_PX/2,AVA_PX/2,0,Math.PI*2);c.clip()}
 c.imageSmoothingQuality='high';c.drawImage(m.img,g.x,g.y,g.w,g.h);c.restore()}
function bindCrop(){const m=S.modal,cv=$('#cropC');if(!m||m.type!=='crop'||!cv)return;cropDraw(cv,m);let drag=null;
 cv.addEventListener('pointerdown',ev=>{drag={x:ev.clientX,y:ev.clientY};cv.setPointerCapture(ev.pointerId)});
 cv.addEventListener('pointermove',ev=>{if(!drag)return;const k=AVA_PX/cv.getBoundingClientRect().width;m.ox+=(ev.clientX-drag.x)*k;m.oy+=(ev.clientY-drag.y)*k;drag={x:ev.clientX,y:ev.clientY};cropDraw(cv,m)});
 const up=()=>{drag=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',ev=>{ev.preventDefault();m.z=Math.max(1,Math.min(3,m.z-ev.deltaY*0.002));const z=$('#cropZ');if(z)z.value=m.z;cropDraw(cv,m)},{passive:false})}
function cropDone(){const m=S.modal;if(!m||m.type!=='crop'||!S.pe)return;const cv=document.createElement('canvas');cv.width=cv.height=AVA_PX;cropDraw(cv,m,true);
 const fin=blob=>{URL.revokeObjectURL(m.url);if(!blob){toast(t('ครอปรูปไม่สำเร็จ','Couldn’t crop that photo'));return}
  if(S.pe.ava&&S.pe.ava.url&&S.pe.ava.url.startsWith('blob:'))URL.revokeObjectURL(S.pe.ava.url);
  const done=url=>{S.pe.ava={blob,url};S.pe.pups=false;S.modal=null;renderModal();render()};
  if(sbLive())done(URL.createObjectURL(blob));else{const r=new FileReader();r.onload=()=>done(r.result);r.readAsDataURL(blob)}};   // demo: a data URL keeps working after the page re-renders
 cv.toBlob(b=>{if(b&&b.type==='image/webp')fin(b);else cv.toBlob(fin,'image/png')},'image/webp',0.86)}
/* ---------- resume: private PDF in the "resumes" bucket at <user id>/resume.pdf ---------- */
async function resUpload(file){if(!file)return;if(file.type!=='application/pdf'){toast(t('อัปโหลดได้เฉพาะไฟล์ PDF','PDF files only'));return}if(file.size>RES_MAX){toast(t('ไฟล์ใหญ่เกิน 5MB','That file is larger than 5 MB'));return}
 const P=prof(),meta={name:file.name.slice(0,120),size:file.size,at:Date.now()};if(S.pe)S.pe.resBusy=true;peSync();render();
 try{if(sbLive()){const path=`${S.user.id}/resume.pdf`,up=await SB.storage.from('resumes').upload(path,file,{contentType:'application/pdf',upsert:true});if(up.error)throw up.error;
   await profRow({resume_path:path,resume_name:meta.name,resume_size:meta.size,resume_at:new Date(meta.at).toISOString()});P.resume=Object.assign({path},meta)}
  else{if(P.resume&&P.resume.url)URL.revokeObjectURL(P.resume.url);P.resume=Object.assign({url:URL.createObjectURL(file),blob:file},meta)}
  toast(t('อัปโหลดเรซูเม่แล้ว 🔒 ส่วนตัว','Resume uploaded 🔒 private'));profClaim(true)}
 catch(e){toast(profErr(e))}if(S.pe)S.pe.resBusy=false;render()}
async function resUrl(){const R=prof().resume;if(!R)return '';if(R.url)return R.url;const {data,error}=await SB.storage.from('resumes').createSignedUrl(R.path,3600);if(error)throw error;return data.signedUrl}
async function resView(){const w=window.open('','_blank');try{const u=await resUrl();if(w)w.location.href=u;else location.assign(u)}catch(e){if(w)w.close();toast(profErr(e))}}
async function resDelete(){const P=prof();if(!P.resume)return;
 try{if(sbLive()){await profRow({resume_path:null,resume_name:null,resume_size:null,resume_at:null});SB.storage.from('resumes').remove([P.resume.path]).catch(()=>{})}else if(P.resume.url)URL.revokeObjectURL(P.resume.url);
  P.resume=null;render();toast(t('ลบเรซูเม่แล้ว','Resume deleted'))}catch(e){toast(profErr(e))}}
async function resFile(){const R=prof().resume;if(!R)return null;if(R.blob)return new File([R.blob],R.name,{type:'application/pdf'});
 const {data,error}=await SB.storage.from('resumes').download(R.path);if(error)throw error;return new File([data],R.name,{type:'application/pdf'})}
/* in a mentor chat (asker side): send my resume as a PDF message — it's copied into that room's private files, so only the two of us can open it */
function resumeQuick(){return S.user&&prof().resume?`<button class="opt sm" data-chatresume>📄 ${t('ส่งเรซูเม่','Send my resume')}</button>`:''}
async function resumeToChat(){if(S.chatBusy)return;try{const f=await resFile();if(f)chatSend(S.chatDraft,f)}catch(e){toast(profErr(e))}}
/* applying to a job: attach the resume (on by default when I have one) */
function applyModal(m,head){const j=JOBS.find(v=>v.id===m.id),R=prof().resume;return head(t('ส่งใบสมัคร','Send your application'),`${esc(x(j.title))} · ${esc(x(getCo(j.co).name))}`)+
 `<label class="pf-att"><input type="checkbox" id="apRes" ${m.att?'checked':''}><span>📄 ${t('แนบเรซูเม่','Attach my resume')}<small class="muted">${esc(R.name)} · ${t('บริษัทนี้เท่านั้นที่เปิดดูได้','only this company can open it')}</small></span></label>
 <p class="demo-note">${t('เดโม: บริษัทตัวอย่าง ไม่มีการส่งไฟล์จริง','Demo: sample company, no file is really sent')}</p>
 <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>${t('ยกเลิก','Cancel')}</button><button class="btn y" data-applygo>${t('ส่งใบสมัคร','Send application')}</button></div>`}
function applyJob(id,res){S.applied[id]={at:Date.now(),resume:!!res};addPoints(10);const j=JOBS.find(v=>v.id===id);pushNotif('💼',`ส่งใบสมัคร ${j.title[0]} แล้ว`,`Application sent: ${j.title[1]}`,['me']);render();
 toast(res?t('ส่งใบสมัครพร้อมเรซูเม่แล้ว! +10 แต้ม','Application sent with your resume! +10 pts'):t('ส่งใบสมัครแล้ว! +10 แต้ม','Application sent! +10 pts'))}
function startApply(id){needLogin(()=>{if(prof().resume)openModal({type:'apply',id,att:true});else applyJob(id,false)})}
/* ---------- events ---------- */
document.addEventListener('click',e=>{const el=e.target.closest('[data-pfedit],[data-pfclaim],[data-pfsave],[data-pfpups],[data-pfpup],[data-pfavadel],[data-pfyear],[data-pfind],[data-pfresview],[data-pfresdel],[data-cropok],[data-chatresume],[data-applygo]');if(!el)return;const d=el.dataset,pe=S.pe;
 if(d.pfedit!==undefined){if(profPct()>=100&&!claimed(PROF_REF)&&S.user&&!S.user.anon&&S.view==='me'){profClaim();return}openProfile();return}
 if(d.pfclaim!==undefined){needMember(()=>profClaim());return}
 if(d.cropok!==undefined){cropDone();return}
 if(d.chatresume!==undefined){resumeToChat();return}
 if(d.applygo!==undefined){const m=S.modal;if(!m||m.type!=='apply')return;const c=$('#apRes');S.modal=null;renderModal();applyJob(m.id,!!(c&&c.checked));return}
 if(d.pfresview!==undefined){resView();return}
 if(d.pfresdel!==undefined){resDelete();return}
 if(!pe)return;peSync();
 if(d.pfsave!==undefined){profSave();return}
 if(d.pfpups!==undefined){pe.pups=!pe.pups;render();return}
 if(d.pfpup){pe.ava='pup:'+d.pfpup;render();return}
 if(d.pfavadel!==undefined){pe.ava=null;pe.pups=false;render();return}
 if(d.pfyear){pe.year=pe.year===d.pfyear?null:d.pfyear;render();return}
 if(d.pfind){const i=pe.inds.indexOf(d.pfind);if(i>=0)pe.inds.splice(i,1);else pe.inds.push(d.pfind);render();return}});
document.addEventListener('change',e=>{const id=e.target.id;if(id!=='pfFile'&&id!=='pfResume')return;const f=e.target.files&&e.target.files[0];e.target.value='';if(id==='pfFile')avaPick(f);else resUpload(f)});
document.addEventListener('input',e=>{const el=e.target;
 if(el.id==='cropZ'&&S.modal&&S.modal.type==='crop'){S.modal.z=+el.value;const cv=$('#cropC');if(cv)cropDraw(cv,S.modal);return}
 if(!S.pe||!/^pf-/.test(el.id))return;peSync();const n=document.getElementById(el.id+'-n');if(n)n.textContent=`${blen(el.value)}/${el.id==='pf-bio'?160:30}`});
