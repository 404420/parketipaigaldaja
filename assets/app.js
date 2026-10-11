import { company, services, patternPrices } from './config.js';
import { defaults, options, validateDesign, summary, STORAGE_KEY } from './state.js';
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav?.classList.contains('open')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.focus(); } });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reduced.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); entry.target.classList.remove('waiting'); observer.unobserve(entry.target); } }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach((el, i) => { el.classList.add('waiting'); el.style.transitionDelay = `${(i % 4) * 70}ms`; observer.observe(el); });
  // Restore visible content even if observer callbacks unexpectedly stop.
  setTimeout(() => document.querySelectorAll('.waiting').forEach(el => el.classList.remove('waiting')), 5000);
}
const quoteDialog = document.querySelector('#quote-dialog');
const imageDialog = document.querySelector('#image-dialog');
let opener;
function openDialog(dialog) { opener = document.activeElement; dialog.showModal(); document.body.classList.add('dialog-open'); }
for (const dialog of [quoteDialog, imageDialog]) {
  dialog?.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog?.addEventListener('close', () => { document.body.classList.remove('dialog-open'); opener?.focus(); });
}
const form = document.querySelector('#quote-form');
let quoteContext = null;
function savedDesign() { try { return validateDesign(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { return { ...defaults }; } }
function fullSummary(d) { return `${summary(d)}\nSeinad: ${options.wall.find(o=>o.id===d.wall).name}; mööbel: ${options.furniture.find(o=>o.id===d.furniture).name}\nNäidistoa mõõdud: ${d.width} × ${d.length} m. Toonid on illustratiivsed.`; }
export function openQuote(context = {}) {
  const d = validateDesign(context.design || savedDesign());
  quoteContext = context;
  form.elements.area.value = context.area || '';
  form.elements.design.value = context.calculatorSummary || fullSummary(d);
  form.elements.floor_type.value = context.floorType || 'laudparkett';
  form.elements.floor_tone.value = options.floor.find(o => o.id === d.floor).name;
  form.elements.pattern.value = options.pattern.find(o => o.id === d.pattern).name;
  form.elements.finish.value = options.finish.find(o => o.id === d.finish).name;
  form.elements.form_started_at.value = String(Math.floor(Date.now()/1000));
  document.querySelector('#form-status').textContent = '';
  openDialog(quoteDialog);
  form.elements.name.focus();
}
document.querySelectorAll('[data-quote]').forEach(btn=>btn.addEventListener('click', ()=>openQuote()));
form?.addEventListener('submit', async e => {
  e.preventDefault();
  const status = document.querySelector('#form-status');
  if (!form.reportValidity()) return;
  const button = form.querySelector('[type=submit]');
  button.disabled = true; status.textContent = 'Saadan hinnapäringut…';
  try {
    const data = new FormData(form);
    data.set('consent','yes');
    if (!company.formEndpoint) throw new Error('Päringute saatmise aadress pole seadistatud.');
    const response = await fetch(company.formEndpoint,{
      method:'POST',body:data,headers:{Accept:'application/json'},mode:'cors',credentials:'omit'
    });
    const result = await response.json().catch(()=>({success:false,message:'Server ei tagastanud korrektset vastust.'}));
    if(!response.ok || !result.success) throw new Error(result.message || 'Päringu saatmine ebaõnnestus.');
    status.textContent = result.message || 'Aitäh! Päring on saadetud.';
    form.reset();
  } catch (error) {
    status.textContent = (error instanceof Error ? error.message : 'Päringu saatmine ebaõnnestus.') + ' Kui probleem kordub, kirjuta info@renoveerikodu.ee.';
  } finally { button.disabled = false; }
});
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click', ()=>{
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed', String(b===btn)));
  document.querySelectorAll('.gallery-card').forEach(card=>card.hidden=btn.dataset.filter!=='all' && card.dataset.pattern!==btn.dataset.filter);
}));
document.querySelectorAll('[data-image]').forEach(btn=>btn.addEventListener('click', ()=>{
  const image = document.querySelector('#large-image'); image.src=btn.dataset.image; image.alt=btn.dataset.title;
  document.querySelector('#image-caption').textContent=btn.dataset.caption || 'Illustratiivne disaininäide';
  document.querySelector('#image-title').textContent=btn.dataset.title; openDialog(imageDialog);
}));
const calculator = document.querySelector('#calculator');
if (calculator) {
  function calculate() {
    const data = new FormData(calculator); const area = Number(data.get('area')); const pattern = String(data.get('pattern'));
    const selected = services.filter(s=>data.has(s.id));
    const rate = patternPrices[pattern];
    const valid = Number.isFinite(area) && area>=1 && area<=10000;
    const allPriced = rate!==null && selected.every(s=>s.price!==null && s.unit==='m²');
    const result = document.querySelector('#calc-result');
    result.textContent = !valid ? 'Sisesta pindala vahemikus 1–10 000 m².' : allPriced ? `${(area*(rate+selected.reduce((sum,s)=>sum+s.price,0))).toFixed(2)} € — esialgne hinnang` : `${area} m² · ${options.pattern.find(o=>o.id===pattern).name}`;
    document.querySelector('#price-rules').textContent = allPriced ? `Hinnareegel: ${rate} €/m²${selected.map(s=>` + ${s.name} ${s.price} €/m²`).join('')}.` : 'Kinnitatud hinnareeglid puuduvad. Koostame päringu hinnanumbrita; liistude maht täpsustatakse eraldi.';
    return { area, calculatorSummary: `${area} m² · ${options.pattern.find(o=>o.id===pattern).name}\nLisatööd: ${selected.map(s=>s.name).join(', ') || 'pole valitud'}\nHind täpsustatakse pakkumises.` };
  }
  calculator.addEventListener('input', calculate); calculator.addEventListener('submit', e=>{ e.preventDefault(); if(calculator.reportValidity()) openQuote(calculate()); }); calculate();
  document.querySelector('#pricing-notes').textContent = [company.vatNote, company.materialNote].filter(Boolean).join(' ') || 'Käibemaksu ja materjalide hinna käsitlus täpsustatakse pakkumises.';
}
