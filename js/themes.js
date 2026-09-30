/* Maadoo Job · js/themes.js — every theme as one config entry (colors, effects, sound). Classic script sharing one global scope; see CLAUDE.md for load order.
   A theme = data only:
   k      key; the mascot is maadoo-icon-<k>.webp (Classic uses maadoo-icon.webp)
   ic, n  menu icon + [th, en] name
   dark   true → data-theme="dark" (the night palette in css/style.css is the base, `vars` go on top)
   prev   [background, color 1, color 2] for the theme-menu card
   vars   CSS variables set on <html> (name without "--"); anything left out keeps the base value
   fx     n: [th, en] effect name · c: particle colors · amb: background kind, or [[kind, weight, colors?], …]
          ev: occasional events ('shoot', 'rocket') · tap: tap kind · tc: tap colors (default c) · dens: particle-count multiplier
          Kinds live once in the PK registry in js/fx.js; a new theme just picks them by name.
   snd    n: [th, en] sound name · scene: a named scene in SCENES (js/fx.js) · or mix: [[layer, options], …] built from LAYERS
   music  true → loops music/<k>.mp3 instead of the synthesized scene (falls back to the synth if the file fails) */
const THEMES=[
 {k:'default',ic:'☀️',n:['ธรรมดา','Classic'],prev:['#F1F7FF','#2F6FD6','#FF9A1F'],vars:{},
  fx:{n:['ประกายวิบวับ','Sparkles'],c:['#2F6FD6','#FF9A1F','#FFC53D','#8EC5FF'],amb:'spark',tap:'spark'},
  snd:{n:['lo-fi คอร์ดเบา ๆ','Soft lo-fi chords'],scene:'default'}},
 {k:'night',ic:'🌙',n:['กลางคืน','Night'],dark:true,prev:['#0C1630','#5B93F5','#FFA940'],vars:{},
  fx:{n:['ดาวระยิบและดาวตก','Twinkling & shooting stars'],c:['#FFFFFF','#FFE9A8','#A9C8FF'],amb:'star',ev:['shoot'],tap:'star'},
  snd:{n:['เปียโนช้า + จิ้งหรีด','Slow piano + crickets'],scene:'night'}},
 {k:'sakura',ic:'🌸',n:['ซากุระ','Sakura'],prev:['#FFF4F7','#E0507F','#FF7AA2'],
  vars:{bg:'#FFF4F7','surface-2':'#FFE6EE',line:'#F6D3DF',blue:'#E0507F',navy:'#8C2450',sky:'#FFD6E4','sky-2':'#FFF0F5',ink:'#3A1F2B','ink-2':'#6E4A5B','ink-3':'#A58596',orange:'#FF7AA2','orange-soft':'#FFD6E4',shadow:'0 2px 0 rgba(140,36,80,.06),0 10px 24px rgba(224,80,127,.12)'},
  fx:{n:['กลีบซากุระร่วง','Falling petals'],c:['#FFB7CC','#FF8FB1','#FFD6E4','#F7A1BD'],amb:'petal',tap:'petal'},
  snd:{n:['สายลม + กระดิ่งลม','Breeze + wind chimes'],scene:'sakura'}},
 {k:'mint',ic:'🌿',n:['มินต์','Mint'],prev:['#F0FBF6','#16A085','#FF8A5B'],
  vars:{bg:'#F0FBF6','surface-2':'#DDF4EA',line:'#CBEBDD',blue:'#16A085',navy:'#0B5E4E',sky:'#C9F0E0','sky-2':'#EAFBF3',ink:'#173A31','ink-2':'#4A6D63','ink-3':'#86A69C',orange:'#FF8A5B','orange-soft':'#FFE0D1',shadow:'0 2px 0 rgba(11,94,78,.06),0 10px 24px rgba(22,160,133,.12)'},
  fx:{n:['ใบไม้ปลิว','Drifting leaves'],c:['#34C39A','#7ED9B5','#16A085','#A8E6CF'],amb:'leaf',tap:'leaf'},
  snd:{n:['ลำธาร + มาริมบา','Brook + soft marimba'],scene:'mint'}},
 {k:'lavender',ic:'💜',n:['ลาเวนเดอร์','Lavender'],prev:['#F6F3FF','#7B5CE0','#FF9A1F'],
  vars:{bg:'#F6F3FF','surface-2':'#ECE6FF',line:'#DDD4FA',blue:'#7B5CE0',navy:'#3F2A8C',sky:'#E0D7FF','sky-2':'#F3EFFF',ink:'#2A2350','ink-2':'#5B5485','ink-3':'#9790BA',shadow:'0 2px 0 rgba(63,42,140,.06),0 10px 24px rgba(123,92,224,.12)'},
  fx:{n:['หัวใจลอย','Floating hearts'],c:['#B39DFF','#FF9ECF','#8C6FF0','#D9CCFF'],amb:'heart',tap:'heart'},
  snd:{n:['ambient pad นุ่ม ๆ','Soft ambient pad'],scene:'lavender'}},
 {k:'sunset',ic:'🍊',n:['พระอาทิตย์ตก','Sunset'],prev:['#FFF6EC','#E8743B','#2F6FD6'],
  vars:{bg:'#FFF6EC','surface-2':'#FFEBD6',line:'#F6DCC0',blue:'#E8743B',navy:'#8A3A12',sky:'#FFDDBD','sky-2':'#FFF1E3',ink:'#3B2416','ink-2':'#6E5040','ink-3':'#A88D7C',orange:'#2F6FD6','orange-soft':'#D6E6FF',shadow:'0 2px 0 rgba(138,58,18,.06),0 10px 24px rgba(232,116,59,.12)'},
  fx:{n:['หิ่งห้อยแสงส้ม','Glowing embers'],c:['#FF9A3C','#FFC46B','#FF6F3C','#FFD9A0'],amb:'ember',tap:'ember'},
  snd:{n:['กีตาร์อาร์เปจโจนุ่ม ๆ','Gentle guitar arpeggios'],scene:'sunset'}},
 {k:'dino',ic:'🦖',n:['ไดโนเสาร์','Dinosaur'],prev:['#F4F8EA','#4F8A2B','#FF8A3D'],
  vars:{bg:'#F4F8EA','surface-2':'#E6F0D2',line:'#D5E4BC',blue:'#4F8A2B',navy:'#2F5A14',sky:'#DDEEC3','sky-2':'#EEF6E1',ink:'#243318','ink-2':'#566846','ink-3':'#8FA07E',orange:'#FF8A3D','orange-soft':'#FFE1CC',shadow:'0 2px 0 rgba(47,90,20,.06),0 10px 24px rgba(79,138,43,.12)'},
  fx:{n:['รอยเท้าไดโนเสาร์','Dino footprints'],c:['#6FA83F','#FF9A4D','#8BC34A','#C58B4A'],amb:'foot',tap:'foot'},
  snd:{n:['กลองไม้ + เสียงป่า','Wood drums + jungle'],scene:'dino'}},
 {k:'garden',ic:'🌷',n:['สวนดอกไม้','Flower garden'],prev:['#FFFCF2','#3FA34D','#FF5E7E'],
  vars:{bg:'#FFFCF2','surface-2':'#EEF7E6',line:'#E4EBD3',blue:'#3FA34D',navy:'#22663A',sky:'#DDF3D9','sky-2':'#F4FBEE',ink:'#23331F','ink-2':'#566650','ink-3':'#94A08C',orange:'#FF5E7E','orange-soft':'#FFD9E1',shadow:'0 2px 0 rgba(34,102,58,.06),0 10px 24px rgba(63,163,77,.12)'},
  fx:{n:['ผีเสื้อบินในสวน','Garden butterflies'],c:['#FF6F91','#FFB347','#B28DFF','#6EC6FF','#FF8FB1'],amb:'fly',tap:'flower'},
  snd:{n:['นกร้องในสวน','Garden birdsong'],scene:'garden'}},
 {k:'sea',ic:'🌊',n:['ทะเล','Ocean'],prev:['#EEF9FC','#0E8FB8','#FF8F6B'],
  vars:{bg:'#EEF9FC','surface-2':'#DAF1F7',line:'#C8E7F0',blue:'#0E8FB8',navy:'#064A63',sky:'#C6ECF5','sky-2':'#E8F7FB',ink:'#10313D','ink-2':'#44687A','ink-3':'#84A3B0',orange:'#FF8F6B','orange-soft':'#FFE0D6',shadow:'0 2px 0 rgba(6,74,99,.06),0 10px 24px rgba(14,143,184,.14)'},
  fx:{n:['ฟองอากาศใต้ทะเล','Rising bubbles'],c:['#7FD8F0','#B8ECF8','#4FC3E3','#FFFFFF'],amb:'bubble',tap:'bubble'},
  snd:{n:['คลื่น + นกนางนวล','Waves + seagulls'],scene:'sea'}},
 /* ---- added themes ---- */
 {k:'space',ic:'🚀',n:['อวกาศ','Space'],dark:true,prev:['#1B1740','#FF7A3D','#FFF1DA'],
  vars:{bg:'#1B1740',surface:'#252057','surface-2':'#2F2966',line:'#403A82',ink:'#FFF6E8','ink-2':'#D2CAE8','ink-3':'#9A92C0',blue:'#FF7A3D','blue-ink':'#1B1740',navy:'#FFE3C2',sky:'#352E74','sky-2':'#2A245F',orange:'#FFC98A','orange-ink':'#1B1740','orange-soft':'#4A3048',accent:'#FFC98A','accent-ink':'#1B1740'},
  fx:{n:['ดาวเล็ก + จรวดจิ๋วบินผ่าน','Tiny stars + a passing rocket'],c:['#FFF1DA','#FFD08A','#FFFFFF','#FFB08A'],amb:'star',ev:['rocket'],tap:'flame',tc:['#FF7A3D','#FFB347','#FFE08A','#FF5A1F']},
  snd:{n:['synth pad ลอย ๆ','Floating synth pad'],mix:[['drone',{m:45,v:.012}],['pad',{prog:[[57,64,67,71],[53,60,64,69],[55,62,65,69],[52,59,64,67]],step:9,wave:'sawtooth',cut:750,v:.011}],['bell',{notes:[81,83,84,86,88],gap:[3.5,7],v:.018}]]}},
 {k:'galaxy',ic:'🌌',n:['กาแล็กซี','Galaxy'],dark:true,prev:['#1E1038','#FF9ADB','#8FD6FF'],
  vars:{bg:'#1E1038',surface:'#2A174D','surface-2':'#35205F',line:'#4E3185',ink:'#F8EEFF','ink-2':'#D8C6F2','ink-3':'#A28DC6',blue:'#FF9ADB','blue-ink':'#2A0B3D',navy:'#A9DCFF',sky:'#5B2A9E','sky-2':'#321C5C',orange:'#8FD6FF','orange-ink':'#140A30','orange-soft':'#243A66',accent:'#FFB8E8','accent-ink':'#2A0B3D'},
  fx:{n:['ดาวระยิบ ดาวตก และหมอกเนบิวลา','Twinkles, shooting stars & nebula'],c:['#FFFFFF','#FFD6F2','#BDE3FF','#E2C8FF'],amb:[['star',10],['nebula',1,['#9B4DFF','#FF6FCF','#4FA8FF']]],ev:['shoot'],tap:'spark',tc:['#FF6B6B','#FFB347','#FFE66D','#6BE08A','#5EC8FF','#B28DFF','#FF8AD8']},
  snd:{n:['ambient + ระฆังแก้ว','Ambient + glass bells'],mix:[['pad',{prog:[[60,67,71,74],[57,64,69,72],[53,60,65,69],[55,62,67,71]],step:10,wave:'triangle',cut:1100,v:.018}],['bell',{notes:[79,81,84,86,88,91,93],gap:[1.4,3.6],v:.03}]]}},
 {k:'japan',ic:'🏯',n:['ญี่ปุ่น','Japan'],prev:['#FBF5E9','#2B3F73','#E23B3B'],
  vars:{bg:'#FBF5E9',surface:'#FFFDF7','surface-2':'#F3EAD6',line:'#E6DAC0',ink:'#1E2540','ink-2':'#4D5470','ink-3':'#8C8A9A',blue:'#2B3F73',navy:'#1B2850',sky:'#E3E6F2','sky-2':'#F2F0EE',orange:'#E23B3B','orange-soft':'#FBD9D5',accent:'#E23B3B','accent-ink':'#FFFFFF',shadow:'0 2px 0 rgba(27,40,80,.06),0 10px 24px rgba(43,63,115,.12)'},
  fx:{n:['ใบเมเปิลปลิว + โคมกระดาษลอย','Maple leaves + paper lanterns'],c:['#E23B3B','#F07B3F','#C8392B','#F2A65A'],amb:[['maple',5],['lantern',1,['#FFB45A','#FF9A3C','#F7C873']]],tap:'maple'},
  snd:{n:['โคโตะ + ขลุ่ย เพนทาโทนิก','Koto + flute, pentatonic'],mix:[['pluck',{scale:[62,63,67,69,70,74,75,79],gap:[1.2,3],v:.08,decay:2.2,wave:'sawtooth',cut:2600}],['flute',{scale:[74,75,79,81,82,86],gap:[6,12],v:.045}]]}},
 {k:'china',ic:'🏮',n:['จีน','Chinese'],prev:['#FFF7EC','#C8102E','#F5C44A'],
  vars:{bg:'#FFF7EC',surface:'#FFFCF6','surface-2':'#FCE9D6',line:'#F2D6B8',ink:'#3A1410','ink-2':'#6E3B30','ink-3':'#A8807A',blue:'#C8102E',navy:'#7A0A1C',sky:'#FFE3C4','sky-2':'#FFF1DE',orange:'#E8A820','orange-ink':'#5A0A12','orange-soft':'#FFEDB8',accent:'#F5C44A','accent-ink':'#7A0A1C',shadow:'0 2px 0 rgba(122,10,28,.06),0 10px 24px rgba(200,16,46,.12)'},
  fx:{n:['โคมแดงแกว่ง + เมฆมงคล','Swinging lanterns + lucky clouds'],c:['#F5C44A','#FFD966'],amb:[['redlantern',2,['#D7192F','#E8243A']],['cloud',2,['#F5C44A','#F7D77E','#FFE3A0']]],tap:'coin',tc:['#F5C44A','#FFD966','#E8A820']},
  snd:{n:['กู่เจิง เพนทาโทนิก','Guzheng, pentatonic'],mix:[['pluck',{scale:[60,62,64,67,69,72,74,76,79,81],gap:[.9,2.4],v:.05,decay:2.6,wave:'triangle',cut:3200,gliss:.18}],['pad',{prog:[[48,55,60],[45,52,57],[41,48,53],[43,50,55]],step:12,wave:'triangle',cut:600,v:.012}]]}},
 {k:'cafe',ic:'☕',n:['คาเฟ่','Café'],prev:['#FFF4E6','#8B5A3C','#E0894A'],
  vars:{bg:'#FFF4E6',surface:'#FFFBF5','surface-2':'#F6E6D2',line:'#EBD6BC',ink:'#3A2518','ink-2':'#6B4F3D','ink-3':'#A68C79',blue:'#8B5A3C',navy:'#5A3520',sky:'#F2DCC4','sky-2':'#FBEEDF',orange:'#E0894A','orange-soft':'#FBE0C8',accent:'#E0894A','accent-ink':'#3A2212',shadow:'0 2px 0 rgba(90,53,32,.06),0 10px 24px rgba(139,90,60,.12)'},
  fx:{n:['ไอกาแฟ + เมล็ดกาแฟหล่น','Coffee steam + falling beans'],c:['#6B3E26','#8B5A3C','#5A3220'],amb:[['steam',3,['#C9AE92','#D8C0A6','#BFA184']],['bean',2]],tap:'bubble',tc:['#D9B38C','#C99A6E','#E6C9A8','#B98A60']},
  snd:{n:['lo-fi เปียโน','Lo-fi piano'],mix:[['crackle',{v:.012}],['keys',{prog:[[62,65,69,72,76],[55,59,62,65,69],[60,64,67,71,74],[57,61,64,67,70]],step:3.2,v:.035}]]}},
 {k:'rain',ic:'🌧️',n:['หน้าฝน','Rainy'],dark:true,prev:['#1B2530','#9CBBDD','#FFD23F'],
  vars:{bg:'#1B2530',surface:'#243240','surface-2':'#2D3E50',line:'#3C5066',ink:'#EEF3F8','ink-2':'#BCCAD9','ink-3':'#8397AD',blue:'#9CBBDD','blue-ink':'#13202D',navy:'#D2E2F2',sky:'#3A4F68','sky-2':'#283849',orange:'#FFD23F','orange-ink':'#2A2200','orange-soft':'#4A4020',accent:'#FFD23F','accent-ink':'#1B2530'},
  fx:{n:['สายฝนเฉียง + หยดน้ำบนกระจก','Slanted rain + drops on glass'],c:['#A9C4E0','#CFE0F2','#8FB0D4'],amb:[['rain',5],['drop',1,['#BFD6EE','#E4EEF8','#5E7A99']]],dens:1.5,tap:'ripple',tc:['#FFD23F','#BFD6EE','#9CBBDD']},
  snd:{n:['ฝนพรำ + เปียโนช้า','Soft rain + slow piano'],mix:[['rain',{v:.05}],['piano',{notes:[57,60,62,64,67,69,72],gap:[2.2,4.5],v:.06}]]}},
 {k:'pixel',ic:'👾',n:['เกมพิกเซล','Pixel game'],dark:true,prev:['#101412','#2BB64A','#FFC83D'],
  vars:{bg:'#101412',surface:'#1A201C','surface-2':'#232B26',line:'#34403A',ink:'#EAF7EC','ink-2':'#B5CCBA','ink-3':'#7E9585',blue:'#2BB64A','blue-ink':'#04130A',navy:'#8CF5A5',sky:'#1F3A28','sky-2':'#18261D',orange:'#FFC83D','orange-ink':'#221800','orange-soft':'#3F3514',accent:'#FF5FA2','accent-ink':'#2A0A1C'},
  fx:{n:['บล็อกพิกเซลลอย','Floating pixel blocks'],c:['#2BB64A','#FFC83D','#FF5FA2','#4FC3FF','#FF7A3D','#B28DFF'],amb:'block',tap:'plus1',tc:['#FFC83D','#FFE27A']},
  snd:{n:['ชิปทูนเบา ๆ','Gentle chiptune'],mix:[['chip',{prog:[[60,64,67,72],[57,60,64,69],[53,57,60,65],[55,59,62,67]],step:.2,v:.03}]]}},
 {k:'library',ic:'📚',n:['ห้องสมุด','Library'],prev:['#F8F3E6','#2E5E4E','#A86B3C'],
  vars:{bg:'#F8F3E6',surface:'#FFFDF6','surface-2':'#ECE6D2',line:'#DED5BC',ink:'#1F2E27','ink-2':'#4C5B52','ink-3':'#8E968C',blue:'#2E5E4E',navy:'#1B3D32',sky:'#DCE8DF','sky-2':'#EEF3EC',orange:'#A86B3C','orange-soft':'#F0DCC6',accent:'#A86B3C','accent-ink':'#FFFFFF',shadow:'0 2px 0 rgba(27,61,50,.06),0 10px 24px rgba(46,94,78,.12)'},
  fx:{n:['ฝุ่นแสงลอย','Floating dust in the light'],c:['#E6B85C','#D9A441','#F2CF7F','#C9954A'],amb:'mote',dens:1.2,tap:'page',tc:['#FFFDF6','#F6EEDA','#EFE3C8']},
  snd:{n:['ฝน + พลิกกระดาษ','Rain + turning pages'],mix:[['rain',{v:.045}],['pages',{gap:[6,14]}]]}}
];
const TH=k=>THEMES.find(v=>v.k===k)||THEMES[0];
/* festival themes are appended by js/festivals.js, which also checks the saved S.skin */
