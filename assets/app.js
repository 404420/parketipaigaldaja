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
function fullSummary(d) { return `${summary(d)}\nSeinad: ${options.wall.find(o=>o.id===d.wall).name}; mööbel: ${options.furniture.find(o=>o.id===d.furniture).name}\nRuumi mõõdud: ${d.width} × ${d.length} m. Toonid on illustratiivsed.`; }
export function openQuote(context = {}) {
  const d = validateDesign(context.design || savedDesign());
  quoteContext = context;
  form.elements.area.value = context.area || (d.width * d.length).toFixed(1);
  form.elements.design.value = context.calculatorSummary || fullSummary(d);
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
  button.disabled = true; status.textContent = 'Koostan päringut…';
  try {
    const data = Object.fromEntries(new FormData(form));
    if (!String(data.name).trim() || !String(data.location).trim()) throw new Error('Palun sisesta nimi ja asukoht.');
    const text = `PARKETIPAIGALDAJA.EE — HINNAPÄRING\n\nNimi: ${data.name}\nE-post: ${data.email}\nTelefon: ${data.phone || '—'}\nAsukoht: ${data.location}\nPindala: ${data.area} m²\nSoovitud aeg: ${data.timing || '—'}\n\nDisain / lähteülesanne:\n${data.design}\n\nKirjeldus:\n${data.message || '—'}\n\nEsialgne lähteülesanne, mitte siduv pakkumine. Toonid on illustratiivsed.\n`;
    // Download-only mode. No personal data is logged, persisted or sent.
    const url = URL.createObjectURL(new Blob(['\ufeff'+text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'parketi-hinnaparing.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent = 'Päringu fail on koostatud ja allalaadimine käivitatud. Päringut ei saadetud; edasta fail ise ettevõttele.';
  } catch (error) { status.textContent = error.message || 'Faili koostamine ei õnnestunud. Proovi uuesti.'; }
  finally { button.disabled = false; }
});
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click', ()=>{
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed', String(b===btn)));
  document.querySelectorAll('.gallery-card').forEach(card=>card.hidden=btn.dataset.filter!=='all' && card.dataset.pattern!==btn.dataset.filter);
}));
document.querySelectorAll('[data-image]').forEach(btn=>btn.addEventListener('click', ()=>{
  const image = document.querySelector('#large-image'); image.src=btn.dataset.image; image.alt=btn.dataset.title+' — illustratiivne inspiratsioon';
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
