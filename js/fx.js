/* Maadoo Job · js/fx.js — theme effects (canvas) + ambient sound. Classic script sharing one global scope; see CLAUDE.md for load order. */
/* ---------- theme effects ----------
   Each theme picks particle kinds by name in its THEMES entry (js/themes.js). A kind is defined once in PK below:
   draw(ctx,r,p) · init(p,fresh) sets its motion · sway (side wobble, default .4) · step(p,dt) extra motion · flap/flip (squash while moving)
   Tap-only options: up (floats up instead of falling) · g (gravity) · tr (size ×) · n/sp (count/speed ×) · bounce · burst(x,y,K,sz,I) for custom bursts.
   Events (EV) are rare one-off animations on the background layer, such as the night shooting star. */
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
 const bx=bg.getContext('2d'),fx=fg.getContext('2d');let W=0,H=0,dpr=1,amb=[],burst=[],evs={},raf=0,last=0,skin=null;
 const rnd=(a,b)=>a+Math.random()*(b-a),PI2=Math.PI*2,I=()=>TH(skin).fx;
 function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;for(const c of [bg,fg]){c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px'}bx.setTransform(dpr,0,0,dpr,0,0);fx.setTransform(dpr,0,0,dpr,0,0)}
 /* shared drawing helpers */
 const starD=(c,r)=>{for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.38:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}c.closePath();c.fill()};
 const glow=(c,r,col,al=1)=>{const a0=c.globalAlpha;c.globalAlpha=a0*al;const g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,col);g.addColorStop(1,col.length===7?col+'00':'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,PI2);c.fill();c.globalAlpha=a0};
 const MAPLE=[[.16,-.58],[.42,-.72],[.36,-.36],[.92,-.46],[.66,-.12],[.86,.1],[.42,.12],[.46,.42],[.1,.26],[0,.3]];
 const fromTop=(p,f)=>{if(!f)p.y=-20},fromBottom=(p,f)=>{if(!f)p.y=H+20};
 const PK={
  spark:{draw:starD,init(p,f){p.vy=-rnd(.1,.3);p.vx=rnd(-.1,.1);p.r=rnd(3,6);p.tw=rnd(.015,.035);fromBottom(p,f)}},
  star:{draw:starD,init(p){p.vy=0;p.vx=0;p.r=rnd(1,2.6);p.tw=rnd(.02,.05)}},
  petal:{sway:1,draw(c,r){c.moveTo(0,-r);c.bezierCurveTo(r*.9,-r*.6,r*.7,r*.7,0,r);c.bezierCurveTo(-r*.7,r*.7,-r*.9,-r*.6,0,-r);c.fill();c.globalAlpha*=.5;c.beginPath();c.moveTo(0,-r);c.lineTo(0,-r*.55);c.strokeStyle='#fff';c.lineWidth=r*.18;c.stroke()},
   init(p,f){p.vy=rnd(.35,.9);p.vx=rnd(-.2,.4);p.r=rnd(5,9);fromTop(p,f)}},
  leaf:{sway:1,draw(c,r){c.moveTo(0,-r);c.quadraticCurveTo(r*.9,0,0,r);c.quadraticCurveTo(-r*.9,0,0,-r);c.fill();c.globalAlpha*=.5;c.beginPath();c.moveTo(0,-r*.9);c.lineTo(0,r*.9);c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=r*.12;c.stroke()},
   init(p,f){p.vy=rnd(.35,.9);p.vx=rnd(-.2,.4);p.r=rnd(5,9);fromTop(p,f)}},
  heart:{up:1,draw(c,r){const s=r/1.1;c.moveTo(0,s*.35);c.bezierCurveTo(-s*1.2,-s*.5,-s*.45,-s*1.25,0,-s*.5);c.bezierCurveTo(s*.45,-s*1.25,s*1.2,-s*.5,0,s*.35);c.fill()},
   init(p,f){p.vy=-rnd(.2,.55);p.vx=rnd(-.15,.15);fromBottom(p,f)}},
  ember:{up:1,draw(c,r){const g=c.createRadialGradient(0,0,0,0,0,r*2.2);g.addColorStop(0,c.fillStyle);g.addColorStop(.35,c.fillStyle);g.addColorStop(1,'rgba(255,160,60,0)');c.fillStyle=g;c.arc(0,0,r*2.2,0,PI2);c.fill()},
   init(p,f){p.vy=-rnd(.2,.55);p.vx=rnd(-.15,.15);fromBottom(p,f);p.r=rnd(1.6,3.2)}},
  foot:{draw(c,r){c.ellipse(0,r*.35,r*.62,r*.72,0,0,PI2);c.fill();for(const [dx,dy] of [[-r*.62,-r*.55],[0,-r*.95],[r*.62,-r*.55]]){c.beginPath();c.ellipse(dx,dy,r*.24,r*.38,dx/r*.6,0,PI2);c.fill()}},
   init(p,f){p.vy=-rnd(.12,.25);p.vx=0;p.r=rnd(5,8);p.rot=rnd(-.3,.3);p.vr=0;p.tw=rnd(.02,.035);p.a=rnd(.25,.45);fromBottom(p,f)}},
  fly:{flap:1,draw(c,r){const k=c.fillStyle;for(const sx of [-1,1]){c.beginPath();c.ellipse(sx*r*.55,-r*.35,r*.6,r*.5,sx*.5,0,PI2);c.fill();c.beginPath();c.ellipse(sx*r*.45,r*.4,r*.4,r*.34,-sx*.4,0,PI2);c.fill()}c.fillStyle='#5A4636';c.beginPath();c.ellipse(0,0,r*.12,r*.6,0,0,PI2);c.fill();c.fillStyle=k},
   init(p,f){p.vy=-rnd(.05,.25);p.vx=rnd(-.4,.4);p.r=rnd(5,8);p.rot=rnd(-.4,.4);p.vr=0;fromBottom(p,f)}},
  flower:{draw(c,r){const k=c.fillStyle;for(let i=0;i<5;i++){const a=i*PI2/5;c.beginPath();c.arc(Math.cos(a)*r*.55,Math.sin(a)*r*.55,r*.45,0,PI2);c.fill()}c.fillStyle='#FFD84D';c.beginPath();c.arc(0,0,r*.35,0,PI2);c.fill();c.fillStyle=k}},
  bubble:{up:1,draw(c,r){c.arc(0,0,r,0,PI2);c.strokeStyle=c.fillStyle;c.lineWidth=Math.max(1.2,r*.18);c.stroke();c.globalAlpha*=.25;c.fill();c.globalAlpha*=3;c.beginPath();c.arc(-r*.35,-r*.35,r*.22,0,PI2);c.fillStyle='#fff';c.fill()},
   init(p,f){p.vy=-rnd(.35,.9);p.vx=0;p.r=rnd(2.5,8);p.vr=0;fromBottom(p,f)}},
  dot:{draw(c,r){c.arc(0,0,r,0,PI2);c.fill()}},
  /* galaxy: soft nebula fog */
  nebula:{sway:.1,draw(c,r){glow(c,r,c.fillStyle)},init(p){p.r=rnd(70,140);p.vx=rnd(-.08,.08);p.vy=rnd(-.05,.05);p.a=rnd(.1,.18);p.vr=0;p.pad=160;p.y=rnd(0,H);p.life=p.max=rnd(900,1500)}},
  /* japan: maple leaf + glowing paper lantern */
  maple:{sway:1,tr:1.5,draw(c,r){c.moveTo(0,-r);for(const s of [1,-1])for(const [px,py] of (s>0?MAPLE:MAPLE.slice().reverse()))c.lineTo(px*r*s,py*r);c.closePath();c.fill();c.strokeStyle=c.fillStyle;c.lineWidth=Math.max(1,r*.1);c.beginPath();c.moveTo(0,r*.2);c.lineTo(0,r*.95);c.stroke()},
   init(p,f){p.vy=rnd(.35,.8);p.vx=rnd(-.2,.4);p.r=rnd(6,10);p.vr=rnd(-.03,.03);fromTop(p,f)}},
  lantern:{sway:.5,draw(c,r){const k=c.fillStyle;glow(c,r*2.6,'#FFC27A',.35);c.fillStyle=k;c.beginPath();c.ellipse(0,0,r*.8,r,0,0,PI2);c.fill();
    c.fillStyle='rgba(60,30,20,.8)';c.fillRect(-r*.42,-r*1.12,r*.84,r*.26);c.fillRect(-r*.42,r*.86,r*.84,r*.26);
    c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=Math.max(.6,r*.07);for(const q of [-.5,0,.5]){const w=r*.78*Math.sqrt(1-q*q);c.beginPath();c.moveTo(-w,q*r);c.lineTo(w,q*r);c.stroke()}},
   step(p){p.rot=Math.sin(p.ph*.8)*.12},init(p,f){p.vy=-rnd(.15,.35);p.vx=rnd(-.08,.08);p.r=rnd(7,11);p.vr=0;p.a=rnd(.55,.85);p.pad=60;if(!f)p.y=H+50}},
  /* china: red lantern swinging on a string + auspicious cloud + gold coin */
  redlantern:{sway:.25,draw(c,r,p){const k=c.fillStyle;c.rotate(-p.rot);c.translate(0,-r*2.4);c.rotate(p.rot);c.translate(0,r*2.4);
    c.strokeStyle='#E0A820';c.lineWidth=Math.max(1,r*.1);c.beginPath();c.moveTo(0,-r*3.4);c.lineTo(0,-r);c.stroke();
    glow(c,r*2.2,'#FF6A4D',.3);c.fillStyle=k;c.beginPath();c.ellipse(0,0,r*1.1,r*.9,0,0,PI2);c.fill();
    c.strokeStyle='rgba(245,196,74,.8)';c.lineWidth=Math.max(.6,r*.08);for(const q of [-.5,0,.5]){c.beginPath();c.ellipse(0,0,r*1.1*Math.abs(q)+.1,r*.9,0,0,PI2);c.stroke()}
    c.fillStyle='#F5C44A';c.fillRect(-r*.5,-r*1.05,r,r*.28);c.fillRect(-r*.5,r*.78,r,r*.28);c.fillRect(-r*.08,r*1.05,r*.16,r*.8)},
   step(p){p.rot=Math.sin(p.ph*1.3)*.28},init(p,f){p.vy=rnd(.12,.28);p.vx=rnd(-.05,.05);p.r=rnd(8,12);p.vr=0;p.a=rnd(.6,.85);p.pad=70;if(!f)p.y=-50}},
  cloud:{sway:.15,draw(c,r){c.beginPath();c.arc(-r*.75,r*.1,r*.5,0,PI2);c.arc(0,-r*.25,r*.72,0,PI2);c.arc(r*.8,r*.1,r*.48,0,PI2);c.fill();c.beginPath();c.ellipse(0,r*.3,r*1.25,r*.32,0,0,PI2);c.fill();
    c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=Math.max(1,r*.09);c.lineCap='round';c.beginPath();c.arc(0,-r*.2,r*.32,Math.PI*.2,Math.PI*1.7);c.stroke();c.beginPath();c.arc(-r*.75,r*.12,r*.2,Math.PI*1.1,Math.PI*2.4);c.stroke()},
   init(p,f){p.vx=rnd(.15,.35);p.vy=0;p.r=rnd(10,18);p.rot=0;p.vr=0;p.a=rnd(.35,.6);p.pad=60;if(!f){p.x=-40;p.y=rnd(0,H)}}},
  coin:{tr:1.7,bounce:1,flip:1,draw(c,r){c.arc(0,0,r,0,PI2);c.fill();c.strokeStyle='rgba(150,90,0,.65)';c.lineWidth=Math.max(1,r*.14);c.beginPath();c.arc(0,0,r*.78,0,PI2);c.stroke();c.fillStyle='rgba(120,60,0,.6)';c.fillRect(-r*.26,-r*.26,r*.52,r*.52)}},
  /* café: steam wisps + coffee beans */
  steam:{sway:.8,draw(c,r){c.strokeStyle=c.fillStyle;c.lineWidth=r*.45;c.lineCap='round';c.moveTo(0,r*2);c.bezierCurveTo(r*1.2,r*.8,-r*1.2,-r*.6,0,-r*2);c.stroke()},
   step(p,dt){p.r+=.012*dt},init(p){p.vy=-rnd(.25,.45);p.vx=0;p.r=rnd(5,8);p.rot=0;p.vr=0;p.a=rnd(.35,.55);p.y=rnd(H*.3,H);p.life=p.max=rnd(200,320)}},
  bean:{sway:.3,draw(c,r){c.ellipse(0,0,r*.72,r,0,0,PI2);c.fill();c.strokeStyle='rgba(40,20,10,.55)';c.lineWidth=Math.max(1,r*.15);c.beginPath();c.moveTo(0,-r*.8);c.quadraticCurveTo(r*.4,0,0,r*.8);c.stroke()},
   init(p,f){p.vy=rnd(.4,.9);p.vx=rnd(-.1,.2);p.r=rnd(4,6);p.vr=rnd(-.03,.03);fromTop(p,f)}},
  /* rain: slanted streaks + drops on the glass + ripples */
  rain:{sway:0,draw(c,r,p){const sp=Math.hypot(p.vx,p.vy)||1,l=r*4;c.strokeStyle=c.fillStyle;c.lineWidth=Math.max(1,r*.22);c.lineCap='round';c.moveTo(0,0);c.lineTo(-p.vx/sp*l,-p.vy/sp*l);c.stroke()},
   init(p,f){p.vy=rnd(6,9);p.vx=-rnd(1.3,1.9);p.r=rnd(3,6);p.rot=0;p.vr=0;p.a=rnd(.35,.6);p.x=rnd(0,W+60);p.pad=80;fromTop(p,f)}},
  drop:{sway:0,draw(c,r){c.arc(0,0,r,0,PI2);c.fill();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.stroke();c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.arc(-r*.35,-r*.35,r*.25,0,PI2);c.fill()},
   step(p,dt){if(Math.random()<.002*dt)p.vy=rnd(.3,.8);p.vy*=Math.pow(.99,dt)},init(p){p.vy=rnd(0,.06);p.vx=0;p.r=rnd(2,4.5);p.rot=0;p.vr=0;p.a=rnd(.4,.65);p.y=rnd(0,H);p.life=p.max=rnd(240,480)}},
  ripple:{burst(x,y,K,sz,I){const cs=I.tc||I.c,n=Math.max(1,Math.round(3*Math.min(1,K)));
    for(let k=0;k<n;k++)burst.push({ring:1,c:cs[k%cs.length],x,y,life:40,max:40,del:k*7,rr:(22+k*10)*sz});
    for(let k=0;k<Math.max(2,Math.round(4*K));k++){const a=rnd(-2.6,-.5),v=rnd(1,2.2)*(.5+.5*K);burst.push({k:'dot',c:cs[(k+1)%cs.length],x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:.08,r:rnd(1.5,2.6)*sz,rot:0,vr:0,life:rnd(22,30),max:30})}}},
  /* pixel game: floating blocks + "+1" coins */
  block:{sway:0,draw(c,r){const s=Math.max(4,Math.round(r)*2),h=s/2;c.fillRect(-h,-h,s,s);c.fillStyle='rgba(255,255,255,.45)';c.fillRect(-h,-h,s/3,s/3);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-h,h-s/4,s,s/4)},
   init(p,f){p.vy=-rnd(.15,.4);p.vx=0;p.r=rnd(3,6);p.rot=0;p.vr=0;p.tw=rnd(.01,.02);fromBottom(p,f)}},
  pcoin:{flip:1,draw(c,r){const s=Math.max(4,Math.round(r))*2,h=s/2,q=s/4;c.fillRect(-h+q,-h,s-2*q,s);c.fillRect(-h,-h+q,s,s-2*q);c.fillStyle='rgba(160,100,0,.6)';c.fillRect(-q/2,-h+q,q,s-2*q)}},
  txt:{draw(c,r,p){c.font=`700 ${Math.round(r*3.4)}px ui-monospace,Menlo,Consolas,monospace`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.6)';c.strokeText(p.txt,0,0);c.fillText(p.txt,0,0)}},
  plus1:{burst(x,y,K,sz,I){const cs=I.tc||I.c;burst.push({k:'txt',txt:'+1',c:cs[0],x,y:y-8,vx:0,vy:-1.1*(.5+.5*K),g:.012,r:5*sz,rot:0,vr:0,life:46,max:46});
    for(let k=0;k<Math.max(1,Math.round(3*K));k++){const a=rnd(-2.4,-.7),v=rnd(1.4,2.6)*(.5+.5*K);burst.push({k:'pcoin',c:cs[k%cs.length],x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,g:.09,r:rnd(3,4)*sz,rot:0,vr:0,ph:rnd(0,6.28),life:rnd(40,52),max:52,floor:y+rnd(20,50)})}}},
  /* library: dust motes in the light + fluttering pages */
  mote:{sway:.3,draw(c,r){glow(c,r*3,c.fillStyle)},init(p){p.vx=rnd(-.12,.12);p.vy=rnd(-.12,.05);p.r=rnd(1.5,3);p.tw=rnd(.01,.025);p.vr=0;p.y=rnd(0,H);p.life=p.max=rnd(400,700)}},
  page:{tr:2.2,g:.035,flip:1,draw(c,r){const w=r*1.1,h=r*1.45;c.fillRect(-w/2,-h/2,w,h);c.strokeStyle='rgba(120,95,60,.6)';c.lineWidth=1;c.strokeRect(-w/2,-h/2,w,h);c.beginPath();for(let i=1;i<4;i++){const yy=-h/2+i*h/4.2;c.moveTo(-w*.32,yy);c.lineTo(w*.32,yy)}c.stroke()}},
  /* space: rocket-fire sparks */
  flame:{n:1.6,sp:1.3,draw(c,r){const g=c.createRadialGradient(0,0,0,0,0,r*2);g.addColorStop(0,'#FFF6D8');g.addColorStop(.3,c.fillStyle);g.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=g;c.arc(0,0,r*2,0,PI2);c.fill()}}
 };
 /* rare background events */
 const EV={
  shoot:{p:.004,start:()=>({x:rnd(W*.2,W),y:rnd(0,H*.35),l:0}),
   step(s,dt,c){s.l+=dt;const t=s.l/45,x=s.x-t*260,y=s.y+t*110;const g=c.createLinearGradient(x,y,x+90,y-38);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');
    c.strokeStyle=g;c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x+90,y-38);c.stroke();return s.l<=45}},
  rocket:{p:.0009,start(){const d=Math.random()<.5?1:-1;return {d,x:d>0?-40:W+40,y:rnd(H*.3,H*.85),vx:d*rnd(2,2.8),vy:-rnd(.5,1),tr:[]}},
   step(s,dt,c,sz){s.x+=s.vx*dt;s.y+=s.vy*dt;s.tr.push({x:s.x,y:s.y,a:1});s.tr=s.tr.filter(q=>(q.a-=.035*dt)>0);
    for(const q of s.tr){c.globalAlpha=q.a*.6;c.fillStyle=q.a>.6?'#FFD08A':'#FF7A3D';c.beginPath();c.arc(q.x+rnd(-1,1),q.y+rnd(-1,1),(1+2*q.a)*sz,0,PI2);c.fill()}
    c.save();c.globalAlpha=.95;c.translate(s.x,s.y);c.rotate(Math.atan2(s.vy,s.vx));c.scale(sz,sz);
    c.fillStyle='#FFB347';c.beginPath();c.moveTo(-9,0);c.lineTo(-15-rnd(0,5),-2.5);c.lineTo(-15-rnd(0,5),2.5);c.fill();
    c.fillStyle='#FF7A3D';c.beginPath();c.moveTo(-8,-3);c.lineTo(-12,-8);c.lineTo(-3,-3);c.fill();c.beginPath();c.moveTo(-8,3);c.lineTo(-12,8);c.lineTo(-3,3);c.fill();
    c.fillStyle='#FFF1DA';c.beginPath();c.ellipse(0,0,11,4.5,0,0,PI2);c.fill();c.fillStyle='#FF7A3D';c.beginPath();c.moveTo(7,-3.6);c.quadraticCurveTo(14,0,7,3.6);c.fill();
    c.fillStyle='#5BB8FF';c.beginPath();c.arc(1,0,2,0,PI2);c.fill();c.restore();c.globalAlpha=1;
    return s.x>-80&&s.x<W+80&&s.y>-60}}
 };
 const kinds=F=>typeof F.amb==='string'?[[F.amb,1]]:F.amb;
 const want=()=>{const k=fxK('amb');return k?Math.max(3,Math.round(Math.min(38,Math.max(16,W*H/38000))*k*(I().dens||1))):0};
 function seed(){const n=want();amb=[];for(let i=0;i<n;i++)amb.push(mk(true))}
 function level(){const n=want();if(amb.length>n)amb.length=n;else while(amb.length<n)amb.push(mk(true));kick()}
 function mk(init){const F=I(),ks=kinds(F);let w=Math.random()*ks.reduce((s,v)=>s+v[1],0),e=ks[0];for(const v of ks){if((w-=v[1])<0){e=v;break}}
  const cs=e[2]||F.c,p={k:e[0],c:cs[Math.random()*cs.length|0],x:rnd(0,W),y:init?rnd(0,H):0,r:rnd(3,7),rot:rnd(0,6.28),vr:rnd(-.02,.02),ph:rnd(0,6.28),a:rnd(.35,.7)};
  (PK[p.k].init||PK.spark.init)(p,init);return p}
 function stepAmb(dt0){bx.clearRect(0,0,W,H);const K=fxK('amb');if(!K)return;const F=I(),dt=dt0*(.5+.5*K),sz=.7+.3*K;
  for(let i=0;i<amb.length;i++){const p=amb[i],P=PK[p.k];p.ph+=.02*dt;p.rot+=p.vr*dt;
   p.x+=(p.vx+Math.sin(p.ph)*.35*(P.sway??.4))*dt;p.y+=p.vy*dt;if(P.step)P.step(p,dt);
   const pad=p.pad||30;if(p.y>H+pad||p.y<-pad||p.x<-pad||p.x>W+pad||(p.life!=null&&(p.life-=dt)<=0)){amb[i]=mk(false);continue}
   let a=p.a;if(p.tw)a=p.a*(.35+.65*(.5+.5*Math.sin(p.ph*p.tw*50)));if(p.life!=null)a*=Math.min(1,Math.sin(Math.PI*p.life/p.max)*2.5);
   bx.save();bx.globalAlpha=a;bx.translate(p.x,p.y);bx.rotate(p.rot);if(P.flap)bx.scale(.35+.65*Math.abs(Math.sin(p.ph*6)),1);bx.fillStyle=p.c;bx.beginPath();P.draw(bx,p.r*sz,p);bx.restore()}
  for(const e of F.ev||[]){const E=EV[e];if(!evs[e]&&Math.random()<E.p*dt)evs[e]=E.start();if(evs[e]&&!E.step(evs[e],dt,bx,sz))evs[e]=null}}
 function stepBurst(dt){fx.clearRect(0,0,W,H);burst=burst.filter(p=>p.life>0);
  for(const p of burst){if(p.del>0){p.del-=dt;continue}p.life-=dt;if(p.ring){const t=1-p.life/p.max;fx.save();fx.globalAlpha=(1-t)*.55;fx.strokeStyle=p.c;fx.lineWidth=2.5;fx.beginPath();fx.arc(p.x,p.y,6+t*(p.rr||34),0,Math.PI*2);fx.stroke();fx.restore();continue}
   const P=PK[p.k];p.vy+=p.g*dt;p.vx*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
   if(p.floor&&p.y>p.floor&&p.vy>0){p.y=p.floor;p.vy*=-.5;p.vx*=.85}
   fx.save();fx.globalAlpha=Math.max(0,p.life/p.max);fx.translate(p.x,p.y);fx.rotate(p.rot);if(P.flip){p.ph=(p.ph||0)+.15*dt;fx.scale(.2+.8*Math.abs(Math.cos(p.ph)),1)}fx.fillStyle=p.c;fx.beginPath();P.draw(fx,p.r,p);fx.restore()}}
 function loop(ts){const dt=Math.min(3,(ts-(last||ts))/16.67)||1;last=ts;stepAmb(dt);stepBurst(dt);
  if(fxLevel('amb')||burst.length)raf=requestAnimationFrame(loop);else{raf=0;last=0;bx.clearRect(0,0,W,H);fx.clearRect(0,0,W,H)}}
 function kick(){if(!raf&&!document.hidden)raf=requestAnimationFrame(loop)}
 function setSkin(k){if(k!==skin){skin=k;evs={};seed()}kick()}
 function tap(x,y){const K=fxK('tap');if(!K)return;const F=I(),P=PK[F.tap],sp=(.5+.5*K)*(P.sp||1),sz=.7+.3*K;
  if(P.burst){P.burst(x,y,K,sz,F);kick();return}
  const cs=F.tc||F.c,n=Math.max(2,Math.round(5*K*(P.n||1)));for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),v=rnd(.9,2.2)*sp;
   burst.push({k:F.tap,c:cs[i%cs.length],x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(P.up?.6:.9),g:P.up?-.01:(P.g??.07),r:rnd(2.5,4.5)*sz*(P.tr||1),rot:P.flip?0:rnd(0,6.28),vr:P.flip?rnd(-.04,.04):rnd(-.12,.12),ph:rnd(0,6.28),life:rnd(24,34)*(P.bounce?1.5:1),max:34*(P.bounce?1.5:1),floor:P.bounce?y+rnd(25,60):0})}
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
   Each theme's sound comes from its THEMES entry (js/themes.js): snd.scene names a scene below, or snd.mix stacks LAYERS.
   Real recordings: put music/<theme>.mp3 in the repo and set music:true on that theme (or list it in MUSIC_FILES); the file then loops instead,
   and the synthesized scene takes over if the file can't load. */
const MUSIC_FILES=[]; // e.g. ['sea','night'] once music/sea.mp3 and music/night.mp3 exist
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
 /* reusable layers for snd.mix: each (out, options) → {srcs, tick} */
 const LAYERS={
  pad(o,{prog,step=8,wave='sawtooth',cut=900,v=.018}){const lp=filt('lowpass',cut,.5);lp.connect(echo(o,.6,.35,.25));const l=lfo(lp.frequency,.05,cut*.35);
   return {srcs:[l],tick:steady(step,(t,i)=>prog[i%prog.length].forEach(m=>[-7,7].forEach(dt=>{const s=ctx.createOscillator(),g=ctx.createGain();s.type=wave;s.frequency.value=mtof(m);s.detune.value=dt;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+step*.35);g.gain.setValueAtTime(v,t+step*.85);g.gain.linearRampToValueAtTime(0,t+step*1.3);chain(s,g,lp);s.start(t);s.stop(t+step*1.3+.1)})))}},
  drone(o,{m=45,v=.015}){const lp=filt('lowpass',420,.7),g=amp(v);chain(lp,g,o);const ls=[lfo(lp.frequency,.03,180),lfo(g.gain,.07,v*.4)];
   const os=[[m,-6],[m,6],[m+7,0],[m+12,3]].map(([n,d])=>{const s=ctx.createOscillator();s.type='sawtooth';s.frequency.value=mtof(n);s.detune.value=d;s.connect(lp);s.start();return s});
   return {srcs:[...os,...ls],tick:()=>{}}},
  bell(o,{notes,gap=[2,5],v=.03}){const bus=echo(o,.5,.4,.35);
   return {srcs:[],tick:stream(gap[0],gap[1],t=>{const f=mtof(pick(notes));tone(bus,t,f,{v,a:.003,d:4});tone(bus,t,f*2.76,{v:v*.3,a:.002,d:1.6});tone(bus,t,f*5.4,{v:v*.12,a:.001,d:.6});
    if(Math.random()<.3)tone(bus,t+.3,mtof(pick(notes)),{v:v*.7,a:.003,d:3.2})})}},
  pluck(o,{scale,gap=[1,3],v=.05,decay=2,wave='triangle',cut=2800,gliss=0}){const bus=echo(o,.34,.25,.22);
   const pl=(t,m,vv)=>{const s=ctx.createOscillator(),g=ctx.createGain(),lp=filt('lowpass',cut,2);s.type=wave;s.frequency.value=mtof(m);
    lp.frequency.setValueAtTime(cut,t);lp.frequency.exponentialRampToValueAtTime(Math.max(300,cut*.2),t+decay*.4);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vv,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+decay);chain(s,lp,g,bus);s.start(t);s.stop(t+decay+.05);
    tone(bus,t,mtof(m)*2,{v:vv*.25,a:.002,d:decay*.3})};
   return {srcs:[],tick:stream(gap[0],gap[1],t=>{
    if(gliss&&Math.random()<gliss){const st=Math.floor(Math.random()*(scale.length-5));for(let k=0;k<6;k++)pl(t+k*.07,scale[st+k],v*.6);return}
    const i=Math.floor(Math.random()*scale.length);pl(t,scale[i],v);
    if(Math.random()<.4)pl(t+rnd(.25,.5),scale[Math.max(0,i-1-Math.floor(Math.random()*2))],v*.7)})}},
  flute(o,{scale,gap=[6,12],v=.03}){const bus=echo(o,.45,.35,.3);
   return {srcs:[],tick:stream(gap[0],gap[1],t=>{let s=t,i=Math.floor(Math.random()*scale.length);const n=2+Math.floor(Math.random()*3);
    for(let k=0;k<n;k++){const d=rnd(.8,1.6),f=mtof(scale[i]),os=ctx.createOscillator(),g=ctx.createGain(),vb=ctx.createOscillator(),vg=amp(0);
     os.frequency.setValueAtTime(f*.985,s);os.frequency.linearRampToValueAtTime(f,s+.12);vb.frequency.value=5;vg.gain.setValueAtTime(0,s);vg.gain.linearRampToValueAtTime(f*.012,s+d*.6);chain(vb,vg,os.frequency);
     g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v,s+.18);g.gain.setValueAtTime(v,s+d*.75);g.gain.linearRampToValueAtTime(0,s+d);chain(os,g,bus);
     os.start(s);os.stop(s+d+.05);vb.start(s);vb.stop(s+d+.05);burst(bus,s,.25,v*.35,f*2);
     s+=d+rnd(0,.15);i=Math.max(0,Math.min(scale.length-1,i+pick([-2,-1,1,1,2])))}})}},
  piano(o,{notes,gap=[1.5,3],v=.07}){const bus=echo(o,.47,.32,.28);
   return {srcs:[],tick:stream(gap[0],gap[1],t=>{const m=pick(notes);tone(bus,t,mtof(m),{v,a:.006,d:3.4});tone(bus,t,mtof(m)*2,{v:v*.22,a:.004,d:1.2});
    if(Math.random()<.3)tone(bus,t+.18,mtof(pick(notes)),{v:v*.6,a:.006,d:3})})}},
  keys(o,{prog,step=3.2,v=.035}){const lp=filt('lowpass',1600);lp.connect(echo(o,.36,.2,.18));const w=lfo(lp.frequency,.2,200);
   return {srcs:[w],tick:steady(step,(t,i)=>{const c=prog[i%prog.length],sw=rnd(.02,.05);
    c.forEach((m,j)=>{tone(lp,t+j*sw,mtof(m),{v,a:.008,d:step*.95});tone(lp,t+j*sw,mtof(m)*2,{v:v*.15,a:.004,d:.6})});
    tone(o,t,mtof(c[0]-24),{v:v*2.2,a:.01,d:step*.8});
    if(i%2)[0,1].forEach(k=>tone(lp,t+step*.5+k*.25,mtof(pick(c)+12),{v:v*.8,a:.006,d:1.2}))})}},
  crackle(o,{v=.012}){const src=loop(white);chain(src,filt('highpass',3500),amp(v*.25),o);
   return {srcs:[src],tick:stream(.05,.35,t=>burst(o,t,.006,rnd(v*.5,v*2),rnd(1500,5000),'highpass'))}},
  rain(o,{v=.05}){const w=loop(white),g=amp(v);chain(w,filt('highpass',800),filt('lowpass',6500),g,o);
   const b=loop(brown);chain(b,filt('lowpass',500),amp(v*1.4),o);const l=lfo(g.gain,.08,v*.25),dp=pan(.2);dp.connect(o);
   return {srcs:[w,b,l],tick:stream(.12,.8,t=>{const f=rnd(1500,3200);tone(dp,t,f,{v:v*.18,a:.001,d:.05,to:f*.6,glide:.04})})}},
  pages(o,{gap=[6,14]}){return {srcs:[],tick:stream(gap[0],gap[1],t=>{for(let k=0;k<5;k++)burst(o,t+k*.05+rnd(0,.02),.09,.025*(1-k*.12),rnd(2500,4500));burst(o,t+.3,.14,.03,1800)})}},
  chip(o,{prog,step=.2,v=.016}){const lp=filt('lowpass',2400);lp.connect(echo(o,.3,.2,.15));const pat=[0,2,1,3,2,1,3,2];
   return {srcs:[],tick:steady(step,(t,i)=>{const c=prog[Math.floor(i/16)%prog.length],k=i%16;
    if(k%8!==7)tone(lp,t,mtof(c[pat[k%8]]+12),{type:'square',v,a:.003,d:step*.8});
    if(k%4===0)tone(o,t,mtof(c[0]-12),{type:'triangle',v:v*3,a:.004,d:step*3});
    if(k%4===2)burst(o,t,.03,v*.5,7000,'highpass')})}}
 };
 function mix(o,list){const ls=list.map(([n,op])=>LAYERS[n](o,op||{}));return {srcs:ls.flatMap(l=>l.srcs),tick:h=>ls.forEach(l=>l.tick(h))}}
 function make(k){const o=amp(0);o.connect(master);const th=TH(k),sn=th.snd||{};let sc;
  const synth=()=>sn.mix?mix(o,sn.mix):(SCENES[sn.scene]||SCENES.default)(o);
  if(th.music||MUSIC_FILES.includes(k)){const el=new Audio('music/'+k+'.mp3');el.loop=true;el.preload='auto';const src=ctx.createMediaElementSource(el);src.connect(o);
   sc={srcs:[],tick:()=>{},el};el.addEventListener('error',()=>{if(sc.el!==el)return;sc.el=null;const s2=synth();sc.srcs=s2.srcs;sc.tick=s2.tick},{once:true});el.play().catch(()=>{})}
  else sc=synth();
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

