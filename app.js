'use strict';
const plans = { A: { title: 'تأمین صنعت', price: 70 }, B: { title: 'رشد وب و جست‌وجو', price: 130 }, C: { title: 'برند ماندگار', price: 150 }, D: { title: 'فروش هوشمند', price: 150 } };
const selected = new Set();
const fa = value => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(value);
const get = id => document.getElementById(id);
const levels = ['آماده شروع رشد', 'اولین قدم رشد', 'رشد متصل', 'شتاب‌گیری کسب‌وکار', 'اکوسیستم کامل رشد'];
function fixedTotal() { return [...selected].reduce((sum, id) => sum + plans[id].price, 0); }
function estimate() {
  const raw = get('sales').value;
  const sales = Number(raw);
  const valid = raw !== '' && Number.isFinite(sales) && sales >= 0;
  get('estimate').textContent = valid ? `برآورد کل ماهانه: ${fa(fixedTotal() + sales * 0.3)} میلیون تومان (شامل ${fa(sales * 0.3)} میلیون سهم فروش)` : '';
  get('sales').setCustomValidity(raw !== '' && !valid ? 'درآمد باید عددی غیرمنفی باشد.' : '');
}
function render() {
  document.querySelectorAll('[data-select]').forEach(button => {
    const active = selected.has(button.dataset.select);
    button.setAttribute('aria-pressed', String(active));
    button.innerHTML = active ? 'انتخاب شد <span>✓</span>' : 'افزودن به ترکیب <span>＋</span>';
    button.closest('.plan').classList.toggle('selected', active);
    button.closest('.plan').querySelector('.select-indicator').textContent = active ? '✓' : '＋';
  });
  get('total').textContent = fa(fixedTotal());
  get('level').textContent = levels[selected.size];
  get('level-description').textContent = selected.size ? 'اهرم‌های منتخب، مسیر همکاری شما را می‌سازند.' : 'اولین اهرم رشد را انتخاب کنید.';
  get('progress-caption').textContent = `${fa(selected.size)} از ۴ اهرم فعال`;
  document.querySelectorAll('.progress i').forEach((bar, i) => bar.classList.toggle('active', i < selected.size));
  get('selected-list').replaceChildren();
  if (!selected.size) get('selected-list').textContent = 'هنوز پلنی انتخاب نشده است.';
  Object.keys(plans).filter(id => selected.has(id)).forEach(id => {
    const row = document.createElement('div'); row.className = 'selected-row';
    const title = document.createElement('span'); title.textContent = `${id} · ${plans[id].title}`;
    const price = document.createElement('span'); price.textContent = `${fa(plans[id].price)} میلیون`;
    row.append(title, price); get('selected-list').append(row);
  });
  ['revenue-note', 'sales-label', 'sales', 'estimate'].forEach(id => { get(id).hidden = !selected.has('A'); });
  get('copy').disabled = !selected.size;
  get('feedback').textContent = '';
  estimate();
}
document.querySelectorAll('[data-select]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.select;
  if (selected.has(id)) selected.delete(id); else selected.add(id);
  render();
}));
get('reset').addEventListener('click', () => { selected.clear(); get('sales').value = ''; render(); });
get('sales').addEventListener('input', estimate);
get('copy').addEventListener('click', async () => {
  const lines = ['پیشنهاد همکاری بازرگانی برومند', ...Object.keys(plans).filter(id => selected.has(id)).map(id => `${id}: ${plans[id].title} — ${fa(plans[id].price)} میلیون تومان ماهانه`), `جمع ثابت ماهانه: ${fa(fixedTotal())} میلیون تومان`];
  if (selected.has('A')) { lines.push('به‌علاوه ۳۰٪ از درآمد فروش تأمین صنعت؛ مبنای درآمد در قرارداد تعیین می‌شود.'); if (get('estimate').textContent) lines.push(get('estimate').textContent); }
  lines.push('شاخص‌های تضمین آگاهی برند و شرایط جبران پیش از اجرا در قرارداد توافق می‌شوند.');
  const text = lines.join('\n');
  try { await navigator.clipboard.writeText(text); get('feedback').textContent = 'خلاصه پیشنهاد کپی شد.'; }
  catch { const field = document.createElement('textarea'); field.value = text; field.setAttribute('aria-label', 'خلاصه پیشنهاد برای کپی دستی'); get('feedback').replaceChildren(field); field.focus(); field.select(); }
});
render();
