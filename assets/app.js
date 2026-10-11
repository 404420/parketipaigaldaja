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
/** Design selections are included only after explicit confirmation in the 3D studio. */
export function openQuote(context = {}) {
  if (!form || !quoteDialog) return;
  form.reset();
  const withDesign = Boolean(context.design);
  const design = withDesign ? validateDesign(context.design) : null;
  const hasSummary = withDesign || Boolean(context.calculatorSummary);
  const selection = document.querySelector('#request-selection');
  const selectionHeading = document.querySelector('#request-selection-heading');
  const selectionSummary = document.querySelector('#request-selection-summary');
  const typeName = context.floorTypeName || '';
  const areaText = context.area ? String(context.area).replace('.', ',') + ' m²' : '';
  let summaryText = '';
  if (withDesign) {
    const floorTone = options.floor.find(o => o.id === design.floor)?.name || '';
    const pattern = options.pattern.find(o => o.id === design.pattern)?.name || '';
    const finish = options.finish.find(o => o.id === design.finish)?.name || '';
    summaryText = [
      typeName && 'Põrandakate: ' + typeName,
      areaText && 'Paigaldatav pindala: ' + areaText,
      'Toon: ' + floorTone,
      'Muster: ' + pattern,
      'Viimistlus: ' + finish,
      '3D näidistuba: ' + design.width + ' × ' + design.length + ' m',
      'Võrdlustoonid: seinad ' + options.wall.find(o => o.id === design.wall).name
        + ', mööbel ' + options.furniture.find(o => o.id === design.furniture).name,
      'Värvid on illustratiivsed; täpne materjal kinnitatakse pakkumisel.'
    ].filter(Boolean).join('\n');
    form.elements.floor_tone.value = floorTone;
    form.elements.pattern.value = pattern;
    form.elements.finish.value = finish;
  } else if (context.calculatorSummary) {
    summaryText = context.calculatorSummary;
  }
  selection.hidden = !hasSummary;
  selectionHeading.textContent = withDesign ? 'Sinu kinnitatud 3D põrandavalik' : 'Hinnapäringu tööde valik';
  selectionSummary.textContent = summaryText;
  form.elements.design.value = summaryText;
  form.elements.floor_type.value = context.floorType || '';
  form.elements.area.value = context.area ?? '';
  form.elements.form_started_at.value = String(Math.floor(Date.now() / 1000));
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
