/* Maadoo Job · js/festivals.js — festival themes: one config entry per festival (dates, colors, patterns, effects, sound) + the free-window / unlock rules.
   Classic script sharing one global scope; see CLAUDE.md for load order. Each festival is added to THEMES (js/themes.js) as a normal theme with a `fest` field.
   ✏️ Next year: only change from / to / day below (Bangkok dates, YYYY-MM-DD, inclusive). Everything else stays.
   k      key; the mascot is maadoo-icon-<k>.webp (gold frame + ribbon are already in the picture)
   from, to  free for everyone on these Bangkok days · day = the real festival day (picks the invite card when two windows overlap)
   dark   dark palette base · g: page background gradient · vars: CSS variables (like themes.js)
   ring   card border gradient · btn: [gradient, text color, shadow] for main buttons · stk: sticker in the card corner
   strip  header-edge decoration (see STRIPS) · pat: faint background tile (see PATS) · pc: tile color
   fx     same fields as themes.js; extra: moon (fixed full moon) · wel: 2-second welcome animation (WEL in js/fx.js)
   snd    same as themes.js (mix of LAYERS in js/fx.js) + gain: loudness trim + tap: short tap sound (TAPS in js/fx.js); music:true plays music/<k>.mp3 */
const FEST_PRICE=120,FEST_EARLY=14;
const FESTIVALS=[
 {k:'halloween',ic:'🎃',n:['ฮาโลวีน','Halloween'],from:'2026-10-24',to:'2026-11-02',day:'2026-10-31',dark:true,stk:'🎃',
  g:'radial-gradient(90% 55% at 100% 100%,rgba(255,138,31,.26),transparent 70%),linear-gradient(165deg,#2A1646 0%,#3A1F62 45%,#4B2A7A 100%)',
  vars:{bg:'#2A1646',surface:'#341C58','surface-2':'#40266C',line:'#5A3C8C',ink:'#FFF4EA','ink-2':'#E2D3F2','ink-3':'#B9A5D8',blue:'#FF9A3C','blue-ink':'#241036',navy:'#FFC78A',sky:'#4B2A7A','sky-2':'#3A2163',orange:'#FFB35C','orange-ink':'#241036','orange-soft':'#5A3450',accent:'#FF8A1F','accent-ink':'#241036'},
  ring:'linear-gradient(135deg,#FF8A1F,#9B5CFF 55%,#FF8A1F)',btn:['linear-gradient(135deg,#FFAA55,#FF8A1F)','#241036','#B8520A'],
  strip:'bunting',sc:['#FF8A1F','#7B4BC4','#1A0E2E','#FFB35C'],pat:'web',pc:'#FFFFFF',
  fx:{n:['ค้างคาวบิน + หมอกลอยต่ำ','Flying bats + low mist'],c:['#120A22','#1E1033'],amb:[['bat',3],['mist',2,['#B9A4E8','#D6C8F5','#9E86D8']]],tap:'pumpkin',tc:['#FF8A1F','#FF9F43','#F07A10'],wel:'bats'},
  snd:{gain:1.7,n:['pad ไมเนอร์ + ลมหวีด + กล่องดนตรี','Minor pad + whistling wind + music box'],tap:'pop',mix:[['pad',{prog:[[45,48,52],[41,45,48],[43,46,50],[40,44,47]],step:10,wave:'sawtooth',cut:520,v:.011}],['wind',{v:.016}],
   ['seq',{inst:'musicbox',bpm:52,v:.03,rest:6,notes:[[69,1],[72,1],[76,2],[74,1],[72,1],[71,2],[69,1],[68,1],[69,3],[null,1],[64,1],[65,1],[68,2],[71,2],[69,4]]}]]}},
 {k:'loykrathong',ic:'🪷',n:['ลอยกระทง','Loy Krathong'],from:'2026-11-17',to:'2026-11-27',day:'2026-11-24',dark:true,stk:'🪷',
  g:'radial-gradient(60% 40% at 85% 0%,rgba(245,196,74,.18),transparent 70%),linear-gradient(175deg,#0F1A3D 0%,#152352 55%,#1B2A5E 100%)',
  vars:{bg:'#0F1A3D',surface:'#18264F','surface-2':'#213263',line:'#34477F',ink:'#FFF8E6','ink-2':'#D6DCF0','ink-3':'#A2ADCD',blue:'#F5C44A','blue-ink':'#14204A',navy:'#FBE2A0',sky:'#26386F','sky-2':'#1C2B5A',orange:'#FFD97A','orange-ink':'#14204A','orange-soft':'#4A4222',accent:'#F5C44A','accent-ink':'#14204A'},
  ring:'linear-gradient(135deg,#F5C44A,#FFF1B8 45%,#C9962A)',btn:['linear-gradient(135deg,#FFE08A,#F5C44A 55%,#E6AE2E)','#14204A','#A87A12'],
  strip:'khom',sc:['#F5C44A','#FFB45A','#FFF1B8'],pat:'wave',pc:'#FFE7A0',
  fx:{n:['กระทงลอยน้ำ + โคมลอย + จันทร์เต็มดวง','Floating krathongs, sky lanterns & full moon'],c:['#F5C44A','#FFD97A'],amb:[['krathong',2,['#F5C44A','#FFD97A','#FFB6C8']],['lantern',3,['#FFB45A','#FF9A3C','#F7C873']]],moon:1,tap:'candle',tc:['#FFE08A','#FFC24A','#FFF3C4'],wel:'lanterns'},
  snd:{gain:1.2,n:['ขลุ่ยไทย + เสียงน้ำไหล','Thai flute + flowing water'],tap:'ranat',mix:[['flute',{scale:[62,64,67,69,71,74,76,79],gap:[4,8],v:.032}],['water',{v:.03,cut:520}],['pad',{prog:[[50,57,62],[48,55,60],[45,52,57],[47,54,59]],step:12,wave:'triangle',cut:600,v:.009}]]}},
 {k:'fathersday',ic:'👔',n:['วันพ่อ','Father’s Day'],from:'2026-12-01',to:'2026-12-07',day:'2026-12-05',stk:'👔',
  g:'radial-gradient(70% 50% at 100% 100%,rgba(30,78,156,.16),transparent 70%),linear-gradient(165deg,#FFE58C 0%,#FFF3C4 45%,#FFF8E2 100%)',
  vars:{bg:'#FFF3C4',surface:'#FFFDF4','surface-2':'#FFF1C2',line:'#EEDB94',ink:'#1D2A4A','ink-2':'#43506E','ink-3':'#6A7390',blue:'#1E4E9C','blue-ink':'#FFFFFF',navy:'#173E7C',sky:'#FFE9A3','sky-2':'#FFF6D6',orange:'#8F5E00','orange-ink':'#FFFFFF','orange-soft':'#FFEBB0',accent:'#FFC21A','accent-ink':'#1D2A4A',shadow:'0 2px 0 rgba(23,62,124,.06),0 10px 24px rgba(30,78,156,.12)'},
  ring:'linear-gradient(135deg,#FFC21A,#FFE58C 50%,#1E4E9C)',btn:['linear-gradient(135deg,#2A62BD,#1E4E9C)','#FFFFFF','#123872'],
  strip:'bunting',sc:['#FFC21A','#1E4E9C','#FFE58C','#4A7FD0'],pat:'canna',pc:'#1E4E9C',
  fx:{n:['กลีบดอกพุทธรักษาลอย','Floating canna petals'],c:['#FFC21A','#FFD54F','#FFB300','#FFE082'],amb:'cpetal',tap:'spark',tc:['#1E4E9C','#FFC21A','#4A7FD0'],wel:'canna'},
  snd:{gain:1.6,n:['เปียโนคอร์ดอบอุ่น','Warm piano chords'],tap:'chime',mix:[['keys',{prog:[[60,64,67,72],[57,60,64,69],[65,69,72,76],[67,71,74,79]],step:4,v:.028}]]}},
 {k:'xmas',ic:'🎄',n:['คริสต์มาส','Christmas'],from:'2026-12-18',to:'2026-12-26',day:'2026-12-25',dark:true,stk:'🎄',
  g:'radial-gradient(80% 50% at 0% 100%,rgba(229,57,53,.22),transparent 70%),linear-gradient(165deg,#123F28 0%,#1B5E3A 60%,#1F6640 100%)',
  vars:{bg:'#123F28',surface:'#154A2F','surface-2':'#1B5738',line:'#2E7550',ink:'#F4FFF6','ink-2':'#D2EBD9','ink-3':'#A4C8AF',blue:'#FFD866','blue-ink':'#123F28',navy:'#FFE9A8',sky:'#236B44','sky-2':'#185234',orange:'#FF8A80','orange-ink':'#2A0A0A','orange-soft':'#4A2A24',accent:'#FF6F61','accent-ink':'#2A0A0A'},
  ring:'linear-gradient(135deg,#E53935,#FFD866 50%,#4CAF73)',btn:['linear-gradient(135deg,#D83A36,#B71C1C)','#FFFFFF','#7A1010'],
  strip:'lights',sc:['#E53935','#FFD866','#4CAF73','#FFFFFF'],pat:'tartan',pc:'#FFFFFF',
  fx:{n:['หิมะตกช้า ๆ','Gently falling snow'],c:['#FFFFFF','#EAF6FF','#D8ECFF'],amb:'snow',dens:1.3,tap:'snow',tc:['#FFFFFF','#E3F2FF','#FFD866'],wel:'snowbells'},
  snd:{gain:1.8,n:['กระดิ่งเลื่อน + เซเลสตา','Sleigh bells + celesta'],tap:'bell',mix:[['jingle',{v:.009,gap:[4,8]}],['pad',{prog:[[53,57,60],[50,53,57],[46,50,53],[48,52,55]],step:8,wave:'triangle',cut:700,v:.009}],
   ['seq',{inst:'celesta',bpm:92,v:.03,rest:4,notes:[[72,1],[74,.5],[72,.5],[69,1],[65,1],[67,1.5],[69,.5],[70,2],[72,1],[77,1],[76,1],[74,.5],[72,.5],[70,1],[69,1],[67,2],[65,1],[69,1],[72,1.5],[70,.5],[69,1],[67,1],[65,3]]}]]}},
 {k:'newyear',ic:'🎉',n:['ปีใหม่','New Year'],from:'2026-12-27',to:'2027-01-03',day:'2027-01-01',dark:true,stk:'🎉',
  g:'radial-gradient(60% 45% at 0% 0%,rgba(255,127,209,.18),transparent 70%),radial-gradient(60% 45% at 100% 100%,rgba(255,210,63,.13),transparent 70%),linear-gradient(165deg,#1A1240 0%,#2C1C5E 55%,#3A2376 100%)',
  vars:{bg:'#1A1240',surface:'#241A55','surface-2':'#2E2266',line:'#48378C',ink:'#FFF6FD','ink-2':'#E0D4F4','ink-3':'#AC9ECE',blue:'#FF8FD6','blue-ink':'#1A1240',navy:'#FFD23F',sky:'#3A2A7A','sky-2':'#2A1E5E',orange:'#FFD23F','orange-ink':'#1A1240','orange-soft':'#4A3A2A',accent:'#FFD23F','accent-ink':'#1A1240'},
  ring:'linear-gradient(135deg,#FF7FD1,#FFD23F 50%,#8C6BFF)',btn:['linear-gradient(135deg,#FF8FD6,#FFB36B 55%,#FFD23F)','#1A1240','#A8508A'],
  strip:'bunting',sc:['#FF7FD1','#FFD23F','#8C6BFF','#5EE0FF'],pat:'stars',pc:'#FFFFFF',
  fx:{n:['พลุ + กระดาษสีโปรย','Fireworks + confetti'],c:['#FF7FD1','#FFD23F','#8C6BFF','#5EE0FF','#FFFFFF'],amb:'confetti',ev:['fw'],tap:'fwk',wel:'countdown'},
  snd:{gain:1.3,n:['pad สว่าง + ประกาย + พลุไกล ๆ','Bright pad + sparkles + distant fireworks'],tap:'whizpop',mix:[['pad',{prog:[[60,64,67,71],[65,69,72,76],[62,65,69,72],[67,71,74,77]],step:8,wave:'triangle',cut:1600,v:.013}],['sparkle',{v:.011}],['fwdist',{v:.045,gap:[6,12]}]]}},
 {k:'childrensday',ic:'🎈',n:['วันเด็ก','Children’s Day'],from:'2027-01-04',to:'2027-01-11',day:'2027-01-09',stk:'🎈',
  g:'linear-gradient(165deg,#FFE2BF 0%,#FFF3C4 45%,#DDF2FD 100%)',
  vars:{bg:'#FFF3D6',surface:'#FFFFFF','surface-2':'#FFF1D6',line:'#F2DAB0',ink:'#23304F','ink-2':'#48546F','ink-3':'#6C7690',blue:'#0272B5','blue-ink':'#FFFFFF',navy:'#0B4F80',sky:'#D4EEFB','sky-2':'#EEF8FE',orange:'#A85A00','orange-ink':'#FFFFFF','orange-soft':'#FFE3C2',accent:'#FFC21A','accent-ink':'#23304F',shadow:'0 2px 0 rgba(11,79,128,.06),0 10px 24px rgba(41,182,246,.14)'},
  ring:'linear-gradient(135deg,#FF9A1F,#FFC21A 50%,#29B6F6)',btn:['linear-gradient(135deg,#FFB547,#FFD34D 50%,#7ACFF5)','#1F2A44','#C98A1A'],
  strip:'bunting',sc:['#FF6B6B','#FFB347','#FFE066','#6BE08A','#5EC8FF','#B28DFF'],pat:'dots',pc:'#FF9A1F',
  fx:{n:['ลูกโป่งหลากสีลอยขึ้น','Colorful balloons floating up'],c:['#FF6B6B','#FFB347','#FFD84D','#6BE08A','#5EC8FF','#B28DFF'],amb:'balloon',tap:'bubble',tc:['#5EC8FF','#8FD9F7','#FF9ED8'],wel:'balloons'},
  snd:{gain:2,n:['ไซโลโฟนสดใส','Bright xylophone tune'],tap:'bubble',mix:[['seq',{inst:'xylo',bpm:132,v:.036,rest:4,notes:[[72,.5],[76,.5],[79,.5],[76,.5],[77,.5],[81,.5],[79,1],[76,.5],[74,.5],[72,.5],[74,.5],[76,1],[72,1],[79,.5],[77,.5],[76,.5],[74,.5],[72,.5],[74,.5],[76,.5],[79,.5],[77,1],[74,1],[72,2]]}],
   ['keys',{prog:[[48,55,60,64],[53,57,60,65],[55,59,62,67],[48,52,55,60]],step:3.64,v:.016}]]}},
 {k:'cny',ic:'🧧',n:['ตรุษจีน','Lunar New Year'],from:'2027-01-30',to:'2027-02-13',day:'2027-02-06',dark:true,stk:'🧧',
  g:'radial-gradient(60% 45% at 100% 0%,rgba(245,196,74,.16),transparent 70%),linear-gradient(165deg,#6E0815 0%,#830A19 55%,#96101F 100%)',
  vars:{bg:'#6E0815',surface:'#7A0A18','surface-2':'#8C1222',line:'#AE3040',ink:'#FFF6E2','ink-2':'#F6DCC8','ink-3':'#E0B0A2',blue:'#F5C44A','blue-ink':'#5A0610',navy:'#FFD97A',sky:'#9A1A26','sky-2':'#840D1B',orange:'#FFD97A','orange-ink':'#5A0610','orange-soft':'#6A2A14',accent:'#F5C44A','accent-ink':'#5A0610',good:'#7FE0B8',bad:'#FFB0B8',mid:'#FFD27A'},
  ring:'linear-gradient(135deg,#F5C44A,#FFE9A8 50%,#E0A020)',btn:['linear-gradient(135deg,#FFE08A,#F5C44A 55%,#E0A020)','#5A0610','#9A6A0A'],
  strip:'redlanterns',sc:['#E02D2D','#F5C44A','#FFE9A8'],pat:'coins',pc:'#F5C44A',
  fx:{n:['โคมแดงแกว่ง + อั่งเปาร่วง','Swinging lanterns + falling red envelopes'],c:['#D7192F','#E8243A'],amb:[['toplantern',2,['#E02D2D','#F0343F']],['angpao',3,['#E02D2D','#D0182A']]],tap:'orange',tc:['#FF9A1F','#FFA940','#F28C0F'],wel:'lion'},
  snd:{gain:2.2,n:['กู่เจิง + ฉาบกลองเบา ๆ','Guzheng + soft drum and cymbal'],tap:'coin',mix:[['pluck',{scale:[62,64,66,69,71,74,76,78,81,83],gap:[1,2.6],v:.042,decay:2.4,wave:'triangle',cut:3000,gliss:.15}],['perc',{v:.024,gap:[8,16]}]]}},
 {k:'valentine',ic:'💘',n:['วาเลนไทน์','Valentine'],from:'2027-02-07',to:'2027-02-16',day:'2027-02-14',stk:'💘',
  g:'radial-gradient(70% 50% at 100% 100%,rgba(226,59,107,.14),transparent 70%),linear-gradient(165deg,#FFE3EE 0%,#FFD6E5 55%,#FFC9DB 100%)',
  vars:{bg:'#FFE3EE',surface:'#FFFFFF','surface-2':'#FFE6EF',line:'#F5C4D5',ink:'#3B1426','ink-2':'#6A374F','ink-3':'#8E5A72',blue:'#C12653','blue-ink':'#FFFFFF',navy:'#8A1538',sky:'#FFD3E1','sky-2':'#FFF0F5',orange:'#D42E5E','orange-ink':'#FFFFFF','orange-soft':'#FFD6E2',accent:'#FF7FA3','accent-ink':'#3B1426',shadow:'0 2px 0 rgba(138,21,56,.06),0 10px 24px rgba(226,59,107,.14)'},
  ring:'linear-gradient(135deg,#FF7FA3,#E23B6B 50%,#FFB3C9)',btn:['linear-gradient(135deg,#D23A6A,#B21E4B)','#FFFFFF','#7E1234'],
  strip:'hearts',sc:['#E23B6B','#FF7FA3','#FFB3C9'],pat:'hearts',pc:'#E23B6B',
  fx:{n:['หัวใจลอยขึ้น','Hearts floating up'],c:['#FF7FA3','#E23B6B','#FFB3C9','#FF4D7E'],amb:'heart',tap:'heart',wel:'hearts'},
  snd:{gain:1.3,n:['เปียโน + pad หวาน ๆ','Piano + sweet pad'],tap:'heartpop',mix:[['keys',{prog:[[60,64,67,71],[65,69,72,76],[62,65,69,72],[67,71,74,77]],step:4,v:.026}],['pad',{prog:[[60,64,67,71],[65,69,72,76],[62,65,69,72],[67,71,74,77]],step:4,wave:'triangle',cut:1200,v:.008}]]}},
 {k:'songkran',ic:'💦',n:['สงกรานต์','Songkran'],from:'2027-04-06',to:'2027-04-17',day:'2027-04-13',stk:'💦',
  g:'linear-gradient(165deg,#D4F0FD 0%,#D6F5EE 55%,#FFE1F0 100%)',
  vars:{bg:'#DDF3FC',surface:'#FFFFFF','surface-2':'#E2F4FB',line:'#BCE0EE',ink:'#12324A','ink-2':'#3D596D','ink-3':'#5F7A8A',blue:'#0A6FA3','blue-ink':'#FFFFFF',navy:'#07506F',sky:'#C9EEF9','sky-2':'#EAF8FD',orange:'#D81F80','orange-ink':'#FFFFFF','orange-soft':'#FFD6EA',accent:'#26C6B0','accent-ink':'#0B3A34',shadow:'0 2px 0 rgba(7,80,111,.06),0 10px 24px rgba(41,182,246,.14)'},
  ring:'linear-gradient(135deg,#29B6F6,#26C6B0 50%,#FF4DA6)',btn:['linear-gradient(135deg,#4FC3F7,#3ED1BC 50%,#FF8AC6)','#0E2A3D','#1A8AA8'],
  strip:'bunting',sc:['#29B6F6','#26C6B0','#FF4DA6','#FFD54F'],pat:'pakama',pc:'#0A6FA3',
  fx:{n:['ละอองน้ำ + ดอกไม้ร่วง','Water spray + falling flowers'],c:['#7FD8F0','#B8ECF8'],amb:[['drip',4,['#4FC3E3','#7FD8F0','#29B6F6']],['bloom',2,['#FF7AC0','#FFB347','#FF4DA6','#FFFFFF']]],tap:'splash',tc:['#29B6F6','#7FD8F0','#4FC3E3','#26C6B0'],wel:'watergun'},
  snd:{gain:3,n:['กลอง + ระนาดไทย + น้ำกระเซ็น','Drums + Thai xylophone + splashes'],tap:'splash',mix:[['drums',{v:.026,step:.29}],['seq',{inst:'ranat',bpm:104,v:.034,rest:4,notes:[[72,.5],[74,.5],[76,1],[79,.5],[76,.5],[74,1],[72,.5],[69,.5],[72,1],[74,2],[76,.5],[79,.5],[81,1],[79,.5],[76,.5],[74,.5],[76,.5],[72,1],[69,.5],[67,.5],[69,1],[72,2]]}],['splash',{v:.022,gap:[7,13]}]]}},
 {k:'mothersday',ic:'🌸',n:['วันแม่','Mother’s Day'],from:'2027-08-08',to:'2027-08-14',day:'2027-08-12',stk:'🌸',
  g:'radial-gradient(70% 50% at 100% 100%,rgba(142,201,255,.45),transparent 70%),linear-gradient(165deg,#EAF5FF 0%,#D6ECFF 55%,#C7E4FF 100%)',
  vars:{bg:'#E4F2FF',surface:'#FFFFFF','surface-2':'#E4F1FF',line:'#C3DDF7',ink:'#18294A','ink-2':'#3E4E6C','ink-3':'#5F6C88',blue:'#3F6FB5','blue-ink':'#FFFFFF',navy:'#1F3F73',sky:'#CFE6FF','sky-2':'#EEF6FF',orange:'#3F6FB5','orange-ink':'#FFFFFF','orange-soft':'#DCEBFF',accent:'#8EC9FF','accent-ink':'#18294A',shadow:'0 2px 0 rgba(31,63,115,.06),0 10px 24px rgba(63,111,181,.14)'},
  ring:'linear-gradient(135deg,#8EC9FF,#FFFFFF 50%,#3F6FB5)',btn:['linear-gradient(135deg,#3F6FB5,#2F5A98)','#FFFFFF','#23467A'],
  strip:'garland',sc:['#FFFFFF','#DCEBFF','#8EC9FF'],pat:'jasmine',pc:'#3F6FB5',
  fx:{n:['ดอกมะลิร่วงช้า ๆ','Jasmine gently falling'],c:['#FFFFFF','#FBFDFF','#F4F9FF'],amb:'jasmine',tap:'jasmine',wel:'jasmine'},
  snd:{gain:1.5,n:['เปียโน + เครื่องสายนุ่ม ๆ','Piano + soft strings'],tap:'windchime',mix:[['piano',{notes:[60,64,67,69,72,74,76],gap:[2.4,4.6],v:.05}],['pad',{prog:[[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]],step:10,wave:'sawtooth',cut:900,v:.009}]]}}
];
/* ---------- SVG decorations (header strip + faint background tile), drawn from the festival colors ---------- */
const svgUrl=s=>`url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const STRIPS={
 bunting:c=>{let s='';for(let i=0;i<6;i++)s+=`<path d="M${i*20+1} 3 L${i*20+19} 3 L${i*20+10} 15Z" fill="${c[i%c.length]}"/>`;return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="18"><path d="M0 3Q60 6 120 3" stroke="${c[0]}" stroke-width="1.2" fill="none" opacity=".7"/>${s}</svg>`},
 khom:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="18"><path d="M0 2H60" stroke="${c[0]}" stroke-width="1" opacity=".7"/><path d="M15 2V5M45 2V5" stroke="${c[0]}"/><rect x="10" y="5" width="10" height="11" rx="4" fill="${c[1]}"/><rect x="40" y="5" width="10" height="11" rx="4" fill="${c[0]}"/><rect x="12" y="7" width="6" height="7" rx="3" fill="${c[2]}" opacity=".7"/><rect x="42" y="7" width="6" height="7" rx="3" fill="${c[2]}" opacity=".7"/></svg>`,
 lights:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="18"><path d="M0 3Q20 10 40 3T80 3" stroke="#2E7550" stroke-width="1.5" fill="none"/>${[[10,7,c[0]],[30,7,c[1]],[50,7,c[2]],[70,7,c[3]]].map(([x,y,f])=>`<rect x="${x-3}" y="${y-1}" width="6" height="3" fill="#2E7550"/><ellipse cx="${x}" cy="${y+6}" rx="3.6" ry="5" fill="${f}"/>`).join('')}</svg>`,
 redlanterns:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="18"><path d="M0 2H60" stroke="${c[1]}" stroke-width="1"/>${[15,45].map(x=>`<path d="M${x} 2V4" stroke="${c[1]}"/><rect x="${x-4}" y="4" width="8" height="2" fill="${c[1]}"/><ellipse cx="${x}" cy="10" rx="7" ry="5" fill="${c[0]}"/><rect x="${x-4}" y="14" width="8" height="2" fill="${c[1]}"/><path d="M${x} 16V18" stroke="${c[1]}"/>`).join('')}</svg>`,
 hearts:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="18"><path d="M0 3Q24 7 48 3" stroke="${c[1]}" stroke-width="1" fill="none"/>${[[12,c[0]],[36,c[2]]].map(([x,f])=>`<path d="M${x} 16C${x-9} 10 ${x-6} 3 ${x} 7C${x+6} 3 ${x+9} 10 ${x} 16Z" fill="${f}"/>`).join('')}</svg>`,
 garland:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="18"><path d="M0 4Q20 11 40 4" stroke="${c[2]}" stroke-width="1.4" fill="none"/>${[10,30].map(x=>`<g transform="translate(${x} 9)">${[0,72,144,216,288].map(a=>`<ellipse rx="2.2" ry="4.4" cy="-3.6" fill="${c[0]}" stroke="${c[2]}" stroke-width=".6" transform="rotate(${a})"/>`).join('')}<circle r="1.6" fill="#E8DC8A"/></g>`).join('')}</svg>`
};
const PATS={
 web:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><g fill="none" stroke="${c}" stroke-width="1.2"><path d="M0 0L60 60M0 60L60 0M30 0V60M0 30H60"/><path d="M8 30Q30 22 52 30Q30 38 8 30M16 16Q30 30 44 16M16 44Q30 30 44 44"/></g><g fill="${c}"><ellipse cx="120" cy="120" rx="16" ry="13"/><rect x="118" y="102" width="4" height="7"/></g></svg>`,
 wave:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><g fill="none" stroke="${c}" stroke-width="1.6"><path d="M0 20Q15 10 30 20T60 20T90 20T120 20"/><path d="M0 60Q15 50 30 60T60 60T90 60T120 60"/><path d="M50 40c6-10 16-10 20 0c-4-4-10-4-12 2c-2-6-6-6-8-2Z"/></g></svg>`,
 canna:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110"><g fill="${c}" transform="translate(40 40)">${[0,72,144,216,288].map(a=>`<ellipse rx="5" ry="14" cy="-12" transform="rotate(${a})"/>`).join('')}<circle r="4"/></g></svg>`,
 tartan:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><g fill="${c}"><rect x="0" y="10" width="64" height="6"/><rect x="0" y="40" width="64" height="2"/><rect x="10" y="0" width="6" height="64"/><rect x="40" y="0" width="2" height="64"/></g><g stroke="${c}" stroke-width="1.4" transform="translate(48 28)"><path d="M0-7V7M-6-3.5L6 3.5M-6 3.5L6-3.5"/></g></svg>`,
 stars:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><g fill="${c}"><path d="M20 10l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/><path d="M85 70l2 5 5 .7-3.6 3.5.8 5-4.2-2.3-4.2 2.3.8-5-3.6-3.5 5-.7z"/><circle cx="70" cy="20" r="2"/><circle cx="30" cy="90" r="1.6"/></g><path d="M0 60q15-12 30 0t30 0" stroke="${c}" stroke-width="2" fill="none"/></svg>`,
 dots:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><g fill="${c}"><circle cx="10" cy="10" r="5"/><circle cx="50" cy="30" r="4"/><circle cx="25" cy="55" r="6"/><circle cx="68" cy="68" r="3.5"/></g></svg>`,
 coins:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="120"><g fill="none" stroke="${c}" stroke-width="2"><circle cx="30" cy="30" r="14"/><rect x="24" y="24" width="12" height="12"/><path d="M70 90c0-10 12-14 20-8c4-10 20-8 20 2c8 0 10 10 2 12H74c-6 0-8-4-4-6z"/><path d="M84 88c4-4 10-4 12 0"/></g></svg>`,
 hearts:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><g fill="${c}"><path d="M20 30C8 22 12 10 20 16C28 10 32 22 20 30Z"/><path d="M60 68C51 62 54 53 60 57C66 53 69 62 60 68Z"/></g></svg>`,
 pakama:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><g fill="${c}"><rect x="0" y="0" width="40" height="8"/><rect x="0" y="0" width="8" height="40"/><rect x="40" y="40" width="40" height="4"/><rect x="40" y="40" width="4" height="40"/></g><g fill="${c}" transform="translate(60 20)">${[0,72,144,216,288].map(a=>`<circle cy="-5" r="4" transform="rotate(${a})"/>`).join('')}</g></svg>`,
 jasmine:c=>`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g fill="none" stroke="${c}" stroke-width="1.4">${[[25,25],[75,70]].map(([x,y])=>`<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(a=>`<ellipse rx="3.4" ry="8" cy="-7" transform="rotate(${a})"/>`).join('')}</g>`).join('')}</g></svg>`
};
/* ---------- add the festivals to THEMES ---------- */
FESTIVALS.forEach(F=>{
 const v=Object.assign({},F.vars,{'fest-g':F.g,'fest-ring':F.ring,'fest-btn':F.btn[0],'fest-btn-ink':F.btn[1],'fest-btn-sh':F.btn[2],'fest-stk':`"${F.stk}"`,
  'fest-pat':svgUrl(PATS[F.pat](F.pc)),'fest-strip':svgUrl(STRIPS[F.strip](F.sc))});
 THEMES.push({k:F.k,ic:F.ic,n:F.n,dark:!!F.dark,prev:[F.vars.bg,F.vars.blue,F.sc[0]===F.vars.blue?F.sc[1]:F.sc[0]],vars:v,fx:F.fx,snd:F.snd,music:!!F.music,fest:F});
});
const FEST=k=>FESTIVALS.find(F=>F.k===k)||null;
/* ---------- dates (always Bangkok time, UTC+7, no DST) ---------- */
const FEST_HOST_OK=!/^maadoo\.pages\.dev$/i.test(location.hostname); // previews, localhost: test params work for everyone
const festParam=n=>{try{return new URL(location.href).searchParams.get(n)||''}catch(e){return ''}};
/* ?festival=<key> previews a festival and ?fest_date=YYYY-MM-DD simulates a day: admins on the live site, anyone on preview deployments */
const festTestOK=()=>FEST_HOST_OK||!!S.isAdmin;
const festNow=()=>{const d=festParam('fest_date');if(festTestOK()&&/^\d{4}-\d{2}-\d{2}$/.test(d))return Date.parse(d+'T12:00:00+07:00')||Date.now();return Date.now()};
const festDay=(ts=festNow())=>new Date(ts+7*36e5).toISOString().slice(0,10);
const festMs=d=>Date.parse(d+'T00:00:00+07:00');
const festAddDays=(d,n)=>festDay(festMs(d)+n*864e5+36e5);
const festIn=(F,d=festDay())=>d>=F.from&&d<=F.to;
const festEarly=(F,d=festDay())=>isPlus()&&d<F.from&&d>=festAddDays(F.from,-FEST_EARLY);
const festDM=d=>new Date(festMs(d)+12*36e5).toLocaleDateString(S.lang==='en'?'en-GB':'th-TH',{day:'numeric',month:'short',timeZone:'Asia/Bangkok'});
const festPreview=()=>{const k=festParam('festival');return k&&FEST(k)&&festTestOK()?k:''};
/* ---------- state: S.festOwn = keys unlocked with coins (Supabase user_themes, or in memory in the demo) ---------- */
S.festOwn=[];S.festOwnLoaded=false;
const FST=(()=>{try{const o=JSON.parse(store.get('maadoo-fest')||'{}');return o&&typeof o==='object'?o:{}}catch(e){return {}}})();
FST.seen=FST.seen||{};FST.wel=FST.wel||{};
const festSave=()=>store.set('maadoo-fest',JSON.stringify(FST));
const festOwned=k=>S.festOwn.includes(k);
function festOpen(k){const F=FEST(k);if(!F)return true;return festIn(F)||festOwned(k)||festEarly(F)||festPreview()===k}
/* free · owned · early (Plus) · locked */
function festState(F){if(festOwned(F.k))return 'owned';if(festIn(F))return 'free';if(festEarly(F))return 'early';return 'locked'}
/* nearest first: running now, then by days until the next start (past windows count from the same dates next year) */
function festOrder(){const d=festDay(),now=festMs(d);return FESTIVALS.slice().sort((a,b)=>{const w=F=>festIn(F,d)?-1:((festMs(F.from)-now)%(365*864e5)+365*864e5)%(365*864e5);return w(a)-w(b)})}
/* the auth + unlock data has loaded, so a locked theme can safely be switched back */
const FEST_BOOT=Date.now();
function festSettled(){if(!SB)return Date.now()-FEST_BOOT>6000;if(!S.authReady)return false;if(!S.user||S.user.anon)return true;return S.prem.loaded&&S.festOwnLoaded}
async function loadFestOwn(){S.festOwnLoaded=false;if(!sbLive()){S.festOwnLoaded=true;return}const uid=S.user.id;
 try{const r=await SB.from('user_themes').select('theme_key');if(!S.user||S.user.id!==uid)return;if(r.error)console.warn('[Maadoo Job] could not read user_themes:',r.error.code,r.error.message);else S.festOwn=(r.data||[]).map(v=>v.theme_key)}catch(e){}
 S.festOwnLoaded=true;rerender()}
/* ---------- picking a theme (from the menu, the invite card or a preview link) ---------- */
function festPick(k){if(!festOpen(k)){festBuy(k);return false}
 const F=FEST(k),cur=FEST(S.skin);if(F&&!cur){FST.prev=S.skin;festSave()}
 S.skin=k;if(festPreview()!==k)store.set('maadoo-skin',k);render();if(F)festWelcome(k);return true}
function festWelcome(k,force){const F=FEST(k),d=festDay();if(!F||(!force&&FST.wel[k]===d))return;FST.wel[k]=d;festSave();setTimeout(()=>{try{FX.welcome(F.fx.wel)}catch(e){}},250)}
/* unlock with coins (permanent) */
function festBuy(k){needMember(()=>{S.themeOpen=false;renderThemePop();openModal({type:'festbuy',k})})}
function festBuyModal(m,head){const F=FEST(m.k),bal=S.prem.coins|0,ok=bal>=FEST_PRICE;
 return head(`${F.ic} ${t('ธีม','Theme')}${x(F.n)}`,t(`ใช้ฟรี ${festDM(F.from)} – ${festDM(F.to)} ทุกปี`,`Free ${festDM(F.from)} – ${festDM(F.to)} every year`))+
 `<div class="fb-pup"><img src="${PUP(F.k)}" alt=""></div>
 <p>${t(`ปลดล็อกถาวรด้วย ${FEST_PRICE} เหรียญ ใช้ธีมนี้ได้ตลอดทั้งปี พร้อมเอฟเฟกต์และเสียงประจำเทศกาล`,`Unlock it for good with ${FEST_PRICE} coins and use it all year, with its own effects and sound.`)}</p>
 <p class="muted" style="margin:0">🪙 ${t(`เหรียญของคุณ ${fmt(bal)}`,`Your coins: ${fmt(bal)}`)}${ok?'':` · ${t(`ขาดอีก ${fmt(FEST_PRICE-bal)}`,`${fmt(FEST_PRICE-bal)} short`)}`}</p>
 ${m.err?`<p class="form-err" role="alert">${esc(m.err)}</p>`:''}
 <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn ghost" data-close>${t('ไว้ก่อน','Not now')}</button>${ok?`<button class="btn" data-festok="${F.k}" ${m.busy?'disabled':''}>${m.busy?t('กำลังปลดล็อก…','Unlocking…'):t(`ปลดล็อกเลย ${FEST_PRICE} เหรียญ`,`Unlock for ${FEST_PRICE} coins`)}</button>`:`<button class="btn" data-festwallet>${t('ไปทำภารกิจรับเหรียญ','Earn coins with missions')}</button>`}</div>`}
async function festUnlock(k){const m=S.modal;if(!m||m.busy||festOwned(k))return;m.busy=true;m.err='';renderModal();
 try{if(sbLive()){const {error}=await SB.rpc('unlock_theme',{p_theme:k});if(error)throw error;await refreshAll()}
  else await addCoins(-FEST_PRICE,'spend','theme:'+k);
  if(!festOwned(k))S.festOwn.push(k);m.busy=false;closeModal();festPick(k);toast(`${FEST(k).ic} ${t('ปลดล็อกถาวรแล้ว!','Unlocked for good!')}`)}
 catch(e){m.busy=false;const s=String((e&&e.message)||'');if(/already/.test(s)){if(!festOwned(k))S.festOwn.push(k);closeModal();festPick(k);return}
  m.err=/unlock_theme|user_themes|PGRST202|42883/.test(s+(e&&e.code||''))?t('ยังไม่ได้ตั้งค่าธีมเทศกาลใน Supabase (รัน SQL)','Festival themes aren’t set up in Supabase yet (run the SQL)'):premErr(e);if(S.modal===m)renderModal()}}
/* ---------- theme menu: 🎉 festivals (nearest first) above the regular themes ---------- */
function festTag(F){const st=festState(F);
 if(st==='owned')return `<span class="fsw-tag fsw-own">✓ ${t('ปลดล็อกแล้ว','Unlocked')}</span>`;
 if(st==='free')return `<span class="fsw-tag fsw-free">${t(`ฟรีถึง ${festDM(F.to)}`,`Free till ${festDM(F.to)}`)}</span>`;
 if(st==='early')return `<span class="fsw-tag fsw-plus">✨ ${t('Plus ใช้ก่อนได้','Plus early access')}</span>`;
 return `<span class="fsw-tag">${t(`ฟรีตั้งแต่ ${festDM(F.from)}`,`Free from ${festDM(F.from)}`)}</span>${isPlus()?'':`<span class="fsw-tag fsw-plus">✨ ${t('Plus ใช้ก่อน 14 วัน','Plus: 14 days early')}</span>`}`}
function themeCard(k){const F=k.fest,lock=F&&!festOpen(k.k);
 return `<button class="sw ${S.skin===k.k?"on":""} ${lock?"sw-lk":""}" data-skin="${k.k}" role="radio" aria-checked="${S.skin===k.k}" title="✨ ${esc(x(k.fx.n))}"><span class="sw-prev" style="background:${F?esc(F.g):k.prev[0]}"><i style="background:${k.prev[1]}"></i><i style="background:${k.prev[2]}"></i><img src="${PUP(k.k)}" alt="" loading="lazy">${lock?`<b class="sw-lock" aria-label="${t('ล็อกอยู่','Locked')}">🔒</b>`:''}</span><span class="sw-n">${k.ic} ${x(k.n)}</span>${F?festTag(F):''}</button>`}
function themeGrids(){const buy=S.user&&!S.user.anon&&(S.prem.coins|0)<FEST_PRICE;
 const fest=festOrder().map(F=>{const k=TH(F.k),lock=!festOpen(F.k);return `<div class="fsw">${themeCard(k)}${lock?`<button class="fsw-buy" ${buy?'data-festwallet':`data-festbuy="${F.k}"`}>${buy?t('เหรียญไม่พอ · ทำภารกิจ','Not enough coins · missions'):t(`ปลดล็อกเลย ${FEST_PRICE} เหรียญ`,`Unlock · ${FEST_PRICE} coins`)}</button>`:''}</div>`}).join('');
 return `<div class="sw-scroll"><div class="sw-h">🎉 ${t('เทศกาล','Festivals')}</div><div class="swatches fest" role="radiogroup" aria-label="${t('ธีมเทศกาล','Festival themes')}">${fest}</div>
 <div class="sw-h">🎨 ${t('ธีมปกติ','Everyday themes')}</div><div class="swatches" role="radiogroup" aria-label="${t('ธีม','Themes')}">${THEMES.filter(k=>!k.fest).map(themeCard).join('')}</div></div>`}
/* ---------- once per festival: a small "try it?" card (never switches by itself) ---------- */
function festInviteFor(){const d=festDay(),now=festMs(d);const on=FESTIVALS.filter(F=>festIn(F,d));if(!on.length)return null;
 return on.sort((a,b)=>Math.abs(festMs(a.day)-now)-Math.abs(festMs(b.day)-now))[0]}
function festCard(){let el=document.getElementById('festCard');const F=el&&el._k?FEST(el._k):null;
 if(!F){if(el)el.remove();return}
 el.innerHTML=`<img src="${PUP(F.k)}" alt=""><div class="fc-t"><b>🎉 ${t(`ลองธีม${x(F.n)}ไหม?`,`Try the ${x(F.n)} theme?`)}</b><small>${t(`ใช้ฟรีถึง ${festDM(F.to)}`,`Free till ${festDM(F.to)}`)}</small><div class="row"><button class="btn sm" data-festtry="${F.k}">${t('ลองเลย','Try it')}</button><button class="btn ghost sm" data-festno>${t('ไม่เป็นไร','No thanks')}</button></div></div><button class="x" data-festno aria-label="${t('ปิด','Close')}">×</button>`}
function festInvite(){if(document.getElementById('festCard')||S.modal||S.themeOpen||(typeof welcomed==='function'&&!welcomed())||festPreview())return;
 const F=festInviteFor();if(!F||S.skin===F.k)return;const id=F.k+':'+F.from;if(FST.seen[id])return;FST.seen[id]=1;festSave();
 const el=document.createElement('div');el.id='festCard';el.className='fest-card';el.setAttribute('role','dialog');el.setAttribute('aria-label',t('ธีมเทศกาล','Festival theme'));el._k=F.k;document.body.appendChild(el);festCard()}
function festCardClose(){const el=document.getElementById('festCard');if(el)el.remove()}
/* ---------- checks on every render + once a minute ---------- */
let festBooted=false,festBack=false;
function festTick(){
 if(!festBooted){festBooted=true;const p=festPreview();if(p){S.skin=p;render();festWelcome(p,true);return}if(FEST(S.skin))festWelcome(S.skin)}
 /* window over (or Plus / unlock gone): back to the theme used before + "see you next year" */
 if(FEST(S.skin)&&!festOpen(S.skin)&&festSettled()&&!festBack){festBack=true;const F=FEST(S.skin);let p=FST.prev;if(!p||FEST(p)||!THEMES.some(v=>v.k===p))p='default';
  S.skin=p;store.set('maadoo-skin',p);render();festBack=false;toast(`${F.ic} ${t(`หมดช่วงธีม${x(F.n)}แล้ว กลับมาปีหน้านะ 👋`,`${x(F.n)} is over for this year. See you next year 👋`)}`);return}
 festCard();if(!festTick.t)festTick.t=setTimeout(()=>{festTick.t=0;festInvite()},1500)}
/* re-check soon after start (login state arrives async) and then once a minute */
[2000,4000,6500,10000].forEach(ms=>setTimeout(()=>{try{festTick()}catch(e){}},ms));setInterval(()=>{try{festTick()}catch(e){}},60000);
if(!THEMES.some(v=>v.k===S.skin))S.skin='default';
