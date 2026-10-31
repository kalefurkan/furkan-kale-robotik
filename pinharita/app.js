(function () {
  'use strict';
  var BOARDS = window.PH_BOARDS, R = window.PinRules;
  var FILES = ['./', 'index.html', 'boards.js', 'rules.js', 'app.js', 'manifest.webmanifest', '../assets/favicon.svg'];
  var CACHE = 'pinharita-v1';
  var $ = function (id) { return document.getElementById(id); };
  var GCOL = { pwm: 'var(--f-pwm)', adc: 'var(--f-adc)', dac: 'var(--f-dac)', i2c: 'var(--f-i2c)', spi: 'var(--f-spi)', uart: 'var(--f-uart)', int: 'var(--f-int)', touch: 'var(--f-touch)' };
  var GSHORT = { pwm: 'PWM', adc: 'ADC', dac: 'DAC', i2c: 'I²C', spi: 'SPI', uart: 'UART', int: 'INT', touch: 'T' };
  var WLAB = { unusable: 'Kullanılamaz', boot: 'Önyükleme sırasında sorun çıkarabilir', usb: 'USB pini', adc2: 'ADC2 / Wi-Fi', cond: 'Koşullu kullanılamaz', led: 'Yerleşik LED', info: 'Bilgi' };
  var state = { board: BOARDS[0], sel: null, filters: {}, mode: 'all', flex: false, q: '', assigns: [] };

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'class') e.className = attrs[k]; else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function store(op, key, val) { try { if (op === 'get') return localStorage.getItem(key); if (op === 'set') localStorage.setItem(key, val); if (op === 'del') localStorage.removeItem(key); } catch (e) { } return null; }
  function groupOf(f) { for (var i = 0; i < R.GROUPS.length; i++) if (R.GROUPS[i].fs.indexOf(f) >= 0) return R.GROUPS[i].id; return null; }
  function pinById(id) { return R.pinById(state.board, id); }
  function visibleFuncs(p) { return p.funcs.filter(function (f) { return state.flex || !f.flex; }); }
  function pinGroups(p) { var s = {}; visibleFuncs(p).forEach(function (f) { var g = groupOf(f.f); if (g) s[g] = 1; }); return Object.keys(s); }
  function toast(msg) { var t = $('toast'); t.textContent = msg; clearTimeout(toast.t); toast.t = setTimeout(function () { t.textContent = ''; }, 4000); }

  /* ---------- kart seçimi ---------- */
  function buildBoards() {
    var wrap = $('boards'); wrap.textContent = '';
    BOARDS.forEach(function (b) {
      var btn = h('button', { type: 'button', 'aria-pressed': String(b === state.board), 'data-b': b.id }, [h('b', { text: b.name }), h('small', { text: b.sub })]);
      btn.addEventListener('click', function () { setBoard(b.id); });
      wrap.appendChild(btn);
    });
  }
  function setBoard(id, keepAssigns) {
    var b = BOARDS.filter(function (x) { return x.id === id; })[0] || BOARDS[0];
    state.board = b; state.sel = null;
    if (!keepAssigns) state.assigns = loadPlan(b.id);
    store('set', 'pinharita:board', b.id);
    $('flexl').hidden = !b.flexible;
    if (!b.flexible) state.flex = false; $('flex').checked = state.flex;
    buildBoards(); buildPlanForm(); renderAll();
    syncHash();
  }

  /* ---------- filtre ---------- */
  function buildFilters() {
    var c = $('chips'); c.textContent = '';
    R.GROUPS.forEach(function (g) {
      var b = h('button', { type: 'button', 'aria-pressed': 'false', style: '--c:' + GCOL[g.id], 'data-g': g.id, text: g.label });
      b.addEventListener('click', function () { state.filters[g.id] = !state.filters[g.id]; b.setAttribute('aria-pressed', String(!!state.filters[g.id])); renderBoard(); });
      c.appendChild(b);
    });
    var lg = $('legend'); lg.textContent = '';
    R.GROUPS.forEach(function (g) { lg.appendChild(h('span', {}, [h('i', { style: '--c:' + GCOL[g.id] }), g.label])); });
    lg.appendChild(h('span', {}, [h('i', { style: '--c:var(--f-power)' }), 'Güç']));
    lg.appendChild(h('span', {}, [h('i', { style: '--c:var(--f-gnd)' }), 'GND']));
    lg.appendChild(h('span', { text: '⚠ kesik çerçeve = önyükleme/USB/koşullu uyarı' }));
    lg.appendChild(h('span', { text: '✕ üstü çizili = kullanılamaz' }));
    lg.appendChild(h('span', { text: 'Sarı etiket = planında atanmış' }));
  }
  function matches(p) {
    var act = Object.keys(state.filters).filter(function (k) { return state.filters[k]; });
    var okF = true;
    if (act.length) {
      var gs = pinGroups(p);
      okF = state.mode === 'all' ? act.every(function (g) { return gs.indexOf(g) >= 0; }) : act.some(function (g) { return gs.indexOf(g) >= 0; });
    }
    var q = state.q.trim().toLowerCase(), okQ = true;
    if (q) {
      var hay = [p.label, p.id, p.gpio === null || p.gpio === undefined ? '' : 'gpio' + p.gpio, p.phys || '', p.kind === 'gnd' ? 'gnd toprak' : '', p.kind === 'power' ? 'güç power' : ''];
      p.funcs.forEach(function (f) { hay.push(R.FUNC_LABEL[f.f], f.f, f.per || ''); });
      p.warns.forEach(function (w) { hay.push(WLAB[w.type]); if (w.type === 'boot') hay.push('strapping'); });
      okQ = hay.join(' ').toLowerCase().replace(/²/g, '2').indexOf(q.replace(/²/g, '2')) >= 0;
    }
    return okF && okQ && (act.length || q ? p.kind === 'gpio' || (!act.length && okQ) : true);
  }

  /* ---------- diyagram ---------- */
  function pinBtn(p, gi, ii, asgMap, badMap) {
    var cls = 'pin k-' + p.kind;
    var wt = p.warns.map(function (w) { return w.type; });
    if (wt.indexOf('unusable') >= 0) cls += ' w-unusable';
    else if (wt.some(function (t) { return t === 'boot' || t === 'usb' || t === 'cond'; })) cls += ' w-boot';
    var lab = p.label;
    var gs = p.kind === 'gpio' ? pinGroups(p) : [];
    var desc = lab + (p.phys && p.kind === 'gpio' ? ', fiziksel pin ' + p.phys : '') + (gs.length ? '. İşlevler: ' + gs.map(function (g) { return GSHORT[g]; }).join(', ') : '') + (wt.indexOf('boot') >= 0 ? '. Önyükleme uyarısı var' : '') + (wt.indexOf('unusable') >= 0 ? '. Kullanılamaz' : '');
    var attrs = { type: 'button', class: cls, 'data-id': p.id, 'data-g': gi, 'data-i': ii, 'aria-label': desc, 'aria-pressed': String(state.sel === p.id) };
    if (asgMap[p.id]) { attrs['data-asg'] = asgMap[p.id]; }
    var b = h('button', attrs);
    if (state.sel === p.id) b.classList.add('sel');
    if (asgMap[p.id]) b.classList.add('asg');
    if (badMap[p.id]) b.classList.add('bad');
    var mk = wt.indexOf('unusable') >= 0 ? '✕' : (wt.some(function (t) { return t === 'boot' || t === 'usb' || t === 'cond'; }) ? '⚠' : '');
    if (p.phys && state.board.layout.kind !== 'uno') b.appendChild(h('span', { class: 'ph', text: p.phys.replace(/^J\d-/, '') }));
    b.appendChild(h('span', { class: 'lb', text: lab }));
    if (mk) b.appendChild(h('span', { class: 'mk', text: mk, 'aria-hidden': 'true' }));
    if (gs.length) {
      var bd = h('span', { class: 'bd', 'aria-hidden': 'true' });
      gs.forEach(function (g) { bd.appendChild(h('span', { style: '--c:' + GCOL[g], title: g.toUpperCase(), text: GSHORT[g] })); });
      b.appendChild(bd);
    }
    b.addEventListener('click', function () { selectPin(p.id); });
    return b;
  }
  function renderBoard() {
    var b = state.board, root = $('board');
    root.textContent = ''; root.className = 'board ' + (b.layout.kind === 'uno' ? 'uno' : '');
    $('bt').textContent = b.name + ' pin diyagramı';
    var asgMap = {}, badMap = {};
    state.assigns.forEach(function (a) { var t = R.task(a.type); asgMap[a.pin] = (asgMap[a.pin] ? asgMap[a.pin] + '+' : '') + (a.name ? a.name.slice(0, 10) : (t ? t.label.split(' ')[0] : a.type)); });
    R.check(b, state.assigns).forEach(function (m) { if (m.level === 'err') m.pins.forEach(function (id) { badMap[id] = 1; }); });
    var total = 0, hits = 0;
    b.layout.groups.forEach(function (g, gi) {
      var box = h('div', { class: 'grp ' + g.dir, role: 'group', 'aria-label': g.title });
      box.appendChild(h('h3', { text: g.title }));
      var rowEl = g.dir === 'h' ? h('div', { class: 'row' }) : box;
      g.pins.forEach(function (id, ii) {
        var p = pinById(id), el = pinBtn(p, gi, ii, asgMap, badMap);
        var m = matches(p), active = Object.keys(state.filters).some(function (k) { return state.filters[k]; }) || state.q.trim();
        if (p.kind === 'gpio') total++;
        if (active) { if (m) { el.classList.add('hit'); if (p.kind === 'gpio') hits++; } else el.classList.add('dim'); }
        rowEl.appendChild(el);
      });
      if (g.dir === 'h') box.appendChild(rowEl);
      root.appendChild(box);
      if (b.layout.kind === 'two' && gi === 0) {
        root.appendChild(h('div', { class: 'mid', 'aria-hidden': 'true' }, [h('div', { text: b.name }, [h('small', { text: b.layout.usb || '' })])]));
      }
    });
    var active2 = Object.keys(state.filters).some(function (k) { return state.filters[k]; }) || state.q.trim();
    $('cnt').textContent = active2 ? hits + ' / ' + total + ' GPIO pini eşleşiyor' : total + ' GPIO pini';
    $('bhint').textContent = b.layout.kind === 'uno' ? 'Üst başlık sırası kartın üst kenarındaki konnektöre benzer; UNO R3 uyumlu düzendir.' : 'Başlık sıraları kartın üstten bakışındaki diziliştir (yerleşim kart sürümüne göre değişebilir).';
  }

  /* ---------- pin ayrıntısı ---------- */
  var codeTab = 'ar';
  function fill(t, p, f) {
    var m = /(\d+)(?!.*\d)/.exec(f.per || '');
    var i = m ? m[1] : '0';
    return t.replace(/\{s\}/g, p.sym).replace(/\{n\}/g, p.gpio).replace(/\{i\}/g, i).replace(/\{u\}/g, String(+i + 1)).replace(/\{ch\}/g, f.ch !== undefined ? f.ch : '0');
  }
  function selectPin(id) {
    state.sel = id; renderBoard(); renderDetail();
    var el = $('board').querySelector('[data-id="' + id + '"]'); if (el && document.activeElement !== el && document.activeElement && document.activeElement.classList.contains('pin')) el.focus();
  }
  function renderDetail() {
    var d = $('detail'); d.textContent = '';
    var p = state.sel ? pinById(state.sel) : null;
    if (!p) { d.appendChild(h('p', { class: 'hint', text: 'Diyagramdan bir pine tıkla.' })); return; }
    var b = state.board;
    d.appendChild(h('div', { class: 'dh' }, [h('h3', { text: p.label }), h('small', { text: (p.phys ? 'fiziksel/başlık pin ' + p.phys : '') + (p.gpio !== null && p.gpio !== undefined ? ' · GPIO ' + p.gpio : '') })]));
    if (p.kind !== 'gpio') {
      d.appendChild(h('p', { text: (p.kind === 'gnd' ? 'Toprak (GND) pini.' : p.kind === 'power' ? 'Güç pini.' : 'Özel pin (GPIO değil).') + ' ' + (p.extra || '') }));
      d.appendChild(h('div', { class: 'tools' }));
      return;
    }
    d.appendChild(h('p', { text: 'Mantık seviyesi: ' + p.level + (b.logic < 5 ? ' (5 V\'a dayanıklı değil, seviye dönüştürücü kullan)' : ' (5 V kart)') }));
    var rows = p.funcs.filter(function (f) { return f.f !== 'dig' || true; });
    var t = h('table'); t.appendChild(h('tr', {}, [h('th', { text: 'İşlev' }), h('th', { text: 'Çevre birimi' }), h('th', { text: 'Not' })]));
    rows.forEach(function (f) {
      var note = f.def ? 'Arduino varsayılanı' : (f.flex ? 'GPIO matrisi (esnek)' : '');
      var tr = h('tr', {}, [h('td', { text: R.FUNC_LABEL[f.f] }), h('td', { text: f.per || '—' }), h('td', {}, [note, f.verify ? h('span', { class: 'vf', text: 'doğrula' }) : null])]);
      t.appendChild(tr);
    });
    d.appendChild(h('div', { class: 'tbl' }, [t]));
    if (p.warns.length) {
      var ul = h('ul', { class: 'wlist' });
      p.warns.forEach(function (w) {
        var lv = w.type === 'unusable' ? 'err' : (w.type === 'led' || w.type === 'info' ? 'info' : 'warn');
        ul.appendChild(h('li', { class: lv }, [h('b', { text: WLAB[w.type] }), w.msg, w.verify ? h('span', { class: 'vf', text: 'doğrula' }) : null]));
      });
      d.appendChild(ul);
    }
    // kod
    var hasAr = !!(b.code.ar), hasMp = !!(b.code.mp);
    if (!hasAr && codeTab === 'ar') codeTab = 'mp';
    if (!hasMp && codeTab === 'mp') codeTab = 'ar';
    var tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': 'Kod dili' });
    [['ar', b.id === 'pi5' ? '' : (b.id === 'esp32-s3' ? 'Arduino-ESP32' : 'Arduino'), hasAr], ['mp', b.id === 'pi5' ? 'Python' : 'MicroPython', hasMp]].forEach(function (x) {
      if (!x[2] || !x[1]) return;
      var bt = h('button', { type: 'button', 'aria-pressed': String(codeTab === x[0]), text: x[1] });
      bt.addEventListener('click', function () { codeTab = x[0]; renderDetail(); });
      tabs.appendChild(bt);
    });
    d.appendChild(h('div', { class: 'cl', text: 'Kodda nasıl yazılır' }));
    var tpl = b.code[codeTab];
    if (!tpl) { d.appendChild(h('p', { class: 'hint', text: 'Bu kart için bu dilde not yok.' })); }
    else {
      if (tabs.children.length > 1) d.appendChild(tabs);
      var seen = {}, lines = [];
      p.funcs.slice().sort(function (a, c) { return (a.flex ? 1 : 0) - (c.flex ? 1 : 0); }).forEach(function (f) {
        if (!tpl[f.f] || seen[f.f]) return; seen[f.f] = 1;
        lines.push('// ' + R.FUNC_LABEL[f.f] + (f.per ? ' · ' + f.per : '') + (f.flex ? ' (GPIO matrisi)' : '') + '\n' + fill(tpl[f.f], p, f));
      });
      var txt = lines.join('\n\n');
      if (codeTab === 'mp') txt = txt.replace(/^\/\//gm, '#');
      d.appendChild(h('pre', { tabindex: '0', 'aria-label': 'Örnek kod', text: txt }));
      if (b.codeNote && codeTab === 'mp') d.appendChild(h('p', { class: 'hint', text: b.codeNote }));
      d.appendChild(h('p', { class: 'hint', text: 'Örnekler pin kullanımını gösterir; derlenmemiş ve gerçek donanımda denenmemiştir.' }));
    }
    var go = h('button', { class: 'btn', type: 'button', text: 'Bu pine görev ata' });
    go.addEventListener('click', function () { $('fpin').value = p.id; $('ftask').focus(); $('p-plan').scrollIntoView({ block: 'nearest' }); });
    d.appendChild(go);
  }

  /* ---------- plan ---------- */
  function planKey(id) { return 'pinharita:plan:' + id; }
  function loadPlan(id) {
    var raw = store('get', planKey(id));
    if (!raw) return [];
    try { var a = JSON.parse(raw); var b = BOARDS.filter(function (x) { return x.id === id; })[0]; return (Array.isArray(a) ? a : []).filter(function (x) { return R.task(x.type) && R.pinById(b, x.pin); }).slice(0, 200); } catch (e) { return []; }
  }
  function savePlan() { store('set', planKey(state.board.id), JSON.stringify(state.assigns)); syncHash(); }
  function syncHash() { try { history.replaceState(null, '', '#' + R.encodePlan(state.board.id, state.assigns)); } catch (e) { } }
  function buildPlanForm() {
    var ts = $('ftask'), ps = $('fpin'); ts.textContent = ''; ps.textContent = '';
    R.TASKS.forEach(function (t) { ts.appendChild(h('option', { value: t.id, text: t.label })); });
    var n = 0;
    state.board.pins.forEach(function (p) { if (p.kind === 'gpio') { n++; ps.appendChild(h('option', { value: p.id, text: p.label + (p.phys && state.board.layout.kind !== 'uno' ? ' · pin ' + p.phys : '') })); } });
    state.board.pins.forEach(function (p) { if (p.kind !== 'gpio') ps.appendChild(h('option', { value: p.id, text: p.label + ' (güç/özel)' })); });
    $('pcount').textContent = n + ' GPIO pini';
  }
  function renderPlan() {
    var ul = $('alist'); ul.textContent = '';
    if (!state.assigns.length) ul.appendChild(h('li', {}, [h('span', { class: 'hint', style: 'margin:0', text: 'Henüz görev yok. Yukarıdan bir görev ve pin seç.' })]));
    state.assigns.forEach(function (a) {
      var t = R.task(a.type), p = pinById(a.pin);
      var li = h('li', {}, [h('span', { class: 't' }, [h('b', { text: t.label }), ' → ', h('code', { text: p.label }), a.name ? ' · ' + a.name : '', a.volt ? ' · ' + (a.volt === '5' ? '5 V' : '3,3 V') + ' cihaz' : ''])]);
      var rm = h('button', { type: 'button', class: 'btn alt', text: 'Kaldır', 'aria-label': t.label + ' ' + p.label + ' görevini kaldır' });
      rm.addEventListener('click', function () { state.assigns = state.assigns.filter(function (x) { return x !== a; }); savePlan(); renderAll(); });
      li.appendChild(rm); ul.appendChild(li);
    });
    var res = R.check(state.board, state.assigns), m = $('msgs'); m.textContent = '';
    if (!res.length) m.appendChild(h('li', { class: 'good' }, [h('b', { text: state.assigns.length ? 'Sorun yok' : 'Denetim' }), state.assigns.length ? 'Bilinen kurallara göre çakışma ya da uyarı bulunmadı. Bu, devrenin çalışacağı anlamına gelmez.' : 'Görev ekledikçe çakışmalar burada Türkçe gerekçesiyle görünür.']));
    var LV = { err: 'Hata', warn: 'Uyarı', info: 'Bilgi' };
    res.forEach(function (r) {
      var li = h('li', { class: r.level, tabindex: '0', role: 'button', 'aria-label': LV[r.level] + ': ' + r.msg }, [h('b', { text: LV[r.level] }), r.msg]);
      var go = function () { if (r.pins[0]) selectPin(r.pins[0]); };
      li.addEventListener('click', go); li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      m.appendChild(li);
    });
    var c = R.toConsts(state.board, state.assigns);
    $('consts').textContent = state.assigns.length ? c : '// Görev ekleyince pin sabitleri burada oluşur.';
    $('clab').textContent = state.board.code.ar ? 'Arduino sabitleri' : 'Python sabitleri';
    $('bconst').textContent = state.board.code.ar ? 'Arduino sabitleri olarak kopyala' : 'Sabitleri kopyala';
  }
  function copy(text, okMsg) {
    var done = function () { toast(okMsg); };
    var fb = function () { var ta = h('textarea', { 'aria-hidden': 'true', style: 'position:fixed;opacity:0' }); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Kopyalanamadı; metni elle seç.'); } ta.remove(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fb); else fb();
  }
  function download(name, mime, text) {
    var a = h('a', { href: URL.createObjectURL(new Blob([text], { type: mime })), download: name });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast(name + ' indirildi.');
  }

  /* ---------- kaynaklar ---------- */
  function renderSources() {
    var b = state.board;
    $('srct').textContent = 'Kaynaklar · ' + b.name;
    var ol = $('srcs'); ol.textContent = '';
    b.sources.forEach(function (s) {
      ol.appendChild(h('li', {}, [h('a', { href: s.u, target: '_blank', rel: 'noopener noreferrer', text: s.t }), s.verify ? h('span', { class: 'vf', text: 'metni doğrulanamadı' }) : null]));
    });
    var nl = $('notes'); nl.textContent = '';
    b.notes.forEach(function (n) { nl.appendChild(h('li', { text: n })); });
  }

  function renderAll() { renderBoard(); renderDetail(); renderPlan(); renderSources(); }

  /* ---------- klavye ---------- */
  function keyNav(e) {
    var t = e.target; if (!t.classList || !t.classList.contains('pin')) return;
    var gi = +t.getAttribute('data-g'), ii = +t.getAttribute('data-i');
    var groups = state.board.layout.groups, g = groups[gi], v = g.dir === 'v';
    var dg = 0, di = 0, k = e.key;
    if (k === 'ArrowDown') { if (v) di = 1; else dg = 1; }
    else if (k === 'ArrowUp') { if (v) di = -1; else dg = -1; }
    else if (k === 'ArrowRight') { if (v) dg = 1; else di = 1; }
    else if (k === 'ArrowLeft') { if (v) dg = -1; else di = -1; }
    else if (k === 'Home') { di = -999; } else if (k === 'End') { di = 999; } else return;
    e.preventDefault();
    var ng = Math.max(0, Math.min(groups.length - 1, gi + dg)), ni = ii + di;
    ni = Math.max(0, Math.min(groups[ng].pins.length - 1, ni));
    var el = $('board').querySelector('[data-g="' + ng + '"][data-i="' + ni + '"]');
    if (el) el.focus();
  }

  /* ---------- çevrimdışı ---------- */
  function offline() {
    var o = $('off');
    if (!('serviceWorker' in navigator) || !window.caches) { o.textContent = 'Çevrimdışı: bu tarayıcıda/adreste desteklenmiyor'; return; }
    navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function () {
      return caches.open(CACHE).then(function (c) {
        return Promise.all(FILES.map(function (f) { return c.match(new URL(f, location.href).href, { ignoreSearch: true }).then(function (r) { return !!r; }); }));
      });
    }).then(function (arr) {
      var n = arr.filter(Boolean).length;
      if (n === FILES.length) { o.textContent = 'Çevrimdışı hazır (' + n + '/' + FILES.length + ' dosya)'; o.className = 'ready'; }
      else o.textContent = 'Çevrimdışı kısmen hazır (' + n + '/' + FILES.length + ' dosya)';
    }).catch(function () { o.textContent = 'Çevrimdışı: kayıt başarısız (HTTP/HTTPS gerekli)'; });
  }

  /* ---------- başlangıç ---------- */
  function init() {
    buildFilters();
    var fromHash = location.hash.length > 1 ? R.decodePlan(location.hash, BOARDS) : null;
    var id = fromHash ? fromHash.board.id : (store('get', 'pinharita:board') || BOARDS[0].id);
    if (fromHash) { state.board = fromHash.board; state.assigns = fromHash.assigns; }
    $('q').addEventListener('input', function (e) { state.q = e.target.value; renderBoard(); });
    $('q').addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.target.value = ''; state.q = ''; renderBoard(); } });
    $('mode').addEventListener('change', function (e) { state.mode = e.target.value; renderBoard(); });
    $('flex').addEventListener('change', function (e) { state.flex = e.target.checked; renderBoard(); if (state.sel) renderDetail(); });
    $('fclear').addEventListener('click', function () { state.filters = {}; state.q = ''; $('q').value = ''; Array.prototype.forEach.call($('chips').children, function (b) { b.setAttribute('aria-pressed', 'false'); }); renderBoard(); });
    $('board').addEventListener('keydown', keyNav);
    document.addEventListener('keydown', function (e) { if (e.key === '/' && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $('q').focus(); } });
    $('form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.assigns.length >= 200) { toast('En fazla 200 görev eklenebilir.'); return; }
      state.assigns.push({ id: 'a' + Date.now() + '_' + state.assigns.length, type: $('ftask').value, pin: $('fpin').value, name: $('fname').value.trim().slice(0, 40), volt: $('fvolt').value });
      $('fname').value = ''; savePlan(); renderAll();
    });
    $('bshare').addEventListener('click', function () { syncHash(); copy(location.href, 'Bağlantı kopyalandı.'); });
    $('bconst').addEventListener('click', function () { if (!state.assigns.length) { toast('Önce görev ekle.'); return; } copy(R.toConsts(state.board, state.assigns), 'Sabitler kopyalandı.'); });
    $('bcsv').addEventListener('click', function () { download('pinharita-' + state.board.id + '.csv', 'text/csv;charset=utf-8', '﻿' + R.toCSV(state.board, state.assigns)); });
    $('bjson').addEventListener('click', function () { download('pinharita-' + state.board.id + '.json', 'application/json', R.toJSON(state.board, state.assigns)); });
    $('bclear').addEventListener('click', function () { if (!state.assigns.length) return; state.assigns = []; savePlan(); renderAll(); toast('Plan temizlendi.'); });
    window.addEventListener('hashchange', function () { var d = R.decodePlan(location.hash, BOARDS); if (d && (d.board.id !== state.board.id || JSON.stringify(d.assigns.map(function (a) { return [a.type, a.pin, a.name, a.volt]; })) !== JSON.stringify(state.assigns.map(function (a) { return [a.type, a.pin, a.name, a.volt]; })))) { state.assigns = d.assigns; setBoard(d.board.id, true); savePlan(); } });
    setBoard(id, !!fromHash);
    if (fromHash) toast('Bağlantıdaki plan yüklendi.');
    offline();
  }
  init();
})();
