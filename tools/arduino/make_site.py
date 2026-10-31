#!/usr/bin/env python3
"""content/<id>.json + sketches/<sketch>.ino -> assets/arduino/p/<id>.json (site verisi).
Kullanım: python3 make_site.py [id,id,...]   (argüman yoksa content/ altındakilerin hepsi)
content/<id>.json alanları: sketch (sketches/ altındaki ad), d (index.json açıklaması), parts, wiring, steps, notes.
Başlık index.json'daki 'n. t' değerinden, görüntü yolu assets/devre/<id>.png olarak üretilir. index.json'a DOKUNMAZ (bkz. audit.py --mark-ready)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.environ.get('SITE') or os.path.abspath(os.path.join(HERE, '../..'))
idx = json.load(open(f'{SITE}/assets/arduino/index.json', encoding='utf-8'))
by = {p['id']: p for p in idx['projects']}
ids = sys.argv[1].split(',') if len(sys.argv) > 1 else sorted(f[:-5] for f in os.listdir(f'{HERE}/content') if f.endswith('.json'))
for i in ids:
    c = json.load(open(f'{HERE}/content/{i}.json', encoding='utf-8'))
    p = by[i]  # kimlik index.json'da zaten var; uydurma kimlik kabul edilmez
    code = open(f"{HERE}/sketches/{c['sketch']}.ino", encoding='utf-8').read().rstrip() + '\n'
    title = f"{p['n']}. {p['t']}" if p.get('n') else p['t']
    out = {'parts': c['parts'], 'wiring': c['wiring'], 'img': f'assets/devre/{i}.png', 'steps': c['steps'], 'code': code, 'notes': c['notes'], 'title': title}
    os.makedirs(f'{SITE}/assets/arduino/p', exist_ok=True)
    json.dump(out, open(f'{SITE}/assets/arduino/p/{i}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('yazıldı', i)
