import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:process.env.BROWSER_PATH || '/usr/bin/chromium',args:['--no-sandbox'],headless:true});
try {
  const page=await browser.newPage({viewport:{width:360,height:800},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/vali-disain/?view=2d');
  await page.locator('[data-preset=contrast]').click();
  assert.equal(await page.locator('[data-key=floor][data-value=walnut]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-step-tab="1"]').click();
  await page.locator('[data-key=pattern][data-value=straight]').click();
  assert.ok((await page.locator('#design-summary').textContent()).includes('Sirge laud'));
  const scene=await page.locator('#scene').boundingBox();
  assert.ok(scene.y>=0 && scene.y+scene.height<800,'preview stays visible while choosing');
  await page.locator('#next-step').click();
  assert.equal(await page.locator('[data-step-tab="2"]').getAttribute('aria-selected'),'true');
  await page.locator('[data-key=finish][data-value=matte]').click();
  await page.locator('[data-step-tab="5"]').click();
  await page.locator('#room-width').fill('6.2');await page.locator('#room-width').press('Tab');
  await page.reload();
  await page.locator('[data-step-tab="5"]').click();
  assert.equal(await page.locator('#room-width').inputValue(),'6.2');
  await page.evaluate(()=>Object.defineProperty(navigator,'share',{value:undefined,configurable:true}));
  await page.locator('#share-design').click();
  const shared=await page.locator('#share-link').inputValue();assert.ok(shared.includes('width=6.2'));
  await page.goto(shared+'&view=2d');
  assert.ok((await page.locator('#design-summary').textContent()).includes('Sirge laud'));
  await page.locator('#design-quote').click();assert.ok((await page.locator('textarea[name=design]').inputValue()).includes('Sirge laud'));await page.keyboard.press('Escape');
  await page.locator('#reset-design').click();assert.equal(await page.locator('[data-step-tab="0"]').getAttribute('aria-selected'),'true');
  await page.screenshot({path:'test-results/design-mobile-steps.png',fullPage:true});
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    for(const route of ['','meist','hinnakiri','tehtud-tood','vali-disain','parketi-paigaldus','laminaadi-paigaldus','parketi-parandus','privaatsuspoliitika']) {
      await page.goto('http://127.0.0.1:4173/'+(route?route+'/':''));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${route}: overflow`);
      await page.evaluate(()=>document.querySelectorAll('img[src]').forEach(i=>i.loading='eager'));
      await page.waitForFunction(()=>Array.from(document.querySelectorAll('img[src]')).every(i=>i.complete&&i.naturalWidth>0));
      assert.ok(await page.locator('script[type="application/ld+json"]').evaluate(el=>Boolean(JSON.parse(el.textContent)['@graph'])));
    }
  }
  assert.deepEqual(errors,[]);
  console.log('Telefon: sammud, kiirvalikud, nähtav eelvaade, salvestus, jagamine ja päring korras. 9 lehte kontrollitud 320–1440 px, pildid ja JSON-LD laevad.');
} finally { await browser.close(); }
