/* ================= Tayson Academy - Views & interactions ================= */

function renderPage(page){
  const map={dashboard:renderDashboard,members:renderMembers,subscriptions:renderSubscriptions,
    schedule:renderSchedule,coaches:renderCoaches,payments:renderPayments,reports:renderReports,settings:renderSettings};
  if(map[page]) map[page]();
}
function refreshAll(){ NAV.forEach(n=>renderPage(n.id)); refreshNotif(); }

/* ---------- schedule ---------- */
function renderSchedule(){
  $('#dayTabs').innerHTML=DAYS.map(d=>`<button class="day-tab ${d===ui.day?'active':''}" data-day="${d}">${d}</button>`).join('');
  const list=SCHEDULE[ui.day];
  $('#classesGrid').innerHTML=list.map(c=>`
    <div class="class-card reveal" style="--cc:${c.color}">
      <div class="class-time">${c.time}</div>
      <div class="class-name">${c.name}</div>
      <div class="class-meta"><span class="chip chip-gray">${c.level}</span><span class="chip chip-gray">60 دقيقة</span></div>
      <div class="class-foot"><span>المدرب: <b>${c.coach}</b></span><span>الحضور: <b>${c.cap}</b></span></div>
    </div>`).join('');
  $$('#dayTabs .day-tab').forEach(b=>b.addEventListener('click',()=>{
    ui.day=b.dataset.day; renderSchedule();
    if(hasGSAP) gsap.fromTo($$('.class-card'),{y:18,autoAlpha:0},{y:0,autoAlpha:1,duration:.45,stagger:.05,ease:'power3.out'});
  }));
}

/* ---------- coaches ---------- */
function renderCoaches(){
  $('#coachesGrid').innerHTML=COACHES.map(c=>`
    <div class="coach-card reveal" style="background-image:url('${c.img}')">
      <span class="coach-rank">${c.rank}</span>
      <div class="coach-body">
        <h3>${c.name}</h3><div class="role">${c.role}</div>
        <p>${c.bio}</p>
        <div class="coach-tags">${c.tags.map(t=>`<span class="chip chip-red">${t}</span>`).join('')}</div>
        <div class="coach-record">
          <div><b>${c.wins}</b><span>انتصار</span></div>
          <div><b>${c.exp}</b><span>خبرة</span></div>
          <div><b>120+</b><span>متدرب</span></div>
        </div>
      </div>
    </div>`).join('');
}

/* ---------- payments ---------- */
function filteredPayments(){
  const q=(ui.paymentSearch||'').trim().toLowerCase();
  const t=new Date().toISOString().slice(0,10), mk=t.slice(0,7);
  return db.payments.filter(p=>{
    if(q && !p.memberName.toLowerCase().includes(q)) return false;
    if(ui.payFilter==='today' && p.date!==t) return false;
    if(ui.payFilter==='month' && p.date.slice(0,7)!==mk) return false;
    return true;
  }).sort((a,b)=>b.date.localeCompare(a.date));
}
function renderPayments(){
  const t=new Date().toISOString().slice(0,10), mk=t.slice(0,7);
  const sum=arr=>arr.reduce((s,p)=>s+Number(p.amount||0),0);
  $('#paymentStats').innerHTML=[
    ['إيراد اليوم',sum(db.payments.filter(p=>p.date===t)),'glow-red','bolt'],
    ['إيراد هذا الشهر',sum(db.payments.filter(p=>p.date.slice(0,7)===mk)),'glow-green','wallet'],
    ['الإجمالي الكلي',sum(db.payments),'glow-blue','chart']
  ].map(([label,val,glow,ic])=>`<div class="mini-stat reveal"><div><span>${label}</span><b>${money(val)}</b></div><i class="${glow}">${icon(ic,19)}</i></div>`).join('');
  const rows=filteredPayments();
  $('#paymentsBody').innerHTML=rows.length?rows.map((p,i)=>`<tr>
    <td style="color:var(--muted)">${String(i+1).padStart(2,'0')}</td>
    <td><div class="person"><div class="avatar">${esc(initials(p.memberName))}</div><div><b>${esc(p.memberName)}</b><span>عملية اشتراك</span></div></div></td>
    <td><span class="chip chip-gray">${esc(planById(p.plan).name)}</span></td>
    <td><span class="method">${esc(p.method||'كاش')}</span></td>
    <td>${fmtDate(p.date)}</td><td class="amount-positive">+ ${money(p.amount)}</td></tr>`).join(''):`<tr><td colspan="6"><div class="empty"><b>لا توجد عمليات مطابقة</b>جرّب تغيير الفترة أو البحث</div></td></tr>`;
  $('#paymentsFoot').innerHTML=`<span>${rows.length} عملية مالية</span><span>الإجمالي: <b style="color:var(--green)">${money(sum(rows))} ${esc(db.settings.currency)}</b></span>`;
}

/* ---------- reports ---------- */
function renderReports(){
  const ms=db.members, total=ms.length||1;
  const active=ms.filter(m=>statusOf(m)==='active').length;
  const soon=ms.filter(m=>statusOf(m)==='soon').length;
  const expired=ms.length-active-soon;
  const totalRev=db.payments.reduce((s,p)=>s+Number(p.amount||0),0);
  $('#reportStats').innerHTML=[
    ['إجمالي الإيرادات',totalRev,'glow-red','wallet'],
    ['متوسط قيمة الاشتراك',Math.round(totalRev/Math.max(db.payments.length,1)),'glow-green','chart'],
    ['معدل الحضور',Math.round(ms.reduce((s,m)=>s+Number(m.attendance||0),0)/total)+'%','glow-blue','users']
  ].map(([l,v,g,i])=>`<div class="mini-stat reveal"><div><span>${l}</span><b>${typeof v==='number'?money(v):v}</b></div><i class="${g}">${icon(i,19)}</i></div>`).join('');
  const data=revenueData();
  animateBars($('#reportBars'),data,MONTHS,205);
  const pct=Math.round(active/total*100);
  animateDonut($('#reportDonut'),$('#reportActivePct'),pct);
  $('#reportLegend').innerHTML=[
    ['نشط',active,'var(--green)'],['ينتهي قريباً',soon,'var(--accent2)'],['منتهي',expired,'var(--accent)']
  ].map(([n,v,c])=>`<div><span class="legend-dot" style="background:${c}"></span><span>${n}</span><b>${v}</b></div>`).join('')+
  `<div class="legend-note">إجمالي المتدربين <b>${ms.length}</b> موزعين على ${db.settings.plans.length} باقات مختلفة</div>`;
  const months=MONTHS.map((m,i)=>({m,i,sum:i===11?data[11]:Math.round(data[i]*(0.8+((i*7)%5)/10))})).slice(6);
  $('#reportMonthly').innerHTML=months.map(x=>`<div class="list-row"><div class="meta"><b>شهر ${x.m}</b><span>${Math.round(x.sum/900)} اشتراك تقريبي</span></div><div class="list-amount">${money(x.sum)}</div></div>`).join('');
}

/* ---------- settings ---------- */
function renderSettings(){
  const s=db.settings;
  $('[name="name"]',$('#settingsForm')).value=s.name;
  $('[name="phone"]',$('#settingsForm')).value=s.phone;
  $('[name="address"]',$('#settingsForm')).value=s.address;
  $('[name="currency"]',$('#settingsForm')).value=s.currency;
  $('#plansSettings').innerHTML=s.plans.map(p=>`
    <div class="plan-setting"><i class="ps-dot" style="background:${p.color}"></i><span class="ps-name">${esc(p.name)}</span>
      <span style="font-size:10px;color:var(--muted)">${p.days} يوم</span>
      <input class="ps-input" type="number" min="0" id="price-${p.id}" value="${p.price}" aria-label="سعر ${esc(p.name)}" />
      <button class="btn btn-ghost btn-sm" data-action="edit-plan" data-id="${p.id}">تفاصيل</button>
    </div>`).join('')+`<button class="btn btn-primary" data-action="save-prices">حفظ الأسعار</button>`;
}

/* ---------- modals ---------- */
function modalHead(title,sub){ return `<div class="modal-head"><div><h3>${title}</h3><p>${sub}</p></div><button class="modal-close" data-action="close-modal" aria-label="إغلاق">${icon('x',16)}</button></div>`; }
function openModal(html,onMount){
  const root=$('#modalRoot');
  root.innerHTML=`<div class="modal-backdrop" data-action="close-modal"></div><div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  if(onMount) onMount(root);
  if(hasGSAP){
    gsap.fromTo($('.modal-backdrop',root),{autoAlpha:0},{autoAlpha:1,duration:.25});
    gsap.fromTo($('.modal',root),{y:34,autoAlpha:0,scale:.96},{y:0,autoAlpha:1,scale:1,duration:.4,ease:'back.out(1.4)'});
  }
  const first=$('input,select,textarea',root); if(first) setTimeout(()=>first.focus(),120);
}
function closeModal(){
  const root=$('#modalRoot'); if(!root.innerHTML) return;
  if(hasGSAP){ gsap.to($('.modal',root),{y:16,autoAlpha:0,duration:.2}); gsap.to($('.modal-backdrop',root),{autoAlpha:0,duration:.2,onComplete:()=>root.innerHTML=''}); }
  else root.innerHTML='';
}
function planOptions(sel){ return db.settings.plans.map(p=>`<option value="${p.id}" ${sel===p.id?'selected':''}>${esc(p.name)} — ${money(p.price)} ${esc(db.settings.currency)}</option>`).join(''); }
function beltOptions(sel){ return BELTS.map(b=>`<option value="${b.n}" ${sel===b.n?'selected':''}>${b.n}</option>`).join(''); }

function memberModal(member,preset){
  const m=member||{name:'',phone:'',plan:preset||'monthly',belt:'أبيض',start:new Date().toISOString().slice(0,10),end:day(30),amount:planById(preset||'monthly').price,attendance:80};
  openModal(`${modalHead(member?'تعديل بيانات المتدرب':'إضافة متدرب جديد',member?'عدّل البيانات المطلوبة':'أدخل بيانات المتدرب والباقة')}
    <form id="memberForm">
      <div class="form-row"><div><label>الاسم الكامل *</label><input name="name" required value="${esc(m.name)}" placeholder="مثال: محمد أحمد" /></div>
      <div><label>رقم الهاتف *</label><input name="phone" required value="${esc(m.phone)}" placeholder="01012345678" /></div></div>
      <div class="form-row"><div><label>نوع الباقة</label><select name="plan" id="fPlan">${planOptions(m.plan)}</select></div>
      <div><label>الحزام</label><select name="belt">${beltOptions(m.belt)}</select></div></div>
      <div class="form-row"><div><label>تاريخ البداية</label><input type="date" name="start" id="fStart" value="${m.start}" required /></div>
      <div><label>تاريخ الانتهاء</label><input type="date" name="end" id="fEnd" value="${m.end}" required /></div></div>
      <div class="form-row"><div><label>المبلغ (${esc(db.settings.currency)})</label><input type="number" name="amount" id="fAmount" min="0" value="${m.amount}" required /></div>
      <div><label>نسبة الحضور (%)</label><input type="number" name="attendance" min="0" max="100" value="${m.attendance}" /></div></div>
      ${member?'':`<div class="form-row full"><div><label>طريقة الدفع</label><select name="method"><option>كاش</option><option>فيزا</option><option>تحويل بنكي</option></select></div></div>`}
      <div class="field-hint">سيتم تسجيل عملية دفع جديدة تلقائياً عند إضافة متدرب جديد.</div>
      <div class="modal-foot"><button type="button" class="btn btn-ghost" data-action="close-modal">إلغاء</button><button type="submit" class="btn btn-primary">${member?'حفظ التعديلات':'إضافة المتدرب'}</button></div>
    </form>`, root=>{
      const sync=()=>{ const p=planById($('#fPlan',root).value);
        $('#fAmount',root).value=p.price;
        const s=new Date($('#fStart',root).value); if(isNaN(s)) return;
        s.setDate(s.getDate()+p.days); $('#fEnd',root).value=s.toISOString().slice(0,10);
      };
      $('#fPlan',root).addEventListener('change',sync);
      $('#fStart',root).addEventListener('change',sync);
      $('#memberForm',root).addEventListener('submit',e=>{
        e.preventDefault(); const f=new FormData(e.target);
        const name=String(f.get('name')).trim(), phone=String(f.get('phone')).trim();
        if(!name){ toast('الاسم مطلوب','error'); return; }
        if(!/^[0-9+\s-]{8,}$/.test(phone)){ toast('رقم الهاتف غير صحيح','error'); return; }
        const data={name,phone,plan:f.get('plan'),belt:f.get('belt'),start:f.get('start'),end:f.get('end'),amount:Number(f.get('amount')),attendance:Number(f.get('attendance'))||0};
        if(member){ Object.assign(member,data); toast('تم تحديث بيانات المتدرب بنجاح'); }
        else{
          const id=uid(); db.members.push({id,...data,joined:data.start});
          db.payments.push({id:uid(),memberId:id,memberName:name,plan:data.plan,amount:data.amount,date:data.start,method:f.get('method')||'كاش'});
          toast('تم إضافة المتدرب بنجاح');
        }
        saveDB(); closeModal(); refreshAll(); renderNav();
      });
    });
}
function renewModal(id){
  const m=db.members.find(x=>x.id===id); if(!m) return;
  const start=new Date().toISOString().slice(0,10);
  openModal(`${modalHead('تجديد الاشتراك','سيتم تسجيل عملية دفع جديدة وتفعيل الاشتراك')}
    <form id="renewForm">
      <div class="list-row" style="background:rgba(255,255,255,.03);margin-bottom:16px"><div class="avatar">${esc(initials(m.name))}</div><div class="meta"><b>${esc(m.name)}</b><span>اشتراكه الحالي ينتهي في ${fmtDate(m.end)}</span></div></div>
      <div class="form-row"><div><label>اختر الباقة</label><select name="plan" id="rPlan">${planOptions(m.plan)}</select></div>
      <div><label>تاريخ البداية</label><input type="date" name="start" id="rStart" value="${start}" required /></div></div>
      <div class="form-row"><div><label>المبلغ الإجمالي</label><input type="number" name="amount" id="rAmount" min="0" value="${planById(m.plan).price}" required /></div>
      <div><label>طريقة الدفع</label><select name="method"><option>كاش</option><option>فيزا</option><option>تحويل بنكي</option></select></div></div>
      <div class="modal-foot"><button type="button" class="btn btn-ghost" data-action="close-modal">إلغاء</button><button type="submit" class="btn btn-primary">تأكيد التجديد</button></div>
    </form>`, root=>{
      $('#rPlan',root).addEventListener('change',()=>{ $('#rAmount',root).value=planById($('#rPlan',root).value).price; });
      $('#renewForm',root).addEventListener('submit',e=>{
        e.preventDefault(); const f=new FormData(e.target);
        const p=planById(f.get('plan')); const s=new Date(f.get('start'));
        s.setDate(s.getDate()+p.days);
        m.plan=p.id; m.start=f.get('start'); m.end=s.toISOString().slice(0,10); m.amount=Number(f.get('amount'));
        db.payments.push({id:uid(),memberId:m.id,memberName:m.name,plan:p.id,amount:m.amount,date:m.start,method:f.get('method')});
        saveDB(); closeModal(); refreshAll(); toast('تم تجديد الاشتراك بنجاح');
      });
    });
}
function confirmModal(title,msg,yesLabel,onYes){
  openModal(`${modalHead(title,msg)}
    <div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">إلغاء</button><button class="btn btn-danger" id="confirmYes">${yesLabel}</button></div>`, root=>{
      $('#confirmYes',root).addEventListener('click',()=>{ closeModal(); onYes(); });
    });
}
function planModal(id){
  const p=db.settings.plans.find(x=>x.id===id); if(!p) return;
  openModal(`${modalHead('تعديل الباقة','خصائص الباقة ومدة الاشتراك')}
    <form id="planForm">
      <div class="form-row"><div><label>اسم الباقة</label><input name="name" value="${esc(p.name)}" required /></div>
      <div><label>المدة بالأيام</label><input name="days" type="number" min="1" value="${p.days}" required /></div></div>
      <div class="form-row full"><div><label>السعر (${esc(db.settings.currency)})</label><input name="price" type="number" min="0" value="${p.price}" required /></div></div>
      <div class="form-row full"><div><label>المميزات (سطر لكل ميزة)</label><textarea name="perks" rows="4">${esc(p.perks.join('\n'))}</textarea></div></div>
      <div class="modal-foot"><button type="button" class="btn btn-ghost" data-action="close-modal">إلغاء</button><button class="btn btn-primary">حفظ الباقة</button></div>
    </form>`, root=>{
      $('#planForm',root).addEventListener('submit',e=>{
        e.preventDefault(); const f=new FormData(e.target);
        p.name=f.get('name'); p.days=Number(f.get('days')); p.price=Number(f.get('price'));
        p.perks=String(f.get('perks')).split('\n').map(x=>x.trim()).filter(Boolean);
        saveDB(); closeModal(); refreshAll(); toast('تم تحديث الباقة بنجاح');
      });
    });
}
function contactModal(){
  openModal(`${modalHead('تواصل مع المدربين','فريق Tayson Academy جاهز للمساعدة')}
    <div class="list"><div class="list-row"><div class="avatar">TA</div><div class="meta"><b>الأكاديمية</b><span>${esc(db.settings.address)}</span></div></div>
    <div class="list-row"><div class="avatar">☎</div><div class="meta"><b>رقم الهاتف</b><span dir="ltr">${esc(db.settings.phone)}</span></div></div></div>
    <div class="modal-foot"><button class="btn btn-primary" data-action="close-modal">حسناً</button></div>`);
}

/* ---------- actions ---------- */
ACTIONS['close-modal']=closeModal;
ACTIONS['add-member']=(el,d)=>memberModal(null,d&&d.plan);
ACTIONS['edit-member']=(el,d)=>memberModal(db.members.find(m=>m.id===d.id));
ACTIONS['renew']=(el,d)=>renewModal(d.id);
ACTIONS['delete-member']=(el,d)=>{
  const m=db.members.find(x=>x.id===d.id); if(!m) return;
  confirmModal('حذف المتدرب',`هل أنت متأكد من حذف "${m.name}"؟ سيتم حذف بياناته وجميع مدفوعاته نهائياً.`,'حذف نهائي',()=>{
    db.members=db.members.filter(x=>x.id!==m.id);
    db.payments=db.payments.filter(p=>p.memberId!==m.id);
    saveDB(); refreshAll(); renderNav(); toast('تم حذف المتدرب');
  });
};
ACTIONS['edit-plan']=(el,d)=>planModal(d.id);
ACTIONS['save-prices']=()=>{
  db.settings.plans.forEach(p=>{ const el=$('#price-'+p.id); if(el) p.price=Number(el.value)||0; });
  saveDB(); renderSubscriptions(); renderSettings(); refreshAll(); toast('تم حفظ الأسعار بنجاح');
};
ACTIONS['reset-data']=()=>confirmModal('إعادة ضبط البيانات','سيتم مسح جميع التعديلات والعودة للبيانات التجريبية الأصلية.','تأكيد الإعادة',()=>{
  db=defaultDB(); saveDB(); refreshAll(); renderNav(); toast('تمت إعادة ضبط البيانات');
});
ACTIONS['contact-coach']=contactModal;
ACTIONS['export-members']=()=>exportCSV([['الاسم','الهاتف','الباقة','الحزام','البداية','النهاية','الحالة'],
  ...filteredMembers().map(m=>[m.name,m.phone,planById(m.plan).name,m.belt,m.start,m.end,statusLabel[statusOf(m)]])],'tayson-members.csv');
ACTIONS['export-payments']=()=>exportCSV([['المتدرب','الباقة','التاريخ','الطريقة','المبلغ'],
  ...filteredPayments().map(p=>[p.memberName,planById(p.plan).name,p.date,p.method,p.amount])],'tayson-payments.csv');

/* ---------- boot ---------- */
function boot(){
  db=loadDB(); saveDB();
  $('#topDate').textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
  $('#memberBelt').innerHTML='<option value="all">كل الأحزمة</option>'+BELTS.map(b=>`<option value="${b.n}">${b.n}</option>`).join('');
  $('#settingsForm').addEventListener('submit',e=>{
    e.preventDefault(); const f=new FormData(e.target);
    db.settings.name=f.get('name'); db.settings.phone=f.get('phone');
    db.settings.address=f.get('address'); db.settings.currency=f.get('currency');
    saveDB(); refreshAll(); toast('تم حفظ إعدادات الأكاديمية');
  });
  setupGlobalEvents();
  renderNav(); refreshAll(); go('dashboard');
  if(hasGSAP){
    const tl=gsap.timeline();
    tl.from('.sidebar',{x:110,autoAlpha:0,duration:.65,ease:'power3.out'})
      .from('.topbar',{y:-28,autoAlpha:0,duration:.5,ease:'power3.out'},'-=.38');
    const track=$('#tickerTrack');
    gsap.to(track,{x:-(track.scrollWidth/2),duration:30,ease:'none',repeat:-1});
    const hero=$('.hero');
    if(hero) hero.addEventListener('mousemove',e=>{
      const r=hero.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      gsap.to(hero,{backgroundPosition:`${50+x*7}% ${38+y*7}%`,duration:.9,ease:'power2.out'});
    });
  }
}
document.addEventListener('DOMContentLoaded',boot);
