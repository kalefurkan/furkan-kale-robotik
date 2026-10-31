/* PinHarita veri tutarlılığı + kural birim testleri. Çalıştır: node pinharita/check.js */
'use strict';
var fs = require('fs'), path = require('path');
var BOARDS = require('./boards.js'), R = require('./rules.js');
var pass = 0, fail = 0;
function ok(c, m) { if (c) pass++; else { fail++; console.log('  BAŞARISIZ: ' + m); } }
function eq(a, b, m) { ok(a === b, m + ' (beklenen ' + b + ', gelen ' + a + ')'); }
function B(id) { return BOARDS.filter(function (b) { return b.id === id; })[0]; }
function A(type, pin, extra) { var o = { id: 'x' + Math.random(), type: type, pin: pin, name: '', volt: '' }; for (var k in (extra || {})) o[k] = extra[k]; return o; }
function codes(b, as) { return R.check(b, as).map(function (x) { return x.code; }); }
function has(b, as, code) { return codes(b, as).indexOf(code) >= 0; }

console.log('== Veri tutarlılığı ==');
var WT = ['unusable', 'boot', 'usb', 'adc2', 'cond', 'led', 'info'];
var counts = { 'uno-r4': 20, 'esp32-s3': 36, pico2: 26, pi5: 28 };
BOARDS.forEach(function (b) {
  var ids = {}, dup = 0;
  b.pins.forEach(function (p) { if (ids[p.id]) dup++; ids[p.id] = 1; });
  eq(dup, 0, b.id + ': pin kimlikleri benzersiz');
  var badF = 0, badW = 0;
  b.pins.forEach(function (p) {
    p.funcs.forEach(function (f) { if (R.FUNCS.indexOf(f.f) < 0) badF++; });
    p.warns.forEach(function (w) { if (WT.indexOf(w.type) < 0 || !w.msg) badW++; });
    if (p.kind !== 'gpio' && p.funcs.length) badF++;
  });
  eq(badF, 0, b.id + ': tüm işlevler bilinen kümede');
  eq(badW, 0, b.id + ': uyarı türleri geçerli');
  eq(b.pins.filter(function (p) { return p.kind === 'gpio'; }).length, counts[b.id], b.id + ': GPIO sayısı');
  var inGroups = {}, missing = 0, twice = 0;
  b.layout.groups.forEach(function (g) { g.pins.forEach(function (id) { if (!ids[id]) missing++; if (inGroups[id]) twice++; inGroups[id] = 1; }); });
  eq(missing, 0, b.id + ': düzendeki tüm kimlikler var');
  eq(twice, 0, b.id + ': hiçbir pin düzende iki kez yok');
  eq(Object.keys(inGroups).length, b.pins.length, b.id + ': her pin düzende gösteriliyor');
  ok(b.sources.length >= 2 && b.sources.every(function (s) { return /^https:\/\//.test(s.u) && s.t; }), b.id + ': kaynak bağlantıları var');
  ok(b.notes.some(function (n) { return /sürümüne/.test(n); }), b.id + ': sürüm farkı notu var');
  // kod şablonu yer tutucuları
  var codeOk = true;
  ['ar', 'mp'].forEach(function (k) { if (b.code[k]) Object.keys(b.code[k]).forEach(function (f) { if (R.FUNCS.indexOf(f) < 0) codeOk = false; (b.code[k][f].match(/\{(\w+)\}/g) || []).forEach(function (m) { if (['{s}', '{n}', '{i}', '{u}', '{ch}'].indexOf(m) < 0) codeOk = false; }); }); });
  ok(codeOk, b.id + ': kod şablonları geçerli');
  // her pin işlevinin (varsa) kod şablonu olmalı
  var miss = [];
  b.pins.forEach(function (p) { p.funcs.forEach(function (f) { var t = (b.code.ar && b.code.ar[f.f]) || (b.code.mp && b.code.mp[f.f]); if (!t) miss.push(p.id + ':' + f.f); }); });
  eq(miss.length, 0, b.id + ': tüm işlevlerin kod şablonu var ' + miss.slice(0, 3));
});
// kart bazlı sayımlar (kaynaklarla karşılaştırma)
var count = function (b, f) { return b.pins.filter(function (p) { return R.supports(p, f); }).length; };
eq(count(B('uno-r4'), 'pwm'), 6, 'Uno R4: 6 PWM pini (D3,5,6,9,10,11)');
eq(count(B('uno-r4'), 'adc'), 6, 'Uno R4: 6 ADC');
eq(count(B('uno-r4'), 'dac'), 1, 'Uno R4: tek DAC (A0)');
eq(count(B('esp32-s3'), 'adc'), 20, 'ESP32-S3: 20 ADC pini');
eq(count(B('esp32-s3'), 'touch'), 14, 'ESP32-S3: 14 dokunmatik (header: tümü)');
eq(count(B('pico2'), 'adc'), 3, 'Pico 2: 3 ADC pini (GP26-28)');
eq(count(B('pi5'), 'adc'), 0, 'Pi 5: ADC yok');
eq(count(B('pi5'), 'pwm'), 4, 'Pi 5: 4 PWM pini');
eq(B('esp32-s3').pins.filter(function (p) { return p.warns.some(function (w) { return w.type === 'boot'; }); }).map(function (p) { return p.gpio; }).sort(function (a, b) { return a - b; }).join(','), '0,3,45,46', 'ESP32-S3 strapping 0,3,45,46');

console.log('== Önbellek listesi ==');
var swSrc = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
var appSrc = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
var re = /FILES\s*=\s*\[([^\]]*)\]/;
var swList = re.exec(swSrc)[1].match(/'[^']+'/g).map(function (s) { return s.slice(1, -1); });
var appList = re.exec(appSrc)[1].match(/'[^']+'/g).map(function (s) { return s.slice(1, -1); });
eq(JSON.stringify(swList), JSON.stringify(appList), 'sw.js ve app.js önbellek listeleri aynı');
swList.forEach(function (f) { if (f === './') return; ok(fs.existsSync(path.resolve(__dirname, f)), 'önbellek dosyası mevcut: ' + f); });

console.log('== Kural birim testleri ==');
var uno = B('uno-r4'), esp = B('esp32-s3'), pico = B('pico2'), pi = B('pi5');
ok(has(uno, [A('led', 'D13'), A('button', 'D13')], 'dup'), '1. aynı pine iki görev (dup)');
ok(has(uno, [A('pwm', 'D4')], 'unsupported'), '2. Uno D4 PWM desteklemez');
ok(!has(uno, [A('pwm', 'D9')], 'unsupported'), '3. Uno D9 PWM destekler');
ok(has(pi, [A('adc', 'GPIO4')], 'unsupported') && /ADC yok/.test(R.check(pi, [A('adc', 'GPIO4')])[0].msg), '4. Pi 5 ADC yok, gerekçe var');
ok(has(esp, [A('led', 'GPIO45')], 'boot'), '5. ESP32 GPIO45 strapping uyarısı');
ok(has(esp, [A('led', 'GPIO0')], 'boot') && has(esp, [A('led', 'GPIO46')], 'boot') && has(esp, [A('led', 'GPIO3')], 'boot'), '6. GPIO0/3/46 strapping');
ok(has(esp, [A('led', 'GPIO19')], 'usb') && has(esp, [A('led', 'GPIO20')], 'usb'), '7. GPIO19/20 USB uyarısı');
ok(has(esp, [A('adc', 'GPIO11')], 'adc2wifi'), '8. ADC2 pini + ADC görevi → Wi-Fi uyarısı');
ok(!has(esp, [A('adc', 'GPIO4')], 'adc2wifi'), '9. ADC1 pini uyarı vermez');
ok(!has(esp, [A('led', 'GPIO11')], 'adc2wifi'), '10. ADC2 pini dijital görevde ADC uyarısı vermez');
ok(has(esp, [A('led', 'GPIO36')], 'cond'), '11. GPIO35-37 octal PSRAM uyarısı');
ok(has(esp, [A('adc', 'GPIO4', { volt: '5' })], 'level5'), '12. 5 V sensör + 3,3 V kart → hata');
ok(!has(uno, [A('adc', 'A0', { volt: '5' })], 'level5'), '13. 5 V sensör + 5 V kart sorunsuz');
ok(has(uno, [A('led', 'D7', { volt: '3.3' })], 'level33'), '14. 3,3 V cihaz + 5 V kart çıkış uyarısı');
ok(has(pico, [A('sda', 'GP0'), A('scl', 'GP3')], 'busmix'), '15. Pico I2C0 SDA + I2C1 SCL → birim uyuşmazlığı');
ok(!has(pico, [A('sda', 'GP4'), A('scl', 'GP5')], 'busmix') && R.check(pico, [A('sda', 'GP4'), A('scl', 'GP5')]).length === 0, '16. Pico GP4/GP5 I2C0 temiz');
ok(has(uno, [A('mosi', 'D11'), A('led', 'D13')], 'periph'), '17. Uno SPI MOSI + SCK pini LED → çevre birimi çakışması');
ok(has(uno, [A('sda', 'A4'), A('adc', 'A5')], 'periph'), '18. Uno I2C SDA A4 + A5 ADC → çakışma');
ok(!has(pico, [A('mosi', 'GP19'), A('led', 'GP18')], 'periph'), '19. Pico seçenekli pinde sahte çakışma yok');
ok(has(uno, [A('sda', 'A4')], 'partner'), '20. SDA tek başına → eş eksik');
ok(has(uno, [A('mosi', 'D11')], 'partner'), '21. SPI MOSI saat (SCK) olmadan → uyarı');
ok(has(uno, [A('led', '5V')], 'notgpio'), '22. Güç pinine görev atama → hata');
ok(has(pico, [A('pwm', 'GP0'), A('pwm', 'GP1')], 'pwmshare') && !has(pico, [A('pwm', 'GP0'), A('pwm', 'GP2')], 'pwmshare'), '23. Aynı PWM diliminde paylaşım bilgisi');
ok(has(pi, [A('pwm', 'GPIO4')], 'unsupported') && !has(pi, [A('pwm', 'GPIO18')], 'unsupported'), '24. Pi 5 PWM yalnızca 12/13/18/19');
ok(R.check(esp, [A('sda', 'GPIO4'), A('scl', 'GPIO5')]).filter(function (x) { return x.level === 'err'; }).length === 0, '25. ESP32 GPIO matrisiyle I2C herhangi pinde');
ok(has(esp, [A('sda', 'GPIO8'), A('scl', 'GPIO9'), A('led', 'GPIO48')], 'led'), '26. Yerleşik LED bilgisi');
var clean = [A('led', 'D13'), A('pwm', 'D9'), A('adc', 'A1', { volt: '5' }), A('button', 'D2')];
eq(R.check(uno, clean).filter(function (x) { return x.level === 'err' || x.level === 'warn'; }).length, 0, '27. Temiz plan: hata/uyarı yok (sadece bilgi)');
eq(R.check(uno, [A('led', 'D13'), A('led', 'D13')])[0].level, 'err', '28. Hatalar listenin başında');
ok(has(uno, [A('foo', 'D13')], 'invalid') && has(uno, [A('led', 'Z99')], 'invalid'), '29. Geçersiz görev/pin güvenli işlenir');

console.log('== Paylaşım / dışa aktarma ==');
var plan = [A('led', 'GPIO48', { name: 'Durum ışığı', volt: '' }), A('sda', 'GPIO8', { name: 'Ekran; SDA & "x"' })];
var h = R.encodePlan('esp32-s3', plan);
var d = R.decodePlan('#' + h, BOARDS);
ok(d && d.board.id === 'esp32-s3' && d.assigns.length === 2 && d.assigns[0].name === 'Durum ışığı' && d.assigns[1].name === 'Ekran; SDA & "x"', '30. #hash gidiş-dönüş');
eq(R.decodePlan('#b=yok', BOARDS), null, '31. Bilinmeyen kart reddedilir');
eq(R.decodePlan('#b=uno-r4&p=led~D13~x~&p=%E0%A4%A', BOARDS).assigns.length, 0, '32. Bozuk hash çökmez');
eq(R.decodePlan('#b=uno-r4&p=led~ZZ~a~!foo~D13~a~', BOARDS).assigns.length, 0, '33. Geçersiz pin/görev atlanır');
var c = R.toConsts(uno, [A('led', 'D13', { name: 'Kırmızı LED' }), A('led', 'D12', { name: 'Kırmızı LED' }), A('adc', 'A0')]);
ok(/const int PIN_KIRMIZI_LED = 13;/.test(c) && /const int PIN_KIRMIZI_LED_2 = 12;/.test(c) && /const int PIN_ANALOG = A0;/.test(c), '34. const int çıktısı, Türkçe ad ve yinelenen ad çözümü');
ok(R.toCSV(esp, plan).split('\n').length === 3 && /"Ekran; SDA & ""x"""/.test(R.toCSV(esp, plan)), '35. CSV kaçışları');
eq(JSON.parse(R.toJSON(esp, plan)).atamalar.length, 2, '36. JSON dışa aktarma geçerli');

console.log('\nSonuç: ' + pass + ' geçti, ' + fail + ' başarısız');
process.exit(fail ? 1 : 0);
