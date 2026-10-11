import { defaults, options, restoreDesign, validateDesign, designQuery, summary, STORAGE_KEY } from './state.js';
import { drawFallback } from './floor.js';
import { openQuote } from './app.js';
let saved;
try { saved=JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { saved=null; }
let design=restoreDesign(location.search,saved);
const scene=document.querySelector('#scene'),fallback=document.querySelector('#fallback-canvas'),status=document.querySelector('#scene-status');
let room=null,forced2d=new URLSearchParams(location.search).get('view')==='2d',failed=false;
const titles={wall:'Seina toon',furniture:'Mööbli toon',floor:'Parketi näidistoon',pattern:'Paigaldusmuster',finish:'Viimistlus'};
document.querySelector('#design-options').innerHTML=Object.entries(options).sort(([a],[b])=>['floor','pattern','finish','wall','furniture'].indexOf(a)-['floor','pattern','finish','wall','furniture'].indexOf(b)).map(([key,items],index)=>`<fieldset id="design-step-${index}" data-step="${index}"><legend>${titles[key]}</legend><div class="${items[0].color?'swatches '+(key==='floor'?'floor-swatches':''):'option-row'}">${items.map(o=>`<button type="button" data-key="${key}" data-value="${o.id}" aria-pressed="false" ${o.color?`class="swatch-button" style="--swatch:${o.color}" title="${o.name}"><span class="swatch" aria-hidden="true"></span><span class="swatch-name">${o.name}</span>`:`class="option-button">${o.name}`} </button>`).join('')}</div></fieldset>`).join('');
const steps=['Parkett','Muster','Viimistlus','Seinad','Mööbel','Mõõdud'];
let currentStep=0;
const mobile=matchMedia('(max-width: 900px)');
document.querySelector('#design-steps').innerHTML=steps.map((name,i)=>`<button type="button" role="tab" id="step-tab-${i}" aria-controls="${i===5?'design-dimensions':'design-step-'+i}" data-step-tab="${i}">${i+1}. ${name}</button>`).join('');
function selectStep(index, focus=false) {
  currentStep=Math.max(0,Math.min(steps.length-1,index));
  document.querySelectorAll('[data-step]').forEach(panel=>{
    panel.hidden=mobile.matches && Number(panel.dataset.step)!==currentStep;
    if(mobile.matches){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','step-tab-'+panel.dataset.step);}
    else {panel.removeAttribute('role');panel.removeAttribute('aria-labelledby');}
  });
  document.querySelectorAll('[data-step-tab]').forEach(tab=>{
    const selected=Number(tab.dataset.stepTab)===currentStep;
    tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;
    if(selected && mobile.matches){tab.scrollIntoView({block:'nearest',inline:'nearest'});if(focus)tab.focus();}
  });
  document.querySelector('#design-step-status').textContent=`Samm ${currentStep+1} / ${steps.length} · ${steps[currentStep]}`;
  document.querySelector('#previous-step').disabled=currentStep===0;
  document.querySelector('#next-step').disabled=currentStep===steps.length-1;
}
document.querySelectorAll('[data-step-tab]').forEach(tab=>{
  tab.addEventListener('click',()=>selectStep(Number(tab.dataset.stepTab)));
  tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();selectStep(e.key==='Home'?0:e.key==='End'?5:currentStep+(e.key==='ArrowRight'?1:-1),true);}});
});
document.querySelector('#previous-step').addEventListener('click',()=>selectStep(currentStep-1,true));
document.querySelector('#next-step').addEventListener('click',()=>selectStep(currentStep+1,true));
mobile.addEventListener('change',()=>selectStep(currentStep));selectStep(0);
const presets={light:{floor:'light',pattern:'straight',wall:'ivory',furniture:'cream',finish:'matte'},natural:{floor:'natural',pattern:'herringbone',wall:'sand',furniture:'cream',finish:'matte'},contrast:{floor:'walnut',pattern:'chevron',wall:'sage',furniture:'terracotta',finish:'satin'}};
document.querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>{design=validateDesign({...design,...presets[btn.dataset.preset]});display();}));
function display() {
  document.querySelectorAll('[data-key]').forEach(btn=>btn.setAttribute('aria-pressed',String(design[btn.dataset.key]===btn.dataset.value)));
  document.querySelector('#room-width').value=design.width;document.querySelector('#room-length').value=design.length;
  document.querySelector('#design-summary').textContent=summary(design);
  document.querySelectorAll('[data-preset]').forEach(btn=>btn.setAttribute('aria-pressed',String(Object.entries(presets[btn.dataset.preset]).every(([key,value])=>design[key]===value))));
  drawFallback(fallback,design);room?.update(design);
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(design));}catch{}
  scene.classList.toggle('is-3d',Boolean(room)&&!forced2d&&!failed);
  document.querySelector('#toggle-2d').setAttribute('aria-pressed',String(forced2d));
  status.textContent=failed?'3D pole saadaval · toimiv 2D eelvaade':forced2d?'2D eelvaade':room?'3D elutuba · illustratiivne disain':'2D eelvaade · 3D vaade laadib…';
}
document.querySelectorAll('[data-key]').forEach(btn=>btn.addEventListener('click',()=>{design=validateDesign({...design,[btn.dataset.key]:btn.dataset.value});display();}));
for(const key of ['width','length'])document.querySelector('#room-'+key).addEventListener('change',e=>{design=validateDesign({...design,[key]:e.target.value});display();});
document.querySelector('#reset-design').addEventListener('click',()=>{design={...defaults};selectStep(0);history.replaceState(null,'',location.pathname);display();room?.view('perspective');});
document.querySelector('#toggle-2d').addEventListener('click',()=>{forced2d=!forced2d;display();});
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>room?.view(btn.dataset.view)));
document.querySelector('#camera-reset').addEventListener('click',()=>room?.view('perspective'));
document.querySelector('#design-quote').addEventListener('click',()=>openQuote({design}));
document.querySelector('#share-design').addEventListener('click',async()=>{
  const url=new URL(location.href);url.search=designQuery(design);url.hash='';
  const input=document.querySelector('#share-link');input.value=url.href;
  document.querySelector('#share-link-label').hidden=false;
  if(mobile.matches && navigator.share){try{await navigator.share({title:'Minu põrandadisain',url:url.href});document.querySelector('#share-status').textContent='Disaini jagamine avatud.';return;}catch(e){if(e.name==='AbortError')return;}}
  try{await navigator.clipboard.writeText(url.href);document.querySelector('#share-status').textContent='Disaini link on kopeeritud.';}
  catch{document.querySelector('#share-status').textContent='Kopeeri disaini link allolevalt väljalt.';input.select();}
});
new ResizeObserver(()=>drawFallback(fallback,design)).observe(scene);
display();
try {
  const {createRoom}=await import('./room3d.js');
  room=createRoom(document.querySelector('#webgl'),design,()=>{failed=true;display();});
  display();
} catch {failed=true;display();}
