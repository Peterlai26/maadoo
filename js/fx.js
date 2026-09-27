/* Maadoo Job · js/fx.js — theme effects (canvas) + ambient sound. Classic script sharing one global scope; see CLAUDE.md for load order. */
/* ---------- theme effects ---------- */
const FXINFO={default:{c:['#2F6FD6','#FF9A1F','#FFC53D','#8EC5FF'],n:['ประกายวิบวับ','Sparkles'],amb:'spark',tap:'spark'},
 night:{c:['#FFFFFF','#FFE9A8','#A9C8FF'],n:['ดาวระยิบและดาวตก','Twinkling & shooting stars'],amb:'star',tap:'star'},
 sakura:{c:['#FFB7CC','#FF8FB1','#FFD6E4','#F7A1BD'],n:['กลีบซากุระร่วง','Falling petals'],amb:'petal',tap:'petal'},
 mint:{c:['#34C39A','#7ED9B5','#16A085','#A8E6CF'],n:['ใบไม้ปลิว','Drifting leaves'],amb:'leaf',tap:'leaf'},
 lavender:{c:['#B39DFF','#FF9ECF','#8C6FF0','#D9CCFF'],n:['หัวใจลอย','Floating hearts'],amb:'heart',tap:'heart'},
 sunset:{c:['#FF9A3C','#FFC46B','#FF6F3C','#FFD9A0'],n:['หิ่งห้อยแสงส้ม','Glowing embers'],amb:'ember',tap:'ember'},
 dino:{c:['#6FA83F','#FF9A4D','#8BC34A','#C58B4A'],n:['รอยเท้าไดโนเสาร์','Dino footprints'],amb:'foot',tap:'foot'},
 garden:{c:['#FF6F91','#FFB347','#B28DFF','#6EC6FF','#FF8FB1'],n:['ผีเสื้อบินในสวน','Garden butterflies'],amb:'fly',tap:'flower'},
 sea:{c:['#7FD8F0','#B8ECF8','#4FC3E3','#FFFFFF'],n:['ฟองอากาศใต้ทะเล','Rising bubbles'],amb:'bubble',tap:'bubble'}};
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* effect strength per theme, 0–100 (0 = off) in `maadoo-fx` = {skin:{amb,tap}}; default 60, or 0 under reduced motion */
S.fxLv=(()=>{try{const o=JSON.parse(store.get('maadoo-fx')||'{}');return o&&typeof o==='object'?o:{}}catch(e){return {}}})();
const FX_DEF={amb:reduceMotion||store.get('maadoo-fx-amb')==='0'?0:60,tap:reduceMotion||store.get('maadoo-fx-tap')==='0'?0:60};
function fxLevel(k,sk=S.skin){const o=S.fxLv[sk],v=o&&+o[k];return Number.isFinite(v)&&o[k]!==undefined?Math.min(100,Math.max(0,Math.round(v))):FX_DEF[k]}
function fxSetLevel(k,v){const o=S.fxLv[S.skin]||(S.fxLv[S.skin]={});o[k]=Math.min(100,Math.max(0,Math.round(+v||0)));store.set('maadoo-fx',JSON.stringify(S.fxLv));FX.level()}
/* 60% = the original look; count, speed and size scale around it */
const fxK=k=>fxLevel(k)/60;
const FX=(()=>{
 const bg=document.createElement('canvas'),fg=document.createElement('canvas');
 bg.className='fx-bg';fg.className='fx-fg';bg.setAttribute('aria-hidden','true');fg.setAttribute('aria-hidden','true');
 document.body.prepend(bg);document.body.appendChild(fg);
 const bx=bg.getContext('2d'),fx=fg.getContext('2d');let W=0,H=0,dpr=1,amb=[],burst=[],shoot=null,raf=0,last=0,skin=null;
 const rnd=(a,b)=>a+Math.random()*(b-a);
 function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;for(const c of [bg,fg]){c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px'}bx.setTransform(dpr,0,0,dpr,0,0);fx.setTransform(dpr,0,0,dpr,0,0)}
 function shape(ctx,k,r){ctx.beginPath();
  if(k==='spark'||k==='star'){for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.38:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill()}
  else if(k==='petal'){ctx.moveTo(0,-r);ctx.bezierCurveTo(r*.9,-r*.6,r*.7,r*.7,0,r);ctx.bezierCurveTo(-r*.7,r*.7,-r*.9,-r*.6,0,-r);ctx.fill();ctx.globalAlpha*=.5;ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(0,-r*.55);ctx.strokeStyle='#fff';ctx.lineWidth=r*.18;ctx.stroke()}
  else if(k==='leaf'){ctx.moveTo(0,-r);ctx.quadraticCurveTo(r*.9,0,0,r);ctx.quadraticCurveTo(-r*.9,0,0,-r);ctx.fill();ctx.globalAlpha*=.5;ctx.beginPath();ctx.moveTo(0,-r*.9);ctx.lineTo(0,r*.9);ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=r*.12;ctx.stroke()}
  else if(k==='heart'){const s=r/1.1;ctx.moveTo(0,s*.35);ctx.bezierCurveTo(-s*1.2,-s*.5,-s*.45,-s*1.25,0,-s*.5);ctx.bezierCurveTo(s*.45,-s*1.25,s*1.2,-s*.5,0,s*.35);ctx.fill()}
  else if(k==='ember'){const g=ctx.createRadialGradient(0,0,0,0,0,r*2.2);g.addColorStop(0,ctx.fillStyle);g.addColorStop(.35,ctx.fillStyle);g.addColorStop(1,'rgba(255,160,60,0)');ctx.fillStyle=g;ctx.arc(0,0,r*2.2,0,Math.PI*2);ctx.fill()}
  else if(k==='foot'){ctx.ellipse(0,r*.35,r*.62,r*.72,0,0,Math.PI*2);ctx.fill();for(const [dx,dy] of [[-r*.62,-r*.55],[0,-r*.95],[r*.62,-r*.55]]){ctx.beginPath();ctx.ellipse(dx,dy,r*.24,r*.38,dx/r*.6,0,Math.PI*2);ctx.fill()}}
  else if(k==='fly'){const c=ctx.fillStyle;for(const sx of [-1,1]){ctx.beginPath();ctx.ellipse(sx*r*.55,-r*.35,r*.6,r*.5,sx*.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(sx*r*.45,r*.4,r*.4,r*.34,-sx*.4,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#5A4636';ctx.beginPath();ctx.ellipse(0,0,r*.12,r*.6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=c}
  else if(k==='flower'){const c=ctx.fillStyle;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.arc(Math.cos(a)*r*.55,Math.sin(a)*r*.55,r*.45,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#FFD84D';ctx.beginPath();ctx.arc(0,0,r*.35,0,Math.PI*2);ctx.fill();ctx.fillStyle=c}
  else if(k==='bubble'){ctx.arc(0,0,r,0,Math.PI*2);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=Math.max(1.2,r*.18);ctx.stroke();ctx.globalAlpha*=.25;ctx.fill();ctx.globalAlpha*=3;ctx.beginPath();ctx.arc(-r*.35,-r*.35,r*.22,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill()}
  else{ctx.arc(0,0,r,0,Math.PI*2);ctx.fill()}}
 const want=()=>{const k=fxK('amb');return k?Math.max(3,Math.round(Math.min(38,Math.max(16,W*H/38000))*k)):0};
 function seed(){const I=FXINFO[skin];const n=want();amb=[];
  for(let i=0;i<n;i++)amb.push(mk(I,true))}
 function level(){const I=FXINFO[skin],n=want();if(amb.length>n)amb.length=n;else while(amb.length<n)amb.push(mk(I,true));kick()}
 function mk(I,init){const k=I.amb;const p={k,c:I.c[Math.random()*I.c.length|0],x:rnd(0,W),y:init?rnd(0,H):0,r:rnd(3,7),rot:rnd(0,6.28),vr:rnd(-.02,.02),ph:rnd(0,6.28),a:rnd(.35,.7)};
  if(k==='petal'||k==='leaf'){p.vy=rnd(.35,.9);p.vx=rnd(-.2,.4);p.r=rnd(5,9);if(!init)p.y=-20}
  else if(k==='heart'||k==='ember'){p.vy=-rnd(.2,.55);p.vx=rnd(-.15,.15);if(!init)p.y=H+20;if(k==='ember')p.r=rnd(1.6,3.2)}
  else if(k==='star'){p.vy=0;p.vx=0;p.r=rnd(1,2.6);p.tw=rnd(.02,.05)}
  else if(k==='foot'){p.vy=-rnd(.12,.25);p.vx=0;p.r=rnd(5,8);p.rot=rnd(-.3,.3);p.vr=0;p.tw=rnd(.02,.035);p.a=rnd(.25,.45);if(!init)p.y=H+20}
  else if(k==='fly'){p.vy=-rnd(.05,.25);p.vx=rnd(-.4,.4);p.r=rnd(5,8);p.rot=rnd(-.4,.4);p.vr=0;p.fly=1;if(!init)p.y=H+20}
  else if(k==='bubble'){p.vy=-rnd(.35,.9);p.vx=0;p.r=rnd(2.5,8);p.vr=0;if(!init)p.y=H+20}
  else{p.vy=-rnd(.1,.3);p.vx=rnd(-.1,.1);p.r=rnd(3,6);p.tw=rnd(.015,.035);if(!init)p.y=H+20}
  return p}
 function stepAmb(dt0){bx.clearRect(0,0,W,H);const K=fxK('amb');if(!K)return;const I=FXINFO[skin],dt=dt0*(.5+.5*K),sz=.7+.3*K;
  for(let i=0;i<amb.length;i++){const p=amb[i];p.ph+=.02*dt;p.rot+=p.vr*dt;
   p.x+=(p.vx+Math.sin(p.ph)*.35*(p.k==='petal'||p.k==='leaf'?1:.4))*dt;p.y+=p.vy*dt;
   if(p.y>H+30||p.y<-30||p.x<-30||p.x>W+30){amb[i]=mk(I,false);continue}
   let a=p.a;if(p.tw)a=p.a*(.35+.65*(.5+.5*Math.sin(p.ph*p.tw*50)));
   bx.save();bx.globalAlpha=a;bx.translate(p.x,p.y);bx.rotate(p.rot);if(p.fly)bx.scale(.35+.65*Math.abs(Math.sin(p.ph*6)),1);bx.fillStyle=p.c;shape(bx,p.k,p.r*sz);bx.restore()}
  if(skin==='night'){if(!shoot&&Math.random()<.004*dt)shoot={x:rnd(W*.2,W),y:rnd(0,H*.35),l:0};
   if(shoot){shoot.l+=dt;const t=shoot.l/45,x=shoot.x-t*260,y=shoot.y+t*110;const g=bx.createLinearGradient(x,y,x+90,y-38);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');
    bx.strokeStyle=g;bx.lineWidth=2;bx.beginPath();bx.moveTo(x,y);bx.lineTo(x+90,y-38);bx.stroke();if(shoot.l>45)shoot=null}}}
 function stepBurst(dt){fx.clearRect(0,0,W,H);burst=burst.filter(p=>p.life>0);
  for(const p of burst){p.life-=dt;if(p.ring){const t=1-p.life/p.max;fx.save();fx.globalAlpha=(1-t)*.55;fx.strokeStyle=p.c;fx.lineWidth=2.5;fx.beginPath();fx.arc(p.x,p.y,6+t*34,0,Math.PI*2);fx.stroke();fx.restore();continue}
   p.vy+=p.g*dt;p.vx*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
   fx.save();fx.globalAlpha=Math.max(0,p.life/p.max);fx.translate(p.x,p.y);fx.rotate(p.rot);fx.fillStyle=p.c;shape(fx,p.k,p.r);fx.restore()}}
 function loop(ts){const dt=Math.min(3,(ts-(last||ts))/16.67)||1;last=ts;stepAmb(dt);stepBurst(dt);
  if(fxLevel('amb')||burst.length)raf=requestAnimationFrame(loop);else{raf=0;last=0;bx.clearRect(0,0,W,H);fx.clearRect(0,0,W,H)}}
 function kick(){if(!raf&&!document.hidden)raf=requestAnimationFrame(loop)}
 function setSkin(k){if(k!==skin){skin=k;seed();shoot=null}kick()}
 function tap(x,y){const K=fxK('tap');if(!K)return;const I=FXINFO[skin],sp=.5+.5*K,sz=.7+.3*K;
  const n=Math.max(2,Math.round(5*K));for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),v=rnd(.9,2.2)*sp;
   burst.push({k:I.tap,c:I.c[i%I.c.length],x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(['ember','heart','bubble'].includes(I.tap)?.6:.9),g:['ember','heart','bubble'].includes(I.tap)?-.01:.07,r:rnd(2.5,4.5)*sz,rot:rnd(0,6.28),vr:rnd(-.12,.12),life:rnd(24,34),max:34})}
  kick()}
 let lastW=innerWidth;addEventListener('resize',()=>{size();if(Math.abs(innerWidth-lastW)>40){lastW=innerWidth;seed()}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)kick()});
 let pd=null;document.addEventListener('pointerdown',e=>{pd=(e.target.closest&&e.target.closest('.scard.top'))?null:{x:e.clientX,y:e.clientY}},{passive:true});
 document.addEventListener('pointerup',e=>{if(pd&&Math.hypot(e.clientX-pd.x,e.clientY-pd.y)<10)tap(e.clientX,e.clientY);pd=null},{passive:true});
 document.addEventListener('pointercancel',()=>{pd=null},{passive:true});
 size();return {setSkin,kick,tap,level};
})();
/* ---------- ambient sound: one relaxing scene per theme, synthesized live with Web Audio (no audio files, no licensing) ----------
   Off by default and never starts without a user gesture. Crossfades on theme change, pauses while the tab is hidden.
   Real recordings later: put music/<theme>.mp3 in the repo and add the theme name to MUSIC_FILES; that file then loops instead. */
const MUSIC_FILES=[]; // e.g. ['sea','night'] once music/sea.mp3 and music/night.mp3 exist
const SNDINFO={default:['lo-fi คอร์ดเบา ๆ','Soft lo-fi chords'],night:['เปียโนช้า + จิ้งหรีด','Slow piano + crickets'],sakura:['สายลม + กระดิ่งลม','Breeze + wind chimes'],mint:['ลำธาร + มาริมบา','Brook + soft marimba'],lavender:['ambient pad นุ่ม ๆ','Soft ambient pad'],sunset:['กีตาร์อาร์เปจโจนุ่ม ๆ','Gentle guitar arpeggios'],dino:['กลองไม้ + เสียงป่า','Wood drums + jungle'],garden:['นกร้องในสวน','Garden birdsong'],sea:['คลื่น + นกนางนวล','Waves + seagulls']};
S.snd=store.get('maadoo-snd')==='1';
S.sndVol=(()=>{const v=parseFloat(store.get('maadoo-snd-vol'));return isFinite(v)?Math.min(1,Math.max(0,v)):.5})();
const SND=(()=>{
 const FADE=1.5,LOOK=.6,TICK=250;
 let ctx=null,master=null,white=null,brown=null,cur=null,skin=S.skin,timer=0,playing=false;
 const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],mtof=m=>440*Math.pow(2,(m-69)/12);
 const level=()=>S.sndVol*S.sndVol*.9;
 function ensure(){
  if(ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{ctx=new AC({latencyHint:'playback'})}catch(e){try{ctx=new AC()}catch(_){return false}}
  master=ctx.createGain();master.gain.value=level();const comp=ctx.createDynamicsCompressor();master.connect(comp);comp.connect(ctx.destination);
  const n=ctx.sampleRate*2;white=ctx.createBuffer(1,n,ctx.sampleRate);brown=ctx.createBuffer(1,n,ctx.sampleRate);
  const w=white.getChannelData(0),b=brown.getChannelData(0);let last=0;
  for(let i=0;i<n;i++){const r=Math.random()*2-1;w[i]=r;last=(last+.02*r)/1.02;b[i]=last*3.5}
  return true}
 /* building blocks (each scene gets its own output gain `o`) */
 function loop(buf){const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;s.start(0,rnd(0,1.9));return s}
 function filt(type,f,q){const x=ctx.createBiquadFilter();x.type=type;x.frequency.value=f;if(q!=null)x.Q.value=q;return x}
 function amp(v){const g=ctx.createGain();g.gain.value=v;return g}
 function pan(p){if(!ctx.createStereoPanner)return amp(1);const s=ctx.createStereoPanner();s.pan.value=p;return s}
 function lfo(param,rate,depth){const l=ctx.createOscillator(),g=amp(depth);l.frequency.value=rate;l.connect(g);g.connect(param);l.start();return l}
 function chain(...n){for(let i=0;i<n.length-1;i++)n[i].connect(n[i+1]);return n[n.length-1]}
 function echo(dest,time,fb,wet){const i=amp(1),d=ctx.createDelay(2),f=amp(fb),lp=filt('lowpass',2200),w=amp(wet);d.delayTime.value=time;
  i.connect(dest);i.connect(d);chain(d,lp,f,d);d.connect(w);w.connect(dest);return i}
 function tone(dest,t,f,o){o=o||{};const s=ctx.createOscillator(),g=ctx.createGain(),a=o.a||.01,d=o.d||1,v=o.v||.05;
  s.type=o.type||'sine';s.frequency.setValueAtTime(f,t);if(o.to)s.frequency.exponentialRampToValueAtTime(o.to,t+(o.glide||d*.5));if(o.detune)s.detune.value=o.detune;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);
  s.connect(g);g.connect(o.via?o.via(g):dest);s.start(t);s.stop(t+a+d+.05);return g}
 function burst(dest,t,d,v,f,type){const s=ctx.createBufferSource(),g=ctx.createGain(),x=filt(type||'bandpass',f,1.2);s.buffer=white;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);chain(s,x,g,dest);s.start(t,rnd(0,1.5));s.stop(t+d+.02)}
 function stream(min,max,fn){let n=0;return h=>{const now=ctx.currentTime;if(n<now-.1)n=now+rnd(.05,min);while(n<h){fn(n);n+=rnd(min,max)}}}
 function steady(step,fn){let n=0,i=0;return h=>{const now=ctx.currentTime;if(n<now-.1)n=now+.1;while(n<h){fn(n,i++);n+=step}}}
 /* one scene per theme: returns {tick(horizon), srcs:[continuous sources]} */
 const SCENES={
  default(o){const bus=echo(o,.38,.25,.18),lp=filt('lowpass',1300);lp.connect(bus);
   const hiss=chain(loop(white),filt('highpass',4000),amp(.004));hiss.connect(o);
   const prog=[[65,69,72,76],[64,67,71,74],[62,65,69,72],[60,64,67,71]];
   return {srcs:[hiss],tick:steady(4,(t,i)=>{const c=prog[i%4];
    c.forEach((m,j)=>{tone(lp,t+j*.035,mtof(m),{type:'triangle',v:.045,a:.03,d:3.7});tone(lp,t+j*.035,mtof(m),{v:.02,a:.05,d:3.5,detune:8})});
    tone(o,t,mtof(c[0]-24),{v:.1,a:.02,d:3.4});if(i%2)tone(lp,t+2,mtof(c[3]+12),{type:'triangle',v:.025,a:.02,d:1.6})})}},
  night(o){const bus=echo(o,.47,.32,.28);
   const cr=[[4400,-.4],[4750,.5]].map(([f,p])=>{const s=ctx.createOscillator(),g=amp(0);s.frequency.value=f;chain(s,g,pan(p),o);s.start();return {s,g}});
   const notes=[57,60,62,64,67,69,72,74,76];
   const piano=stream(1.3,2.8,t=>{const m=pick(notes);tone(bus,t,mtof(m),{v:.08,a:.006,d:3.4});tone(bus,t,mtof(m)*2,{v:.018,a:.004,d:1.2});
    if(Math.random()<.3){const m2=pick(notes);tone(bus,t+.18,mtof(m2),{v:.05,a:.006,d:3})}});
   const crick=cr.map(c=>stream(.7,1.6,t=>{const g=c.g.gain;for(let k=0;k<3;k++){const s=t+k*.07;g.setValueAtTime(0,s);g.linearRampToValueAtTime(.012,s+.012);g.linearRampToValueAtTime(0,s+.045)}}));
   return {srcs:cr.map(c=>c.s),tick:h=>{piano(h);crick.forEach(f=>f(h))}}},
  sakura(o){/* soft breeze: deep brown noise in slow gusts (no white-noise hiss, which reads as rain) + wind chimes */
   const w=loop(brown),bp=filt('bandpass',320,.9),lp=filt('lowpass',900),g=amp(.03);chain(w,bp,lp,g,o);
   const gusts=stream(5,9,t=>{const p=rnd(5,9),pk=rnd(.07,.11);g.gain.setValueAtTime(.025,t);g.gain.linearRampToValueAtTime(pk,t+p*.45);g.gain.linearRampToValueAtTime(.025,t+p*.95);
    bp.frequency.setValueAtTime(260,t);bp.frequency.linearRampToValueAtTime(rnd(480,640),t+p*.45);bp.frequency.linearRampToValueAtTime(260,t+p*.95)});
   const bus=echo(o,.33,.3,.3),chimes=[84,86,88,91,93,96,98];
   const ring=stream(.8,3.2,t=>{const n=Math.random()<.35?3:1;for(let k=0;k<n;k++){const f=mtof(pick(chimes)),s=t+k*rnd(.1,.25);
    tone(bus,s,f,{v:.04,a:.002,d:3.8});tone(bus,s,f*2.76,{v:.009,a:.002,d:1.3})}});
   return {srcs:[w],tick:h=>{gusts(h);ring(h)}}},
  mint(o){/* brook: low water rumble + pitched bubbling/gurgles + soft marimba (no broadband hiss) */
   const r=loop(brown),lp=filt('lowpass',380),rg=amp(.07);chain(r,lp,rg,o);const l=lfo(rg.gain,.13,.02);
   const gu=loop(brown),gf=filt('bandpass',700,4),gg=amp(.05);chain(gu,gf,gg,o);const l2=lfo(gf.frequency,.9,220),l3=lfo(gg.gain,.37,.03);
   const wp=pan(-.25);wp.connect(o);
   const bubbles=stream(.08,.5,t=>{const n=Math.random()<.4?2+Math.floor(Math.random()*3):1;for(let k=0;k<n;k++){const f=rnd(300,650),s=t+k*rnd(.04,.09);
    tone(wp,s,f,{v:.03,a:.003,d:.06,to:f*rnd(1.8,2.6),glide:.045})}});
   const bus=echo(o,.42,.25,.22),scale=[67,69,72,74,76,79,81];
   const mar=stream(2.2,4.5,t=>{const m=pick(scale);tone(bus,t,mtof(m),{v:.05,a:.004,d:1.4});tone(bus,t,mtof(m)*4,{v:.008,a:.002,d:.25});
    if(Math.random()<.4)tone(bus,t+.24,mtof(pick(scale)),{v:.035,a:.004,d:1.2})});
   return {srcs:[r,l,gu,l2,l3],tick:h=>{bubbles(h);mar(h)}}},
  lavender(o){const lp=filt('lowpass',900,.5);lp.connect(echo(o,.6,.35,.25));const l=lfo(lp.frequency,.05,350);
   const prog=[[57,60,64,67],[53,57,60,64],[55,59,62,67],[52,55,59,64]];
   return {srcs:[l],tick:steady(8,(t,i)=>{prog[i%4].forEach(m=>{[-7,7].forEach(dt=>{const s=ctx.createOscillator(),g=ctx.createGain();s.type='sawtooth';s.frequency.value=mtof(m);s.detune.value=dt;
     g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.018,t+3);g.gain.setValueAtTime(.018,t+7);g.gain.linearRampToValueAtTime(0,t+10.5);chain(s,g,lp);s.start(t);s.stop(t+10.6)})});
    tone(o,t+1,mtof(prog[i%4][2]+12),{v:.012,a:2.5,d:5})})}},
  sunset(o){const bus=echo(o,.36,.22,.2),prog=[[48,55,60,64,67],[45,52,57,60,64],[41,48,53,57,60],[43,50,55,59,62]],pat=[0,2,3,4,3,2,1,2];
   return {srcs:[],tick:steady(.36,(t,i)=>{const c=prog[Math.floor(i/16)%4],m=c[pat[i%8]],s=ctx.createOscillator(),g=ctx.createGain(),lp=filt('lowpass',3500,1);
    s.type='triangle';s.frequency.value=mtof(m);lp.frequency.setValueAtTime(3500,t);lp.frequency.exponentialRampToValueAtTime(700,t+.35);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(i%8?.06:.085,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+1.9);chain(s,lp,g,bus);s.start(t);s.stop(t+2);
    if(i%16===0)tone(o,t,mtof(c[0]-12),{v:.07,a:.01,d:2.8})})}},
  dino(o){const r=loop(brown),f=filt('lowpass',900),g=amp(.05);chain(r,f,g,o);const l=lfo(g.gain,.09,.025);
   const beat=[2,0,0,1,0,0,1,0,2,0,1,0,0,0,0,0];
   const drums=steady(.42,(t,i)=>{const b=beat[i%16];if(!b)return;const f0=b===2?150:220;
    tone(o,t,f0,{v:.13,a:.003,d:.32,to:f0*.55,glide:.12});burst(o,t,.03,.035,1800)});
   const calls=stream(3,8,t=>{if(Math.random()<.5){for(let k=0;k<2;k++){const s=t+k*.16;tone(o,s,170,{type:'square',v:.012,a:.005,d:.09,to:120,glide:.08,via:()=>{const x=filt('lowpass',650);x.connect(o);return x}})}}
    else{const f0=rnd(900,1400);[0,.22,.44].forEach((d,k)=>tone(o,t+d,f0*(1+k*.08),{v:.02,a:.01,d:.16,to:f0*.8,glide:.14}))}});
   return {srcs:[r,l],tick:h=>{drums(h);calls(h)}}},
  garden(o){const w=loop(white),bp=filt('bandpass',420,.7);chain(w,bp,amp(.03),o);
   const birds=[[2600,4000,-.5],[3200,5200,.45]].map(([lo,hi,p])=>{const out=pan(p);out.connect(o);
    return stream(1.6,5,t=>{const n=3+Math.floor(Math.random()*5),base=rnd(lo,hi);let s=t;for(let k=0;k<n;k++){const d=rnd(.05,.11),f=base*rnd(.85,1.15);tone(out,s,f,{v:.08,a:.008,d,to:f*rnd(.7,1.35),glide:d});s+=d+rnd(.03,.09)}})});
   return {srcs:[w],tick:h=>birds.forEach(b=>b(h))}},
  sea(o){const s=loop(brown),lp=filt('lowpass',500),g=amp(.03);chain(s,lp,g,o);const foam=loop(white),hp=filt('highpass',2500),fg=amp(.002);chain(foam,hp,fg,o);
   const waves=stream(6,10,t=>{const p=rnd(6,10);g.gain.setValueAtTime(.03,t);g.gain.linearRampToValueAtTime(.2,t+p*.4);g.gain.linearRampToValueAtTime(.03,t+p*.95);
    lp.frequency.setValueAtTime(420,t);lp.frequency.linearRampToValueAtTime(1100,t+p*.4);lp.frequency.linearRampToValueAtTime(420,t+p*.95);
    fg.gain.setValueAtTime(.002,t+p*.3);fg.gain.linearRampToValueAtTime(.012,t+p*.45);fg.gain.linearRampToValueAtTime(.002,t+p*.8)});
   const gp=pan(.3);gp.connect(o);
   const gulls=stream(7,15,t=>{const n=2+Math.floor(Math.random()*2);for(let k=0;k<n;k++){const f=rnd(1250,1500);tone(gp,t+k*.42,f,{type:'triangle',v:.02,a:.03,d:.32,to:f*.62,glide:.3})}});
   return {srcs:[s,foam],tick:h=>{waves(h);gulls(h)}}}
 };
 function make(k){const o=amp(0);o.connect(master);let sc;
  if(MUSIC_FILES.includes(k)){const el=new Audio('music/'+k+'.mp3');el.loop=true;el.preload='auto';const src=ctx.createMediaElementSource(el);src.connect(o);
   el.play().catch(()=>{});sc={srcs:[],tick:()=>{},el}}
  else sc=(SCENES[k]||SCENES.default)(o);
  sc.o=o;const t=ctx.currentTime;o.gain.setValueAtTime(0,t);o.gain.linearRampToValueAtTime(1,t+FADE);return sc}
 function kill(sc,fade){if(!sc)return;const t=ctx.currentTime;sc.o.gain.cancelScheduledValues(t);sc.o.gain.setValueAtTime(sc.o.gain.value,t);sc.o.gain.linearRampToValueAtTime(0,t+fade);
  setTimeout(()=>{sc.srcs.forEach(s=>{try{s.stop()}catch(e){}});if(sc.el){sc.el.pause();sc.el.removeAttribute('src');sc.el.load()}try{sc.o.disconnect()}catch(e){}},fade*1000+120)}
 function run(){clearInterval(timer);timer=0;if(!playing||document.hidden)return;const f=()=>{if(cur)cur.tick(ctx.currentTime+LOOK)};f();timer=setInterval(f,TICK)}
 function start(){if(playing||!ensure())return;playing=true;ctx.resume().catch(()=>{});master.gain.setValueAtTime(level(),ctx.currentTime);cur=make(skin);run()}
 function stop(){if(!playing)return;playing=false;clearInterval(timer);timer=0;const old=cur;cur=null;kill(old,.4);
  setTimeout(()=>{if(!playing&&ctx)ctx.suspend().catch(()=>{})},600)}
 function setSkin(k){if(k===skin)return;skin=k;if(!playing||!ctx)return;const old=cur;cur=make(k);kill(old,FADE);run()}
 function setVol(v){S.sndVol=v;store.set('maadoo-snd-vol',String(v));if(ctx)master.gain.setTargetAtTime(level(),ctx.currentTime,.05)}
 function toggle(){S.snd=!S.snd;store.set('maadoo-snd',S.snd?'1':'0');S.snd?start():stop()}
 document.addEventListener('visibilitychange',()=>{if(!ctx||!playing)return;
  if(document.hidden){clearInterval(timer);timer=0;if(cur&&cur.el)cur.el.pause();ctx.suspend().catch(()=>{})}
  else{ctx.resume().catch(()=>{});if(cur&&cur.el)cur.el.play().catch(()=>{});run()}});
 // remembered "on": wait for the visitor's first tap/click/key before making any sound (never autoplay)
 const wake=()=>{['click','keydown','touchend'].forEach(e=>document.removeEventListener(e,wake,true));if(S.snd&&!playing&&!document.hidden)start()};
 if(S.snd)['click','keydown','touchend'].forEach(e=>document.addEventListener(e,wake,true));
 return {setSkin,setVol,toggle,get playing(){return playing}};
})();

