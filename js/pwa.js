/* Maadoo Job · js/pwa.js — install as an app (PWA): service-worker registration, "new version" bar, offline bar,
   install card (Me) + strip (home, from the 2nd visit), iPhone "Add to Home Screen" guide. Classic script sharing one global scope; see CLAUDE.md for load order. */
const PWA_KEY='maadoo-pwa';
function pwaLoad(){let v=null;try{v=JSON.parse(store.get(PWA_KEY)||'null')}catch(e){}return {visits:+(v&&v.visits)||0,hide:!!(v&&v.hide),installed:!!(v&&v.installed)}}
S.pwa=Object.assign(pwaLoad(),{evt:null,update:null,offline:false});
const pwaSave=()=>store.set(PWA_KEY,JSON.stringify({visits:S.pwa.visits,hide:S.pwa.hide,installed:S.pwa.installed}));
const UA=navigator.userAgent||'';
const isIOS=()=>/iphone|ipad|ipod/i.test(UA)||(/Macintosh/.test(UA)&&navigator.maxTouchPoints>1);
const isAndroid=()=>/Android/i.test(UA);
const inAppBrowser=()=>/Instagram|FBAN|FBAV|FB_IAB|Line\/|KAKAOTALK|TikTok|musical_ly/i.test(UA);
const isStandalone=()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch(e){return false}};
/* what we can offer: 'prompt' (Chrome's install dialog), 'ios' (Share → Add to Home Screen), 'android' (⋮ → Install app, e.g. after the dialog was cancelled),
   'inapp' (open in a real browser first) */
function pwaMode(anyway){if(isStandalone()||(S.pwa.installed&&!anyway))return null;if(inAppBrowser())return 'inapp';if(S.pwa.evt)return 'prompt';if(isIOS())return 'ios';if(isAndroid())return 'android';return null}
const pwaOffer=()=>!S.pwa.hide&&pwaMode();
/* theme menu row: always there — install (ignores the remembered "installed", which can be stale after the app was removed), or "installed" inside the app */
function pwaMenuRow(){if(isStandalone())return `<div class="fx-row tour-again pwa-ok"><span><b>📲 ${t('เปิดแบบแอปอยู่','You’re in the app')}</b><small>✓ ${t('ติดตั้ง Maadoo Job แล้ว','Maadoo Job is installed')}</small></span></div>`;
 const m=pwaMode(true);return m?`<button class="fx-row tour-again" data-pwainstall="menu"><span><b>📲 ${t('ติดตั้งแอป Maadoo Job','Install the Maadoo Job app')}</b><small>${t('เปิดจากหน้าจอโฮมได้ เร็วขึ้น ใช้ได้ตอนเน็ตหลุด','Open it from your home screen: faster, works offline')}</small></span><span aria-hidden="true">→</span></button>`:''}

/* Me page card */
function pwaCard(){const mode=pwaOffer();if(!mode)return '';
 return `<section class="sec"><div class="card pwa-card"><img src="icons/icon-192.png" alt="" width="52" height="52"><div class="pwa-t"><b>📲 ${t('ติดตั้งแอป Maadoo Job','Install the Maadoo Job app')}</b><span class="muted">${mode==='inapp'?t('เปิดในเบราว์เซอร์ก่อน แล้วติดตั้งลงหน้าจอได้เลย','Open this in your browser first, then add it to your home screen'):t('เปิดจากหน้าจอโฮมได้ทันที เร็วขึ้น และใช้ได้ตอนเน็ตหลุด','Open it straight from your home screen: faster, and it works when the internet drops')}</span></div>
 <button class="btn y sm" data-pwainstall>${mode==='prompt'?t('ติดตั้ง','Install'):t('ดูวิธี','How to')}</button><button class="x sm" data-pwahide aria-label="${t('ไม่ต้องแสดงอีก','Don’t show again')}">×</button></div></section>`}
/* home strip: from the 2nd visit on */
function pwaStrip(){const mode=pwaOffer();if(!mode||S.pwa.visits<2)return '';
 return `<section class="sec pwa-strip"><button class="ps-line" data-pwainstall><span class="ps-ic" aria-hidden="true">📲</span><span class="ps-txt"><b>${t('ติดตั้งแอป Maadoo Job','Install the Maadoo Job app')}</b><span class="ps-s"> · ${t('เปิดเร็ว ใช้ได้ตอนเน็ตหลุด','opens fast, works offline')}</span></span><span class="ps-go" aria-hidden="true">→</span></button><button class="x sm" data-pwahide aria-label="${t('ไม่ต้องแสดงอีก','Don’t show again')}">×</button></section>`}

/* iPhone / in-app browser guide (modal) */
const IOS_SHARE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
const IOS_ADD='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
const AND_MENU='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';
function pwaIosModal(m,head){const mode=pwaMode(true),inapp=mode==='inapp',ios=isIOS();
 if(mode==='android')return head(t('ติดตั้งบน Android','Install on Android'),t('ผ่านเมนูของ Chrome','From Chrome’s menu'))+
 `<ol class="pwa-steps">${[[AND_MENU,t('กดปุ่ม ⋮ มุมบนขวาของ Chrome','Tap ⋮ in Chrome’s top-right corner')],['📲',t('เลือก “ติดตั้งแอป” หรือ “เพิ่มลงในหน้าจอหลัก”','Choose “Install app” or “Add to Home screen”')],[`<img src="icons/icon-192.png" alt="">`,t('กด “ติดตั้ง” แล้วเปิด Maadoo Job จากหน้าจอหลักได้เลย','Tap “Install”, then open Maadoo Job from your home screen')]].map((s,i)=>`<li><span class="pwa-n">${i+1}</span><span class="pwa-ic">${s[0]}</span><span>${s[1]}</span></li>`).join('')}</ol>
 <div class="row" style="justify-content:flex-end"><button class="link" data-pwahide>${t('ไม่ต้องแสดงอีก','Don’t show again')}</button><button class="btn y" data-close>${t('เข้าใจแล้ว','Got it')}</button></div>`;
 const steps=inapp?[[ '⋯',t('กดปุ่ม ⋯ หรือ ↗ มุมบนขวา','Tap ⋯ or ↗ in the top corner'),''],['🧭',ios?t('เลือก “เปิดใน Safari” / “เปิดในเบราว์เซอร์”','Choose “Open in Safari” / “Open in browser”'):t('เลือก “เปิดใน Chrome” / “เปิดในเบราว์เซอร์”','Choose “Open in Chrome” / “Open in browser”'),''],['📲',t('แล้วกด “ติดตั้งแอป” ในหน้าฉันอีกครั้ง','Then tap “Install the app” on the Me page again'),'']]
  :[[IOS_SHARE,t('กดปุ่มแชร์ ที่แถบล่างของ Safari (หรือมุมบนขวาบน iPad)','Tap the Share button in Safari’s bottom bar (top right on iPad)'),'share'],[IOS_ADD,t('เลื่อนลงแล้วเลือก “เพิ่มไปยังหน้าจอโฮม”','Scroll down and choose “Add to Home Screen”'),'add'],[`<img src="icons/icon-192.png" alt="">`,t('กด “เพิ่ม” แล้วเปิด Maadoo Job จากหน้าจอโฮมได้เลย','Tap “Add”, then open Maadoo Job from your home screen'),'icon']];
 return head(inapp?t('เปิดในเบราว์เซอร์ก่อนนะ','Open it in your browser first'):t('ติดตั้งบน iPhone','Install on iPhone'),inapp?t('แอปที่เปิดลิงก์อยู่ (เช่น IG, LINE) ติดตั้งไม่ได้','In-app browsers (IG, LINE…) can’t install apps'):t('3 ขั้น ไม่ถึงนาที','3 steps, under a minute'))+
 `<ol class="pwa-steps">${steps.map((s,i)=>`<li><span class="pwa-n">${i+1}</span><span class="pwa-ic">${s[0]}</span><span>${s[1]}</span></li>`).join('')}</ol>
 ${inapp?'':`<div class="pwa-demo" aria-hidden="true"><div class="pwa-phone"><div class="pwa-scr"><img src="icons/icon-192.png" alt=""><small>Maadoo Job</small></div><div class="pwa-bar"><i></i><i></i><b>${IOS_SHARE}</b><i></i><i></i></div></div><span class="pwa-arrow">⬆</span></div>`}
 <div class="row" style="justify-content:flex-end"><button class="link" data-pwahide>${t('ไม่ต้องแสดงอีก','Don’t show again')}</button><button class="btn y" data-close>${t('เข้าใจแล้ว','Got it')}</button></div>`}

async function pwaInstall(anyway){const mode=pwaMode(anyway);
 /* Chrome allows one dialog per page load: after it, the card stays and "How to" shows the ⋮ → Install app steps instead */
 if(mode==='prompt'){const e=S.pwa.evt;S.pwa.evt=null;let ok=false;try{await e.prompt();const c=await e.userChoice;ok=!!(c&&c.outcome==='accepted')}catch(err){}
  if(ok){S.pwa.installed=true;pwaSave();toast(t('ติดตั้งแล้ว! เปิดจากหน้าจอโฮมได้เลย 🎉','Installed! Open it from your home screen 🎉'))}
  else toast(t('ยังไม่ได้ติดตั้ง · กด “ดูวิธี” เพื่อติดตั้งจากเมนู ⋮ ได้','Not installed yet · tap “How to” to install from the ⋮ menu'));
  render();return}
 if(mode)openModal({type:'pwaios'})}
function pwaHide(){S.pwa.hide=true;pwaSave();if(S.modal&&S.modal.type==='pwaios')S.modal=null;render();toast(t('ซ่อนแล้ว ติดตั้งทีหลังได้จากเมนูเบราว์เซอร์','Hidden. You can still install it from the browser menu'))}

/* bars: "new version" and "offline" */
function pwaBars(){let el=$('#pwaBar');if(!el){document.body.insertAdjacentHTML('beforeend','<div id="pwaBar" aria-live="polite"></div>');el=$('#pwaBar')}
 el.innerHTML=(S.pwa.offline?`<div class="pwa-bar-b off"><img src="maadoo-icon.webp" alt=""><span>${t('ตอนนี้ไม่มีเน็ต ลองใหม่อีกครั้งนะ','No internet right now. Please try again')}</span><button class="link" data-pwaretry>${t('ลองใหม่','Retry')}</button></div>`:'')+
  (S.pwa.update?`<div class="pwa-bar-b upd"><span>✨ ${t('มีเวอร์ชันใหม่','A new version is ready')}</span><button class="btn y sm" data-pwaupdate>${t('รีเฟรช','Refresh')}</button></div>`:'')}

/* start-up (called once from js/app.js) */
function pwaInit(){try{if(!sessionStorage.getItem('maadoo-pwa-s')){sessionStorage.setItem('maadoo-pwa-s','1');S.pwa.visits++;pwaSave()}}catch(e){}
 if(isStandalone()&&!S.pwa.installed){S.pwa.installed=true;pwaSave()}
 S.pwa.offline=navigator.onLine===false;pwaBars();
 if(!('serviceWorker' in navigator)||!(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))return;
 let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading||!S.pwa.asked)return;reloading=true;location.reload()});
 navigator.serviceWorker.register('/sw.js').then(reg=>{
  const waiting=w=>{if(w&&navigator.serviceWorker.controller){S.pwa.update=w;pwaBars()}};
  waiting(reg.waiting);
  reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed')waiting(w)})});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})});
 }).catch(e=>console.warn('[Maadoo Job] service worker not registered:',e&&e.message))}

/* Chrome only fires this when the app is NOT installed, so it also clears a stale "installed" (the app was removed) */
addEventListener('beforeinstallprompt',e=>{e.preventDefault();if(isStandalone())return;S.pwa.evt=e;if(S.pwa.installed){S.pwa.installed=false;pwaSave()}if(S.themeOpen)renderThemePop();if(['home','me'].includes(S.view))render()});
addEventListener('appinstalled',()=>{S.pwa.installed=true;S.pwa.evt=null;pwaSave();if(['home','me'].includes(S.view))render()});
addEventListener('offline',()=>{S.pwa.offline=true;pwaBars()});
addEventListener('online',()=>{if(!S.pwa.offline)return;S.pwa.offline=false;pwaBars();toast(t('กลับมาออนไลน์แล้ว 🐾','You’re back online 🐾'))});
document.addEventListener('click',e=>{const b=e.target.closest('[data-pwainstall],[data-pwahide],[data-pwaupdate],[data-pwaretry]');if(!b)return;const d=b.dataset;
 if(d.pwainstall!==undefined){if(S.themeOpen){S.themeOpen=false;renderThemePop()}pwaInstall(d.pwainstall==='menu');return}
 if(d.pwahide!==undefined){pwaHide();return}
 if(d.pwaupdate!==undefined){const w=S.pwa.update;if(!w){location.reload();return}S.pwa.asked=true;b.disabled=true;w.postMessage({type:'SKIP_WAITING'});setTimeout(()=>location.reload(),3000);return}
 if(d.pwaretry!==undefined){if(navigator.onLine)location.reload();else toast(t('ยังไม่มีเน็ตเลย ลองอีกทีนะ','Still offline. Try again in a bit'))}});
