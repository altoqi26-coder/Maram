/* إنجاز — خطة ١٢ أسبوعاً
 * تطبيق ويب يعمل دون خادم: البيانات تُحفظ في المتصفح (localStorage).
 */
'use strict';

// ---------- ثوابت ----------
const KEY = 'injaz:v1';
const WEEKS = 12;
const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY_SHORT = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const ICS_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const SMART = [
  ['s', 'محدد', 'هدف واضح ومباشر، بعيد عن الغموض'],
  ['m', 'قابل للقياس', 'يرتكز على عدد أو نسبة لمتابعة الأداء'],
  ['a', 'قابل للإنجاز', 'منطقي وغير مستحيل (قد يتطلب مهارة أو تغيير عادة)'],
  ['r', 'ذو صلة', 'مرتبط برؤيتك وغير عشوائي (ابتعد عن التشعب)'],
  ['t', 'مرتبط بزمن', 'له موعد نهائي يخلق حاجة ملحّة لتحقيقه'],
];
const DEFAULT_AREAS = [
  { name: 'ديني', vision: 'رضا الله', icon: '🕌', color: '#0f766e' },
  { name: 'اجتماعي', vision: 'علاقات أسرية واجتماعية متينة', icon: '🤝', color: '#7c3aed' },
  { name: 'صحي', vision: 'جسم صحي ونشيط', icon: '💪', color: '#16a34a' },
  { name: 'مالي', vision: 'استقرار مالي ونمو في الدخل', icon: '💰', color: '#d97706' },
  { name: 'علمي', vision: 'تعلّم مستمر وتنمية المهارات', icon: '📚', color: '#2563eb' },
];
// النموذج الوارد في ملف «خطة ١٢ أسبوعاً»
const SAMPLE = {
  'ديني': [
    ['حفظ القرآن الكريم', [['وقت محدد للحفظ', [0, 1, 2, 3, 4, 5, 6], '05:30']]],
    ['الذكر (تلاوة + أذكار)', [['أذكار الصباح والمساء', [0, 1, 2, 3, 4, 5, 6], '06:00']]],
    ['التبكير لأداء الصلوات', [['النوم مبكراً', [0, 1, 2, 3, 4, 5, 6], '22:00'], ['الاستيقاظ مبكراً', [0, 1, 2, 3, 4, 5, 6], '04:30']]],
  ],
  'اجتماعي': [
    ['بر الوالدين', [['زيارة أو اتصال بالوالدين', [0, 1, 2, 3, 4, 5, 6], '']]],
    ['صلة الرحم', [['التواصل مع الأقارب', [5], '']]],
    ['الأسرة والأصحاب', [['هدية شهرية', [5], '']]],
  ],
  'صحي': [
    ['نظام غذائي', [['عدم أكل الوجبات المعلّبة', [0, 1, 2, 3, 4, 5, 6], ''], ['الإكثار من شرب الماء', [0, 1, 2, 3, 4, 5, 6], '10:00']]],
    ['تمارين رياضية', [['المشي ٣٠ دقيقة يومياً', [0, 1, 2, 3, 4, 5, 6], '17:00']]],
  ],
  'مالي': [
    ['مضاعفة الدخل', [['دورات تدريبية', [1, 3], ''], ['خدمة التصميم', [0, 2, 4], '']]],
    ['ادخار ٢٠٪ من الراتب', [['تحويل ٢٠٪ للادخار عند استلام الراتب', [0], '']]],
  ],
  'علمي': [
    ['تنمية المهارات', [['التدرّب يومياً', [0, 1, 2, 3, 4], '20:00']]],
    ['قراءة الكتب (ومنها الفقهية)', [['القراءة يومياً ١٠ صفحات', [0, 1, 2, 3, 4, 5, 6], '21:00']]],
  ],
};

// ---------- أدوات التاريخ ----------
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const sundayOf = (d) => addDays(d, -d.getDay());
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtDate = (d) => d.toLocaleDateString('ar-SA-u-ca-gregory-nu-arab', { day: 'numeric', month: 'short' });
const fmtFull = (d) => d.toLocaleDateString('ar-SA-u-ca-gregory-nu-arab', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const ar = (n) => Number(n).toLocaleString('ar-SA-u-nu-arab');
const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- الحالة ----------
function freshState() {
  return {
    settings: {
      name: '',
      startDate: ymd(sundayOf(today())),
      morningTime: '07:00',
      reminderTime: '21:00',
      reviewDay: 5, // الجمعة
      notify: false,
    },
    areas: DEFAULT_AREAS.map((a) => ({ id: uid(), ...a })),
    goals: [],   // {id, areaId, title, target, smart:{s,m,a,r,t}}
    means: [],   // {id, goalId, title, days:[0..6], time:'HH:MM'|''}
    log: {},     // {'YYYY-MM-DD': {meanId: true}}
    notes: {},   // {'YYYY-MM-DD': 'نص'}
    reviews: {}, // {weekNo: {achieved, obstacles, lessons, rating}}
    sent: { date: '', keys: [] },
  };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || freshState(); } catch { S = freshState(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('تعذّر الحفظ: ' + e.message); } };

let tab = 'today';
let selWeek = null;

// ---------- حسابات الخطة ----------
const planStart = () => parse(S.settings.startDate);
const planEnd = () => addDays(planStart(), WEEKS * 7 - 1);
const weekStart = (w) => addDays(planStart(), (w - 1) * 7);
function weekOf(d) {
  const diff = Math.floor((d - planStart()) / 86400000);
  return Math.floor(diff / 7) + 1;
}
const currentWeek = () => Math.min(Math.max(weekOf(today()), 1), WEEKS);
const isDone = (key, id) => !!(S.log[key] && S.log[key][id]);
const meansOn = (d) => S.means.filter((m) => m.days.includes(d.getDay()));
const goalById = (id) => S.goals.find((g) => g.id === id);
const areaById = (id) => S.areas.find((a) => a.id === id);
const areaOfMean = (m) => areaById(goalById(m.goalId)?.areaId);

// يحسب المنجز والمطلوب في مدى من الأيام (اختيارياً حتى اليوم فقط، ولمجموعة وسائل)
function tally(from, to, { untilToday = false, filter = () => true } = {}) {
  let done = 0, total = 0;
  const last = untilToday && today() < to ? today() : to;
  for (let d = new Date(from); d <= last; d = addDays(d, 1)) {
    const k = ymd(d);
    for (const m of meansOn(d)) {
      if (!filter(m)) continue;
      total++;
      if (isDone(k, m.id)) done++;
    }
  }
  return { done, total, p: pct(done, total) };
}
const weekTally = (w, opts) => tally(weekStart(w), addDays(weekStart(w), 6), opts);

function streak() {
  // عدد الأيام المتتالية التي أُنجز فيها كل المطلوب
  let n = 0;
  let d = today();
  const t = tally(d, d);
  if (t.total && t.done < t.total) d = addDays(d, -1); // اليوم لم ينتهِ بعد
  while (d >= planStart()) {
    const x = tally(d, d);
    if (!x.total) { d = addDays(d, -1); continue; }
    if (x.done < x.total) break;
    n++; d = addDays(d, -1);
  }
  return n;
}

// ---------- واجهة: أدوات ----------
const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 2600);
}
function bar(p) { return `<div class="progress"><i style="width:${p}%"></i></div>`; }

function openDialog(title, body, onOk, okLabel = 'حفظ') {
  const dlg = $('#dlg');
  $('#dlgTitle').textContent = title;
  $('#dlgBody').innerHTML = body;
  $('#dlgOk').textContent = okLabel;
  dlg.onclose = () => {
    if (dlg.returnValue === 'ok') { onOk($('#dlgForm')); save(); render(); }
    dlg.returnValue = '';
  };
  dlg.showModal();
  const first = $('#dlgBody input, #dlgBody textarea, #dlgBody select');
  if (first) first.focus();
}
function confirmBox(msg, onYes) {
  openDialog('تأكيد', `<p>${esc(msg)}</p>`, onYes, 'نعم، متابعة');
}

// ---------- العرض الرئيس ----------
function render() {
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  const w = weekOf(today());
  $('#weekBadge').textContent = w < 1 ? `تبدأ الخطة ${fmtDate(planStart())}`
    : w > WEEKS ? 'انتهت الخطة — ابدأ خطة جديدة' : `الأسبوع ${ar(w)} من ${ar(WEEKS)}`;
  ({ today: renderToday, week: renderWeek, goals: renderGoals, report: renderReport, settings: renderSettings }[tab])();
  renderBanner();
}

function renderBanner() {
  const b = $('#banner');
  if (S.settings.notify && 'Notification' in window && Notification.permission === 'default') {
    b.innerHTML = 'فعّل إذن التنبيهات ليصلك التذكير بالإنجاز <button class="btn sm" id="permBtn">تفعيل</button>';
    b.hidden = false;
    $('#permBtn').onclick = askPermission;
  } else b.hidden = true;
}

// ----- اليوم -----
function renderToday() {
  const d = today();
  const k = ymd(d);
  const list = meansOn(d);
  const t = tally(d, d);
  const w = currentWeek();
  const wt = weekTally(w, { untilToday: true });
  const hello = S.settings.name ? `أهلاً ${esc(S.settings.name)} 👋` : 'أهلاً بك 👋';

  if (!S.means.length) {
    view.innerHTML = `
      <div class="card empty">
        <div class="big">🎯</div>
        <h2>ابدأ خطتك لـ ١٢ أسبوعاً</h2>
        <p>حدّد رؤيتك في كل مجال، ثم اكتب أهدافك والوسائل المعينة على تحقيقها، وتابع إنجازك يومياً.</p>
        <div class="row" style="justify-content:center">
          <button class="btn primary" id="goGoals">إضافة أهدافي</button>
          <button class="btn" id="loadSample">تحميل النموذج الجاهز</button>
        </div>
      </div>`;
    $('#goGoals').onclick = () => { tab = 'goals'; render(); };
    $('#loadSample').onclick = loadSample;
    return;
  }

  // ترتيب: غير المنجز أولاً ثم حسب الوقت
  list.sort((a, b) => (isDone(k, a.id) - isDone(k, b.id)) || (a.time || '99').localeCompare(b.time || '99'));

  view.innerHTML = `
    <div class="card">
      <div class="row between">
        <div class="grow">
          <h2>${hello}</h2>
          <div class="muted">${fmtFull(d)}</div>
          <p style="margin:.6em 0 0">أنجزت <b>${ar(t.done)}</b> من <b>${ar(t.total)}</b> مهام اليوم</p>
          <div class="muted">إنجاز الأسبوع ${ar(w)} حتى الآن: ${ar(wt.p)}٪ · 🔥 ${ar(streak())} يوم متتالٍ</div>
        </div>
        <div class="ring" style="--p:${t.p}"><b>${ar(t.p)}٪</b></div>
      </div>
    </div>
    <div class="card">
      <h2>مهام اليوم</h2>
      ${list.length ? list.map((m) => taskHTML(m, k)).join('') : '<p class="muted">لا توجد مهام مجدولة اليوم. استمتع بيومك 🌿</p>'}
    </div>
    <div class="card">
      <h2>📝 توثيق اليوم</h2>
      <textarea id="note" placeholder="ماذا أنجزت؟ ما الذي عطّلك؟ ما الذي ستحسّنه غداً؟">${esc(S.notes[k] || '')}</textarea>
      <div class="muted" id="noteState" style="margin-top:4px">يُحفظ تلقائياً</div>
    </div>`;

  view.querySelectorAll('.task').forEach((el) => {
    el.onclick = (e) => {
      if (e.target.tagName !== 'INPUT') el.querySelector('input').click();
    };
    el.querySelector('input').onchange = (e) => { setDone(k, el.dataset.id, e.target.checked); render(); };
  });
  let tm;
  $('#note').oninput = (e) => {
    clearTimeout(tm);
    tm = setTimeout(() => {
      const v = e.target.value.trim();
      if (v) S.notes[k] = e.target.value; else delete S.notes[k];
      save(); $('#noteState').textContent = 'تم الحفظ ✓';
    }, 400);
  };
}

function taskHTML(m, k) {
  const g = goalById(m.goalId); const a = areaOfMean(m);
  const done = isDone(k, m.id);
  return `<div class="task ${done ? 'done' : ''}" data-id="${m.id}">
    <input type="checkbox" ${done ? 'checked' : ''} aria-label="${esc(m.title)}">
    <div class="grow">
      <div class="t-title">${esc(m.title)}</div>
      <div class="t-meta">${a ? `${a.icon} ${esc(a.name)} · ` : ''}${esc(g?.title || '')}</div>
    </div>
    ${m.time ? `<span class="chip">⏰ ${m.time}</span>` : ''}
  </div>`;
}

function setDone(k, id, val) {
  S.log[k] = S.log[k] || {};
  if (val) S.log[k][id] = true; else delete S.log[k][id];
  if (!Object.keys(S.log[k]).length) delete S.log[k];
  save();
  if (val) {
    const t = tally(parse(k), parse(k));
    if (t.total && t.done === t.total) toast('🎉 رائع! أنجزت كل مهام اليوم');
  }
}

// ----- الأسبوع (جدول المتابعة كما في النموذج) -----
function renderWeek() {
  const cw = currentWeek();
  if (selWeek == null) selWeek = cw;
  const w = selWeek;
  const ws = weekStart(w);
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const tk = ymd(today());
  const wt = weekTally(w);
  const rv = S.reviews[w] || {};

  const strip = [...Array(WEEKS)].map((_, i) => {
    const n = i + 1;
    return `<button data-w="${n}" class="${n === w ? 'sel' : ''} ${n === cw ? 'cur' : ''}" title="${ar(weekTally(n).p)}٪">${ar(n)}</button>`;
  }).join('');

  let rows = '';
  for (const a of S.areas) {
    for (const g of S.goals.filter((x) => x.areaId === a.id)) {
      const ms = S.means.filter((m) => m.goalId === g.id);
      if (!ms.length) continue;
      rows += `<tr class="goal-row"><td colspan="9">${a.icon} ${esc(g.title)}</td></tr>`;
      for (const m of ms) {
        let done = 0, total = 0;
        const cells = days.map((d) => {
          const k = ymd(d);
          const tcls = k === tk ? 'today-col' : '';
          if (!m.days.includes(d.getDay())) return `<td class="off ${tcls}">—</td>`;
          total++; const c = isDone(k, m.id); if (c) done++;
          return `<td class="${tcls}"><input type="checkbox" data-k="${k}" data-id="${m.id}" ${c ? 'checked' : ''}></td>`;
        }).join('');
        rows += `<tr><td class="name">${esc(m.title)}<small>الوسيلة لتحقيق الهدف</small></td>${cells}<td><b>${ar(pct(done, total))}٪</b></td></tr>`;
      }
    }
  }

  view.innerHTML = `
    <div class="card">
      <div class="row between">
        <h2>خطة ١٢ أسبوعاً — الأسبوع ${ar(w)}</h2>
        <span class="muted">من ${fmtDate(ws)} إلى ${fmtDate(days[6])}</span>
      </div>
      <div class="weeks-strip">${strip}</div>
      <div class="row"><span class="grow">${bar(wt.p)}</span><b>${ar(wt.p)}٪</b></div>
      <div class="muted">نسبة إنجاز الأسبوع: ${ar(wt.done)} من ${ar(wt.total)}</div>
    </div>
    <div class="card">
      ${rows ? `<div class="table-wrap"><table class="week">
        <thead><tr><th>الوسائل</th>${days.map((d) => `<th>${DAY_SHORT[d.getDay()]}<br><small>${fmtDate(d)}</small></th>`).join('')}<th>نسبة الإنجاز</th></tr></thead>
        <tbody>${rows}</tbody></table></div>` : '<p class="muted">أضف أهدافاً ووسائل من تبويب «الأهداف» لتظهر هنا.</p>'}
    </div>
    <div class="card">
      <h2>🔁 المراجعة الأسبوعية</h2>
      <p class="muted">راجع نفسك في حال التقصير، وعوّض ما فاتك من إنجاز.</p>
      <label class="field"><span>ما الذي أنجزته هذا الأسبوع؟</span><textarea data-r="achieved">${esc(rv.achieved || '')}</textarea></label>
      <label class="field"><span>ما العوائق التي واجهتك؟</span><textarea data-r="obstacles">${esc(rv.obstacles || '')}</textarea></label>
      <label class="field"><span>كيف ستعوّض وتتحسّن الأسبوع القادم؟</span><textarea data-r="lessons">${esc(rv.lessons || '')}</textarea></label>
      <label class="field"><span>تقييمك للأسبوع</span>
        <select data-r="rating">${['', '١ ⭐', '٢ ⭐⭐', '٣ ⭐⭐⭐', '٤ ⭐⭐⭐⭐', '٥ ⭐⭐⭐⭐⭐'].map((l, i) => `<option value="${i || ''}" ${String(rv.rating || '') === String(i || '') ? 'selected' : ''}>${l || '— اختر —'}</option>`).join('')}</select>
      </label>
      <button class="btn primary" id="saveReview">حفظ المراجعة</button>
    </div>`;

  view.querySelectorAll('.weeks-strip button').forEach((b) => (b.onclick = () => { selWeek = +b.dataset.w; render(); }));
  view.querySelectorAll('table.week input').forEach((i) => (i.onchange = () => { setDone(i.dataset.k, i.dataset.id, i.checked); render(); }));
  $('#saveReview').onclick = () => {
    const r = {};
    view.querySelectorAll('[data-r]').forEach((el) => { if (el.value.trim()) r[el.dataset.r] = el.value; });
    if (Object.keys(r).length) S.reviews[w] = { ...r, savedAt: new Date().toISOString() }; else delete S.reviews[w];
    save(); toast('تم حفظ المراجعة ✓');
  };
}

// ----- الأهداف -----
function renderGoals() {
  view.innerHTML = `
    <div class="card">
      <h2>الرؤية ← الأهداف ← الوسائل</h2>
      <p class="muted" style="margin:0">صنّف أهدافك بحسب المجال الذي تنتمي إليه. عند كتابة الهدف حدّد الوسائل المعينة على تحقيقه فهي أساسية للوصول لأقصى حد.</p>
      <div class="row" style="margin-top:10px">
        <button class="btn primary" id="addGoal">+ هدف جديد</button>
        <button class="btn" id="addArea">+ مجال جديد</button>
        ${S.goals.length ? '' : '<button class="btn" id="loadSample">تحميل النموذج الجاهز</button>'}
      </div>
    </div>
    ${S.areas.map(areaHTML).join('')}`;

  $('#addGoal').onclick = () => goalDialog();
  $('#addArea').onclick = () => areaDialog();
  if ($('#loadSample')) $('#loadSample').onclick = loadSample;
  view.querySelectorAll('[data-act]').forEach((b) => {
    b.onclick = () => {
      const { act, id } = b.dataset;
      if (act === 'edit-area') areaDialog(areaById(id));
      if (act === 'del-area') delArea(id);
      if (act === 'add-goal') goalDialog(null, id);
      if (act === 'edit-goal') goalDialog(goalById(id));
      if (act === 'del-goal') confirmBox('حذف الهدف ووسائله؟', () => {
        S.means = S.means.filter((m) => m.goalId !== id);
        S.goals = S.goals.filter((g) => g.id !== id);
      });
      if (act === 'add-mean') meanDialog(null, id);
      if (act === 'edit-mean') meanDialog(S.means.find((m) => m.id === id));
      if (act === 'del-mean') confirmBox('حذف هذه الوسيلة؟', () => { S.means = S.means.filter((m) => m.id !== id); });
    };
  });
}

function areaHTML(a) {
  const goals = S.goals.filter((g) => g.areaId === a.id);
  const t = tally(planStart(), planEnd(), { untilToday: true, filter: (m) => goalById(m.goalId)?.areaId === a.id });
  return `<div class="card area" style="--c:${esc(a.color)}">
    <div class="area-head">
      <div>
        <h2>${a.icon} ${esc(a.name)}</h2>
        <div class="muted">الرؤية: ${esc(a.vision || '—')}</div>
      </div>
      <div class="row no-print">
        <button class="btn sm" data-act="add-goal" data-id="${a.id}">+ هدف</button>
        <button class="btn sm ghost" data-act="edit-area" data-id="${a.id}">✏️</button>
        <button class="btn sm ghost danger" data-act="del-area" data-id="${a.id}">🗑</button>
      </div>
    </div>
    ${t.total ? `<div class="row" style="margin-top:8px"><span class="grow">${bar(t.p)}</span><small>${ar(t.p)}٪</small></div>` : ''}
    ${goals.length ? goals.map(goalHTML).join('') : '<p class="muted">لا توجد أهداف بعد في هذا المجال (عصف ذهني: اكتب أهدافك العامة).</p>'}
  </div>`;
}

function goalHTML(g) {
  const ms = S.means.filter((m) => m.goalId === g.id);
  const smart = SMART.map(([k, l]) => `<span class="${g.smart?.[k] ? 'on' : ''}">${l}</span>`).join('');
  return `<div class="goal">
    <div class="row between">
      <div class="grow"><div class="goal-title">🎯 ${esc(g.title)}</div>
        ${g.target ? `<div class="muted">المقياس: ${esc(g.target)}</div>` : ''}
        <div class="smart">${smart}</div></div>
      <div class="row no-print">
        <button class="btn sm" data-act="add-mean" data-id="${g.id}">+ وسيلة</button>
        <button class="btn sm ghost" data-act="edit-goal" data-id="${g.id}">✏️</button>
        <button class="btn sm ghost danger" data-act="del-goal" data-id="${g.id}">🗑</button>
      </div>
    </div>
    <ul class="means">${ms.map((m) => `<li>
      <span>• ${esc(m.title)} <span class="muted">(${daysLabel(m.days)}${m.time ? ` · ⏰ ${m.time}` : ''})</span></span>
      <span class="row no-print"><button class="btn sm ghost" data-act="edit-mean" data-id="${m.id}">✏️</button><button class="btn sm ghost danger" data-act="del-mean" data-id="${m.id}">🗑</button></span>
    </li>`).join('') || '<li class="muted">أضف وسيلة واحدة على الأقل لمتابعتها يومياً.</li>'}</ul>
  </div>`;
}

function daysLabel(days) {
  if (days.length === 7) return 'يومياً';
  return [...days].sort().map((d) => DAY_SHORT[d]).join('، ');
}

function areaDialog(a) {
  openDialog(a ? 'تعديل المجال' : 'مجال جديد', `
    <label class="field"><span>اسم المجال</span><input type="text" name="name" required value="${esc(a?.name || '')}" placeholder="مثال: مهني"></label>
    <label class="field"><span>الرؤية</span><input type="text" name="vision" value="${esc(a?.vision || '')}" placeholder="ما الصورة التي تطمح إليها؟"></label>
    <div class="row">
      <label class="field grow"><span>رمز</span><input type="text" name="icon" maxlength="4" value="${esc(a?.icon || '⭐')}"></label>
      <label class="field"><span>اللون</span><input type="color" name="color" value="${esc(a?.color || '#0f766e')}"></label>
    </div>`, (f) => {
    const v = { name: f.name.value.trim(), vision: f.vision.value.trim(), icon: f.icon.value.trim() || '⭐', color: f.color.value };
    if (!v.name) return;
    if (a) Object.assign(a, v); else S.areas.push({ id: uid(), ...v });
  });
}

function delArea(id) {
  const n = S.goals.filter((g) => g.areaId === id).length;
  confirmBox(n ? `سيُحذف المجال مع ${n} هدف ووسائلها. متابعة؟` : 'حذف هذا المجال؟', () => {
    const gids = S.goals.filter((g) => g.areaId === id).map((g) => g.id);
    S.means = S.means.filter((m) => !gids.includes(m.goalId));
    S.goals = S.goals.filter((g) => g.areaId !== id);
    S.areas = S.areas.filter((a) => a.id !== id);
  });
}

function goalDialog(g, areaId) {
  const sel = g?.areaId || areaId || S.areas[0]?.id;
  if (!S.areas.length) { toast('أضف مجالاً أولاً'); return; }
  openDialog(g ? 'تعديل الهدف' : 'هدف جديد', `
    <label class="field"><span>المجال</span><select name="area">${S.areas.map((a) => `<option value="${a.id}" ${a.id === sel ? 'selected' : ''}>${a.icon} ${esc(a.name)}</option>`).join('')}</select></label>
    <label class="field"><span>الهدف</span><input type="text" name="title" required value="${esc(g?.title || '')}" placeholder="مثال: قراءة ٦ كتب خلال ١٢ أسبوعاً"></label>
    <label class="field"><span>كيف ستقيسه؟ (عدد أو نسبة)</span><input type="text" name="target" value="${esc(g?.target || '')}" placeholder="مثال: ٦ كتب / ١٠ صفحات يومياً"></label>
    <div class="field"><span style="font-weight:600">تحقّق من شروط الهدف الذكي (SMART)</span>
      <div class="check-list">${SMART.map(([k, l, d]) => `<label><input type="checkbox" name="smart_${k}" ${g?.smart?.[k] ? 'checked' : ''}><span><b>${l}:</b> <span class="muted">${d}</span></span></label>`).join('')}</div>
    </div>
    ${g ? '' : `<label class="field"><span>أول وسيلة لتحقيق الهدف (اختياري)</span><input type="text" name="mean" placeholder="مثال: القراءة يومياً ١٠ صفحات"></label>`}`,
  (f) => {
    const v = {
      areaId: f.area.value, title: f.title.value.trim(), target: f.target.value.trim(),
      smart: Object.fromEntries(SMART.map(([k]) => [k, f['smart_' + k].checked])),
    };
    if (!v.title) return;
    if (g) Object.assign(g, v);
    else {
      const ng = { id: uid(), ...v };
      S.goals.push(ng);
      const mt = f.mean?.value.trim();
      if (mt) S.means.push({ id: uid(), goalId: ng.id, title: mt, days: [0, 1, 2, 3, 4, 5, 6], time: '' });
    }
  });
}

function meanDialog(m, goalId) {
  const days = m?.days || [0, 1, 2, 3, 4, 5, 6];
  openDialog(m ? 'تعديل الوسيلة' : 'وسيلة جديدة', `
    <label class="field"><span>الوسيلة لتحقيق الهدف</span><input type="text" name="title" required value="${esc(m?.title || '')}" placeholder="مثال: المشي ٣٠ دقيقة"></label>
    <div class="field"><span style="font-weight:600">أيام التنفيذ</span>
      <div class="days-pick">${DAY_NAMES.map((n, i) => `<label><input type="checkbox" name="d${i}" ${days.includes(i) ? 'checked' : ''}>${n}</label>`).join('')}</div>
    </div>
    <label class="field"><span>وقت التنبيه (اختياري)</span><input type="time" name="time" value="${esc(m?.time || '')}"></label>`,
  (f) => {
    const v = { title: f.title.value.trim(), days: DAY_NAMES.map((_, i) => i).filter((i) => f['d' + i].checked), time: f.time.value };
    if (!v.title || !v.days.length) { toast('اكتب الوسيلة واختر يوماً واحداً على الأقل'); return; }
    if (m) Object.assign(m, v); else S.means.push({ id: uid(), goalId, ...v });
  });
}

function loadSample() {
  for (const [areaName, goals] of Object.entries(SAMPLE)) {
    let a = S.areas.find((x) => x.name === areaName);
    if (!a) { a = { id: uid(), ...DEFAULT_AREAS.find((x) => x.name === areaName) }; S.areas.push(a); }
    for (const [title, means] of goals) {
      const g = { id: uid(), areaId: a.id, title, target: '', smart: { s: true, m: false, a: true, r: true, t: true } };
      S.goals.push(g);
      for (const [mt, days, time] of means) S.means.push({ id: uid(), goalId: g.id, title: mt, days, time });
    }
  }
  save(); toast('تم تحميل النموذج، عدّله بما يناسبك'); tab = 'goals'; render();
}

// ----- التوثيق والتقارير -----
function renderReport() {
  const all = tally(planStart(), planEnd(), { untilToday: true });
  const cw = currentWeek();
  const weeks = [...Array(WEEKS)].map((_, i) => weekTally(i + 1, { untilToday: true }));
  const best = weeks.reduce((b, x, i) => (x.total && x.p > (weeks[b]?.p ?? -1) ? i : b), -1);
  const notes = Object.entries(S.notes).sort((a, b) => b[0].localeCompare(a[0]));
  const reviews = Object.entries(S.reviews).sort((a, b) => b[0] - a[0]);

  view.innerHTML = `
    <div class="card">
      <div class="row between">
        <div class="grow">
          <h2>📊 تقرير الإنجاز</h2>
          <div class="muted">من ${fmtDate(planStart())} إلى ${fmtDate(planEnd())}</div>
        </div>
        <div class="ring" style="--p:${all.p}"><b>${ar(all.p)}٪</b></div>
      </div>
      <div class="stats" style="margin-top:12px">
        <div class="stat"><b>${ar(all.done)}</b><span>مهمة منجزة</span></div>
        <div class="stat"><b>${ar(weekTally(cw, { untilToday: true }).p)}٪</b><span>إنجاز الأسبوع الحالي</span></div>
        <div class="stat"><b>🔥 ${ar(streak())}</b><span>أيام متتالية مكتملة</span></div>
        <div class="stat"><b>${best >= 0 ? ar(best + 1) : '—'}</b><span>أفضل أسبوع</span></div>
      </div>
    </div>
    <div class="card">
      <h2>الإنجاز الأسبوعي</h2>
      <div class="bars">${weeks.map((x, i) => `<div title="${ar(x.p)}٪"><small>${x.total ? ar(x.p) : ''}</small><i style="height:${x.p}%"></i>${ar(i + 1)}</div>`).join('')}</div>
    </div>
    <div class="card">
      <h2>الإنجاز حسب المجال</h2>
      ${S.areas.map((a) => {
        const t = tally(planStart(), planEnd(), { untilToday: true, filter: (m) => goalById(m.goalId)?.areaId === a.id });
        return `<div style="margin-bottom:10px"><div class="row between"><span>${a.icon} ${esc(a.name)}</span><small>${ar(t.p)}٪ (${ar(t.done)}/${ar(t.total)})</small></div>${bar(t.p)}</div>`;
      }).join('')}
    </div>
    <div class="card">
      <h2>🔁 المراجعات الأسبوعية</h2>
      ${reviews.length ? reviews.map(([w, r]) => `<div class="goal">
        <div class="row between"><b>الأسبوع ${ar(w)}</b><span>${r.rating ? '⭐'.repeat(r.rating) : ''}</span></div>
        ${r.achieved ? `<div><b>الإنجاز:</b> ${esc(r.achieved)}</div>` : ''}
        ${r.obstacles ? `<div><b>العوائق:</b> ${esc(r.obstacles)}</div>` : ''}
        ${r.lessons ? `<div><b>التحسين:</b> ${esc(r.lessons)}</div>` : ''}
      </div>`).join('') : '<p class="muted">لم تُسجَّل مراجعات بعد — من تبويب «الأسبوع».</p>'}
    </div>
    <div class="card">
      <h2>📝 سجل التوثيق اليومي</h2>
      ${notes.length ? notes.map(([k, v]) => `<div class="goal"><b>${fmtFull(parse(k))}</b> <span class="chip">${ar(tally(parse(k), parse(k)).p)}٪</span><div style="white-space:pre-wrap">${esc(v)}</div></div>`).join('') : '<p class="muted">لم تُكتب ملاحظات بعد — من تبويب «اليوم».</p>'}
    </div>
    <div class="card no-print">
      <h2>حفظ ومشاركة</h2>
      <div class="row">
        <button class="btn primary" id="printBtn">🖨️ طباعة / PDF</button>
        <button class="btn" id="csvBtn">⬇️ تصدير Excel (CSV)</button>
        <button class="btn" id="jsonBtn">💾 نسخة احتياطية</button>
        <label class="btn">📂 استعادة نسخة<input type="file" id="importFile" accept="application/json" hidden></label>
      </div>
    </div>`;

  $('#printBtn').onclick = () => window.print();
  $('#csvBtn').onclick = exportCSV;
  $('#jsonBtn').onclick = () => download(`injaz-backup-${ymd(today())}.json`, JSON.stringify(S, null, 2), 'application/json');
  $('#importFile').onchange = importJSON;
}

function download(name, text, type) {
  const blob = new Blob([text], { type: type + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function exportCSV() {
  const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const lines = [['التاريخ', 'اليوم', 'الأسبوع', 'المجال', 'الهدف', 'الوسيلة', 'منجز'].map(q).join(',')];
  const last = today() < planEnd() ? today() : planEnd();
  for (let d = planStart(); d <= last; d = addDays(d, 1)) {
    const k = ymd(d);
    for (const m of meansOn(d)) {
      const g = goalById(m.goalId); const a = areaOfMean(m);
      lines.push([k, DAY_NAMES[d.getDay()], weekOf(d), a?.name, g?.title, m.title, isDone(k, m.id) ? 'نعم' : 'لا'].map(q).join(','));
    }
  }
  download(`injaz-${ymd(today())}.csv`, '﻿' + lines.join('\r\n'), 'text/csv');
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  file.text().then((t) => {
    const data = JSON.parse(t);
    if (!data.settings || !Array.isArray(data.goals) || !Array.isArray(data.means)) throw new Error('ملف غير صالح');
    confirmBox('ستُستبدل بياناتك الحالية بالنسخة الاحتياطية. متابعة؟', () => { S = { ...freshState(), ...data }; });
  }).catch((err) => toast('تعذّرت الاستعادة: ' + err.message));
}

// ----- الإعدادات -----
function renderSettings() {
  const s = S.settings;
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  const permLabel = { granted: '✅ مفعّلة', denied: '⛔ مرفوضة من المتصفح (فعّلها من إعدادات المتصفح)', default: '⚠️ لم يُمنح الإذن بعد', unsupported: '❌ غير مدعومة في هذا المتصفح' }[perm];
  view.innerHTML = `
    <div class="card">
      <h2>الخطة</h2>
      <label class="field"><span>اسمك</span><input type="text" id="sName" value="${esc(s.name)}" placeholder="اختياري"></label>
      <label class="field"><span>تاريخ بداية الخطة (يبدأ الأسبوع يوم الأحد)</span><input type="date" id="sStart" value="${s.startDate}"></label>
      <p class="muted">تنتهي الخطة في ${fmtFull(planEnd())}.</p>
    </div>
    <div class="card">
      <h2>🔔 التنبيهات</h2>
      <label class="check-list"><label><input type="checkbox" id="sNotify" ${s.notify ? 'checked' : ''}> <span>تفعيل التنبيهات</span></label></label>
      <p class="muted">حالة إذن المتصفح: ${permLabel}</p>
      <div class="row">
        <label class="field grow"><span>☀️ تنبيه خطة اليوم</span><input type="time" id="sMorning" value="${s.morningTime}"></label>
        <label class="field grow"><span>🌙 تذكير المهام المتبقية</span><input type="time" id="sEvening" value="${s.reminderTime}"></label>
      </div>
      <label class="field"><span>🔁 يوم المراجعة الأسبوعية</span>
        <select id="sReview">${DAY_NAMES.map((n, i) => `<option value="${i}" ${+s.reviewDay === i ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <p class="muted">إضافةً لذلك يصلك تنبيه في وقت كل وسيلة حدّدت لها وقتاً.</p>
      <div class="row">
        <button class="btn primary" id="saveSettings">حفظ الإعدادات</button>
        <button class="btn" id="testNotif">تجربة تنبيه</button>
        <button class="btn" id="icsBtn">📅 إضافة التنبيهات للتقويم</button>
      </div>
      <p class="muted" style="margin-top:10px">💡 تنبيهات المتصفح تعمل والتطبيق مفتوح أو مثبّت ويعمل بالخلفية. لتنبيهات مضمونة حتى والتطبيق مغلق، استخدم «إضافة التنبيهات للتقويم» ليُنشأ ملف تقويم (ics) فيه كل مواعيدك على مدى ١٢ أسبوعاً بتنبيهات، وافتحه على جوالك.</p>
    </div>
    <div class="card">
      <h2>خطة جديدة</h2>
      <p class="muted">ابدأ ١٢ أسبوعاً جديدة مع الإبقاء على أهدافك ووسائلك، أو امسح كل شيء.</p>
      <div class="row">
        <button class="btn" id="newPlan">بدء خطة جديدة من هذا الأسبوع</button>
        <button class="btn danger" id="resetAll">مسح كل البيانات</button>
      </div>
    </div>
    <p class="muted" style="text-align:center">إنجاز · بياناتك محفوظة على جهازك فقط</p>`;

  $('#saveSettings').onclick = () => {
    const st = $('#sStart').value;
    Object.assign(s, {
      name: $('#sName').value.trim(),
      startDate: st ? ymd(sundayOf(parse(st))) : s.startDate,
      morningTime: $('#sMorning').value || '07:00',
      reminderTime: $('#sEvening').value || '21:00',
      reviewDay: +$('#sReview').value,
      notify: $('#sNotify').checked,
    });
    selWeek = null; save();
    if (s.notify) askPermission();
    toast('تم الحفظ ✓'); render();
  };
  $('#testNotif').onclick = async () => {
    await askPermission();
    notify('إنجاز 🎯', 'هكذا ستصلك تنبيهات الإنجاز. بالتوفيق!', 'test');
  };
  $('#icsBtn').onclick = exportICS;
  $('#newPlan').onclick = () => confirmBox('ستبدأ خطة ١٢ أسبوعاً جديدة من الأحد الحالي (يبقى السجل القديم محفوظاً). متابعة؟', () => {
    S.settings.startDate = ymd(sundayOf(today())); S.reviews = {}; selWeek = null;
  });
  $('#resetAll').onclick = () => confirmBox('سيتم حذف كل الأهداف والسجلات نهائياً. هل أنت متأكد؟', () => { S = freshState(); });
}

// ---------- التنبيهات ----------
let swReg = null;
async function askPermission() {
  if (!('Notification' in window)) { toast('المتصفح لا يدعم التنبيهات'); return 'unsupported'; }
  if (Notification.permission === 'default') {
    const r = await Notification.requestPermission();
    renderBanner();
    if (r === 'granted') { S.settings.notify = true; save(); }
    return r;
  }
  return Notification.permission;
}

async function notify(title, body, tag) {
  toast(`${title}: ${body}`);
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, tag, icon: 'icons/icon.svg', badge: 'icons/icon.svg', dir: 'rtl', lang: 'ar' };
  try {
    if (swReg) await swReg.showNotification(title, opts);
    else new Notification(title, opts);
  } catch { /* تجاهل */ }
}

function tick() {
  if (!S.settings.notify) return;
  const d = today(); const k = ymd(d); const now = nowHM();
  if (S.sent.date !== k) S.sent = { date: k, keys: [] };
  const once = (key, fn) => { if (!S.sent.keys.includes(key)) { S.sent.keys.push(key); save(); fn(); } };
  const w = weekOf(d);
  if (w < 1 || w > WEEKS) return;
  const list = meansOn(d);
  const left = list.filter((m) => !isDone(k, m.id));
  const st = S.settings;

  if (now >= st.morningTime && list.length) {
    once('morning', () => notify('☀️ خطة اليوم', `لديك ${ar(list.length)} مهام اليوم. ابدأ بأهمها!`, 'morning'));
  }
  for (const m of left) {
    if (m.time && now >= m.time && minutesBetween(m.time, now) <= 120) {
      once('m:' + m.id, () => notify('⏰ حان وقت الإنجاز', m.title, 'm' + m.id));
    }
  }
  if (now >= st.reminderTime) {
    if (left.length) once('evening', () => notify('🌙 لم ينتهِ يومك بعد', `بقي ${ar(left.length)} من ${ar(list.length)} مهام. عوّض ما فاتك قبل النوم!`, 'evening'));
    else if (list.length) once('evening', () => notify('🎉 أحسنت!', 'أنجزت كل مهام اليوم. وثّق إنجازك في ملاحظة اليوم.', 'evening'));
    if (d.getDay() === +st.reviewDay && !S.reviews[w]) {
      once('review', () => notify('🔁 المراجعة الأسبوعية', `حان وقت مراجعة الأسبوع ${ar(w)}: ما أنجزت؟ وما العوائق؟`, 'review'));
    }
  }
}
function minutesBetween(a, b) {
  const [h1, m1] = a.split(':').map(Number); const [h2, m2] = b.split(':').map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

// ملف تقويم بتنبيهات لكل وسيلة + التذكير اليومي + المراجعة الأسبوعية
function exportICS() {
  const fold = (line) => {
    const out = []; let cur = ''; let bytes = 0; const enc = new TextEncoder();
    for (const ch of line) {
      const b = enc.encode(ch).length;
      if (bytes + b > 73) { out.push(cur); cur = ' '; bytes = 1; }
      cur += ch; bytes += b;
    }
    out.push(cur); return out.join('\r\n');
  };
  const txt = (s) => String(s).replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const dt = (d, hm) => `${ymd(d).replace(/-/g, '')}T${hm.replace(':', '')}00`;
  const until = `${ymd(planEnd()).replace(/-/g, '')}T235959`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ev = [];
  const add = (title, desc, days, hm) => {
    let first = planStart();
    while (!days.includes(first.getDay())) first = addDays(first, 1);
    const end = hm.split(':').map(Number); const endHM = `${pad(end[0])}:${pad(Math.min(end[1] + 15, 59))}`;
    ev.push(['BEGIN:VEVENT', `UID:${uid()}-${Date.now()}@injaz`, `DTSTAMP:${stamp}`,
      `DTSTART:${dt(first, hm)}`, `DTEND:${dt(first, endHM)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${days.map((x) => ICS_DAYS[x]).join(',')};UNTIL=${until}`,
      `SUMMARY:${txt(title)}`, `DESCRIPTION:${txt(desc)}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${txt(title)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'].join('\r\n'));
  };
  for (const m of S.means) {
    if (!m.time) continue;
    const g = goalById(m.goalId); const a = areaOfMean(m);
    add(`إنجاز: ${m.title}`, `${a?.name || ''} — ${g?.title || ''}`, m.days, m.time);
  }
  const allDays = [0, 1, 2, 3, 4, 5, 6];
  add('☀️ إنجاز: خطة اليوم', 'افتح تطبيق إنجاز واطّلع على مهام اليوم', allDays, S.settings.morningTime);
  add('🌙 إنجاز: هل أنجزت مهام اليوم؟', 'سجّل إنجازك ووثّق يومك في تطبيق إنجاز', allDays, S.settings.reminderTime);
  add('🔁 إنجاز: المراجعة الأسبوعية', 'راجع أسبوعك: ما أنجزت؟ ما العوائق؟ كيف تعوّض؟', [+S.settings.reviewDay], S.settings.reminderTime);
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Injaz//12 Week Plan//AR', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:إنجاز', ...ev, 'END:VCALENDAR']
    .join('\r\n').split('\r\n').map(fold).join('\r\n');
  download('injaz-reminders.ics', ics, 'text/calendar');
  toast(`تم إنشاء ${ar(ev.length)} موعداً متكرراً بتنبيهات`);
}

// ---------- التشغيل ----------
document.querySelectorAll('.tabs button').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; window.scrollTo(0, 0); render(); }));
$('#bellBtn').onclick = () => { tab = 'settings'; render(); };

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').then((r) => { swReg = r; }).catch(() => {});
}

let lastDay = ymd(today());
setInterval(() => {
  tick();
  if (ymd(today()) !== lastDay) { lastDay = ymd(today()); render(); } // يوم جديد
}, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); render(); } });

render();
tick();
