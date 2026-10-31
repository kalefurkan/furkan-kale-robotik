/* PinHarita: görev kataloğu, çakışma denetimi, paylaşım/dışa aktarma yardımcıları.
 * Tarayıcıda window.PinRules, Node'da module.exports olarak yüklenir (test için). */
(function () {
  'use strict';

  var FUNCS = ['dig', 'pwm', 'adc', 'dac', 'sda', 'scl', 'mosi', 'miso', 'sck', 'cs', 'tx', 'rx', 'int', 'touch'];
  var FUNC_LABEL = { dig: 'Dijital G/Ç', pwm: 'PWM', adc: 'ADC', dac: 'DAC', sda: 'I²C SDA', scl: 'I²C SCL', mosi: 'SPI MOSI', miso: 'SPI MISO', sck: 'SPI SCK', cs: 'SPI CS', tx: 'UART TX', rx: 'UART RX', int: 'Kesme', touch: 'Dokunmatik' };
  // Arayüz filtre grupları
  var GROUPS = [
    { id: 'pwm', label: 'PWM', fs: ['pwm'] },
    { id: 'adc', label: 'ADC', fs: ['adc'] },
    { id: 'dac', label: 'DAC', fs: ['dac'] },
    { id: 'i2c', label: 'I²C', fs: ['sda', 'scl'] },
    { id: 'spi', label: 'SPI', fs: ['mosi', 'miso', 'sck', 'cs'] },
    { id: 'uart', label: 'UART', fs: ['tx', 'rx'] },
    { id: 'int', label: 'Kesme', fs: ['int'] },
    { id: 'touch', label: 'Dokunmatik', fs: ['touch'] }
  ];
  // out: pin çıkış/sürücü olarak kullanılır (3,3 V sensör + 5 V kart uyarısı için)
  var TASKS = [
    { id: 'led', label: 'LED', need: 'dig', out: true, pre: 'LED' },
    { id: 'button', label: 'Buton', need: 'dig', out: false, pre: 'BUTON' },
    { id: 'digital', label: 'Dijital giriş/çıkış', need: 'dig', out: true, pre: 'DIJITAL' },
    { id: 'pwm', label: 'PWM (motor / LED parlaklığı)', need: 'pwm', out: true, pre: 'PWM' },
    { id: 'adc', label: 'ADC (analog sensör)', need: 'adc', out: false, pre: 'ANALOG' },
    { id: 'dac', label: 'DAC (analog çıkış)', need: 'dac', out: true, pre: 'DAC' },
    { id: 'int', label: 'Kesme girişi', need: 'int', out: false, pre: 'KESME' },
    { id: 'touch', label: 'Dokunmatik giriş', need: 'touch', out: false, pre: 'DOKUNMA' },
    { id: 'sda', label: 'I2C SDA', need: 'sda', out: true, pre: 'I2C_SDA', bus: 'i2c' },
    { id: 'scl', label: 'I2C SCL', need: 'scl', out: true, pre: 'I2C_SCL', bus: 'i2c' },
    { id: 'mosi', label: 'SPI MOSI', need: 'mosi', out: true, pre: 'SPI_MOSI', bus: 'spi' },
    { id: 'miso', label: 'SPI MISO', need: 'miso', out: false, pre: 'SPI_MISO', bus: 'spi' },
    { id: 'sck', label: 'SPI SCK', need: 'sck', out: true, pre: 'SPI_SCK', bus: 'spi' },
    { id: 'cs', label: 'SPI CS', need: 'cs', out: true, pre: 'SPI_CS', bus: 'spi' },
    { id: 'tx', label: 'UART TX', need: 'tx', out: true, pre: 'UART_TX', bus: 'uart' },
    { id: 'rx', label: 'UART RX', need: 'rx', out: false, pre: 'UART_RX', bus: 'uart' }
  ];
  var BUS_ROLES = { i2c: ['sda', 'scl'], spi: ['sck', 'mosi', 'miso'], uart: ['tx', 'rx'] };

  function task(id) { for (var i = 0; i < TASKS.length; i++) if (TASKS[i].id === id) return TASKS[i]; return null; }
  function pinById(board, id) { for (var i = 0; i < board.pins.length; i++) if (board.pins[i].id === id) return board.pins[i]; return null; }
  function funcOf(pin, f, fixedFirst) {
    var best = null;
    for (var i = 0; i < pin.funcs.length; i++) {
      var x = pin.funcs[i];
      if (x.f !== f) continue;
      if (!x.flex) return x;
      best = best || x;
    }
    return best;
  }
  function supports(pin, f) { return !!funcOf(pin, f); }
  function name(board, id) { var p = pinById(board, id); return p ? p.label : id; }

  function check(board, assigns) {
    var out = [];
    function add(level, code, msg, pins) { out.push({ level: level, code: code, msg: msg, pins: pins || [] }); }
    var byPin = {};
    var items = [];
    assigns.forEach(function (a) {
      var t = task(a.type), p = pinById(board, a.pin);
      var tl = t ? t.label : a.type;
      var who = '"' + (a.name ? a.name + ' · ' : '') + tl + '" görevi';
      if (!t || !p) { add('err', 'invalid', who + ' için geçersiz görev ya da pin seçilmiş.', []); return; }
      items.push({ a: a, t: t, p: p, who: who });
      (byPin[p.id] = byPin[p.id] || []).push(items[items.length - 1]);
    });

    // 1) aynı pine iki görev
    Object.keys(byPin).forEach(function (id) {
      var L = byPin[id];
      if (L.length > 1) {
        add('err', 'dup', name(board, id) + ' pinine ' + L.length + ' görev atanmış (' + L.map(function (x) { return x.t.label; }).join(', ') + '). Bir pin aynı anda tek iş yapabilir; görevlerden birini başka bir pine taşı.', [id]);
      }
    });

    items.forEach(function (it) {
      var p = it.p, t = it.t, a = it.a;
      // 2) güç/özel pin
      if (p.kind !== 'gpio') {
        add('err', 'notgpio', it.who + ', ' + p.label + ' pinine atanmış; bu bir ' + (p.kind === 'gnd' ? 'toprak' : (p.kind === 'power' ? 'güç' : 'özel')) + ' pinidir, GPIO değildir.', [p.id]);
        return;
      }
      // 3) işlev desteği
      if (!supports(p, t.need)) {
        var why = '';
        if (t.need === 'adc' && board.noAdc) why = ' Bu kartta hiç ADC yok; analog sensör için harici ADC (ör. ADS1115) kullan.';
        else {
          var alts = board.pins.filter(function (q) { return q.kind === 'gpio' && supports(q, t.need); }).map(function (q) { return q.label; });
          if (alts.length && alts.length <= 12) why = ' Bu işlevi destekleyen pinler: ' + alts.join(', ') + '.';
          else if (!alts.length) why = ' Bu kartta bu işlevi destekleyen pin yok.';
        }
        add('err', 'unsupported', it.who + ': ' + p.label + ' pini ' + FUNC_LABEL[t.need] + ' işlevini desteklemiyor.' + why, [p.id]);
      }
      // 4) pin uyarıları
      p.warns.forEach(function (w) {
        if (w.type === 'unusable') add('err', 'unusable', it.who + ', ' + p.label + ' pininde: ' + w.msg, [p.id]);
        else if (w.type === 'boot') add('warn', 'boot', it.who + ', ' + p.label + ' pininde (önyükleme/strapping): ' + w.msg, [p.id]);
        else if (w.type === 'usb') add('warn', 'usb', it.who + ', ' + p.label + ' pininde (USB): ' + w.msg, [p.id]);
        else if (w.type === 'cond') add('warn', 'cond', it.who + ', ' + p.label + ' pininde: ' + w.msg, [p.id]);
        else if (w.type === 'adc2' && t.need === 'adc') add('warn', 'adc2wifi', it.who + ', ' + p.label + ' pininde: ' + w.msg, [p.id]);
        else if (w.type === 'led') add('info', 'led', it.who + ', ' + p.label + ' pininde: ' + w.msg, [p.id]);
      });
      // 5) gerilim seviyesi
      var volt = String(a.volt || '');
      if (volt === '5' && board.logic < 5) {
        add('err', 'level5', it.who + ' 5 V sinyal/sensör olarak işaretli ama ' + board.name + ' 3,3 V mantıklıdır ve pinleri 5 V\'a dayanıklı değildir. Seviye dönüştürücü ya da gerilim bölücü kullan; aksi halde pin ya da çip zarar görebilir.', [p.id]);
      } else if (volt === '3.3' && board.logic >= 5 && t.out) {
        add('warn', 'level33', it.who + ' 3,3 V cihaz olarak işaretli ama ' + board.name + ' pinleri 5 V sürer. 5 V çıkış 3,3 V girişe zarar verebilir; seviye dönüştürücü kullan.', [p.id]);
      }
    });

    // 6) veri yolu tutarlılığı
    ['i2c', 'spi', 'uart'].forEach(function (bus) {
      var roles = BUS_ROLES[bus];
      var list = items.filter(function (it) { return it.t.bus === bus && it.p.kind === 'gpio' && supports(it.p, it.t.need); });
      if (!list.length) return;
      var byRole = {};
      list.forEach(function (it) { (byRole[it.t.id] = byRole[it.t.id] || []).push(it); });
      var cnt = function (r) { return (byRole[r] || []).length; };
      var busName = { i2c: 'I²C', spi: 'SPI', uart: 'UART' }[bus];
      // eksik eş
      if (bus === 'i2c' && (cnt('sda') ? !cnt('scl') : cnt('scl'))) add('warn', 'partner', 'I²C için yalnızca ' + (cnt('sda') ? 'SDA' : 'SCL') + ' atanmış; I²C çalışmak için SDA ve SCL birlikte gerekir.', list.map(function (x) { return x.p.id; }));
      if (bus === 'spi') {
        if (cnt('sck') && !cnt('mosi') && !cnt('miso')) add('warn', 'partner', 'SPI için SCK atanmış ama MOSI ya da MISO yok; veri hattı eksik.', list.map(function (x) { return x.p.id; }));
        if (!cnt('sck') && (cnt('mosi') || cnt('miso'))) add('warn', 'partner', 'SPI için MOSI/MISO atanmış ama SCK (saat) yok; SPI saat hattı olmadan çalışmaz.', list.map(function (x) { return x.p.id; }));
      }
      // farklı çevre birimi (yalnızca sabit işlevlerde)
      var single = roles.every(function (r) { return cnt(r) <= 1; });
      var fixedPers = [];
      list.forEach(function (it) {
        if (it.t.id === 'cs') return;
        var f = funcOf(it.p, it.t.need);
        if (f && !f.flex && f.per) fixedPers.push({ per: f.per, it: it });
      });
      if (single && fixedPers.length > 1) {
        var first = fixedPers[0].per;
        var diff = fixedPers.filter(function (x) { return x.per !== first; });
        if (diff.length) {
          add('err', 'busmix', busName + ' pinleri farklı çevre birimlerine ait: ' + fixedPers.map(function (x) { return x.it.t.label + '→' + x.it.p.label + ' (' + x.per + ')'; }).join(', ') + '. Aynı ' + busName + ' biriminin pinlerini seç.', fixedPers.map(function (x) { return x.it.p.id; }));
        }
      }
      // sabit pinli kartlarda: bu birimin diğer sabit pini başka işe verilmiş mi
      if (!board.flexible && single) {
        var pers = {};
        fixedPers.forEach(function (x) { pers[x.per] = x; });
        Object.keys(pers).forEach(function (per) {
          roles.forEach(function (r) {
            if (cnt(r)) return;
            var cands = board.pins.filter(function (q) { var f = funcOf(q, r); return q.kind === 'gpio' && f && !f.flex && f.per === per; });
            if (cands.length !== 1) return;
            var q = cands[0];
            (byPin[q.id] || []).forEach(function (other) {
              add('err', 'periph', q.label + ' pini, ' + per + ' biriminin ' + FUNC_LABEL[r] + ' pinidir; ' + pers[per].it.t.label + ' görevi bu birimi kullandığı için ' + other.t.label + ' görevine verilemez (çevre birimi çakışması).', [q.id, pers[per].it.p.id]);
            });
          });
        });
      }
    });

    // 7) aynı PWM dilimi/zamanlayıcısı
    var pw = {};
    items.filter(function (it) { return it.t.need === 'pwm' && it.p.kind === 'gpio'; }).forEach(function (it) {
      var f = funcOf(it.p, 'pwm');
      var m = f && f.per ? /^((?:PWM|GPT)\d+) [AB]$/.exec(f.per) : null;
      if (m) (pw[m[1]] = pw[m[1]] || []).push(it);
    });
    Object.keys(pw).forEach(function (k) {
      if (pw[k].length > 1) add('info', 'pwmshare', 'PWM görevleri aynı donanım biriminde (' + k + '): ' + pw[k].map(function (x) { return x.p.label; }).join(' ve ') + '. İki kanal aynı frekansı paylaşır; farklı frekans gerekiyorsa farklı birimlerden pin seç.', pw[k].map(function (x) { return x.p.id; }));
    });

    var order = { err: 0, warn: 1, info: 2 };
    out.sort(function (x, y) { return order[x.level] - order[y.level]; });
    return out;
  }

  /* ---- paylaşım bağlantısı ---- */
  function encodePlan(boardId, assigns) {
    var p = assigns.map(function (a) { return [a.type, a.pin, a.name || '', a.volt || ''].map(encodeURIComponent).join('~'); }).join('!');
    return 'b=' + encodeURIComponent(boardId) + (p ? '&p=' + p : '');
  }
  function decodePlan(hash, boards) {
    var h = String(hash || '').replace(/^#/, '');
    var q = {};
    h.split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) q[kv.slice(0, i)] = kv.slice(i + 1); });
    var bid; try { bid = decodeURIComponent(q.b || ''); } catch (e) { return null; }
    var board = boards.filter(function (b) { return b.id === bid; })[0];
    if (!board) return null;
    var assigns = [];
    if (q.p) q.p.split('!').slice(0, 200).forEach(function (s) {
      var f; try { f = s.split('~').map(decodeURIComponent); } catch (e) { return; }
      if (!task(f[0]) || !pinById(board, f[1])) return;
      var volt = f[3] === '5' || f[3] === '3.3' ? f[3] : '';
      assigns.push({ id: 'a' + assigns.length, type: f[0], pin: f[1], name: (f[2] || '').slice(0, 40), volt: volt });
    });
    return { board: board, assigns: assigns };
  }

  /* ---- dışa aktarma ---- */
  function slug(s) {
    var map = { 'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U' };
    return String(s).replace(/[çÇğĞıİöÖşŞüÜ]/g, function (c) { return map[c]; }).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }
  function constNames(assigns) {
    var used = {}, res = [];
    assigns.forEach(function (a) {
      var t = task(a.type);
      var base = 'PIN_' + (slug(a.name || '') || (t ? t.pre : 'PIN'));
      var n = base, i = 2;
      while (used[n]) n = base + '_' + (i++);
      used[n] = 1; res.push(n);
    });
    return res;
  }
  function toConsts(board, assigns) {
    var names = constNames(assigns);
    var lines = ['// PinHarita · ' + board.name];
    var arduino = !!(board.code && board.code.ar);
    assigns.forEach(function (a, i) {
      var p = pinById(board, a.pin), t = task(a.type);
      if (!p || !t) return;
      var val = p.sym === null || p.sym === undefined ? '-1' : p.sym;
      var cmt = t.label + ' · ' + p.label + (p.phys && board.id === 'pi5' ? ' (fiziksel pin ' + p.phys + ')' : '');
      lines.push(arduino ? 'const int ' + names[i] + ' = ' + val + ';  // ' + cmt : names[i] + ' = ' + val + '  # ' + cmt);
    });
    if (!arduino) { lines[0] = '# PinHarita · ' + board.name + ' (BCM GPIO numaraları, Python)'; }
    return lines.join('\n');
  }
  function csvCell(s) { s = String(s == null ? '' : s); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function toCSV(board, assigns) {
    var names = constNames(assigns);
    var rows = [['kart', 'sabit_adi', 'gorev', 'ad', 'pin', 'gpio', 'fiziksel_pin', 'gerilim']];
    assigns.forEach(function (a, i) {
      var p = pinById(board, a.pin) || {}, t = task(a.type) || {};
      rows.push([board.id, names[i], t.label || a.type, a.name || '', p.label || a.pin, p.gpio === null || p.gpio === undefined ? '' : p.gpio, p.phys || '', a.volt ? (a.volt === '5' ? '5 V' : '3,3 V') : '']);
    });
    return rows.map(function (r) { return r.map(csvCell).join(','); }).join('\n');
  }
  function toJSON(board, assigns) {
    return JSON.stringify({ arac: 'PinHarita', kart: board.id, atamalar: assigns.map(function (a) { return { gorev: a.type, pin: a.pin, ad: a.name || '', gerilim: a.volt || null }; }) }, null, 2);
  }

  var API = {
    FUNCS: FUNCS, FUNC_LABEL: FUNC_LABEL, GROUPS: GROUPS, TASKS: TASKS, task: task, pinById: pinById, funcOf: funcOf, supports: supports,
    check: check, encodePlan: encodePlan, decodePlan: decodePlan, toConsts: toConsts, toCSV: toCSV, toJSON: toJSON, constNames: constNames, slug: slug
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else window.PinRules = API;
})();
