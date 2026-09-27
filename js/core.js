/* Maadoo Job · js/core.js — prefs, app state S, t()/x(), helpers, themes + nav. Classic script sharing one global scope; see CLAUDE.md for load order. */
/* ---------- prefs ---------- */
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const S={lang:store.get('maadoo-lang')||'th',skin:store.get('maadoo-skin')||(store.get('maadoo-theme')==='dark'||(!store.get('maadoo-theme')&&matchMedia('(prefers-color-scheme: dark)').matches)?'night':'default'),themeOpen:false,coach:false,view:'home',co:null,tab:'overview',q:'',unlocked:false,follow:{},helped:{},poll:null,
 form:null,done:null,quiz:{i:0,a:[]},sal:{role:0,v:'22000'},askText:'',askTag:0,filter:-1,
 user:null,after:null,modal:null,mdb:{},notifOpen:false,saved:{},applied:{},booked:[],myReviews:[],dbRev:{},dbState:'idle',dbAt:0,sending:false,asked:0,
 jobF:{type:'all',ind:'all',min:0},askTab:'swipe',ptApps:{},ptDay:'all',jobTab:'full',ptForm:{title:'',kind:'onsite',day:'today',when:'',pay:'',unit:'h',need:'1',how:'cash',req:'',boost:'none',ok:false},ptRate:{s:0,tags:{}},coOnlyJobs:false,sw:{liked:[],skipped:[],topic:'all'},bd:{sort:'hot',tag:-1,kind:'ask',open:{p1:true},anon:true},pl:{}};
const t=(th,en)=>S.lang==='en'?en:th;
const x=v=>Array.isArray(v)?(S.lang==='en'?v[1]:v[0]):v;
const blankForm=()=>({co:'',role:'',type:'emp',r:0,mood:null,ot:null,rec:null,title:'',pro:'',con:'',sal:''});
S.form=blankForm();

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString(S.lang==='en'?'en-US':'th-TH');
const stars=r=>'★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r));
const col=v=>v>=4?'var(--good)':v>=3.3?'var(--mid)':'var(--bad)';
const getCo=id=>CO.find(c=>c.id===id);
function toast(m){const e=$('#toast');e.textContent=m;e.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>e.hidden=true,2200)}
function go(v,extra={}){Object.assign(S,{view:v},extra);render();window.scrollTo({top:0})}
/* themes: see js/themes.js (THEMES, TH) */
const isDark=()=>!!TH(S.skin).dark;
const PUP=(k=S.skin)=>k==='default'?'maadoo-icon.webp':`maadoo-icon-${k}.webp`;
const PALETTE='<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.4-1.9-.5-1.1.2-2.1 1.4-2.1H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.3"/><circle cx="10.5" cy="7" r="1.3"/><circle cx="15" cy="7.5" r="1.3"/></svg>';
const MEGA='<svg viewBox="0 0 24 24"><path d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/></svg>';
const SUN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON='<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';

function applyPrefs(){
 const r=document.documentElement;
 const th=TH(S.skin);r.setAttribute('data-theme',th.dark?'dark':'light');
 if(S.skin==='default'||S.skin==='night')r.removeAttribute('data-skin');else r.setAttribute('data-skin',S.skin);
 (applyPrefs.vars||[]).forEach(v=>r.style.removeProperty(v));applyPrefs.vars=Object.keys(th.vars||{}).map(v=>'--'+v);
 applyPrefs.vars.forEach((v,i)=>r.style.setProperty(v,th.vars[v.slice(2)]));
 r.lang=S.lang;document.title=t('มาดูจ็อบ · ก่อนไปทำงาน มาดูก่อน','Maadoo Job · Before you go, Maadoo first');
 $('#themeBtn').innerHTML=PALETTE+`<span class="tlabel">${t('ธีม','Theme')}</span>`;
 $('#themeBtn').setAttribute('aria-label',t('เลือกธีม','Choose a theme'));
 renderThemePop();renderCoach();try{FX.setSkin(S.skin)}catch(e){}try{SND.setSkin(S.skin)}catch(e){}
 $('#langBtn').innerHTML=`<span class="${S.lang==='th'?'on':''}">TH</span><i>/</i><span class="${S.lang==='en'?'on':''}">EN</span>`;
 $('#langBtn').setAttribute('aria-label',t('เปลี่ยนภาษาเป็นอังกฤษ','Switch language to Thai'));
 $('#demoTag').textContent=t('เดโม · ข้อมูลตัวอย่าง','Demo · sample data');
}
function nav(){
 const act=S.view==='company'?'explore':['chat','book'].includes(S.view)?'ask':S.view==='live'?'me':S.view;
 const cu=S.user&&S.rooms?chatUnread():0,dot=id=>id==='ask'&&cu?`<i class="ndot" aria-label="${t('ข้อความใหม่','New messages')}"></i>`:'';
 $('#topnav').innerHTML=NAV.map(n=>`<button data-go="${n.id}" class="${act===n.id?'on':''}">${x(n.t)}${dot(n.id)}</button>`).join('');
 $('#bnav').innerHTML=NAV.filter(n=>n.id!=='explore').map(n=>`<button data-go="${n.id}" class="${act===n.id?'on':''} ${n.id==='write'?'write':''}"><svg viewBox="0 0 24 24">${n.i}</svg>${x(n.t)}${dot(n.id)}</button>`).join('');
}
function moodBar(m){return `<div class="moodbar" aria-hidden="true"><i style="flex:${m[0]};background:var(--good)"></i><i style="flex:${m[1]};background:var(--mid)"></i><i style="flex:${m[2]};background:var(--bad)"></i></div>`}
const trendTxt=n=>t(`+${n} รีวิวเดือนนี้`,`+${n} reviews this month`);
function coCard(c){return `<button class="co" data-co="${c.id}">
 <div class="co-top"><span class="mark" style="background:${c.hue}">${x(c.mk)}</span><div><div class="co-name">${x(c.name)}</div><div class="muted">${x(IND[c.ind])} · ${x(c.loc)}</div></div>
 <div class="score"><b style="color:${col(c.overall)}">${c.overall.toFixed(1)}</b><span class="stars">${stars(c.overall)}</span></div></div>
 ${moodBar(c.mood)}
 <div class="moodlegend"><span>😊 ${c.mood[0]}%</span><span>😐 ${c.mood[1]}%</span><span>😵 ${c.mood[2]}%</span><span style="margin-left:auto" class="chip">${trendTxt(c.trend)}</span></div></button>`}
function review(r,co,i){const m=MOODS[r.mood];const k=r.real?'db-'+r.id:(co?co.id:(S.co||''))+i;
 return `<article class="card rv"><div class="rv-h"><span class="chip ${m[2]}">${m[0]} ${x(m[1])}</span><span class="stars" style="font-size:14px">${stars(r.r)}</span>
 ${r.real?`<span class="chip ad">🙋 ${t('รีวิวจากผู้ใช้จริง','Real user review')}</span>`:''}${r.real&&canDelete(r.id)?`<span class="chip mid">${t('รีวิวของคุณ','Your review')}</span>`:''}${r.v?`<span class="chip ver">✓ ${t('พนักงานจริง','Verified employee')}</span>`:''}<span class="chip">${x(TYPE[r.type])}</span><span class="muted" style="margin-left:auto">${r.d}</span></div>
 <h3>“${esc(x(r.t))}”</h3><div class="muted">${esc(x(r.role))}${co?` · <button class="link" data-co="${co.id}">${x(co.name)}</button>`:''}</div>
 <dl class="pc"><dt class="p">${t('ข้อดี','Pros')}</dt><dd>${esc(x(r.p))}</dd><dt class="c">${t('ข้อเสีย','Cons')}</dt><dd>${esc(x(r.c))}</dd></dl>
 ${r.reply?`<div class="reply"><b>🏢 ${t('บริษัทตอบกลับ','Company response')}</b><span>${esc(x(r.reply))}</span></div>`:''}
 <div class="rv-actions"><button class="help ${S.helped[k]?'on':''}" data-help="${k}">👍 ${t('มีประโยชน์','Helpful')} ${r.h+(S.helped[k]?1:0)}</button>${r.real&&canDelete(r.id)?`<button class="del-rv" data-delrev="${esc(r.id)}">🗑️ ${t('ลบ','Delete')}</button>`:''}<button class="report" data-report="1">⚑ ${t('รายงาน','Report')}</button></div></article>`}
const brand=(label='Maadoo')=>`<div class="brand"><img src="${PUP()}" alt="">${label}</div><img class="pup" src="${PUP()}" alt="">`;
const allRoles=()=>{const seen=new Map();CO.forEach(c=>c.salary.filter(s=>!s[5]).forEach(s=>{if(!seen.has(s[0][1]))seen.set(s[0][1],s[0])}));return [...seen.values()]};

