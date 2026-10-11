import { company } from './config.js';

let captchaPromise;
let widget;
export function prepareContact() {
  if (!captchaPromise) captchaPromise = loadCaptcha().catch(error => {
    captchaPromise = null;
    throw error;
  });
  return captchaPromise;
}

async function loadCaptcha() {
  const response = await fetch(company.formEndpoint, { credentials: 'omit', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Päringute vastuvõtt pole praegu saadaval. Palun proovi hiljem uuesti.');
  const config = await response.json();
  if (config.success !== true || typeof config.captchaRequired !== 'boolean') throw new Error('Päringuvormi seadistuse laadimine ebaõnnestus.');
  if (!config.captchaRequired) return;
  if (!config.siteKey) throw new Error('Robotikontrolli seadistus puudub.');
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.onload = () => window.grecaptcha.ready(resolve);
    script.onerror = () => { script.remove(); reject(new Error('Robotikontrolli laadimine ebaõnnestus. Palun proovi uuesti.')); };
    document.head.append(script);
  });
  widget = window.grecaptcha.render('quote-captcha', { sitekey: config.siteKey, size: 'compact' });
}

export async function sendContact(form) {
  await prepareContact();
  const data = new FormData(form);
  data.set('consent', form.elements.consent.checked ? 'on' : '');
  const floor = form.elements.floor_type;
  const floorName = floor.options[floor.selectedIndex]?.textContent || '';
  data.set('design', ['Põrandakate: ' + floorName, String(data.get('design') || '')].filter(Boolean).join('\n'));

  if (widget !== undefined) {
    const token = window.grecaptcha.getResponse(widget);
    if (!token) throw new Error('Palun kinnita, et sa ei ole robot.');
    data.set('g-recaptcha-response', token);
  }
  try {
    const response = await fetch(company.formEndpoint, {
      method: 'POST', body: data, credentials: 'omit',
      headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000),
    });
    const result = await response.json();
    if (!response.ok || result.success !== true || result.db_saved !== true) {
      throw new Error(result.message || 'Päringu salvestamine ebaõnnestus. Palun proovi uuesti.');
    }
    return result.message;
  } finally {
    if (widget !== undefined) window.grecaptcha.reset(widget);
  }
}
