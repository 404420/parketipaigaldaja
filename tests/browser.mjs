import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4173';
for(const path of ['/','/meist/','/hinnakiri/','/vali-disain/','/tehtud-tood/']){await page.goto(base+path);await page.locator('h1').waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'et');assert.equal(await page.locator('nav a[aria-current="page"]').count(),1);}
await page.goto(base+'/');await page.waitForTimeout(850);await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));await page.waitForFunction(()=>Array.from(document.querySelectorAll('img[src]')).every(i=>i.complete&&i.naturalWidth>0));await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
await page.goto(base+'/vali-disain/');await page.waitForFunction(()=>!document.querySelector('#scene-status').textContent.includes('laadib'),{timeout:30000});
assert.ok((await page.locator('#scene-status').textContent()).includes('3D elutuba'),'actual WebGL scene must initialize');
await page.screenshot({path:'test-results/design-desktop.png',fullPage:true});
const patterns=[];for(const pattern of ['straight','herringbone','chevron']){await page.locator(`[data-key=pattern][data-value=${pattern}]`).click();patterns.push(await page.locator('#webgl canvas').screenshot());}assert.ok(!patterns[0].equals(patterns[1])&&!patterns[1].equals(patterns[2]),'all floor patterns alter the actual rendered scene');
await page.locator('[data-key=wall][data-value=sage]').click();await page.locator('[data-key=furniture][data-value=terracotta]').click();await page.locator('[data-key=floor][data-value=walnut]').click();await page.locator('[data-key=pattern][data-value=chevron]').click();await page.locator('[data-key=finish][data-value=satin]').click();
await page.locator('#room-width').fill('6.3');await page.locator('#room-width').press('Tab');await page.reload();
assert.equal(await page.locator('[data-key=pattern][data-value=chevron]').getAttribute('aria-pressed'),'true');
assert.equal(await page.locator('#room-width').inputValue(),'6.3');await page.locator('#share-design').click();const link=await page.locator('#share-link').inputValue();
await page.goto(link);assert.equal(await page.locator('[data-key=wall][data-value=sage]').getAttribute('aria-pressed'),'true');
await page.locator('#design-quote').click();assert.ok((await page.locator('textarea[name=design]').inputValue()).includes('Chevron'));
await page.locator('[name=name]').fill('Testkasutaja');await page.locator('[name=email]').fill('test@example.com');await page.locator('[name=location]').fill('Testlinn');await page.locator('[name=consent]').check();
const downloadPromise=page.waitForEvent('download');await page.locator('#quote-form [type=submit]').click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'parketi-hinnaparing.txt');assert.ok((await page.locator('#form-status').textContent()).includes('ei saadetud'));await page.keyboard.press('Escape');
await page.goto(base+'/vali-disain/?wall=bad&width=-10&pattern=invalid&view=2d');assert.equal(await page.locator('[data-key=wall][data-value=ivory]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#room-width').inputValue(),'5');await page.locator('[data-key=floor][data-value=light]').click();await page.screenshot({path:'test-results/design-fallback.png',fullPage:true});
await page.goto(base+'/hinnakiri/');await page.locator('#calc-area').fill('47');await page.locator('#calc-pattern').selectOption('chevron');await page.locator('#calculator [type=submit]').click();assert.equal(await page.locator('#quote-form [name=area]').inputValue(),'47');await page.keyboard.press('Escape');
await page.goto(base+'/tehtud-tood/');await page.locator('[data-filter=chevron]').click();assert.equal(await page.locator('.gallery-card:visible').count(),1);await page.locator('.gallery-card:visible [data-image]').click();assert.equal(await page.locator('#image-dialog').evaluate(d=>d.open),true);await page.keyboard.press('Escape');
await page.setViewportSize({width:360,height:800});await page.emulateMedia({reducedMotion:'reduce'});
for(const path of ['/','/meist/','/hinnakiri/','/vali-disain/','/tehtud-tood/']){await page.goto(base+path);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow: ${path}`);await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.locator('nav a').first().focus();await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');}
await page.goto(base+'/');await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
await page.goto(base+'/vali-disain/');await page.waitForTimeout(800);await page.screenshot({path:'test-results/design-mobile.png',fullPage:true});
const fallbackContext=await browser.newContext();await fallbackContext.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2')return null;return original.call(this,type,...args);};});const noGL=await fallbackContext.newPage();await noGL.goto(base+'/vali-disain/');await noGL.waitForFunction(()=>document.querySelector('#scene-status').textContent.includes('pole saadaval'));await noGL.locator('[data-key=wall][data-value=blue]').click();assert.equal(await noGL.locator('[data-key=wall][data-value=blue]').getAttribute('aria-pressed'),'true');await fallbackContext.close();
assert.deepEqual(errors,[]);await browser.close();console.log('Viis marsruuti, 360 px, päris WebGL, kolm mustrit, disain, salvestus, jagamine, WebGL tõrke fallback, galerii ja päring kontrollitud.');

