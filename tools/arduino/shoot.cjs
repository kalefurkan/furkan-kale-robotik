// Kullanım: node shoot.cjs [proje-id,...]
// Yerel MakersHub (localhost:8787) üzerinde test hesabı açar, out/docs/<id>.json belgelerini proje olarak yükler,
// editörde "Sığdır" + "Simülasyonu Başlat" yapar, project.shoot eylemlerini uygular ve devre alanını 3x ölçekle
// <SITE>/assets/devre/<id>.png olarak kaydeder. Yalnızca localhost'a bağlanır.
const { createRequire } = require('module');
const MAKERLAB = process.env.MAKERLAB || '/Users/furkan/Documents/GitHub/MakerLab';
const { chromium } = createRequire(MAKERLAB + '/package.json')('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const BASE = process.env.BASE || 'http://localhost:8787';
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error('yalnızca localhost');
const SITE = process.env.SITE || path.resolve(__dirname, '../..');
const DOCS = path.join(__dirname, 'out/docs'), SHOOT = path.join(__dirname, 'out/shoot.json');
const shoot = fs.existsSync(SHOOT) ? JSON.parse(fs.readFileSync(SHOOT, 'utf8')) : {};
(async () => {
  const ids = process.argv[2] ? process.argv[2].split(',') : fs.readdirSync(DOCS).map(f => f.replace(/\.json$/, ''));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 3, locale: 'tr-TR' });
  const email = `ekran-${Date.now()}@example.test`, pw = crypto.randomUUID() + 'Aa1';
  let r = await ctx.request.post(BASE + '/api/auth/register', { data: { email, password: pw, fullName: 'Test Kullanici' } });
  if (r.status() !== 201) throw new Error('register ' + r.status());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  for (const k of ids) {
    const doc = JSON.parse(fs.readFileSync(path.join(DOCS, k + '.json'), 'utf8'));
    r = await ctx.request.post(BASE + '/api/projects', { data: { title: k, kind: 'arduino', document: doc } });
    const id = (await r.json()).id;
    await page.goto(`${BASE}/arduino/desktop.html?project=${id}`);
    await page.waitForSelector('svg', { timeout: 15000 });
    await page.waitForTimeout(800);
    await page.getByTitle('Sığdır').click();
    await page.getByText('Simülasyonu Başlat').first().click();
    const sc = shoot[k] || {};
    await page.waitForTimeout(sc.startWaitMs ?? 2200);
    for (const a of (sc.actions || [])) {
      if (a.wait) await page.waitForTimeout(a.wait);
      else if (a.waitText) await page.waitForFunction(t => (document.querySelector('[data-ar-panel="serial"]')?.textContent || '').includes(t), a.waitText, { timeout: a.timeout || 20000, polling: 20 });
      else if (a.down) await down(page, a.down, true);
      else if (a.up) await down(page, a.up, false);
      else if (a.press) await press(page, a.press, a.hold || 150);
      else if (a.keys) for (const k of a.keys.seq) { await pressKey(page, a.keys.id, k, a.keys.hold || 90); await page.waitForTimeout(a.keys.gap || 180); }
      else if (a.waitMs === undefined && a.waitLcd) await page.waitForTimeout(a.waitLcd);
      else if (a.presses) for (let i = 0; i < a.presses.n; i++) { await press(page, a.presses.id, a.presses.hold || 90); await page.waitForTimeout(a.presses.gap || 160); }
    }
    if ((sc.actions || []).some(a => a.keys || a.press || a.presses || a.down)) {
      // tıklanan parça seçili kalır (turkuaz çerçeve + sağ/sol denetçi paneli): boş bir yere tıklayıp seçimi kaldır
      await page.keyboard.press('Escape');
      const sv = await page.evaluate(() => { const r = [...document.querySelectorAll('svg')].map(s => s.getBoundingClientRect()).sort((a, b) => b.width * b.height - a.width * a.height)[0]; return { x: r.right - 14, y: r.bottom - 14 }; });
      await page.mouse.click(sv.x, sv.y);
    }
    await page.waitForTimeout(sc.settleMs ?? 400);
    if (sc.hideFlybackFrame) {
      // MakersHub doğrulayıcısı 5V'a bağlı katotlu (doğru bağlanmış) ters diyotlara yanlış "ters bağlı" uyarısı çizer (bkz. README, "MakersHub hatası").
      // audit.py bu uyarıyı yalnızca güç yolu denetimi (diyot yönü doğru) geçerse kabul eder.
      await page.addStyleTag({ content: 'svg rect[stroke-dasharray="5 3"] { display: none !important; }' });
      await page.waitForTimeout(150);
    }
    const box = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll('svg')].map(s => ({ s, r: s.getBoundingClientRect() })).sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
      const { s, r } = svgs[0]; let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
      for (const el of s.querySelectorAll('g, image, path, line, rect, circle, foreignObject')) {
        const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
        if (b.width > r.width * 0.9 && b.height > r.height * 0.9) continue;
        if (b.top < r.top + 70 && b.left < r.left + 420) continue; // durum rozeti
        x1 = Math.min(x1, b.left); y1 = Math.min(y1, b.top); x2 = Math.max(x2, b.right); y2 = Math.max(y2, b.bottom);
      }
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1, svg: { x: r.left, y: r.top, w: r.width, h: r.height } };
    });
    const pad = 28;
    const clip = { x: Math.max(box.svg.x, box.x - pad), y: Math.max(box.svg.y, box.y - pad), width: Math.min(box.svg.w, box.w + 2 * pad), height: Math.min(box.svg.h, box.h + 2 * pad) };
    fs.mkdirSync(path.join(SITE, 'assets/devre'), { recursive: true });
    await page.screenshot({ path: path.join(SITE, 'assets/devre', k + '.png'), clip });
    fs.mkdirSync(path.join(__dirname, 'out/shots'), { recursive: true });
    await page.screenshot({ path: path.join(__dirname, 'out/shots', k + '-full.png') });
    // Seri Monitör metni (varsa) ve arayüzdeki uyarılar
    const info = await page.evaluate(() => ({ status: document.body.innerText.match(/(Çalışıyor|Durdu|Bitti)[^\n]*/)?.[0], issues: (document.body.innerText.match(/(uyarı|Uyarı|hata|Hata)[^\n]{0,100}/g) || []).slice(0, 4) }));
    console.log(k, JSON.stringify(info));
  }
  console.log('pageerrors:', errs);
  await browser.close();
})();
async function capPos(page, id) {
  const bb = await page.evaluate(i => { const e = document.querySelector(`g[data-id="${i}"] [data-dyn="cap"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  if (!bb) throw new Error('buton yok: ' + id);
  return bb;
}
async function down(page, id, on) {
  const bb = await capPos(page, id);
  await page.mouse.move(bb.x, bb.y);
  if (on) await page.mouse.down(); else await page.mouse.up();
}
async function press(page, id, hold) {
  const bb = await page.evaluate(i => { const e = document.querySelector(`g[data-id="${i}"] [data-dyn="cap"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  if (!bb) throw new Error('buton yok: ' + id);
  await page.mouse.move(bb.x, bb.y); await page.mouse.down(); await page.waitForTimeout(hold); await page.mouse.up();
}

async function pressKey(page, id, k, hold) {
  const bb = await page.evaluate(([i, k]) => { const e = document.querySelector(`g[data-id="${i}"] [data-dyn="key-${k}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, [id, k]);
  if (!bb) throw new Error('tuş yok: ' + id + ' ' + k);
  await page.mouse.move(bb.x, bb.y); await page.mouse.down(); await page.waitForTimeout(hold); await page.mouse.up();
}
