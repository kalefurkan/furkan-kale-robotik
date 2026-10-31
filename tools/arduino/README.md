# Arduino proje hattı (MakersHub Studio simülatörü -> ekran görüntüsü -> site verisi)

Bir proje için: devre (simülatörde gerçekten kurulur) + sketch + anlatım -> `assets/devre/<id>.png` ve `assets/arduino/p/<id>.json`.
Yalnızca `localhost` MakersHub'a bağlanır; MakerLab kaynağını sadece OKUR (değiştirmez). Uzak/canlı hizmete dokunmaz.

## Dosyalar
| Yol | Görev |
|---|---|
| `lib.ts` | `Builder` (Uno + breadboard, `plug`, `wire`, `ledRes`, `free`), renkler, `Project` tipi |
| `projects/pNN.ts` | Proje başına devre tanımı (`build`), simülasyon senaryosu (`sim`), ekran görüntüsü eylemleri (`shoot`) |
| `sketches/*.ino` | Sketch'ler (Türkçe yorumlu) |
| `content/<id>.json` | Anlatım: `sketch`, `d`, `parts`, `wiring`, `steps`, `notes` |
| `core.ts`, `build.mjs` | Belgeleri (`out/docs`) ve doğrulama bulgularını (`out/facts`) üretir; simülasyonu node'da koşturur |
| `shoot.cjs` | Playwright: test hesabı, proje, editör, "Sığdır", "Simülasyonu Başlat", eylemler, 3x kırpılmış PNG |
| `make_site.py` | `content` + sketch -> `assets/arduino/p/<id>.json` |
| `audit.py` | Denetim (aşağıda); `--mark-ready` ile geçenleri `index.json`'da `ready:true` yapar |
| `syntax_check.sh`, `stub/` | `g++ -fsyntax-only` ile sahte başlıklarla sketch söz dizimi denetimi (gerçek AVR derleyicisi yok) |

## Çalıştırma
```sh
# 1) yerel MakersHub (ayrı terminal / arka plan)
cd /Users/furkan/Documents/GitHub/MakerLab && npx wrangler d1 migrations apply makerlab-db --local && npm run dev   # :8787
# 2) bu klasörde
cd tools/arduino
node build.mjs [id,id]          # out/docs, out/facts, out/shoot.json (MAKERLAB env ile yol değişir)
sh syntax_check.sh              # sketch söz dizimi
node shoot.cjs [id,id]          # assets/devre/<id>.png  (BASE ve SITE env ile değişir; yalnızca localhost)
python3 make_site.py [id,id]    # assets/arduino/p/<id>.json
python3 audit.py [id,id] --mark-ready
```
İş bitince `npm run dev` sürecini öldür. Test hesabı her çalıştırmada rastgele `@example.test` e-postası ve parolayla açılır (parola yazdırılmaz).

## Yeni proje eklemek
1. `projects/pNN.ts`: `id` index.json'daki kimlikle aynı olmalı (uydurma kimlik yok). `build(b)` içinde parçaları `b.plug("c10", {...})` ile breadboard'a tak, `b.wire("uno.D8", "bb.e10")` ile kablola.
2. `sketches/<ad>.ino`, `content/<id>.json` yaz. `sim.events` ile zamanlı girdi (buton, sensör kaydırıcısı) ver, `node build.mjs <id>` çıktısındaki `out/facts/<id>.json` (serial, toneLog, buzLog, ledLog, lcd) ile davranışı GÖZLE; notlardaki kalibrasyon sayıları buradan alınmalı.
3. `shoot` eylemleri: `{waitText}` (Seri Monitör metnini bekler), `{press|down|up}` (buton id'si), `{presses:{id,n}}`, `{wait}`; ardından görüntüyü gözle kontrol et.
4. `audit.py` geçmeden ready yapma.

## Denetim (audit.py)
(1) devre bileşen/direnç sayıları == malzeme metni, (2) kablo adedi == "Jumper kablolar (N adet)", (3) tek kablo ucu/delik, delik çakışması yok,
(4) malzemede Breadboard varsa tüm uçlar breadboard'a takılı, (5) MakersHub doğrulayıcı/simülatör uyarısı, kısa devre, aşırı akım, çalışma hatası yok.
Ek: bağlantı tablosundaki Arduino pinleri == devre, kod == koşulan sketch, kodda Türkçe harfli tanımlayıcı yok, LCD metni ASCII, "Sık yapılan hatalar" ve "Dene" notları, doğrulanamaz ifade ("gerçek kartta denendi") yok.

## Öğrenilen kurallar (tuzaklar)
- Breadboard: a–e bir şerit, f–j ayrı şerit. Direnç 4 sütun arayla. Çok LED'de LED başına dikey direnç (`rotation: 90`, e -> h, orta oluğu aşar) + j -> alt ray kablosu yer kazandırır.
- Kabloları parçanın gövdesini kapatmayan satıra bağla (LED/LDR/buton/pot/LM35/PIR: e; HC-SR04 ve LCD gibi aşağı doğru uzanan gövdelerde a).
- Arayüz kablo yönlendiricisi A* (60 bin adım sınırı); hedef delik komşu LED gövdeleriyle çevriliyse yol bulunamaz ve kablolar pin hizasında düz bir "L" olarak üst üste biner. Çok yakın LED'lerde (2 sütun aralık) LED'i d satırına, kabloyu a satırına bağla; böylece kablo gövdenin üstünden girebilir. Çok uzun/çok kablolu devrelerde `builder: { bbX }` ile breadboard'u Uno'ya yaklaştırmak yardımcı olabilir.
- Simülatör `delay()` içinde sanal zamanı hemen ilerletir: `tone(pin, f, süre)` + `delay(süre)` kalıbında kare "bitmiş" görünür, pasif buzzer çalıyor görünmez. `tone(pin, f); delay(süre); noTone(pin);` kalıbını kullan.
- Çok boyutlu dizi, `sizeof` benzeri yapılar ve LCD'de Türkçe harf (ekranda `?`) desteklenmez; tek boyutlu dizi/bit maskesi ve ASCII metin kullan. Serial Monitör metni Türkçe harf alabilir.
- Pot kaydırıcısı: konum 0 = A ucu (genelde 5V tarafı).
- A0 boşta: `randomSeed(analogRead(A0))` simülatörde hep aynı dizi verir (gerçek kartta farklı).
