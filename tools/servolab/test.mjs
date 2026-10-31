// ServoLab testleri. Kullanım: node tools/servolab/test.mjs   (repo kökünden)
// 1) index.html içindeki CORE bölümünü çıkarıp birim testler çalıştırır (sahte port / sahte zamanlayıcı).
// 2) Üretilen sketch'leri g++ -fsyntax-only ile (tools/arduino/stub) denetler.
// 3) Alıcı ve bağımsız sketch'leri bilgisayarda gerçekten derleyip çalıştırır (host/mock.h) ve JS ile karşılaştırır.
import fs from 'node:fs'; import path from 'node:path'; import {execFileSync, spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../..');
const html = fs.readFileSync(path.join(root, 'servolab/index.html'), 'utf8');
const core = html.split('/*CORE-START*/')[1].split('/*CORE-END*/')[0];
const C = new Function(core + '; return {defaults,sanitize,fixServo,exportObj,angleToUs,effAngle,fk,fmtS,fmtP,parseLine,chunkText,makeThrottle,startPlayback,stepPlayback,genCode,NUS,LINK,clamp};')();
let pass = 0, fail = 0;
const t = (name, ok, info) => { if (ok) pass++; else { fail++; console.log('BAŞARISIZ:', name, info ?? ''); } };
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;

/* --- açı/µs --- */
{ const s = C.defaults().servos[0];
  t('us 0°', C.angleToUs(s,0) === 544); t('us 180°', C.angleToUs(s,180) === 2400); t('us 90°', C.angleToUs(s,90) === 1472);
  const s2 = {...s, inv:true}; t('ters 0° -> 2400', C.angleToUs(s2,0) === 2400); t('ters 180° -> 544', C.angleToUs(s2,180) === 544);
  const s3 = {...s, amin:30, amax:150}; t('kırpma alt', C.angleToUs(s3,0) === C.angleToUs(s3,30)); t('kırpma üst', C.angleToUs(s3,170) === C.angleToUs(s3,150)); }
/* --- ileri kinematik --- */
{ let f = C.fk([90,90,180,0]); t('fk düz yukarı x', near(f.tip.x, 0, 1e-9)); t('fk düz yukarı z', near(f.tip.z, 6+10+10+5, 1e-9), f.tip.z);
  f = C.fk([90,90,90,0]); t('fk L pozu x', near(f.tip.x, 15)); t('fk L pozu z', near(f.tip.z, 16));
  f = C.fk([90,0,180,0]); t('fk yatay ileri', near(f.tip.x, 25) && near(f.tip.z, 6));
  f = C.fk([0,90,90,0]); t('X/Y J1=0', near(f.X, 15) && near(f.Y, 0)); }
/* --- protokol --- */
t('fmtS', C.fmtS(1,120.4) === 'S2:120\n'); t('fmtP', C.fmtP([90,60.6,120,40,1,1],4) === 'P 90,61,120,40\n');
t('parse S', JSON.stringify(C.parseLine('S3:45\n',4)) === '{"t":"S","i":2,"a":45}');
t('parse S kapsam dışı', C.parseLine('S5:45',4) === null && C.parseLine('S0:45',4) === null);
t('parse P', JSON.stringify(C.parseLine('P 90,60,120,40\r\n',4).a) === '[90,60,120,40]');
t('parse P kısa', JSON.stringify(C.parseLine('P 10,20',4).a) === '[10,20]');
t('parse H ?', C.parseLine('H').t === 'H' && C.parseLine('?').t === '?'); t('parse çöp', C.parseLine('xyz') === null);
/* --- BLE parçalama + sahte port --- */
{ const line = C.fmtP([180,180,180,180,180,180],6), ch = C.chunkText(line, 20);
  t('parça <=20', ch.every(c => c.length <= 20)); const joined = new TextDecoder().decode(Buffer.concat(ch.map(c => Buffer.from(c)))); t('parça birleşir', joined === line);
  t('P 6 servo > 20 bayt (parçalama gerekli)', line.length > 20 && ch.length > 1); }
/* --- hız sınırlayıcı (sahte zaman) --- */
{ let now = 0, timers = [], sent = [];
  const thr = C.makeThrottle(l => sent.push([now, l]), 50, () => 4, () => now, (f,ms) => { const o = {f, at: now + ms}; timers.push(o); return o; }, o => { timers = timers.filter(x => x !== o); });
  const adv = to => { while (true) { const nx = timers.filter(x => x.at <= to).sort((a,b) => a.at - b.at)[0]; if (!nx) break; timers = timers.filter(x => x !== nx); now = nx.at; nx.f(); } now = to; };
  const ang = [90,90,90,90];
  for (let ms = 0; ms <= 1000; ms += 5) { adv(ms); ang[0] = 90 + ms / 20; thr.push(ang, [0]); }
  adv(1200);
  t('hız sınırı <=20 Hz', sent.length <= 22, sent.length);
  t('aralık >=50ms', sent.every((s,i) => i === 0 || s[0] - sent[i-1][0] >= 50 - 1e-9));
  t('son değer iletildi', sent.at(-1)[1] === 'S1:' + Math.round(ang[0]) + '\n', sent.at(-1)[1]);
  t('tek servo S komutu', sent[0][1].startsWith('S1:'));
  sent.length = 0; thr.push([1,2,3,4],[0,1]); adv(now + 100); t('çok servo P', sent[0][1] === 'P 1,2,3,4\n', sent[0]); }
/* --- oynatma --- */
{ const poses = [{a:[0,0],dur:1000,hold:500},{a:[100,50],dur:1000,hold:0}];
  const run = (now, o) => { const pb = C.startPlayback([0,0], 0); return [pb, C.stepPlayback(pb, now, poses, o)]; };
  let [, r] = run(500, {speed:1,ease:false,loop:false}); t('lineer orta', near(r.angles[0],0)); // 1. poz hedefi 0
  const pb = C.startPlayback([0,0],0); let res;
  res = C.stepPlayback(pb, 1000, poses, {speed:1,ease:false,loop:false}); t('poz1 bitti hold', pb.phase === 'hold' && !res.done);
  res = C.stepPlayback(pb, 1500, poses, {speed:1,ease:false,loop:false}); t('hold sonrası poz2 başı', pb.idx === 1 && pb.phase === 'move' && near(res.angles[0],0), JSON.stringify(pb));
  res = C.stepPlayback(pb, 2000, poses, {speed:1,ease:false,loop:false}); t('lineer yarı', near(res.angles[0],50) && near(res.angles[1],25), res.angles);
  res = C.stepPlayback(pb, 2000, poses, {speed:1,ease:true,loop:false}); t('ease yarı=yarı', near(res.angles[0],50));
  res = C.stepPlayback(pb, 2250, poses, {speed:1,ease:true,loop:false}); t('ease u=0.75', near(res.angles[0], 100*(.75*.75*(3-2*.75)), 1e-6), res.angles[0]);
  res = C.stepPlayback(pb, 2600, poses, {speed:1,ease:false,loop:false}); t('bitiş', res.done && near(res.angles[0],100));
  const p2 = C.startPlayback([0,0],0); res = C.stepPlayback(p2, 2500, poses, {speed:2,ease:false,loop:false}); t('hız x2: 2500ms*2=5000 -> bitti', res.done);
  const p3 = C.startPlayback([0,0],0); res = C.stepPlayback(p3, 5000, poses, {speed:1,ease:false,loop:true}); t('döngü bitmez', !res.done); }
/* --- sanitize / JSON --- */
{ const d = C.defaults(); d.poses = [{a:[10,20,30,40,50,60],dur:700,hold:5}]; d.n = 4;
  const j = JSON.parse(JSON.stringify(C.exportObj(d))); const back = C.sanitize(j);
  t('gidiş-dönüş n', back.n === 4); t('gidiş-dönüş poz', back.poses.length === 1 && back.poses[0].a.slice(0,4).join() === '10,20,30,40' && back.poses[0].dur === 700);
  const bad = C.sanitize({n:99, servos:[{pmin:-5, pmax:99999, amin:170, amax:10, pin:'x', name:'a\n*/b'}], poses:[{a:[500,-9], dur:-1, hold:'zz'}, 5, null], speed:99, interp:'??'});
  t('n kırpma', bad.n === 6); t('µs aralığı', bad.servos[0].pmin === 400 && bad.servos[0].pmax === 2600);
  t('açı ters aralık düzelir', bad.servos[0].amin === 0 && bad.servos[0].amax === 180); t('ad temiz', !/\n/.test(bad.servos[0].name));
  t('poz kırpma', bad.poses[0].a[0] === 180 && bad.poses[0].a[1] === 0 && bad.poses[0].dur === 0 && bad.poses[0].hold === 0 && bad.poses.length === 3);
  t('hız', bad.speed === 2); t('interp', bad.interp === 'ease');
  let thrown = false; try { C.sanitize([1]); } catch { thrown = true; } t('dizi reddedilir', thrown); }

/* --- kod üretimi + g++ --- */
const out = path.join(here, 'out'); fs.mkdirSync(out, {recursive:true});
const stub = path.join(root, 'tools/arduino/stub'), hostDir = path.join(here, 'host');
const demo = C.sanitize({n:4, interp:'ease', speed:1, loop:true, servos:[{name:'J1 Taban',pin:3},{name:'J2 Omuz',pin:5,amin:20,amax:160,inv:true},{name:'J3 Dirsek',pin:6,pmin:600,pmax:2300},{name:'GR Kıskaç',pin:9,amin:10,amax:120,home:60}],
  poses:[{a:[90,90,90,60],dur:800,hold:100},{a:[30,40,120,10],dur:1200,hold:0},{a:[150,120,60,120],dur:1000,hold:300}]});
const six = C.sanitize({n:6, interp:'linear', speed:1.5, loop:false, poses:[{a:[10,20,30,40,50,60],dur:500,hold:0},{a:[170,160,150,140,130,120],dur:900,hold:0}], servos:[{pin:2,inv:true},{pin:4},{pin:7},{pin:8},{pin:12},{pin:13,pmin:500,pmax:2500}]});
const two = C.sanitize({n:2, poses:[]});
const confs = {demo, six, two};
const kinds = ['uno','esp32','rx-usb','rx-hc05','rx-ble'];
let synOk = 0, synTot = 0;
for (const [cn, cfg] of Object.entries(confs)) for (const k of kinds) {
  const f = path.join(out, `${cn}_${k}.ino`); fs.writeFileSync(f, C.genCode(cfg, k, {rx:10, tx:11, baud:9600})); synTot++;
  const r = spawnSync('g++', ['-fsyntax-only','-Wall','-Wextra','-Wno-unused-parameter','-x','c++','-std=gnu++11','-I',stub,'-include','Arduino.h',f], {encoding:'utf8'});
  if (r.status === 0 && !r.stderr.trim()) synOk++; else { fail++; console.log('SÖZ DİZİMİ HATASI', cn, k, '\n' + r.stderr.slice(0,1500)); }
}
console.log(`söz dizimi (stub): ${synOk}/${synTot} temiz (uyarısız)`);

/* --- bilgisayarda çalıştır: alıcı --- */
function build(cfg, kind, name){
  const src = path.join(out, name + '.cpp'); fs.writeFileSync(src, C.genCode(cfg, kind, {rx:10, tx:11, baud:9600}));
  const bin = path.join(out, name);
  const r = spawnSync('g++', ['-std=gnu++17','-O1','-Wall','-I',hostDir,'-include',path.join(hostDir,'mock.h'),src,path.join(hostDir,'main.cpp'),'-o',bin], {encoding:'utf8'});
  if (r.status !== 0) { fail++; console.log('DERLEME HATASI', name, r.stderr.slice(0,1500)); return null; }
  return bin;
}
for (const kind of ['rx-usb','rx-hc05']) {
  const bin = build(demo, kind, 'sim_' + kind); if (!bin) continue;
  const lines = [C.fmtS(1,100), C.fmtP([10,20,170,130],4), C.fmtS(0,200), 'H\n', 'S9:10\n', 'junk\n', 'P 45\n', 'S3:-20\n', '?\n'];
  const r = spawnSync(bin, ['rx'], {input: lines.join(''), encoding:'utf8'}); const us = r.stdout.split('\n').filter(l => l.startsWith('[US]')).map(l => l.slice(5).trim().split(' ').map(Number));
  const exp = []; let st = demo.servos.slice(0,4).map(s => C.angleToUs(s, s.home)); // başlangıç: ev
  const apply = (i,a) => { st[i] = C.angleToUs(demo.servos[i], a); };
  const E = [];
  apply(1,100); E.push(st.slice());
  [10,20,170,130].forEach((a,i) => apply(i,a)); E.push(st.slice());
  apply(0,200); E.push(st.slice());
  demo.servos.slice(0,4).forEach((s,i) => apply(i,s.home)); E.push(st.slice());
  E.push(st.slice()); E.push(st.slice());           // S9 ve junk: değişmez
  apply(0,45); E.push(st.slice());                  // P 45: yalnız ilk servo
  apply(2,-20); E.push(st.slice());
  E.push(st.slice());                                // ?
  let ok = us.length === E.length; us.forEach((row,i) => { if (!E[i] || row.some((v,j) => Math.abs(v - E[i][j]) > 1)) ok = false; });
  t('alıcı simülasyonu ' + kind, ok, JSON.stringify({us, E}));
  t('alıcı ? yanıtı ' + kind, r.stdout.includes('SERVOLAB 1') && r.stdout.includes('4'));
}
/* --- bilgisayarda çalıştır: bağımsız sketch vs JS oynatıcı --- */
for (const [cn, cfg, ease] of [['demo', demo, true], ['six', six, false]]) {
  const bin = build(cfg, 'uno', 'sim_play_' + cn); if (!bin) continue;
  const r = spawnSync(bin, ['play','1','6000'], {encoding:'utf8'}); const rows = r.stdout.trim().split('\n').map(l => l.split(' ').map(Number));
  // setup(): delay(500) sonra startMove(0): t0 = 500; JS: aynı başlangıç (ev), aynı zaman çizelgesi
  const n = cfg.n, home = cfg.servos.slice(0,n).map(s => s.home), poses = cfg.poses.map(p => ({...p, a:p.a.slice(0,n)}));
  const pb = C.startPlayback(home, 500); let worst = 0, cnt = 0;
  for (const row of rows) { const ms = row[0]; if (ms < 500) continue;
    const res = C.stepPlayback(pb, ms, poses, {speed:cfg.speed, ease, loop:cfg.loop});
    res.angles.forEach((a,i) => { const d = Math.abs(C.angleToUs(cfg.servos[i], a) - row[1+i]); if (d > worst) worst = d; }); cnt++; }
  t(`bağımsız sketch ≈ JS oynatıcı (${cn}, en büyük fark ${worst} µs, ${cnt} örnek)`, worst <= 8 && cnt > 100);
  console.log(`  ${cn}: en büyük µs farkı = ${worst} (${cnt} örnek)`);
}
console.log(`\n${pass} geçti, ${fail} başarısız`); process.exit(fail ? 1 : 0);
