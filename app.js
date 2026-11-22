/* ================= Tayson Academy - Core ================= */
const KEY = 'tayson_academy_v1';
const hasGSAP = typeof window.gsap !== 'undefined';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const ACTIONS = {};
let db, currentPage = 'dashboard';

const DAYS = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];
const MONTHS = ['ينا','فبر','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس'];
const BELTS = [
  {n:'أبيض',c:'#e8ecf2'},{n:'أصفر',c:'#ffd54a'},{n:'برتقالي',c:'#ff8a3d'},
  {n:'أخضر',c:'#34d399'},{n:'أزرق',c:'#38bdf8'},{n:'بنفسجي',c:'#a78bfa'},
  {n:'بني',c:'#b48056'},{n:'أسود',c:'#6b7280'}
];
const PLANS_DEFAULT = [
  {id:'daily',name:'يومي',days:1,price:80,color:'#38bdf8',perks:['حصة تدريب واحدة','استخدام جميع المعدات','منشفة مجانية']},
  {id:'monthly',name:'شهري',days:30,price:900,color:'#ff3b30',perks:['12 حصة تدريب أسبوعية','تقييم مستوى مجاني','خصم 10% على المكملات']},
  {id:'quarter',name:'3 أشهر',days:90,price:2400,color:'#ffb020',perks:['تدريب مكثف 3 أشهر','جلسة خصوصية شهرية','شهادة إتمام المستوى']},
  {id:'half',name:'6 أشهر',days:180,price:4500,color:'#a78bfa',perks:['برنامج تدريبي متكامل','جلسات خصوصية أسبوعية',' First aid kit مجاني'],popular:true},
  {id:'year',name:'سنوي',days:365,price:8000,color:'#22c55e',perks:['تدريب غير محدود','قفازات احترافية','أولوية حجز الحصص']},
  {id:'vip',name:'VIP النخبة',days:365,price:12000,color:'#ff7ab2',perks:['مدرب شخصي مخصص','برنامج تغذية مخصص','مشاركة في المعسكرات']}
];
const CLASS_TYPES = [
  {time:'09:00',name:'KICKBOXING BASIS',coach:'كابتن رايان',level:'مبتدئ',cap:'12/16',color:'#ff3b30'},
  {time:'11:30',name:'MUAY THAI POWER',coach:'كابتن طيسون',level:'متوسط',cap:'8/12',color:'#ffb020'},
  {time:'14:00',name:'SPARRING LAB',coach:'كابتن عمر',level:'متقدم',cap:'6/10',color:'#38bdf8'},
  {time:'17:00',name:'FITNESS KICK',coach:'كابتن رايان',level:'الكل',cap:'15/20',color:'#a78bfa'},
  {time:'19:30',name:'FIGHT TEAM',coach:'كابتن طيسون',level:'نخبة',cap:'9/12',color:'#22c55e'},
  {time:'21:00',name:'CARDIO BOX',coach:'كابتن عمر',level:'الكل',cap:'18/20',color:'#ff7ab2'}
];
const SCHEDULE = {};
DAYS.forEach((d,i)=>SCHEDULE[d] = CLASS_TYPES.map((c,j)=>({...c,id:i+'-'+j})));

const COACHES = [
  {name:'كابتن طيسون',role:'مدرب رئيسي • مؤسس الأكاديمية',img:'istockphoto-674744296-1024x1024.jpg',
   bio:'خبرة 12 عاماً في الكيك بوكسينج والمواي تاي، ومدرب معتمد من الاتحاد الدولي. اشتهر بأسلوبه القاسي في بناء المقاتلين.',
   tags:['KICKBOXING','MUAY THAI','STRENGTH'],wins:'38',exp:'12 سنة',rank:'HEAD COACH'},
  {name:'كابتن رايان',role:'مدرب تقنية وحركة',img:'istockphoto-1006291908-1024x1024.jpg',
   bio:'متخصص في تطوير الأساسيات والتقنية للمتدربين الجدد، مع سجل تدريبي حافل بإخراج أبطال على مستوى الأندية.',
   tags:['TECHNIQUE','BASICS','CARDIO'],wins:'24',exp:'8 سنوات',rank:'SENIOR COACH'},
  {name:'كابتن عمر',role:'مدرب قتال ولياقة',img:'istockphoto-2225074143-1024x1024.jpg',
   bio:'خبير في حصص السبارينج واللياقة القتالية، يركز على بناء التحمل والقوة الانفجارية لدى المتدربين المتقدمين.',
   tags:['SPARRING','FITNESS','POWER'],wins:'19',exp:'6 سنوات',rank:'COACH'}
];

const ICONS = {
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
 card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
 crown:'<path d="M2 18h20l-1.5-9-5 4L12 5 8.5 13l-5-4z"/><path d="M4 21h16"/>',
 wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 1-1 1v3a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/>',
 chart:'<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-3v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-3h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-2 .1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4h3v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1h.2v3h-.2a1.7 1.7 0 0 0-1.6 1z"/>',
 edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/>',
 renew:'<path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3L3 16"/><path d="M3 21v-5h5"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 close:'<path d="M18 6 6 18M6 6l12 12"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 9-12h-7z"/>'
};
const icon = (n,s=18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]||''}</svg>`;

const NAV = [
  {id:'dashboard',label:'لوحة التحكم',icon:'grid'},
  {id:'members',label:'المتدربون',icon:'users'},
  {id:'subscriptions',label:'الاشتراكات',icon:'card'},
  {id:'schedule',label:'جدول الحصص',icon:'calendar'},
  {id:'coaches',label:'المدربون',icon:'crown'},
  {id:'payments',label:'المدفوعات',icon:'wallet'},
  {id:'reports',label:'التقارير',icon:'chart'},
  {id:'settings',label:'الإعدادات',icon:'settings'}
];
const TITLES = {
  dashboard:['لوحة التحكم','نظرة عامة على أداء الأكاديمية اليوم'],
  members:['المتدربون','إدارة المتدربين وحالات اشتراكاتهم'],
  subscriptions:['الاشتراكات','الباقات والاشتراكات الجارية'],
  schedule:['جدول الحصص','البرنامج التدريبي الأسبوعي'],
  coaches:['المدربون','طاقم التدريب المعتمد'],
  payments:['المدفوعات','سجل العمليات المالية'],
  reports:['التقارير','مؤشرات أداء الأكاديمية'],
  settings:['الإعدادات','تخصيص بيانات الأكاديمية']
};

/* ---------- data ---------- */
const uid = () => Math.random().toString(36).slice(2,10);
const day = n => { const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const defaultPlan = id => PLANS_DEFAULT.find(p=>p.id===id) || PLANS_DEFAULT[1];
const planById = id => (db.settings.plans.find(p=>p.id===id) || db.settings.plans[1]);
const money = n => Number(n||0).toLocaleString('en-US');
const esc = s => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = d => { if(!d) return '—'; const [y,m,dd]=d.split('-'); return `${dd}/${m}/${y}`; };
const daysLeft = end => { const a=new Date(end+'T23:59:59'); const b=new Date(); b.setHours(0,0,0,0); return Math.ceil((a-b)/86400000); };
const statusOf = m => { const d=daysLeft(m.end); return d<0?'expired':d<=7?'soon':'active'; };
const initials = name => String(name||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const statusLabel = {active:'نشط',soon:'ينتهي قريباً',expired:'منتهي'};

function defaultDB(){
  const specs = [
    ['أحمد مصطفى','01012345678','monthly','أزرق',18,92],
    ['محمد السيد','01123456789','quarter','بني',64,88],
    ['يوسف رائد','01234567890','half','أسود',150,97],
    ['كريم فتحي','01098765432','monthly','برتقالي',4,76],
    ['عمر خالد','01112223344','year','أسود',300,95],
    ['طارق نبيل','01222334455','monthly','أخضر',-6,60],
    ['محمود جمال','01055667788','quarter','أصفر',2,81],
    ['بلال حسن','01155667788','daily','أبيض',1,55],
    ['إبراهيم سعيد','01299887766','vip','أسود',220,99],
    ['رضا العتيبي','0551234567','half','أزرق',120,84],
    ['سلطان عامر','0509876543','monthly','برتقالي',12,73],
    ['فيصل ناصر','0534567890','quarter','أخضر',-12,68]
  ];
  const methods=['كاش','فيزا','تحويل بنكي'];
  const members = specs.map((s,i)=>{
    const p=defaultPlan(s[2]);
    return {id:uid(),name:s[0],phone:s[1],plan:s[2],belt:s[3],start:day(s[4]-p.days),end:day(s[4]),amount:p.price,attendance:s[5],joined:day(s[4]-p.days-30)};
  });
  const payments = members.map((m,i)=>({
    id:uid(),memberId:m.id,memberName:m.name,plan:m.plan,amount:m.amount,
    date:m.start,method:methods[i%3]
  })).sort((a,b)=>b.date.localeCompare(a.date));
  return {
    settings:{name:'Tayson Academy',phone:'0100 000 0000',address:'القاهرة - مصر',currency:'ج.م',plans:JSON.parse(JSON.stringify(PLANS_DEFAULT))},
    members, payments
  };
}
function loadDB(){
  try{ const raw=localStorage.getItem(KEY); if(raw){ const o=JSON.parse(raw); if(o&&o.members&&o.payments&&o.settings&&o.settings.plans) return o; } }catch(e){}
  return defaultDB();
}
function saveDB(){ try{ localStorage.setItem(KEY,JSON.stringify(db)); }catch(e){} }

/* ---------- shared UI helpers ---------- */
function countTo(el,val,suffix=''){
  if(!el) return;
  if(!hasGSAP){ el.textContent=money(val)+suffix; return; }
  const o={v:0};
  gsap.to(o,{v:val,duration:1.15,ease:'power2.out',onUpdate:()=>{ el.textContent=money(Math.round(o.v))+suffix; }});
}
function animateBars(container,data,labels,maxPx=130){
  if(!container) return;
  const max=Math.max(...data,1);
  container.innerHTML = data.map((v,i)=>`<div class="bar-wrap ${v<max*.35?'low':''}" title="${money(v)} ج.م"><div class="bar" style="--h:${Math.max(8,Math.round(v/max*maxPx))}px"></div><div class="bar-label">${labels[i]||''}</div></div>`).join('');
  if(hasGSAP) gsap.fromTo($$('.bar',container),{scaleY:0},{scaleY:1,duration:.8,stagger:.035,ease:'power3.out',delay:.1});
}
function animateDonut(circle,label,pct){
  if(!circle) return;
  const C=301.6, off=C*(1-Math.min(100,Math.max(0,pct))/100);
  if(hasGSAP) gsap.to(circle,{attr:{'stroke-dashoffset':off},duration:1.3,ease:'power2.out'});
  else circle.setAttribute('stroke-dashoffset',off);
  countTo(label,pct,'%');
}
function toast(msg,type='success'){
  const box=$('#toasts'); if(!box) return;
  const el=document.createElement('div');
  el.className='toast '+(type==='error'?'error':'');
  el.innerHTML=`<span>${icon(type==='error'?'close':'check',17)}</span><span>${esc(msg)}</span>`;
  box.appendChild(el);
  if(hasGSAP) gsap.from(el,{x:70,autoAlpha:0,duration:.4,ease:'power3.out'});
  setTimeout(()=>{ if(hasGSAP) gsap.to(el,{x:70,autoAlpha:0,duration:.35,onComplete:()=>el.remove()}); else el.remove(); },3200);
}
function exportCSV(rows,name){
  const csv='\uFEFF'+rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download=name; a.click(); URL.revokeObjectURL(a.href);
  toast('تم تصدير الملف بنجاح');
}
function renderNav(){
  $('#nav').innerHTML=NAV.map(n=>`<button class="nav-item ${n.id===currentPage?'active':''}" data-page="${n.id}">${icon(n.icon,19)}<span>${n.label}</span>${n.id==='members'?`<span class="nav-badge">${db.members.length}</span>`:''}</button>`).join('');
}
function go(page){
  const target=$(`.page[data-page="${page}"]`); if(!target) return;
  if(typeof renderPage==='function') renderPage(page);
  $$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===page));
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  $('#pageTitle').textContent=TITLES[page][0];
  $('#pageSubtitle').textContent=TITLES[page][1];
  currentPage=page;
  $('#notifPanel').classList.remove('open');
  $('#content').scrollTop=0;
  if(typeof refreshNotif==='function') refreshNotif();
  if(hasGSAP){
    gsap.fromTo(target,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.42,ease:'power3.out',clearProps:'all'});
    gsap.fromTo($$('.reveal',target),{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.55,stagger:.055,ease:'power3.out',delay:.08,clearProps:'transform,opacity,visibility'});
  }
  animatePageCharts(page);
}
function animatePageCharts(page){
  if(!hasGSAP) return;
  const scope=$(`.page[data-page="${page}"]`); if(!scope) return;
  gsap.fromTo($$('.stat',scope),{y:26,autoAlpha:0},{y:0,autoAlpha:1,duration:.5,stagger:.07,ease:'power3.out',delay:.12,clearProps:'all'});
}

/* ---------- dashboard ---------- */
function revenueData(){
  const base=[6200,7400,8100,6900,9200,10500,9800,11200,12600,11900,13400];
  const mk=new Date().toISOString().slice(0,7);
  const cur=db.payments.filter(p=>p.date.slice(0,7)===mk).reduce((s,p)=>s+Number(p.amount||0),0);
  return [...base,cur||9800];
}
function renderDashboard(){
  const ms=db.members;
  const active=ms.filter(m=>statusOf(m)==='active').length;
  const soon=ms.filter(m=>statusOf(m)==='soon').length;
  const expired=ms.length-active-soon;
  countTo($('#statMembers'),ms.length);
  countTo($('#statActive'),active);
  const mk=new Date().toISOString().slice(0,7);
  countTo($('#statRevenue'),db.payments.filter(p=>p.date.slice(0,7)===mk).reduce((s,p)=>s+Number(p.amount||0),0));
  $('#statExpired').textContent=expired;
  $('#icMembers').innerHTML=icon('users',19);
  $('#icActive').innerHTML=icon('check',19);
  $('#icRevenue').innerHTML=icon('wallet',19);
  $('#icSessions').innerHTML=icon('bolt',19);
  animateBars($('#revenueBars'),revenueData(),MONTHS,130);
  const avg=Math.round(ms.reduce((s,m)=>s+Number(m.attendance||0),0)/Math.max(ms.length,1));
  animateDonut($('#donutValue'),$('#attendancePct'),avg);

  const alerts=ms.filter(m=>statusOf(m)!=='active').sort((a,b)=>daysLeft(a.end)-daysLeft(b.end)).slice(0,4);
  $('#expiringList').innerHTML=alerts.length?alerts.map(m=>{
    const d=daysLeft(m.end);
    return `<div class="list-row"><div class="avatar">${esc(initials(m.name))}</div><div class="meta"><b>${esc(m.name)}</b><span>${esc(planById(m.plan).name)} • ${d<0?'انتهى قبل '+Math.abs(d)+' يوم':'متبقي '+d+' يوم'}</span></div>
      <button class="btn btn-ghost btn-sm" data-action="renew" data-id="${m.id}">تجديد</button></div>`;
  }).join(''):`<div class="empty"><b>كل الاشتراكات نشطة</b>لا توجد اشتراكات تحتاج متابعة</div>`;

  const recent=[...db.payments].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  $('#recentPayments').innerHTML=recent.length?recent.map(p=>`<div class="list-row"><div class="avatar">${esc(initials(p.memberName))}</div><div class="meta"><b>${esc(p.memberName)}</b><span>${esc(planById(p.plan).name)} • ${fmtDate(p.date)}</span></div><div class="list-amount">+${money(p.amount)}</div></div>`).join(''):`<div class="empty"><b>لا توجد عمليات</b>ستظهر المدفوعات هنا عند تسجيل أول اشتراك</div>`;

  const todayIdx=(new Date().getDay()+6)%7;
  const dayName=DAYS[todayIdx];
  $('#schedulePreview').innerHTML=SCHEDULE[dayName].slice(0,4).map(c=>`<div class="list-row"><div style="font-family:'Barlow Condensed';font-size:17px;font-weight:800;color:${c.color};width:56px;flex:0 0 56px" dir="ltr">${c.time}</div><div class="meta"><b>${c.name}</b><span>${c.coach} • ${c.level}</span></div><span class="chip chip-gray">${c.cap}</span></div>`).join('');

  $('#beltBars').innerHTML=BELTS.map(b=>{
    const n=ms.filter(m=>m.belt===b.n).length;
    const pct=Math.round(n/Math.max(ms.length,1)*100);
    return `<div class="belt-row"><span class="belt-name">${b.n}</span><div class="belt-track"><i style="--bc:${b.c};width:${pct}%" data-w="${pct}"></i></div><span class="belt-count">${n}</span></div>`;
  }).join('');
  if(hasGSAP) gsap.fromTo($$('#beltBars i'),{width:0},{width:(i,t)=>t.dataset.w+'%',duration:.9,stagger:.06,ease:'power3.out',delay:.2});
}

/* ---------- members ---------- */
function filteredMembers(){
  const q=(ui.memberSearch||'').trim().toLowerCase();
  return db.members.filter(m=>{
    if(q && !m.name.toLowerCase().includes(q) && !m.phone.includes(q)) return false;
    if(ui.memberStatus!=='all' && statusOf(m)!==ui.memberStatus) return false;
    if(ui.memberBelt!=='all' && m.belt!==ui.memberBelt) return false;
    return true;
  }).sort((a,b)=>b.start.localeCompare(a.start));
}
function renderMembers(){
  const rows=filteredMembers();
  $('#membersBody').innerHTML=rows.length?rows.map(m=>{
    const s=statusOf(m), d=daysLeft(m.end), p=planById(m.plan);
    return `<tr><td><div class="person"><div class="avatar">${esc(initials(m.name))}</div><div><b>${esc(m.name)}</b><span>منذ ${fmtDate(m.joined)}</span></div></div></td>
      <td dir="ltr" style="text-align:right">${esc(m.phone)}</td>
      <td><span class="chip chip-gray">${esc(p.name)}</span></td>
      <td><span class="belt-mini" style="display:inline-flex;align-items:center;gap:6px"><i style="width:9px;height:9px;border-radius:3px;background:${(BELTS.find(b=>b.n===m.belt)||BELTS[0]).c}"></i>${esc(m.belt)}</span></td>
      <td><span class="badge ${s}">${statusLabel[s]}</span></td>
      <td>${d<0?'—':d+' يوم'}</td>
      <td><div class="icon-actions">
        <button class="icon-act" data-action="edit-member" data-id="${m.id}" title="تعديل" aria-label="تعديل">${icon('edit',14)}</button>
        <button class="icon-act renew" data-action="renew" data-id="${m.id}" title="تجديد" aria-label="تجديد">${icon('renew',14)}</button>
        <button class="icon-act del" data-action="delete-member" data-id="${m.id}" title="حذف" aria-label="حذف">${icon('trash',14)}</button>
      </div></td></tr>`;
  }).join(''):`<tr><td colspan="7"><div class="empty"><b>لا توجد نتائج مطابقة</b>جرّب تغيير كلمات البحث أو الفلاتر</div></td></tr>`;
  $('#membersFoot').innerHTML=`<span>عرض ${rows.length} من ${db.members.length} متدرب</span><span>آخر تحديث: ${new Date().toLocaleDateString('ar-EG')}</span>`;
  const badge=$('.nav-item[data-page="members"] .nav-badge'); if(badge) badge.textContent=db.members.length;
}

/* ---------- subscriptions ---------- */
function renderSubscriptions(){
  $('#plansGrid').innerHTML=db.settings.plans.map(p=>`
    <div class="plan-card ${p.popular?'popular':''} reveal">
      <div class="plan-icon" style="--pg:${p.color}22">${icon('bolt',20)}</div>
      <div class="plan-name">${esc(p.name)}</div>
      <div class="plan-days">${p.days===1?'يوم واحد':p.days+' يومًا'} من التدريب المتواصل</div>
      <div class="plan-price" style="color:${p.color}">${money(p.price)} <small>${esc(db.settings.currency)}</small></div>
      <ul class="plan-perks">${p.perks.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      <button class="btn ${p.popular?'btn-primary':'btn-ghost'}" style="width:100%" data-action="add-member" data-plan="${p.id}">اشتراك جديد</button>
      <button class="link-btn" style="display:block;margin:10px auto 0" data-action="edit-plan" data-id="${p.id}">تعديل الباقة</button>
    </div>`).join('');
  const subs=[...db.members].sort((a,b)=>daysLeft(a.end)-daysLeft(b.end));
  $('#subsCount').textContent=subs.length+' اشتراك';
  $('#subsBody').innerHTML=subs.map(m=>{
    const total=Math.max(1,Math.round((new Date(m.end)-new Date(m.start))/86400000));
    const left=Math.max(0,daysLeft(m.end));
    const pct=Math.min(100,Math.max(0,Math.round(left/total*100)));
    const s=statusOf(m);
    return `<tr><td><div class="person"><div class="avatar">${esc(initials(m.name))}</div><div><b>${esc(m.name)}</b><span>${esc(m.phone)}</span></div></div></td>
      <td>${esc(planById(m.plan).name)}</td><td>${fmtDate(m.start)}</td><td>${fmtDate(m.end)}</td>
      <td class="sub-row-progress"><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted)"><span>${left} يوم متبقي</span><span>${pct}%</span></div><div class="progress-line"><i style="width:${pct}%"></i></div></td>
      <td><span class="badge ${s}">${statusLabel[s]}</span></td></tr>`;
  }).join('');
}

/* ---------- init helpers ---------- */
const ui={memberSearch:'',memberStatus:'all',memberBelt:'all',payFilter:'all',paymentSearch:'',day:DAYS[(new Date().getDay()+6)%7]};

function loadUI(){}

function refreshNotif(){
  const box=$('#notifPanel'); if(!box) return;
  const alerts=db.members.filter(m=>statusOf(m)!=='active').sort((a,b)=>daysLeft(a.end)-daysLeft(b.end)).slice(0,5);
  $('#notifDot').style.display=alerts.length?'block':'none';
  box.innerHTML=`<div class="notif-head">تنبيهات الاشتراكات (${alerts.length})</div>`+
    (alerts.length?alerts.map(m=>`<div class="notif-item"><div class="nd">${daysLeft(m.end)<0?'!':daysLeft(m.end)}</div><div><b>${esc(m.name)}</b><span>${daysLeft(m.end)<0?'انتهى اشتراكه':'ينتهي خلال '+daysLeft(m.end)+' يوم'}</span></div></div>`).join(''):`<div class="empty" style="padding:18px">لا توجد تنبيهات</div>`);
}
function setupGlobalEvents(){
  document.addEventListener('click',e=>{
    const g=e.target.closest('[data-go]'); if(g){ go(g.dataset.go); return; }
    const a=e.target.closest('[data-action]'); if(a && ACTIONS[a.dataset.action]){ ACTIONS[a.dataset.action](a, a.dataset); return; }
    const n=e.target.closest('.nav-item'); if(n){ go(n.dataset.page); return; }
    if(!e.target.closest('.notif-wrap')) $('#notifPanel').classList.remove('open');
  });
  $('#notifBtn').addEventListener('click',()=>$('#notifPanel').classList.toggle('open'));
  $('#menuBtn').addEventListener('click',()=>{ $('#sidebar').classList.add('open'); $('#screenOverlay').classList.add('show'); });
  $('#screenOverlay').addEventListener('click',()=>{ $('#sidebar').classList.remove('open'); $('#screenOverlay').classList.remove('show'); });
  $('#settingsShortcut').addEventListener('click',()=>go('settings'));
  $('#globalSearch').addEventListener('input',e=>{
    ui.memberSearch=e.target.value; $('#memberSearch').value=e.target.value;
    renderMembers(); if(currentPage!=='members') go('members');
  });
  $('#memberSearch').addEventListener('input',e=>{ ui.memberSearch=e.target.value; renderMembers(); });
  $('#memberStatus').addEventListener('change',e=>{ ui.memberStatus=e.target.value; renderMembers(); });
  $('#memberBelt').addEventListener('change',e=>{ ui.memberBelt=e.target.value; renderMembers(); });
  $('#paymentSearch').addEventListener('input',e=>{ ui.paymentSearch=e.target.value; renderPayments(); });
  $$('#paymentFilters .chip-btn').forEach(b=>b.addEventListener('click',()=>{
    $$('#paymentFilters .chip-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    ui.payFilter=b.dataset.payfilter; renderPayments();
  }));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ if(typeof closeModal==='function') closeModal(); $('#notifPanel').classList.remove('open'); } });
  window.addEventListener('resize',()=>{ if(window.innerWidth>900){ $('#sidebar').classList.remove('open'); $('#screenOverlay').classList.remove('show'); } });
}
