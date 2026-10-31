#!/usr/bin/env python3
"""Denetim: devre bulguları (out/facts/<id>.json) ile site verisi (assets/arduino/p/<id>.json) tutarlı mı?
Kullanım: python3 audit.py [id,id,...] [--mark-ready]
 (1) devredeki bileşen sayıları ve dirençler == malzeme listesi   (2) kablo adedi == "Jumper kablolar (N adet)"
 (3) bir Arduino pinine / breadboard deliğine tek kablo ucu, delik çakışması yok
 (4) malzemede Breadboard varsa tüm parçalar breadboard'a takılı     (5) doğrulayıcı/simülatör uyarısı yok, çalışma hatasız
 + kod = sketch dosyası, bağlantı tablosundaki Arduino pinleri == devredekiler, notlarda 'Sık yapılan hatalar' ve 'Dene', görüntü var,
   LCD metinleri ASCII, Türkçe harfli tanımlayıcı yok, "gerçek kartta denendi" gibi doğrulanamaz ifade yok.
--mark-ready: yalnızca denetimden geçen projeleri index.json'da ready:true yapar ve d açıklamasını content/<id>.json'dan yazar."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.environ.get('SITE') or os.path.abspath(os.path.join(HERE, '../..'))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
mark = '--mark-ready' in sys.argv
idx_path = f'{SITE}/assets/arduino/index.json'
idx = json.load(open(idx_path, encoding='utf-8'))
by = {p['id']: p for p in idx['projects']}
ids = args[0].split(',') if args else sorted(f[:-5] for f in os.listdir(f'{HERE}/out/facts') if f.endswith('.json'))

def ohms(txt):
    m = re.search(r'(\d+(?:,\d+)?)\s*([kM]?)\s*Ω', txt)
    if not m: return None
    v = float(m.group(1).replace(',', '.')) * {'': 1, 'k': 1e3, 'M': 1e6}[m.group(2)]
    return str(int(v))

def classify(t):
    l = t.lower()
    if 'pasif buzzer' in l: return 'passivebuzzer'
    if 'aktif buzzer' in l: return 'buzzer'
    if re.search(r'Ω\s*direnç', t): return 'resistor'
    for k, typ in [('potansiyometre', 'pot'), ('rgb', 'rgbled'), (r'\bldr\b', 'ldr'), ('lm35', 'lm35'), ('dht11', 'dht11'), ('hc-sr04', 'hcsr04'), ('ttp223', 'ttp223'),
                   ('eğim', 'tilt'), ('tilt', 'tilt'), ('lcd', 'lcd16x2'), ('servo', 'servo'), (r'\bpir\b', 'pir'),
                   ('keypad', 'keypad4x4'), ('tuş takımı', 'keypad4x4'), ('su seviye', 'waterlevel'), ('yağmur', 'rainsensor'),
                   ('toprak nem', 'soil'), (r'\bir\b.*(sensör|engel)', 'irsensor'), ('hall', 'hallsensor'), ('hmc5883l', 'hmc5883l'),
                   ('röle', 'relay'), (r'\bnpn\b', 'npn'), ('diyot', 'diode'), ('güç kaynağı', 'psu'), (r'\bpil\b', 'battery9v'),
                   ('dc motor', 'dcmotor'), ('pompa', 'dcmotor'), (r'\bfan\b', 'dcmotor'), ('buton', 'button')]:
        if re.search(k, l): return typ
    if re.search(r'direnç', l): return 'resistor'
    if re.search(r'\bled\b', l): return 'led'
    return None

def pin_tokens(s):
    return {re.sub(r'GND\d', 'GND', m) for m in re.findall(r'\b(D\d{1,2}|A[0-5]|5V|3V3|GND\d?|VIN)\b', s)}

results = {}
for i in ids:
    errs, warns = [], []
    fp = f'{HERE}/out/facts/{i}.json'; sp = f'{SITE}/assets/arduino/p/{i}.json'
    if i not in by: errs.append("index.json'da kimlik yok")
    if not os.path.exists(fp): errs.append('facts yok (node build.mjs çalıştır)')
    if not os.path.exists(sp): errs.append('site JSON yok (python3 make_site.py)')
    if errs: results[i] = (errs, warns); continue
    f = json.load(open(fp, encoding='utf-8')); s = json.load(open(sp, encoding='utf-8'))
    # (1) parça sayıları
    want, wres, wires_n, has_bb = {}, {}, None, False
    for t in s['parts']:
        if t.startswith('Arduino Uno'): continue
        if 'Jumper' in t:
            m = re.search(r'\((\d+) adet\)', t)
            if m: wires_n = int(m.group(1))
            else: errs.append(f'Jumper satırında adet yok: {t}')
            continue
        if t.lower().startswith('breadboard'): has_bb = True; continue
        typ = classify(t)
        if not typ: errs.append(f'(1) tanınmayan malzeme satırı: {t}'); continue
        m = re.match(r'(\d+)\s*×', t); n = int(m.group(1)) if m else 1
        want[typ] = want.get(typ, 0) + n
        if typ == 'resistor':
            o = ohms(t)
            if o is None: errs.append(f'(1) direnç değeri okunamadı: {t}')
            else: wres[o] = wres.get(o, 0) + n
    for typ in sorted(set(want) | set(f['counts'])):
        if want.get(typ, 0) != f['counts'].get(typ, 0): errs.append(f"(1) {typ}: malzeme listesinde {want.get(typ, 0)}, devrede {f['counts'].get(typ, 0)}")
    if wres != f['resistors']: errs.append(f"(1) direnç değerleri: malzemede {wres}, devrede {f['resistors']}")
    # (2) kablo
    if wires_n is None: errs.append('(2) malzemede "Jumper kablolar (N adet)" yok')
    elif wires_n != f['wires']: errs.append(f"(2) jumper: metinde {wires_n}, devrede {f['wires']}")
    # (3) çift kullanım
    if f['endpointDup']: errs.append(f"(3) birden çok kablo ucu: {f['endpointDup']}")
    if f['holeClash']: errs.append(f"(3) delik çakışması: {f['holeClash']}")
    # (4) breadboard
    if not has_bb: errs.append('(4) malzemede Breadboard yok (devrede var)')
    else:
        cpath = f'{HERE}/content/{i}.json'
        free = json.load(open(cpath, encoding='utf-8')).get('free', []) if os.path.exists(cpath) else []
        bad = [u for u in f['unplugged'] if u.split('.')[0] not in free]
        if bad: errs.append(f"(4) breadboard'a takılı olmayan uçlar: {bad}")
        if free:
            txt0 = json.dumps(s, ensure_ascii=False)
            if not re.search(r"takılı değil|breadboard dışında", txt0): errs.append("(4) serbest parçalar (breadboard dışı) metinde açıklanmamış ('takılı değil' / 'breadboard dışında')")
    # (5) simülatör
    FLY = "Diyot ters bağlı: anot GND'ye (veya katot 5V'a) gidiyor, akım geçirmez."
    vw = [w for w in f['validator']['warnings'] if w != FLY]
    nfly = len(f['validator']['warnings']) - len(vw)
    if nfly:  # MakersHub yanlış alarmı: yalnızca güç yolu denetimi diyot yönünü doğruladıysa ve diyot sayısı kadar kabul edilir
        if f.get('powerIssues') or nfly > f['counts'].get('diode', 0): errs.append("(5) 'Diyot ters bağlı' uyarısı yanlış alarm olarak kabul edilemedi (güç yolu hatası ya da diyot sayısından fazla)")
        else: warns.append(f"MakersHub yanlış alarmı kabul edildi ({nfly}): doğru bağlı ters (flyback) diyot 'ters bağlı' uyarısı alıyor; ekran görüntüsünde çerçeve gizlenir, notlarda belirtilmeli")
    if f['validator']['errors'] or vw: errs.append(f"(5) doğrulayıcı: {f['validator']}")
    r = f['runtime']
    if r['error']: errs.append(f"(5) çalışma hatası: {r['error']}")
    if r['warnings'] or r['shorted'] or r['overcurrent'] or r['lcdProblem'] or r['diagnostics']: errs.append(f'(5) simülatör uyarısı: {r}')
    if not (f['serial'] or f['toneLog'] or f['buzLog'] or f['ledLog'] or any(f['lcd'].values())): errs.append('(5) gözlenen davranış yok (seri/ton/buzzer/LED/LCD boş)')
    if f.get('powerIssues'): errs.append(f"güç yolu: {f['powerIssues']}")
    # bağlantı tablosu == Uno pinleri
    wt = set()
    for pin, _ in s['wiring']: wt |= pin_tokens(pin)
    if wt != set(f['unoPins']): errs.append(f"bağlantı tablosundaki Arduino pinleri {sorted(wt)} != devredekiler {f['unoPins']}")
    # kod
    doc = json.load(open(f'{HERE}/out/docs/{i}.json', encoding='utf-8'))
    if doc['sketch'].rstrip() + '\n' != s['code']: errs.append('site kodu simülatörde koşulan sketch ile aynı değil')
    nocomment = re.sub(r'//.*', '', s['code']); nostr = re.sub(r'"[^"]*"', '""', nocomment)
    if re.search(r'[ÇĞİÖŞÜçğıöşü]', nostr): errs.append('kodda Türkçe harfli tanımlayıcı var')
    for m in re.finditer(r'lcd\.print\("([^"]*)"\)', s['code']):
        if not m.group(1).isascii(): errs.append(f'LCD metni ASCII değil: {m.group(1)}')
    if not re.search(r'//\s*\S', s['code']): errs.append('kodda yorum yok')
    # notlar / görüntü / ifadeler
    titles = [n[0] for n in s['notes']]
    if not any(t.startswith('Sık yapılan hatalar') for t in titles): errs.append("notlarda 'Sık yapılan hatalar' yok")
    if not any(t.startswith('Dene') for t in titles): errs.append("notlarda 'Dene' yok")
    img = f"{SITE}/{s['img']}"
    if not os.path.exists(img) or os.path.getsize(img) < 20000: errs.append('görüntü yok ya da çok küçük')
    alltxt = json.dumps(s, ensure_ascii=False)
    if f['validator']['warnings'] and not re.search(r'yanlış (uyarı|alarm)', alltxt): errs.append("MakersHub'ın yanlış 'ters bağlı' uyarısı notlarda açıklanmamış ('yanlış uyarı' ifadesi yok)")
    if re.search(r'gerçek kartta (denendi|test edildi|çalıştırıldı)', alltxt): errs.append('doğrulanamaz ifade: gerçek kartta denendi')
    if 'denendi' in alltxt and 'gerçek kartta denenmedi' not in alltxt: warns.append("'denendi' geçiyor: simülatörde denendiği açık yazılmış mı kontrol et")
    # adımlarda pin anılıyor mu (uyarı)
    st = ' '.join(s['steps'])
    miss = [p for p in f['unoPins'] if p not in ('GND',) and not re.search(r'\b' + p + r'\b', st)]
    ranges = re.findall(r"D(\d+)'\w+ D(\d+)", st)
    for a, b in ranges: miss = [m for m in miss if not (m.startswith('D') and int(a) <= int(m[1:]) <= int(b))]
    if miss: warns.append(f'adımlarda anılmayan Arduino pinleri: {miss}')
    results[i] = (errs, warns)

ok = [i for i, (e, w) in results.items() if not e]
for i, (e, w) in results.items():
    print(('GEÇTİ ' if not e else 'KALDI ') + i)
    for x in e: print('   -', x)
    for x in w: print('   ~', x)
json.dump({i: {'errors': e, 'warnings': w} for i, (e, w) in results.items()}, open(f'{HERE}/out/audit.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if mark:
    for i in ok:
        c = json.load(open(f'{HERE}/content/{i}.json', encoding='utf-8'))
        by[i]['ready'] = True; by[i]['d'] = c['d']
    json.dump(idx, open(idx_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ready yapıldı:', ok)
sys.exit(0 if len(ok) == len(results) else 1)
