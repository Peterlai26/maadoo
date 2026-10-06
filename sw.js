/* Maadoo Job · sw.js — service worker (PWA). Precaches the app shell so the site opens fast and works offline.
   ⚠️ Bump VERSION on every change to the site's files, otherwise installed apps keep the old files.
   Never caches Supabase (data must always be fresh): only same-origin files and Google Fonts are handled. */
const VERSION='2026-10-06.4';
const SHELL='maadoo-shell-'+VERSION,FONTS='maadoo-fonts-v1';
const PUPS=['','-night','-sakura','-mint','-lavender','-sunset','-dino','-garden','-sea','-space','-galaxy','-japan','-china','-cafe','-rain','-pixel','-library','-halloween','-loykrathong','-fathersday','-xmas','-newyear','-childrensday','-cny','-valentine','-songkran','-mothersday'].map(k=>`/maadoo-icon${k}.webp`);
const FILES=['/','/index.html','/offline.html','/manifest.webmanifest','/css/style.css',
 ...['core','themes','festivals','data','auth','views','premium','mentor','onboard','parttime','pwa','profile','landing','fx','app'].map(f=>`/js/${f}.js`),
 '/maadoo-job-icon-512.png','/maadoo-job-round.png','/icons/icon-192.png','/icons/icon-512.png','/icons/maskable-512.png','/icons/apple-touch-icon-180.png',...PUPS];

self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('maadoo-shell-')&&k!==SHELL).map(k=>caches.delete(k)));await self.clients.claim()})())});
/* the page shows "มีเวอร์ชันใหม่ · รีเฟรช"; tapping it tells the waiting worker to take over */
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});

self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(/(^|\.)supabase\.(co|in)$/.test(u.hostname))return;                       // Supabase: always the network, never cached
 if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){e.respondWith(fonts(r));return}
 if(u.origin!==location.origin)return;                                           // other sites (CDN, Jitsi…): browser default
 if(r.mode==='navigate'){e.respondWith(page(r));return}
 e.respondWith(caches.match(r,{ignoreSearch:true,cacheName:SHELL}).then(hit=>hit||fetch(r)))});

/* pages: the cached app shell (instant, and always the same version as the cached CSS/JS; the query string such as ?ref= is still
   read by the page), else the network, else the cute offline page */
async function page(r){const c=await caches.open(SHELL),hit=await c.match('/');if(hit)return hit;
 try{return await fetch(r)}catch(err){return (await c.match('/offline.html'))||Response.error()}}
/* fonts: the stylesheet refreshes in the background, the font files never change */
async function fonts(r){const c=await caches.open(FONTS),hit=await c.match(r);
 const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);
 return hit||net}
