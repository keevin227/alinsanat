'use strict';
let lang = 'fa';
const plans = {
 A: { fa: 'تأمین صنعت', en: 'Tamin Sanat', price: 70 },
 B: { fa: 'رشد وب و جست‌وجو', en: 'Web & search growth', price: 130 },
 C: { fa: 'برند ماندگار', en: 'A lasting brand', price: 150 },
 D: { fa: 'فروش هوشمند', en: 'Intelligent sales', price: 150 }
};
const selected = new Set();
const get = id => document.getElementById(id);
const L = (fa, en) => lang === 'fa' ? fa : en;
const fmt = n => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 2 }).format(n);
const faD = s => String(s).replace(/[0-9]/g, n => '۰۱۲۳۴۵۶۷۸۹'[n]);
const fixedTotal = () => [...selected].reduce((sum, id) => sum + plans[id].price, 0);
let previousTotal = 0;
function estimate() {
 const raw = get('sales').value, sales = Number(raw);
 const valid = raw !== '' && Number.isFinite(sales) && sales >= 0;
 get('sales').setCustomValidity(raw !== '' && !valid ? L('درآمد باید عددی غیرمنفی باشد.', 'Revenue must be a nonnegative number.') : '');
 get('estimate').textContent = valid ? L(`برآورد کل ماهانه: ${fmt(fixedTotal() + sales * .3)} میلیون تومان؛ شامل ${fmt(sales * .3)} میلیون سهم فروش.`, `Estimated monthly total: ${fmt(fixedTotal() + sales * .3)} million toman, including ${fmt(sales * .3)} million sales share.`) : '';
}
function render(animate = false) {
 document.querySelectorAll('[data-select]').forEach(button => {
  const active = selected.has(button.dataset.select);
  button.setAttribute('aria-pressed', String(active));
  button.textContent = active ? L('انتخاب شد ✓', 'Selected ✓') : L('افزودن به ترکیب ＋', 'Add to mix +');
  button.closest('.plan').classList.toggle('selected', active);
 });
 const total = fixedTotal(), delta = total - previousTotal;
 get('total').textContent = get('summary-total').textContent = fmt(total);
 get('delta').className = 'chip' + (animate && delta ? delta > 0 ? ' up' : ' down' : '');
 get('delta').textContent = delta ? `${delta > 0 ? '+' : '−'}${fmt(Math.abs(delta))} ${L('میلیون', 'million')}` : '';
 previousTotal = total;
 get('growth-ring').style.setProperty('--p', selected.size * 25);
 get('growth-percent').textContent = fmt(selected.size * 25) + L('٪', '%');
 get('progress-caption').textContent = L(`${fmt(selected.size)} از ۴ اهرم فعال`, `${selected.size} of 4 levers active`);
 const levelsFa = ['آماده شروع رشد', 'اولین قدم رشد', 'رشد متصل', 'شتاب‌گیری کسب‌وکار', 'اکوسیستم کامل رشد'];
 const levelsEn = ['Ready to grow', 'First growth step', 'Connected growth', 'Business acceleration', 'Complete growth ecosystem'];
 get('level').textContent = L(levelsFa[selected.size], levelsEn[selected.size]);
 get('level-description').textContent = selected.size ? L('ترکیب منتخب شما برای همکاری.', 'Your selected partnership mix.') : L('اولین اهرم رشد را انتخاب کنید.', 'Choose your first growth lever.');
 document.querySelectorAll('[data-stage]').forEach(row => {
  const active = selected.has(row.dataset.stage);
  row.classList.toggle('done', active);
  row.querySelector('.st').textContent = active ? '✓' : row.dataset.stage;
  row.querySelector('.tg').textContent = active ? L('فعال', 'Active') : L('انتخاب نشده', 'Not selected');
 });
 get('selected-list').replaceChildren();
 if (!selected.size) get('selected-list').textContent = L('هنوز پلنی انتخاب نشده است.', 'No plans selected yet.');
 Object.keys(plans).filter(id => selected.has(id)).forEach(id => {
  const row = document.createElement('div'); row.className = 'kv';
  const title = document.createElement('span'); title.textContent = `${id} · ${plans[id][lang]}`;
  const price = document.createElement('span'); price.textContent = `${fmt(plans[id].price)} ${L('میلیون', 'M')}`;
  row.append(title, price); get('selected-list').append(row);
 });
 ['revenue-note', 'sales-label', 'sales', 'estimate'].forEach(id => { get(id).hidden = !selected.has('A'); });
 get('revenue-note').textContent = L('به‌علاوه ۳۰٪ از درآمد فروش تأمین صنعت', 'Plus 30% of Tamin Sanat sales revenue');
 get('share-top').textContent = selected.has('A') ? L('+ ۳۰٪ درآمد فروش تأمین صنعت', '+ 30% of Tamin Sanat sales revenue') : L('بدون سهم فروش در این ترکیب', 'No sales share in this mix');
 get('copy').disabled = !selected.size;
 get('feedback').textContent = '';
 estimate();
}
document.querySelectorAll('[data-select]').forEach(button => button.addEventListener('click', () => {
 const id = button.dataset.select;
 if (selected.has(id)) selected.delete(id); else selected.add(id);
 render(true);
}));
get('reset').addEventListener('click', () => { selected.clear(); get('sales').value = ''; render(true); });
get('sales').addEventListener('input', estimate);
get('copy').addEventListener('click', async () => {
 const lines = [L('پیشنهاد همکاری بازرگانی برومند', 'Boroumand Trading partnership proposal'), ...Object.keys(plans).filter(id => selected.has(id)).map(id => `${id}: ${plans[id][lang]} — ${fmt(plans[id].price)} ${L('میلیون تومان ماهانه', 'million toman per month')}`), L(`جمع ثابت ماهانه: ${fmt(fixedTotal())} میلیون تومان`, `Fixed monthly total: ${fmt(fixedTotal())} million toman`)];
 if (selected.has('A')) { lines.push(L('به‌علاوه ۳۰٪ از درآمد فروش تأمین صنعت؛ مبنای درآمد در قرارداد تعیین می‌شود.', 'Plus 30% of Tamin Sanat sales revenue; the revenue basis is agreed in the contract.')); if (get('estimate').textContent) lines.push(get('estimate').textContent); }
 lines.push(L('اهداف آگاهی برند، روش سنجش و شرایط جبران پیش از اجرا در قرارداد توافق می‌شوند.', 'Brand-awareness targets, measurement and remedies are agreed in the contract before work begins.'));
 try { await navigator.clipboard.writeText(lines.join('\n')); get('feedback').textContent = L('خلاصه پیشنهاد کپی شد.', 'Proposal summary copied.'); }
 catch { const field = document.createElement('textarea'); field.value = lines.join('\n'); field.setAttribute('aria-label', L('خلاصه برای کپی دستی', 'Summary for manual copying')); field.style.width = '100%'; get('feedback').replaceChildren(field); field.focus(); field.select(); }
});
// Original BuildEasy chapter navigation, adapted only to the proposal's menus.
const CH = [['intro','مقدمه','Overview'],['business','کسب‌وکار','Business'],['value','مسیر رشد','Growth'],['services','خدمات','Services'],['demo','پلن‌ها','Plans'],['commitment','تعهد','Commitment'],['roadmap','اجرا','Delivery'],['sources','منابع','Sources'],['download','PDF','PDF']];
function buildNav() {
 const fa = lang === 'fa', N = i => { const t = String(i + 1).padStart(2, '0'); return fa ? faD(t) : t; };
 get('tabs').innerHTML = CH.map(([id,f,e],i) => `<a href="#${id}" data-i="${i}">${fa ? f : e}</a>`).join('');
 CH.forEach(([id],i) => {
  const sec = get(id); if (!sec) return; sec.dataset.ch = i;
  const k = sec.querySelector('.kicker'); if (!k) return;
  k.querySelectorAll('.nd,.chn').forEach(x => x.remove());
  k.insertAdjacentHTML('afterbegin', `<i class="nd"></i><span class="chn">${N(i)}</span>`);
 });
 spy();
}
function spy() {
 const y = innerHeight * .4; let cur = 0;
 CH.forEach(([id],i) => { const e = get(id); if (e && e.getBoundingClientRect().top < y) cur = i; });
 CH.forEach(([id],i) => get(id)?.classList.toggle('on', i === cur));
 document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('on', +a.dataset.i === cur));
}
addEventListener('scroll', spy, { passive: true }); addEventListener('resize', spy);
function setLang(l) { lang = l; document.body.className = l; document.documentElement.lang = l; document.documentElement.dir = l === 'fa' ? 'rtl' : 'ltr'; render(); buildNav(); }
function setTheme(t) {
 document.documentElement.dataset.theme = t;
 try { localStorage.setItem('boroumand-theme', t); } catch {}
 document.querySelectorAll('#themes button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
}
document.querySelectorAll('#themes button').forEach(b => b.onclick = () => setTheme(b.dataset.t));
// Start in the requested original dark theme on every visit; other original modes remain available.
setTheme('dark');
setLang('fa');
