/* Maadoo Job · sw.js — service worker (PWA). Precaches the app shell so the site opens fast and works offline.
   ⚠️ Bump VERSION on every change to the site's files, otherwise installed apps keep the old files.
   Never caches Supabase (data must always be fresh): only same-origin files and Google Fonts are handled. */
const VERSION='2026-11-13.12';
const SHELL='maadoo-shell-'+VERSION,FONTS='maadoo-fonts-v1';
const PUPS=['/maadoo-icon.webp'];
const FILES=['/','/index.html','/offline.html','/manifest.webmanifest','/css/style.css',
 '/js/app.js','/img/mascot-job.png',
 '/maadoo-job-icon-512.png','/maadoo-job-round.png','/icons/icon-192.png','/icons/icon-512.png','/icons/maskable-512.png','/icons/apple-touch-icon-180.png',...PUPS];

self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();const old=keys.filter(k=>k.startsWith('maadoo-shell-')&&k!==SHELL);
 await Promise.all(old.map(k=>caches.delete(k)));await self.clients.claim();
 /* upgrade from an older version: reload the open tabs/apps once so visitors land on the new site without refreshing by hand */
 if(old.length||keys.some(k=>k.startsWith('maadoo-')&&k!==SHELL&&k!==FONTS)){const cs=await self.clients.matchAll({type:'window'});cs.forEach(c=>{try{c.navigate(c.url)}catch(err){}})}})())});
/* the page shows "มีเวอร์ชันใหม่ · รีเฟรช"; tapping it tells the waiting worker to take over */
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});

self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(/(^|\.)supabase\.(co|in)$/.test(u.hostname))return;                       // Supabase: always the network, never cached
 if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){e.respondWith(fonts(r));return}
 if(u.origin!==location.origin)return;                                           // other sites (CDN, Jitsi…): browser default
 e.respondWith(fresh(r))});

/* network first: visitors always get the newest site; the cached copy (and offline.html) is only the fallback when the network
   is slow (>4 s) or missing. Successful responses refresh the cache. */
async function fresh(r){const c=await caches.open(SHELL),nav=r.mode==='navigate';
 const key=nav?'/':r;
 try{const res=await Promise.race([fetch(r,{cache:'no-cache'}),new Promise((_,rej)=>setTimeout(rej,4000))]);
  if(res&&res.ok)c.put(key,res.clone());return res}
 catch(err){const hit=await c.match(key,{ignoreSearch:true});if(hit)return hit;
  if(nav)return (await c.match('/offline.html'))||Response.error();
  try{return await fetch(r)}catch(e2){return Response.error()}}}
/* fonts: the stylesheet refreshes in the background, the font files never change */
async function fonts(r){const c=await caches.open(FONTS),hit=await c.match(r);
 const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);
 return hit||net}
