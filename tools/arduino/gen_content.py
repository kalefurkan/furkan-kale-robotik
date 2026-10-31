#!/usr/bin/env python3
"""Seviye 2 (21-40) anlatım içerikleri: content/<id>.json üretir. Kullanım: python3 gen_content.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
C = {}
def add(id, sketch, d, parts, wiring, steps, notes, free=None):
    C[id] = dict(sketch=sketch, d=d, parts=parts, wiring=wiring, steps=steps, notes=notes)
    if free: C[id]['free'] = free

UNO = "Arduino Uno ve USB kablosu"
LCDP = ["1 × 16x2 LCD ekran (HD44780)", "1 × 220 Ω direnç (LCD arka ışığı)"]
LCDW = [["5V", "Alttaki artı (+) rayı: LCD VDD ve arka ışık direncinin ucu"], ["GND (GND2)", "Alttaki eksi (−) rayı: LCD VSS, V0, RW ve K"],
        ["D12", "LCD RS"], ["D11", "LCD E"], ["D5", "LCD D4"], ["D4", "LCD D5"], ["D3", "LCD D6"], ["D2", "LCD D7"]]
LCDS = ["LCD'yi breadboard'un en üst sırasına (a satırı) tak: 12 pini sırayla 2–13. sütunlara gelsin (VSS, VDD, V0, RS, RW, E, D4, D5, D6, D7, A, K). Gerçek 16x2 LCD'nin 16 pini vardır; D0–D3 pinleri 4 bit modda boş kalır, simülatördeki ekran yalnızca kullanılan 12 pini gösterir.",
        "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
        "LCD güç kabloları: e2 → eksi rayı (VSS), e3 → artı rayı (VDD), e4 → eksi rayı (V0), e6 → eksi rayı (RW), e13 → eksi rayı (K). Arka ışık için 220 Ω direnci d12 ile d16 arasına tak (A bacağı üzerinden) ve e16 → artı rayı.",
        "LCD veri kabloları: D12 → e5 (RS), D11 → e7 (E), D5 → e8 (D4), D4 → e9 (D5), D3 → e10 (D6), D2 → e11 (D7)."]
KUT = "Gerçek derleme servisinin izinli başlıkları arasında DHT.h, LiquidCrystal.h ve Keypad.h yoktur; bu kütüphaneler yalnızca MakersHub simülatöründe çalışır, sitedeki gerçek derleme bu sketch'lerde hata verir. Gerçek kart için Arduino IDE'ye ilgili kütüphaneyi kurmak gerekir."
FLY = "MakersHub'ın doğrulayıcısı katodu 5V'a bağlı bu diyot için 'ters bağlı' uyarısı verebilir ve diyodun çevresini kesikli turuncu çizebilir; bu yanlış uyarıdır: bu diyot bilerek ters (flyback) bağlanır ve görevi motor kapanınca oluşan ters gerilimi kısa devre etmektir. Sayfadaki görüntüde bu çerçeve gizlenmiştir."

# ---------------- 21
add("dijital-termometre", "termometre",
 "DHT11 sensörünün ölçtüğü sıcaklık ve nem 16x2 LCD ekranda gösterilir. DHT ve LiquidCrystal kütüphanelerini birlikte kullanmayı, ondalık sayı yazmayı ve sensör hatasını yakalamayı öğrenirsin.",
 [UNO, "Breadboard", "1 × DHT11 sıcaklık ve nem sensörü (3 pinli modül)"] + LCDP + ["Jumper kablolar (17 adet)"],
 [["5V", "Alttaki artı (+) rayı: LCD VDD, arka ışık direnci ve DHT11 VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: LCD VSS, V0, RW, K ve DHT11 GND"],
  ["D12", "LCD RS"], ["D11", "LCD E"], ["D5", "LCD D4"], ["D4", "LCD D5"], ["D3", "LCD D6"], ["D2", "LCD D7"], ["D8", "DHT11 DATA"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + LCDS + [
  "DHT11'i c20 (VCC), c21 (DATA), c22 (GND) deliklerine tak. e20 → artı rayı, e22 → eksi rayı, D8 pinini e21'e kablola.",
  "Kodu yükle (simülatörde çalıştır): ekranın ilk satırında \"Sicaklik: 27.0 C\", ikinci satırında \"Nem: %55\" görünür. Sensör kaydırıcısını değiştirince ekran iki saniye içinde güncellenir."],
 [["Nasıl çalışıyor?", "DHT11 tek veri hattıyla sıcaklık ve nemi sayısal gönderir; zamanlamayı DHT.h kütüphanesi halleder. dht.readTemperature() °C, dht.readHumidity() % bağıl nem verir. Sonuçlar lcd.print(sayı, basamak) ile yazılır: sıcaklık 1, nem 0 ondalık basamakla. LCD'de derece simgesi (°) yoktur; bu yüzden \"C\" ve \"%\" harfleri ASCII olarak yazıldı."],
  ["Ekranı silmeden güncelleme", "lcd.clear() ekranı titretir. Bunun yerine her seferinde aynı konuma yazılır ve satırın sonuna boşluk eklenir; böylece \"%100\" den \"%9\" a inince eski rakam ekranda kalmaz."],
  ["Sensör sınırları", "DHT11 yalnızca 0–50 °C ve %20–90 nem aralığında ölçer, hata payı yaklaşık ±2 °C ve ±%5'tir, en sık 1–2 saniyede bir okunur (kodda delay(2000))."],
  ["Simülatör notu", "Simülatörde sensör kaydırıcıdan ayarlanır ve tam sayı döner: 27 °C ve %55 iken ekranda \"Sicaklik: 27.0 C\" / \"Nem: %55\", 31 °C ve %70'e getirince \"31.0 C\" / \"%70\", 18 °C ve %35'e getirince \"18.0 C\" / \"%35\" göründü. " + KUT],
  ["Sık yapılan hatalar", "DHT kütüphanesini kurmamak; DATA pinini koddaki DHT_PIN ile aynı yapmamak (ekranda \"Sensor hatasi!\" görünür); LCD'nin RW ve V0 bacaklarını GND'ye bağlamamak (ekran boş kalır); lcd.print(\"°C\") yazmaya çalışmak (simgeler ekranda ? olur)."],
  ["Dene", "Sıcaklık 30 °C'yi geçince ekrana \"SICAK!\" yazdır ya da en yüksek ve en düşük sıcaklığı değişkenlerde tutup ikinci satırda göster."]])

# ---------------- 22
add("otomatik-fan-sistemi", "fan",
 "DHT11 sıcaklık eşiğini (28 °C) aşınca NPN transistör üzerinden DC fan döner, sıcaklık düşünce durur. Motoru transistörle sürmeyi, ters (flyback) diyodu ve histerezisi öğrenirsin.",
 [UNO, "Breadboard", "1 × DHT11 sıcaklık ve nem sensörü (3 pinli modül)", "1 × DC motor (fan)", "1 × NPN transistör (BC547 tipi)", "1 × 1 kΩ direnç (transistör taban direnci)", "1 × diyot (1N4007, ters diyot)", "Jumper kablolar (10 adet)"],
 [["5V", "Alttaki artı (+) rayı: DHT11 VCC, fanın + ucu ve diyot katodu"], ["GND (GND2)", "Alttaki eksi (−) rayı: DHT11 GND ve transistör emitörü"], ["D8", "DHT11 DATA"], ["D9", "1 kΩ direncin ucu (transistör tabanı)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "DHT11'i a2 (VCC), a3 (DATA), a4 (GND) deliklerine tak. e2 → artı rayı, e4 → eksi rayı, D8 pinini e3'e kablola.",
  "Fanı (DC motor) a11 ve a12 deliklerine tak. e11 → artı rayı: fanın bir ucu doğrudan 5V rayından beslenir.",
  "NPN transistörü a16 (C), a17 (B), a18 (E) deliklerine tak. b12 ile d16 arasına kablo çek: fanın diğer ucu transistörün kolektörüne gitsin. e18 → eksi rayı (emitör GND).",
  "1 kΩ direnci d17 ile d21 arasına tak (taban direnci) ve D9 pinini e21'e kablola. D9 yalnızca transistörün tabanını sürer, fanın akımı Arduino pininden geçmez.",
  "Diyodu dikey tak: anot ucu c12'de (fanın transistör tarafı), katot ucu f12'de olsun; h12 → artı rayı. Katot (çizgili uç) artı tarafa bakmalı.",
  "Kodu yükle (simülatörde çalıştır): sıcaklık 28 °C ve üstüne çıkınca fan döner, 27 °C ve altına inince durur."],
 [["Nasıl çalışıyor?", "D9 HIGH olunca taban direncinden küçük bir akım akar ve NPN transistör iletime geçer; fan, 5V rayından transistör üzerinden GND'ye devresini tamamlar. Arduino pini yalnızca (5 V − 0,7 V) / 1 kΩ ≈ 4 mA verir; asıl akımı güç rayı taşır. Bir Arduino pini en fazla 40 mA (önerilen 20 mA) verebilir, fan ise onlarca-yüzlerce mA çeker; bu yüzden motor asla doğrudan pine bağlanmaz."],
  ["Ters diyot neden gerekli?", "Motor bir bobindir: akımı kesilince uçlarında ters yönde yüksek gerilim doğurur ve transistörü bozabilir. Motora paralel, ters yönde bağlı diyot bu akımı motorun içinde dolaştırır. " + FLY],
  ["Histerezis", "Kod fanı 28 °C'de açar ama 27 °C'ye inene kadar kapatmaz. Böylece sıcaklık eşik civarında dalgalanırsa fan sürekli aç-kapa yapmaz. Simülatörde 31 °C → ACIK, 24 °C → KAPALI, 28 °C → ACIK, 26 °C → KAPALI, 31 °C → ACIK gözlendi."],
  ["Güç uyarısı", "Simülatördeki fan 5V rayında yaklaşık 150 mA çekti (hızı %75, çünkü motor modeli ±6 V'ta tam hızdır ve transistörde yaklaşık 0,2 V düşer). Küçük bir fan USB'den beslenebilir; büyük motorlar için ayrı güç kaynağı kullan ve GND'lerini Arduino GND'sine bağla."],
  ["Sık yapılan hatalar", "Fanı doğrudan D9'a bağlamak; diyodu ters takmak (devre kısa devre gibi davranır); taban direncini unutmak (transistör ve pin zarar görür); emitörü GND'ye bağlamamak (fan dönmez)."],
  ["Dene", "analogWrite(9, hız) ile fan hızını sıcaklığa göre değiştir: 25 °C'de yavaş, 35 °C'de tam hız (transistör PWM ile de çalışır)."]])

# ---------------- 23
add("akilli-gece-lambasi", "gece_lambasi",
 "LDR ve 10 kΩ'luk gerilim bölücü ortam ışığını ölçer; ortam karardıkça RGB LED'in parlaklığı analogWrite ile artar ve sıcak beyaz bir ışık verir.",
 [UNO, "Breadboard", "1 × LDR (ışığa duyarlı direnç)", "1 × 10 kΩ direnç (gerilim bölücü)", "1 × RGB LED (ortak katot)", "3 × 220 Ω direnç (kanal dirençleri)", "Jumper kablolar (7 adet)"],
 [["5V", "LDR'nin bir ucu"], ["A0", "LDR ile 10 kΩ direncin ortak noktası"], ["GND (GND3)", "10 kΩ direncin diğer ucu"], ["GND (GND2)", "RGB LED ortak katot (K)"],
  ["D9", "Kırmızı kanalın 220 Ω direnci"], ["D10", "Yeşil kanalın 220 Ω direnci"], ["D11", "Mavi kanalın 220 Ω direnci"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "RGB LED'i a2 (R), a3 (K, ortak katot), a4 (G), a5 (B) deliklerine tak.",
  "Üç adet 220 Ω direnci tak: kırmızı için e2 ile h2 arasına, yeşil için e4 ile h4 arasına (ikisi dikey, orta oluğu aşar), mavi için e5 ile e9 arasına (yatay).",
  "Kablolar: D9 → j2 (kırmızı), D10 → j4 (yeşil), D11 → a9 (mavi), GND2 → e3 (ortak katot).",
  "LDR'yi a14 ve a15 deliklerine tak. 10 kΩ direnci d15 ile d19 arasına tak.",
  "Kablolar: 5V → e14 (LDR'nin 5V ucu), A0 → b15 (LDR ile direncin ortak noktası), GND3 → e19 (10 kΩ direncin GND ucu).",
  "Kodu yükle (simülatörde çalıştır) ve LDR'nin ışık kaydırıcısını değiştir: ışık azalınca LED parlar, aydınlıkta söner. Seri Monitör'de ham ışık değeri ve parlaklık görünür."],
 [["Nasıl çalışıyor?", "5V → LDR → A0 → 10 kΩ → GND bir gerilim bölücüdür. Işık azalınca LDR'nin direnci artar ve A0'a gelen gerilim düşer: karanlık = küçük analogRead değeri. Kod değeri map() ile ters çevirir (karanlık → 255, aydınlık → 0) ve analogWrite ile üç kanalı farklı oranlarda sürer (kırmızı tam, yeşil yarısı, mavi beşte biri); böylece sıcak beyaz bir ışık elde edilir."],
  ["Ölçülen değerler", "Simülatörde LDR ışık kaydırıcısı 0,1 / 0,3 / 0,5 / 0,7 / 0,9 iken analogRead sırasıyla 20 / 75 / 246 / 570 / 853 okundu (0,2'de 39). Koddaki KARANLIK = 100 ve AYDINLIK = 800 sınırları bu ölçümlerden seçildi: 246 okununca parlaklık 202, 570'te 84, 853'te 0. Gerçek LDR ve ortam için bu iki sayıyı kendi ölçümünle değiştir."],
  ["RGB LED ve dirençler", "Ortak katotlu RGB LED'in üç renk çipinin her birine ayrı 220 Ω direnç gerekir; tek direnç kullanırsan renkler birbirinin parlaklığını değiştirir."],
  ["Simülatör notu", "Simülatör analogWrite'ı ortalama akım olarak çözer ve LED'in parlaklığını buna göre çizer. Gerçek LDR'nin ışık-direnç eğrisi doğrusal değildir, simülatör modeli basittir."],
  ["Sık yapılan hatalar", "LDR'yi GND tarafına, direnci 5V tarafına takıp mantığı ters kurmak (o zaman karardıkça değer artar); ortak katodu 5V'a bağlamak; kanal dirençlerini unutmak; pinleri PWM olmayan pinlere (örn. D8) bağlamak."],
  ["Dene", "Aydınlıkta LED sönsün ama çok karanlıkta renk maviye kaysın: mavi kanalı parlaklıkla birlikte artır, kırmızıyı azalt."]])

# ---------------- 24
add("mesafe-alarmi", "park_sensoru",
 "HC-SR04 ile mesafe ölçülür; nesne 30 cm'den yaklaşınca buzzer öter ve LED yanıp söner, yaklaştıkça bip ve yanıp sönme hızlanır, 8 cm'den yakında ses ve ışık sürekli olur.",
 [UNO, "Breadboard", "1 × HC-SR04 ultrasonik mesafe sensörü", "1 × aktif buzzer", "1 × LED (kırmızı)", "1 × 220 Ω direnç (LED için)", "Jumper kablolar (8 adet)"],
 [["5V", "HC-SR04 VCC"], ["D7", "HC-SR04 TRIG"], ["D6", "HC-SR04 ECHO"], ["GND (GND2)", "HC-SR04 GND"], ["D8", "Aktif buzzer + (uzun bacak)"], ["GND (GND3)", "Aktif buzzer − (kısa bacak)"], ["D9", "LED anot (uzun bacak)"], ["GND (GND1)", "220 Ω direncin ucu (LED katodu direnç üzerinden)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "HC-SR04'ü c2 (VCC), c3 (TRIG), c4 (ECHO), c5 (GND) deliklerine tak; gövdesi aşağı doğru uzanır, bu yüzden kabloları a satırına bağla.",
  "Kablolar: 5V → a2, D7 → a3 (TRIG), D6 → a4 (ECHO), GND2 → a5.",
  "Aktif buzzer'ı a10 (+) ve a11 (−) deliklerine tak. D8 → e10, GND3 → e11.",
  "LED'i c16 (anot) ve c17 (katot) deliklerine tak. 220 Ω direnci d17 ile d21 arasına tak. D9 → e16, GND1 → e21.",
  "Kodu yükle (simülatörde çalıştır) ve HC-SR04'ün mesafe kaydırıcısını azalt: 30 cm'den sonra bip ve yanıp sönme başlar, 8 cm'den sonra buzzer ve LED sürekli açık kalır. Seri Monitör'de cm değeri görünür."],
 [["Sensör nasıl ölçer?", "TRIG'e verilen 10 µs'lik darbe sensörden ultrason çıkarır; ECHO pini sesin geri dönmesine kadar HIGH kalır ve bu süre pulseIn ile ölçülür. Mesafe = süre × 0,0343 / 2 (ses 0,0343 cm/µs hızla gider, gidiş-dönüş olduğu için ikiye bölünür)."],
  ["Bip ve LED hızı", "30 cm ile 8 cm arasında bip, LED ile birlikte 40 ms açık kalır; kapalı kalma süresi map() ile 400 ms (30 cm) ile 40 ms (8 cm) arasında değişir. Simülatörde 25 cm'de bip yaklaşık 0,34 saniyede bir, 8 cm'nin altında (6 cm) buzzer ve LED sürekli açık gözlendi. Seri Monitör'de ölçülen değerler 24,95 / 14,97 / 7,99 / 5,99 cm okundu (simülatör ses hızını ayarlanan değerden ufak sapmayla hesaplar)."],
  ["Aktif buzzer ve LED", "Aktif buzzer'ın içinde osilatör vardır: HIGH verince öter. LED'in akımını 220 Ω direnç sınırlar (yaklaşık 14 mA). Buzzer ve LED aynı anda uyarı verir; fonksiyon uyariVer() ikisini birlikte açıp kapatır."],
  ["Doğruluk", "HC-SR04 yaklaşık 2–400 cm aralığında çalışır. Kumaş gibi yumuşak ya da sensöre açılı duran yüzeyler yankıyı zayıflatır."],
  ["Sık yapılan hatalar", "TRIG ve ECHO'yu ters bağlamak (mesafe hep −1 görünür); LED'i direnç olmadan bağlamak; buzzer'ın + ve − bacaklarını ters takmak; GND bağlantılarından birini unutmak."],
  ["Dene", "Mesafeyi 4 kademeye böl (30, 20, 10, 5 cm) ve her kademede farklı bip hızı kullan ya da ikinci bir LED ekleyip yakınlığı iki LED ile göster."]])

# ---------------- 25
add("otomatik-kapi-sistemi", "otomatik_kapi",
 "HC-SR04 biri 20 cm içine girince servo ile kapıyı açar, kişi uzaklaşıp 2 saniye geçince kapatır. Servo hareketini yumuşatmayı ve millis() ile bekleme süresi tutmayı öğrenirsin.",
 [UNO, "Breadboard", "1 × HC-SR04 ultrasonik mesafe sensörü", "1 × servo motor (SG90)", "Jumper kablolar (9 adet)"],
 [["5V", "Alttaki artı (+) rayı: HC-SR04 VCC ve servo VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: HC-SR04 GND ve servo GND"], ["D9", "HC-SR04 TRIG"], ["D10", "HC-SR04 ECHO"], ["D6", "Servo sinyal (SIG)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "HC-SR04'ü c2 (VCC), c3 (TRIG), c4 (ECHO), c5 (GND) deliklerine tak. a2 → artı rayı, a5 → eksi rayı, D9 → a3, D10 → a4.",
  "Servoyu c10 (SIG), c11 (VCC), c12 (GND) deliklerine tak. D6 → a10, a11 → artı rayı, a12 → eksi rayı.",
  "Kodu yükle (simülatörde çalıştır): mesafe kaydırıcısı 20 cm'nin altındayken servo kolu 0°'den 90°'ye döner (kapı açılır); kişi uzaklaşınca 2 saniye sonra geri döner."],
 [["Nasıl çalışıyor?", "Kod her turda mesafeyi ölçer. 20 cm'den yakınsa kisiVar = true olur ve sonGorulme zamanı güncellenir; kişi gidince 2 saniye (BEKLEME_MS) geçmeden kapı kapanmaz. Servo, ani hareket yerine her turda 3°'lik adımlarla hedef açıya ilerletilir."],
  ["Simülatörde gözlenen", "Mesafe 15 cm iken servo 0°'den 90°'ye yaklaşık 0,6 saniyede çıktı. Mesafe 120 cm'ye çıkınca servo yaklaşık 2 saniye sonra kapanmaya başladı ve yaklaşık 0,8 saniyede 0°'ye döndü; 30 cm'de (eşiğin dışında) kapı kapalı kaldı, 10 cm'de yeniden açıldı."],
  ["Besleme uyarısı", "Servo hareket ederken yüzlerce mA çekebilir ve çalışırken Arduino'yu resetleyebilir. SG90 gibi küçük servolar USB'den çalışır; birden çok servo ya da büyük servo için ayrı 5 V kaynak kullan ve GND'lerini birleştir."],
  ["Sık yapılan hatalar", "Servo kablolarını ters takmak (kahverengi/siyah = GND, kırmızı = VCC, turuncu = sinyal); servo VCC'sini bir veri pinine bağlamak; HC-SR04'ün TRIG/ECHO pinlerini koddakiyle uyumsuz bağlamak; Servo.h kütüphanesini eklememek."],
  ["Dene", "Açık kalma süresini 5 saniyeye çıkar, ya da kapı açılırken bir buzzer ile kısa bip ver."]])

# ---------------- 26
add("sifreli-kapi-kilidi", "kapi_kilidi",
 "4x4 tuş takımından girilen şifre doğruysa (1234#) servo kilidi açar, LCD'de \"Sifre dogru!\" görünür; yanlışsa \"Yanlis sifre!\" yazar. Keypad kütüphanesi, iki boyutlu dizi ve analog pinleri dijital kullanma öğrenilir.",
 [UNO, "Breadboard", "1 × 4x4 tuş takımı (keypad)"] + LCDP + ["1 × servo motor (SG90)", "Jumper kablolar (25 adet)"],
 LCDW + [["D10", "Keypad R1"], ["D9", "Keypad R2"], ["D8", "Keypad R3"], ["D7", "Keypad R4"], ["A0", "Keypad C1 (analog pin dijital kullanılır)"], ["A1", "Keypad C2"], ["A2", "Keypad C3"], ["A3", "Keypad C4"], ["D6", "Servo sinyal (SIG)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + LCDS + [
  "Keypad'i a19–a26 deliklerine tak; pinler soldan sağa R1, R2, R3, R4, C1, C2, C3, C4 sırasındadır.",
  "Keypad kabloları: D10 → e19 (R1), D9 → e20 (R2), D8 → e21 (R3), D7 → e22 (R4), A0 → e23 (C1), A1 → e24 (C2), A2 → e25 (C3), A3 → e26 (C4).",
  "Servoyu d28 (SIG), d29 (VCC), d30 (GND) deliklerine tak. D6 → b28, b29 → artı rayı (B+25), b30 → eksi rayı (B-25).",
  "Kodu yükle (simülatörde çalıştır) ve tuvaldeki tuşlara tıklayarak 1 2 3 4 # gir: ekranda \"Sifre dogru!\" / \"Kapi acik\" yazar ve servo 90°'ye döner; 3 saniye sonra kilit kapanır."],
 [["Nasıl çalışıyor?", "Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN) tuş matrisini tanımlar; satirPinleri dizisi keypad'in R1–R4, sutunPinleri dizisi C1–C4 uçlarına bağlı pinleri listeler (bu sırayı bozarsan tuşlar karışır). getKey() basılan tuşu bir kez döndürür, basış yoksa NO_KEY verir. Girilen rakamlar girilen[] dizisine yazılır, # ile DOGRU_SIFRE[] ile karşılaştırılır; * girileni siler. Şifre ekranda * ile gizlenir."],
  ["Pin bütçesi", "LCD 6, keypad 8, servo 1 pin ister: 15 pin. D2–D13 yalnızca 12 pindir, bu yüzden keypad sütunları A0–A3'e bağlandı. Analog pinler dijital pin gibi de kullanılabilir (A0 = 14 numaralı pin). Simülatörde A0–A3 üzerindeki keypad sütunlarının çalıştığı görüldü."],
  ["Simülatörde gözlenen", "\"12#\" girince 1,5 saniye \"Yanlis sifre!\" / \"Tekrar deneyin\" yazdı ve servo 0°'de kaldı; \"1234#\" girince \"Sifre dogru!\" / \"Kapi acik\" yazdı, servo 90°'ye çıktı, 3 saniye sonra 0°'ye döndü; \"99*1234#\" girince * ile silinen rakamlardan sonra şifre kabul edildi. " + KUT],
  ["Sık yapılan hatalar", "Keypad pinlerini satirPinleri/sutunPinleri sırasıyla eşleştirmemek (basılan tuş başka çıkar); D0/D1'i kullanmak (Seri haberleşme ile çakışır); şifreyi 4 hane sınırı olmadan almak; servoyu LCD'nin kullandığı rayla karıştırmak."],
  ["Dene", "3 yanlış denemeden sonra 10 saniye kilitle, ya da şifreyi * 4 5 6 # gibi tuşla değiştirmeyi ekle."]])

# ---------------- 27
add("elektronik-kasa", "kasa",
 "Keypad'e doğru şifre (1234#) girilince servo kilidi açılır ve iki kısa bip duyulur; yanlış şifrede buzzer uzun öter, üç yanlış denemede 2 saniyelik alarm çalar.",
 [UNO, "Breadboard", "1 × 4x4 tuş takımı (keypad)", "1 × servo motor (SG90)", "1 × aktif buzzer", "Jumper kablolar (13 adet)"],
 [["D9", "Keypad R1"], ["D8", "Keypad R2"], ["D7", "Keypad R3"], ["D6", "Keypad R4"], ["D5", "Keypad C1"], ["D4", "Keypad C2"], ["D3", "Keypad C3"], ["D2", "Keypad C4"],
  ["D10", "Servo sinyal (SIG)"], ["5V", "Servo VCC"], ["GND (GND2)", "Servo GND"], ["D11", "Aktif buzzer + (uzun bacak)"], ["GND (GND3)", "Aktif buzzer − (kısa bacak)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Keypad'i a2–a9 deliklerine tak; pinler soldan sağa R1, R2, R3, R4, C1, C2, C3, C4 sırasındadır.",
  "Keypad kabloları: D9 → e2 (R1), D8 → e3 (R2), D7 → e4 (R3), D6 → e5 (R4), D5 → e6 (C1), D4 → e7 (C2), D3 → e8 (C3), D2 → e9 (C4).",
  "Servoyu c13 (SIG), c14 (VCC), c15 (GND) deliklerine tak. D10 → a13, 5V → a14, GND2 → a15.",
  "Aktif buzzer'ı a20 (+) ve a21 (−) deliklerine tak. D11 → e20, GND3 → e21.",
  "Kodu yükle (simülatörde çalıştır) ve Seri Monitör'ü aç. Tuvaldeki tuşlarla 1 2 3 4 # gir: iki kısa bip, servo 90°'ye döner ve 4 saniye sonra kapanır."],
 [["Nasıl çalışıyor?", "Her tuşa basışta kısa bir tuş sesi (30 ms) çalar ve rakam girilen[] dizisine eklenir. # ile şifre kontrol edilir: doğruysa iki kısa bip, servo açılır, 4 saniye sonra kilitlenir; yanlışsa 500 ms'lik bip ve yanlisSayisi artar; 3 yanlışta 2 saniyelik alarm çalar ve sayaç sıfırlanır. * girileni siler."],
  ["Simülatörde gözlenen", "\"123#\" yanlış (Seri: Deneme: 1, uzun bip), \"1234#\" doğru (iki kısa bip, servo 0° → 90°, 4 saniye sonra 0°), \"1*1234#\" ile * silip doğru şifre kabul edildi, art arda üç yanlış denemede Seri Monitör'de \"3 yanlis deneme: ALARM\" yazıldı. " + KUT],
  ["Güvenlik notu", "Bu bir öğretici projedir: şifre kodun içinde açık yazılıdır ve servo kolu gerçek bir kilidi tek başına güvenli tutmaz. Gerçek bir kasada şifreyi EEPROM'a kaydet ve mekanik kilidi servoya güvenerek değil, ayrıca tasarla."],
  ["Sık yapılan hatalar", "Keypad R/C pinlerini sketch'teki satirPinleri/sutunPinleri ile aynı sırada bağlamamak; servo besleme ucunu veri pinine bağlamak; buzzer'ın − ucunu GND'ye bağlamamak (hiç ses çıkmaz)."],
  ["Dene", "Şifreyi 6 haneye çıkar ya da kilit açıkken bir LED yak. Kasa kapağına bir buton takıp açık kalma süresini bitirmeyi dene."]])

# ---------------- 28
add("su-seviye-olcer", "su_seviye",
 "Su seviye sensörünün analog değeri yüzdeye çevrilip LCD'de rakam ve 16 karakterlik çubukla gösterilir. map(), constrain() ve kalibrasyon öğrenilir.",
 [UNO, "Breadboard", "1 × su seviye sensörü"] + LCDP + ["Jumper kablolar (17 adet)"],
 LCDW + [["A0", "Su seviye sensörü S (sinyal)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + LCDS + [
  "Su seviye sensörünü a20 (S), a21 (+), a22 (−) deliklerine tak. A0 → e20, e21 → artı rayı, e22 → eksi rayı.",
  "Kodu yükle (simülatörde çalıştır): sensörün seviye kaydırıcısını değiştir; LCD'de \"Su Seviyesi:%50\" ve çubuk güncellenir."],
 [["Nasıl çalışıyor?", "Sensörün yüzeyindeki iz çizgileri suya battıkça daha çok iletir ve S ucundaki gerilim artar. analogRead değeri map(ham, KURU, DOLU, 0, 100) ile yüzdeye çevrilir; constrain() sonucu 0–100 arasında tutar. Çubuk satırı, yüzdenin 16'ya ölçeklenmesiyle çizilir (# dolu, - boş)."],
  ["Kalibrasyon (simülatörden ölçüldü)", "Seviye kaydırıcısı 0 / 0,25 / 0,5 / 0,75 / 1 iken analogRead 0 / 174 / 348 / 522 / 696 okundu, LCD %0 / %25 / %50 / %75 / %100 gösterdi. Bu yüzden KURU = 0 ve DOLU = 696 seçildi. Gerçek sensörde bu sayılar sensöre, suyun iletkenliğine ve sıcaklığa göre değişir; sensörü kuru ve tamamen batık okuyup iki sayıyı değiştir."],
  ["Gerçek sensör uyarıları", "Su seviye sensörünün izleri sürekli suda kalırsa paslanır; ölçümü gerektiğinde güç vererek yapmak ömrünü uzatır. Sensör doğrusal değildir, yüzde değeri yaklaşıktır. " + KUT],
  ["Sık yapılan hatalar", "+ ve − uçlarını ters bağlamak; sinyali A0 yerine bir dijital pine takmak; KURU ve DOLU sayılarını ölçmeden varsaymak (yüzde hep yanlış çıkar); lcd.print satırında eski rakamı silmek için boşluk eklememek."],
  ["Dene", "Seviye %20'nin altına inince bir buzzer öttür ya da seviye %90'ı geçince \"TASIYOR!\" yazdır."]])

# ---------------- 29
add("yagmur-algilama-sistemi", "yagmur",
 "Yağmur sensörünün analog (AO) ve dijital (DO) çıkışı okunur; hafif yağmurda buzzer yavaş bip, şiddetli yağmurda sürekli öter. Analog eşikler ve DO çıkışı karşılaştırılır.",
 [UNO, "Breadboard", "1 × yağmur sensörü modülü (AO/DO)", "1 × aktif buzzer", "Jumper kablolar (6 adet)"],
 [["5V", "Yağmur modülü VCC"], ["GND (GND2)", "Yağmur modülü GND"], ["A0", "Yağmur modülü AO (analog çıkış)"], ["D2", "Yağmur modülü DO (dijital çıkış)"], ["D8", "Aktif buzzer + (uzun bacak)"], ["GND (GND3)", "Aktif buzzer − (kısa bacak)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Yağmur modülünü a2 (VCC), a3 (GND), a4 (AO), a5 (DO) deliklerine tak.",
  "Kablolar: 5V → e2, GND2 → e3, A0 → e4 (AO), D2 → e5 (DO).",
  "Aktif buzzer'ı a10 (+) ve a11 (−) deliklerine tak. D8 → e10, GND3 → e11.",
  "Kodu yükle (simülatörde çalıştır) ve Seri Monitör'ü aç. Sensörün ıslaklık kaydırıcısını artır: AO değeri düşer, hafif yağmurda yavaş bip, şiddetli yağmurda sürekli ses duyulur."],
 [["Nasıl çalışıyor?", "Plakadaki izler ıslanınca iletim artar ve AO gerilimi düşer: kuru ≈ 1023, ıslak ≈ 205. LM393 karşılaştırıcı AO'yu bir eşikle kıyaslayıp DO'yu üretir (ıslakken LOW). Kod AO'yu iki eşikle yorumlar: 800'ün altı hafif, 450'nin altı şiddetli yağmur."],
  ["Ölçülen değerler (simülatör)", "Islaklık 0 / 0,2 / 0,4 / 0,6 / 0,9 iken AO 1023 / 860 / 696 / 532 / 286 okundu. DO, ıslaklık 0,5'i geçince (AO yaklaşık 613'ün altında) LOW oldu; 0,4'te hâlâ HIGH, 0,6'da LOW'du. Bu yüzden 800 eşiği 0,2'de (860) kuru, 0,4'te (696) hafif; 450 eşiği 0,6'da (532) hafif, 0,9'da (286) şiddetli sonucunu verdi."],
  ["Gerçek modül uyarısı", "Gerçek modüldeki DO eşiği karttaki ayar potu ile değişir; simülatörde sabittir. Plakadaki izler su ve kirle paslanır, sensörü yalnızca ölçüm sırasında beslemek ömrünü uzatır."],
  ["Sık yapılan hatalar", "DO ile AO'yu karıştırmak; DO'nun ıslakken LOW verdiğini unutup mantığı ters kurmak; AO'yu dijital pine bağlamak; eşikleri ölçmeden yazmak."],
  ["Dene", "Yağmur başlayınca bir servo ile pencereyi kapat (proje 25'in servo düzenini kullanabilirsin) ya da AO değerini yüzdeye çevirip Seri Monitör'de göster."]])

# ---------------- 30
add("toprak-nem-olcer", "toprak_nem",
 "Toprak nem sensörünün değeri yüzdeye çevrilip LCD'de \"Toprak Nem: %40\" ve Kuru/Nemli/Islak durumuyla gösterilir. Ters çalışan sensör değerini map() ile düzeltmeyi öğrenirsin.",
 [UNO, "Breadboard", "1 × toprak nem sensörü (analog çıkışlı)"] + LCDP + ["Jumper kablolar (17 adet)"],
 LCDW + [["A0", "Toprak nem sensörü OUT"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + LCDS + [
  "Toprak nem sensörünü a20 (VCC), a21 (OUT), a22 (GND) deliklerine tak. e20 → artı rayı, A0 → e21, e22 → eksi rayı.",
  "Kodu yükle (simülatörde çalıştır): sensörün nem kaydırıcısını değiştir; LCD'de yüzde ve durum yazısı güncellenir."],
 [["Nasıl çalışıyor?", "Bu sensör nem arttıkça OUT gerilimini DÜŞÜRÜR (kuru toprakta yüksek değer). map(ham, KURU, ISLAK, 0, 100) satırında KURU büyük, ISLAK küçük sayı olduğu için değer ters çevrilip yüzdeye dönüşür. %30'un altı \"Kuru - sula!\", %60'ın altı \"Nemli\", üstü \"Islak\" yazar."],
  ["Kalibrasyon (simülatörden ölçüldü)", "Nem kaydırıcısı 0 / 0,2 / 0,4 / 0,6 / 0,8 / 1 iken analogRead 921 / 788 / 655 / 522 / 389 / 256 okundu; LCD %0 / %20 / %40 / %60 / %80 / %100 gösterdi. Bu yüzden KURU = 921, ISLAK = 256. Gerçek sensörde sayılar farklıdır: sensörü kuru havada ve bir bardak suda okuyup iki sayıyı değiştir."],
  ["Gerçek sensör uyarısı", "Ucuz dirençli toprak nem sensörleri toprakta kısa sürede paslanır; ölçümü yalnızca gerektiğinde güç vererek yapmak ya da kapasitif sensör kullanmak ömrü uzatır. Yüzde değeri yaklaşıktır, topraktan toprağa değişir. " + KUT],
  ["Sık yapılan hatalar", "KURU ve ISLAK sayılarını ters yazmak (yüzde ters çıkar); VCC'yi 5V yerine bir dijital pine bağlamak; sinyal telini dijital pine takmak; LCD'ye eski rakamı silmek için boşluk yazmamak."],
  ["Dene", "Yüzde %30'un altına inince LCD'de yazı yanıp sönsün ya da bir LED yansın. Sonraki proje (Otomatik Bitki Sulama) bu ölçümü pompayla birleştirir."]])

# ---------------- 31
add("otomatik-bitki-sulama", "sulama",
 "Toprak kuruyunca Arduino bir transistörle röleyi çeker, röle ayrı 6 V güç kaynağından mini pompayı çalıştırır; pompa ve röle bobininde ters diyot kullanılır. Güç ayrımı, röle ve güvenli sulama mantığı öğrenilir.",
 [UNO, "Breadboard", "1 × toprak nem sensörü (analog çıkışlı)", "1 × röle (SPDT, 5 V bobin)", "1 × NPN transistör (BC547 tipi)", "1 × 1 kΩ direnç (transistör taban direnci)", "2 × diyot (1N4007; biri bobinde, biri motor devresinde)",
  "1 × mini su pompası (DC motor)", "1 × 6 V harici güç kaynağı (örn. 4 × AA pil yuvası; simülatörde ayarlanabilir güç kaynağı)", "1 × LED (yeşil, kapalı durum göstergesi)", "1 × 470 Ω direnç (LED için)", "Jumper kablolar (17 adet)"],
 [["5V", "Alttaki artı (+) rayı: röle bobini C1, bobin diyodu katodu, toprak nem sensörü VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: transistör emitörü ve toprak nem sensörü GND"], ["A0", "Toprak nem sensörü OUT"], ["D7", "1 kΩ direncin ucu (transistör tabanı)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın. Harici güç kaynağı ve pompa breadboard'a takılı değildir, breadboard dışında durur ve yalnızca kablolarla bağlanır.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "Röleyi a2–a6 deliklerine tak (C1, C2, COM, NO, NC). e2 → artı rayı (bobin C1 = 5V). Bobin diyodunu c3 (anot) ile c7 (katot) arasına tak ve e7 → artı rayı.",
  "NPN transistörü a12 (C), a13 (B), a14 (E) deliklerine tak. e12 → e3 (kolektör, bobinin C2 ucuna), e14 → eksi rayı (emitör). 1 kΩ direnci d13 ile d17 arasına tak ve D7 pinini e17'ye kablola.",
  "Toprak nem sensörünü a20 (VCC), a21 (OUT), a22 (GND) deliklerine tak. e20 → artı rayı, A0 → e21, e22 → eksi rayı.",
  "Pompa devresi (ayrı güç): 6 V güç kaynağının + ucunu e4'e (COM), röle NO ucunu e5 → g19 kablosuyla alt şeride, h19 → pompanın bir ucuna kablola. Güç kaynağının − ucunu e19'a, pompanın diğer ucunu b19'a bağla. Pompa diyodunu dikey tak: anot c19, katot f19 (katot NO tarafına, + tarafa bakar).",
  "NC ucundan yeşil LED'e: e6 → e24. LED'i c24 (anot), c25 (katot) deliklerine tak; 470 Ω direnci d25 ile d29 arasına tak ve e29 → a19 (güç kaynağı − şeridi). Bu LED pompa kapalıyken yanar.",
  "Kodu yükle (simülatörde çalıştır): toprak kuruysa D7 HIGH olur, röle çeker, pompa döner; nem %50'ye çıkınca ya da 5 saniye dolunca pompa durur."],
 [["Nasıl çalışıyor?", "Arduino pini röle bobinini (≈70 mA) doğrudan süremez, bu yüzden D7 → 1 kΩ → NPN transistör bobini 5V rayından sürer. Röle çekince COM–NO kontağı kapanır ve ayrı 6 V kaynaktan pompa beslenir; kontak Arduino devresinden elektriksel olarak ayrıdır. Pompa kapalıyken COM–NC kontağı yeşil LED'i yakar."],
  ["Ters diyotlar neden gerekli?", "Röle bobini ve pompa motoru bobin gibi davranır; akım kesilince ters gerilim oluşur ve transistöre/kontağa zarar verebilir. Her birine paralel, ters yönde bağlı diyot bu gerilimi yok eder (katot + tarafa bakar). Pompa diyodunun katodu rölenin NO ucuna bağlıdır. " + FLY],
  ["Güvenli sulama mantığı", "Nem %30'un altına inince pompa açılır, %50'ye çıkınca kapanır (histerezis); pompa her koşulda en fazla 5 saniye çalışır ve ardından 8 saniye beklenir (su toprağa yayılsın, taşırma olmasın). Simülatörde nem kaydırıcısı 0,1 iken (analogRead 855, %9) pompa 5 saniye çalıştı (6 V'ta yaklaşık 199 mA), sonra röle bıraktı ve yeşil LED yandı; kaydırıcı 0,8 iken (analogRead 389, %80) pompa çalışmadı."],
  ["Güç ve akım uyarısı", "Mini pompa yaklaşık 200 mA çeker ve ayrı kaynaktan beslenir; Arduino'nun 5V pininden beslemeyi deneme. Gerçek pompanın gerilimini (çoğu 3–6 V) kontrol et. Su ve elektriği ayrı tut: sensör ve pompa bağlantılarını suya temas etmeyecek şekilde yalıt. Röle kontağının akım/gerilim değerini aşma."],
  ["Kalibrasyon", "Toprak nem sensörü bu simülatörde nem arttıkça düşen değer verir: kuru 921, ıslak 256 (proje 30'da ölçüldü). Gerçek sensör için KURU ve ISLAK sayılarını kendin ölç. " ],
  ["Sık yapılan hatalar", "Pompayı doğrudan Arduino pinine ya da 5V rayına bağlamak; röle bobinine transistör ve diyot koymamak; ayrı güç kaynağının eksisini rölenin yanlış ucuna bağlamak (kısa devre); diyotu ters takmak; NC/NO uçlarını karıştırmak (pompa sürekli çalışır)."],
  ["Dene", "Pompa süresini ve bekleme süresini bitkine göre ayarla; ya da nem %20 altına inince bir buzzer ekleyip \"su deposu boş\" uyarısı ver."]],
 free=["psu1", "pump1"])

# ---------------- 32
add("akilli-cop-kutusu", "cop_kutusu",
 "HC-SR04 elin yaklaştığını algılayınca servo kapağı açar, el çekilince 3 saniye sonra yavaşça kapatır. Art arda ölçüm doğrulaması ve yumuşak servo hareketi öğrenilir.",
 [UNO, "Breadboard", "1 × HC-SR04 ultrasonik mesafe sensörü", "1 × servo motor (SG90)", "Jumper kablolar (9 adet)"],
 [["5V", "Alttaki artı (+) rayı: HC-SR04 VCC ve servo VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: HC-SR04 GND ve servo GND"], ["D7", "HC-SR04 TRIG"], ["D6", "HC-SR04 ECHO"], ["D9", "Servo sinyal (SIG)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "HC-SR04'ü c2 (VCC), c3 (TRIG), c4 (ECHO), c5 (GND) deliklerine tak. a2 → artı rayı, a5 → eksi rayı, D7 → a3, D6 → a4.",
  "Servoyu c10 (SIG), c11 (VCC), c12 (GND) deliklerine tak. D9 → a10, a11 → artı rayı, a12 → eksi rayı.",
  "Servo koluna bir kapak (karton) bağlandığını düşün: 0° kapalı, 110° açık.",
  "Kodu yükle (simülatörde çalıştır): mesafe 25 cm'nin altına inince kapak 0°'den 110°'ye açılır, el çekilince 3 saniye sonra kapanır."],
 [["Nasıl çalışıyor?", "Elin 25 cm içinde art arda 3 ölçümde görülmesi gerekir (ardArda sayacı); bu, tek bir hatalı ölçümün kapağı açmasını engeller. El çekilince 3 saniye (ACIK_KALMA_MS) beklenir ve kapak 5°'lik adımlarla kapanır."],
  ["Simülatörde gözlenen", "Mesafe 15 cm iken kapak yaklaşık 0,7 saniyede 110°'ye açıldı. Mesafe 150 cm'ye çıkınca yaklaşık 3 saniye sonra \"Kapak kapaniyor\" yazıldı ve kapak adım adım 0°'ye döndü; mesafe yeniden 20 cm olunca kapak tekrar açıldı."],
  ["Besleme uyarısı", "Servo hareket ederken akım çeker; küçük SG90 USB'den çalışır, büyük bir kapak ya da başka servo için ayrı 5 V kaynak ve ortak GND kullan."],
  ["Sık yapılan hatalar", "TRIG/ECHO'yu ters bağlamak; kapak açıkken sensörün kapağı görüp sürekli açık kalması (sensörü kapaktan uzağa bak); servo ucunu çok fazla döndürüp mekanik sınırı zorlamak."],
  ["Dene", "Kapak açılırken kısa bir bip için aktif buzzer ekle ya da açık kalma süresini el yaklaştıkça uzat."]])

# ---------------- 33
add("otomatik-el-dezenfektani", "dezenfektan",
 "IR engel sensörü eli algılayınca NPN transistör üzerinden mini pompa 1,5 saniye çalışır ve el çekilene kadar tekrar çalışmaz. Transistörle pompa sürme, ters diyot ve tek seferlik tetikleme öğrenilir.",
 [UNO, "Breadboard", "1 × IR engel algılama sensörü", "1 × mini pompa (DC motor)", "1 × NPN transistör (BC547 tipi)", "1 × 1 kΩ direnç (transistör taban direnci)", "1 × diyot (1N4007, ters diyot)", "Jumper kablolar (10 adet)"],
 [["5V", "Alttaki artı (+) rayı: IR sensör VCC, pompanın + ucu ve diyot katodu"], ["GND (GND2)", "Alttaki eksi (−) rayı: IR sensör GND ve transistör emitörü"], ["D2", "IR sensör OUT"], ["D9", "1 kΩ direncin ucu (transistör tabanı)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "IR sensörü a2 (VCC), a3 (GND), a4 (OUT) deliklerine tak. e2 → artı rayı, e3 → eksi rayı, D2 pinini e4'e kablola.",
  "Pompayı (DC motor) a11 ve a12 deliklerine tak. e11 → artı rayı.",
  "NPN transistörü a16 (C), a17 (B), a18 (E) deliklerine tak. b12 ile d16 arasına kablo çek (pompanın diğer ucu transistörün kolektörüne). e18 → eksi rayı.",
  "1 kΩ direnci d17 ile d21 arasına tak ve D9 pinini e21'e kablola.",
  "Diyodu dikey tak: anot c12, katot f12; h12 → artı rayı (katot + tarafa bakar).",
  "Kodu yükle (simülatörde çalıştır): IR sensörde \"engel var\" düğmesini aç; pompa 1,5 saniye çalışır. Düğmeyi kapatana kadar tekrar çalışmaz."],
 [["Nasıl çalışıyor?", "IR sensör engel (el) varken OUT'u LOW yapar. Kod LOW görünce pompayı POMPA_MS (1500 ms) süreyle açar; elVardi değişkeni el sensörün önündeyken yeniden pompalamayı engeller. OUT yeniden HIGH olunca (el çekildi) sistem yeni doz için hazırdır. Pompa D9 → 1 kΩ → NPN ile sürülür; pompanın akımı 5V rayından akar."],
  ["Simülatörde gözlenen", "Pompa her algılamada 1,5 saniye döndü (5V'ta yaklaşık 150 mA). El 3 saniye sensörün önünde tutulunca yalnızca bir doz verildi; 0,3 saniyelik kısa bir el hareketi de tam bir doz (1,5 saniye) verdi."],
  ["Ters diyot ve güç uyarısı", "Pompa motoru ters gerilim üretir; diyot bunu bastırır. " + FLY + " Pompa akımı Arduino pininden değil 5V rayından çekilir; gerçek pompa daha fazla akım çekiyorsa ayrı bir güç kaynağı kullan ve GND'leri birleştir. Elektronik parçaları dezenfektan sıvısından uzak tut."],
  ["Sık yapılan hatalar", "Pompayı doğrudan D9'a bağlamak; diyotu ters takmak; IR sensörün mantığını ters sanmak (engelde LOW); pompa süresini çok uzun tutup dezenfektanı israf etmek."],
  ["Dene", "POMPA_MS değerini değiştirip doz miktarını ayarla; ya da doz sayısını sayıp LCD'de göstermek için proje 20'deki LCD düzenini ekle."]])

# ---------------- 34
add("hirsiz-alarm-sistemi", "hirsiz_alarm",
 "PIR sensör hareket algılayınca pasif buzzer iki tonlu siren çalar ve LED yanıp söner. Başlangıç kurulum gecikmesi, tone() ile siren ve alarmı yeniden kurma öğrenilir.",
 [UNO, "Breadboard", "1 × PIR hareket sensörü (HC-SR501)", "1 × pasif buzzer", "1 × LED (kırmızı)", "1 × 220 Ω direnç (LED için)", "Jumper kablolar (7 adet)"],
 [["5V", "PIR VCC"], ["D2", "PIR OUT"], ["GND (GND2)", "PIR GND"], ["D8", "Pasif buzzer + (uzun bacak)"], ["GND (GND3)", "Pasif buzzer − (kısa bacak)"], ["D4", "LED anot (uzun bacak)"], ["GND (GND1)", "220 Ω direncin ucu (LED katodu direnç üzerinden)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "PIR'ı a2 (VCC), a3 (OUT), a4 (GND) deliklerine tak. 5V → e2, D2 → e3, GND2 → e4.",
  "Pasif buzzer'ı a10 (+) ve a11 (−) deliklerine tak. D8 → e10, GND3 → e11.",
  "LED'i c16 (anot) ve c17 (katot) deliklerine tak. 220 Ω direnci d17 ile d21 arasına tak. D4 → e16, GND1 → e21.",
  "Kodu yükle (simülatörde çalıştır) ve Seri Monitör'ü aç. 3 saniyelik kurulumdan sonra \"Alarm KURULDU\" yazılır; PIR'da hareket oluşturunca siren 5 saniye çalar ve LED yanıp söner."],
 [["Nasıl çalışıyor?", "Pasif buzzer kendi başına ses üretmez; tone(pin, frekans) ile verilen frekansta çalar. siren() fonksiyonu 800 Hz ile 1200 Hz'i 250 ms aralıkla değiştirir (10 tur = 5 saniye), LED de aynı ritimle yanıp söner. Sonra noTone() ile susar ve alarm yeniden kurulur."],
  ["Simülatörde gözlenen", "Açılışta 3 saniye \"Sistem kuruluyor\" bekledi; hareket varken siren 3,0 saniyeden 8,0 saniyeye kadar 800/1200 Hz'i sırayla çaldı (simülatör \"çalıyor 1200 Hz\" gösterdi), LED aynı anda yanıp söndü, sonra \"Alarm tekrar kuruldu\" yazıldı; hareket kalkınca alarm tekrar çalmadı, 12 saniyede yeni hareketle yeniden çaldı."],
  ["PIR ısınma süresi", "Gerçek HC-SR501'in ortama alışması 30–60 saniye sürer ve bu sürede yanlış alarm verebilir; koddaki 3 saniyelik KURULUM_MS simülatörde beklemeyi kısa tutmak içindir, gerçek devrede artır. PIR'ın üzerindeki iki pot algılama mesafesini ve OUT'un HIGH kalma süresini ayarlar."],
  ["Sık yapılan hatalar", "Pasif buzzer'ı digitalWrite ile sürmeye çalışmak (ses çıkmaz); tone() + delay() + noTone() sırasını bozmak; PIR VCC'sini 3V3'e bağlamak; LED'i dirençsiz takmak."],
  ["Dene", "Alarmı bir buton ya da keypad şifresiyle kapat (proje 27'deki şifre kodunu ekle) ya da siren frekanslarını değiştirerek farklı bir ses dene."]])

# ---------------- 35
add("pir-hareket", "pir_lamba",
 "HC-SR501 PIR sensörü hareketi algılayınca LED lamba yanar ve son hareketten 5 saniye sonra söner. millis() ile bekleme süresi tutmayı ve PIR çıkışını okumayı öğrenirsin.",
 [UNO, "Breadboard", "1 × PIR hareket sensörü (HC-SR501)", "1 × LED (sarı)", "1 × 220 Ω direnç (LED için)", "Jumper kablolar (5 adet)"],
 [["5V", "PIR VCC"], ["D2", "PIR OUT"], ["GND (GND2)", "PIR GND"], ["D8", "LED anot (uzun bacak)"], ["GND (GND3)", "220 Ω direncin ucu (LED katodu direnç üzerinden)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "PIR'ı a2 (VCC), a3 (OUT), a4 (GND) deliklerine tak. 5V → e2, D2 → e3, GND2 → e4.",
  "LED'i c10 (anot) ve c11 (katot) deliklerine tak. 220 Ω direnci d11 ile d15 arasına tak.",
  "Kablolar: D8 → e10 (LED anot), GND3 → e15 (direncin diğer ucu).",
  "Kodu yükle (simülatörde çalıştır) ve Seri Monitör'ü aç. PIR'da hareket oluşturunca LED yanar ve \"Hareket var: lamba yandi\" yazılır; hareket bitince 5 saniye sonra söner."],
 [["PIR nasıl çalışır?", "Sensör vücut sıcaklığındaki nesnelerin yaydığı kızılötesi ışımadaki değişimi algılar; hareketsiz duran birini ya da ısı farkı oluşturmayan hareketi algılamayabilir. Hareket varken OUT HIGH olur."],
  ["Lamba mantığı", "Kod hareket gördükçe sonHareket zamanını yeniler; hareket kesildikten sonra YANIK_KALMA_MS (5 saniye) geçince LED'i söndürür. Simülatörde hareket 2. saniyede bitti, LED yaklaşık 6,95. saniyede söndü (≈ 5 saniye sonra); 8. saniyede kısa bir hareketle yeniden yandı ve yaklaşık 13,25. saniyede söndü."],
  ["Isınma ve ayar", "Güç verdikten sonra sensörün ortama alışması için yaklaşık 30–60 saniye gerekir; bu sürede yanlış tetikleme olabilir. HC-SR501 üzerindeki iki küçük pot algılama mesafesini ve OUT'un kaç saniye HIGH kalacağını ayarlar. PIR'ın VCC'si doğrudan 5V'a bağlanmalıdır (simülatörde de böyle)."],
  ["Sık yapılan hatalar", "VCC, OUT ve GND bacaklarını karıştırmak (isimler kartın üzerinde yazar); LED'i dirençsiz takmak; PIR'ın hemen açılışta tetiklendiğini hata sanmak (ısınma süresi)."],
  ["Dene", "Ortam aydınlıksa LED yanmasın: bir LDR ekleyip yalnızca karanlıkta ve hareket varken yak (proje 23'teki ışık ölçümü)."]])

# ---------------- 36
add("elektronik-kronometre", "kronometre",
 "İki butonlu kronometre: biri başlat/durdur, diğeri sıfırla; süre millis() ile ölçülüp LCD'de dakika:saniye.onda biçiminde gösterilir.",
 [UNO, "Breadboard"] + LCDP + ["2 × buton (push button)", "Jumper kablolar (18 adet)"],
 LCDW + [["D7", "Başlat/Durdur butonunun bir ucu"], ["D6", "Sıfırla butonunun bir ucu"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + LCDS + [
  "Başlat/Durdur butonunu c20 ve c22 deliklerine, Sıfırla butonunu c25 ve c27 deliklerine tak.",
  "Buton kabloları: D7 → e20, e22 → eksi rayı; D6 → e25, e27 → eksi rayı. Butonlar INPUT_PULLUP ile çalışır (basılınca LOW).",
  "Kodu yükle (simülatörde çalıştır): D7 butonuna bas, kronometre sayar; yeniden bas, durur ve süre kalır; tekrar bas, kaldığı yerden devam eder; D6 butonu sıfırlar."],
 [["Nasıl çalışıyor?", "Başlatınca millis() değeri baslangic değişkenine yazılır; geçen süre millis() − baslangic ile bulunur. Durdurunca geçen süre biriken'e eklenir, böylece devam edince süre kaldığı yerden sürer. Kod yalnızca HIGH → LOW geçişini (yeni basış) sayar ve delay(30) ile buton titreşimini atlar. Dakika, saniye ve onda bir saniye bölme/mod işlemleriyle çıkarılır."],
  ["Simülatörde gözlenen", "Başlat düğmesine 1. saniyede basıp 4,3. saniyede durdurunca ekran 00:03.2 gösterdi (gerçek süre 3,3 saniyedir; simülatör zamanlaması ±0,1 saniye sapar). Yeniden başlatınca 00:03.2'den saymaya devam etti, durdurunca 00:05.2'de kaldı, sıfırla düğmesi 00:00.0 yaptı."],
  ["Doğruluk", "millis() yaklaşık milisaniye çözünürlüğündedir ama Arduino'nun kristal saati birkaç dakikada bir saniye sapabilir; bu proje bilimsel ölçüm için değil, öğrenme içindir. Ekran onda bir saniye gösterir ve 50 ms'de bir güncellenir."],
  ["Simülatör notu", KUT],
  ["Sık yapılan hatalar", "delay() ile süre saymaya çalışmak (butonlar donar); durdurunca biriken süreyi eklememek; butonun diğer ucunu GND'ye bağlamamak (INPUT_PULLUP ile HIGH kalır); iki butonun pinlerini koddakiyle karıştırmak."],
  ["Dene", "Üçüncü bir butonla tur (lap) süresini ikinci satırda kaydet, ya da süreyi Seri Monitör'e de yazdır."]])

# ---------------- 37
add("dijital-geri-sayim-sayaci", "geri_sayim",
 "Keypad ile saniye girilir, # ile geri sayım başlar, LCD'de dakika:saniye azalır ve süre bitince buzzer 3 kez öter. * girileni siler ve geri sayımı iptal eder.",
 [UNO, "Breadboard", "1 × 4x4 tuş takımı (keypad)"] + LCDP + ["1 × aktif buzzer", "Jumper kablolar (24 adet)"],
 LCDW + [["D10", "Keypad R1"], ["D9", "Keypad R2"], ["D8", "Keypad R3"], ["D7", "Keypad R4"], ["A0", "Keypad C1 (analog pin dijital kullanılır)"], ["A1", "Keypad C2"], ["A2", "Keypad C3"], ["A3", "Keypad C4"], ["D6", "Aktif buzzer + (uzun bacak)"], ["GND (GND3)", "Aktif buzzer − (kısa bacak)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + LCDS + [
  "Keypad'i a19–a26 deliklerine tak; pinler soldan sağa R1, R2, R3, R4, C1, C2, C3, C4 sırasındadır.",
  "Keypad kabloları: D10 → e19, D9 → e20, D8 → e21, D7 → e22 (satırlar); A0 → e23, A1 → e24, A2 → e25, A3 → e26 (sütunlar).",
  "Aktif buzzer'ı a29 (+) ve a30 (−) deliklerine tak. D6 → e29, GND3 → e30.",
  "Kodu yükle (simülatörde çalıştır) ve tuvaldeki tuşlarla örneğin 1 5 # gir: ekranda \"Kalan sure:\" ve 00:15'ten geriye doğru sayan süre görünür; sıfıra inince \"SURE DOLDU!\" yazar ve buzzer 3 kez öter."],
 [["Nasıl çalışıyor?", "Rakam tuşları girilen sayının sağına eklenir (girilen = girilen × 10 + rakam, en fazla 4 hane), ekranda saniye mm:ss biçiminde gösterilir. # ile sayimiYap() başlar: kalan = toplam − (millis() − başlangıç) / 1000; ekran yalnızca saniye değişince güncellenir ve sayım sırasında * tuşu iptal eder."],
  ["Simülatörde gözlenen", "\"12\" girilince 00:12, * ile 00:00'a döndü; \"8\" girilip # basılınca ekran \"Kalan sure:\" / 00:08, 00:07 … 00:01 şeklinde saniyede bir azaldı, sıfırda \"SURE DOLDU!\" yazıldı ve buzzer 300 ms'lik 3 bip verdi, ardından giriş ekranı geri geldi. " + KUT],
  ["Pin bütçesi", "LCD 6, keypad 8, buzzer 1 pin ister: 15 pin. D2–D13 yalnızca 12 pindir, bu yüzden keypad sütunları A0–A3'e bağlandı; analog pinler dijital olarak kullanılabilir. Simülatörde bu atamanın çalıştığı görüldü."],
  ["Sık yapılan hatalar", "Keypad R/C pinlerini sketch'teki satirPinleri/sutunPinleri ile uyumsuz bağlamak; sayım sırasında delay() kullanıp tuşları kaçırmak; ekranı her turda yeniden yazıp titretmek; 4 haneden uzun sayı girip int taşırmak (kod 4 hane ile sınırlıdır)."],
  ["Dene", "Sayım bitince LED yakıp söndür ya da sayım sırasında bir tuşla duraklatmayı ekle."]])

# ---------------- 38
add("akilli-park-yeri-gostergesi", "park_yeri",
 "Üç park yerinin her birinde bir IR engel sensörü araç var mı diye bakar; LCD'de \"Bos: N/3\" ve her yerin durumu görünür, boş yerlerin yeşil LED'i yanar.",
 [UNO, "Breadboard", "3 × IR engel algılama sensörü (park yerlerinde, breadboard'a takılı değil)"] + ["1 × 16x2 LCD ekran (HD44780)", "4 × 220 Ω direnç (1 tanesi LCD arka ışığı, 3 tanesi LED'ler için)", "3 × LED (yeşil)", "Jumper kablolar (29 adet)"],
 LCDW + [["D6", "1. IR sensör OUT"], ["D7", "2. IR sensör OUT"], ["D8", "3. IR sensör OUT"], ["D9", "1. LED anot"], ["D10", "2. LED anot"], ["D13", "3. LED anot"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın. IR sensörler park yerlerine konacağı için breadboard'a takılı değildir, breadboard dışında durur ve kablolarla bağlanır."] + LCDS + [
  "Üç LED'i c19, c22, c25 deliklerine tak (anot soldaki bacak, katot sağdaki bacaktır). Her LED'in katot sütununa dikey bir 220 Ω direnç tak: e20–h20, e23–h23, e26–h26. Direnç çıkışlarını j20 → eksi rayı (B-17), j23 → eksi rayı (B-20), j26 → eksi rayı (B-23) kablolarıyla GND'ye bağla.",
  "LED anot kabloları: D9 → e19, D10 → e22, D13 → e25.",
  "Her IR sensörün VCC'sini artı rayına (B+8, B+10, B+12), GND'sini eksi rayına (B-8, B-10, B-12) kablola; OUT uçlarını D6, D7 ve D8 pinlerine bağla.",
  "Kodu yükle (simülatörde çalıştır): sensörlerde \"engel var\" düğmesini aç-kapat; LCD'de boş yer sayısı ve P1/P2/P3 durumu (B: boş, D: dolu) güncellenir, boş yerin LED'i yanar."],
 [["Nasıl çalışıyor?", "IR engel sensörü engel (araç) varken OUT'u LOW yapar. Kod üç sensörü for döngüsüyle okur (irPinleri[] ve ledPinleri[] tek boyutlu dizilerdir), dolu olmayan yerlerin LED'ini yakar, boş yer sayısını sayıp LCD'ye \"Bos: N/3\" ve \"P1:B P2:D P3:B\" olarak yazar."],
  ["Simülatörde gözlenen", "Başlangıçta yalnızca 2. sensörde engel varken ekran \"Bos: 2/3\" / \"P1:B P2:D P3:B\" gösterdi ve 2. LED sönük, diğerleri yanıktı. Sırayla 1. sensöre engel konunca \"Bos: 1/3\", 2. sensörün engeli kalkınca \"Bos: 2/3\", 3. sensöre engel konunca \"Bos: 1/3\", üçünde de engel olunca \"Bos: 0/3\" yazıldı. Pin bütçesi: LCD 6 pin, IR 3 pin, LED 3 pin = 12 pin (D2–D13)."],
  ["Gerçek sensör uyarıları", "Gerçek IR modüllerin algılama mesafesi karttaki potla ayarlanır ve parlak/koyu yüzeyler farklı yansıtır; güneş ışığı IR sensörü şaşırtabilir. Simülatörde engel bir düğmeyle verilir, mesafe ve yansıtma modellenmez. " + KUT],
  ["Sık yapılan hatalar", "IR çıkışının ters mantık olduğunu (engelde LOW) unutmak; her LED'e ayrı direnç koymamak; sensör VCC/GND'sini yanlış rayla karıştırmak; LED katotlarını GND'ye bağlamamak."],
  ["Dene", "Boş yer kalmayınca LCD'ye \"DOLU\" yazdır ve bir buzzer öttür ya da park yeri sayısını 4'e çıkarmak için bir sensör ve LED daha ekle."]],
 free=["ir1", "ir2", "ir3"])

# ---------------- 39
add("mini-ruzgar-hiz-olcer", "ruzgar",
 "Hall sensörü, dönen kanattaki mıknatısı her turda bir kez algılar; Arduino darbeleri sayıp devir/dakikayı ve kanat ucu hızını hesaplar ve Seri Monitör'e yazar. millis() ile ölçüm penceresi ve kenar algılama öğrenilir.",
 [UNO, "Breadboard", "1 × Hall efekt sensörü modülü (A3144 tipi; kanada yapıştırılacak küçük bir mıknatısla)", "Jumper kablolar (3 adet)"],
 [["5V", "Hall sensörü VCC"], ["GND (GND2)", "Hall sensörü GND"], ["D2", "Hall sensörü DO"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Hall sensörünü a2 (VCC), a3 (GND), a4 (DO) deliklerine tak.",
  "Kablolar: 5V → e2, GND2 → e3, D2 → e4.",
  "Gerçek devrede mıknatısı rüzgâr çarkının bir kanadına yapıştırırsın; kanat dönerken mıknatıs sensörün önünden her turda bir kez geçer. Simülatörde bunu Hall sensörünün \"devir/dk\" (rpm) kaydırıcısı verir.",
  "Kodu yükle (simülatörde çalıştır) ve Seri Monitör'ü aç. 2 saniyede bir devir ve hız yazılır; rpm kaydırıcısını değiştirince değerler değişir."],
 [["Nasıl çalışıyor?", "Hall sensörü mıknatıs yakınken DO'yu LOW yapar. Dönen mıknatıs her turda bir LOW darbesi verir (simülatörde turun %10'u kadar sürer). Kod digitalRead ile hızlı okur ve yalnızca HIGH → LOW kenarını sayar; 2 saniyelik pencerede sayılan darbe = tur sayısı. rpm = darbe × 60000 / 2000. Simülatörde attachInterrupt desteklenmediği için okuma döngüde yapılır (delay(1) ile saniyede ~1000 okuma)."],
  ["Hız hesabı ve varsayım", "Kanat ucunun çevre hızı v = 2 × π × r × (rpm / 60) formülüyle bulunur. Koddaki r = 0,05 m (5 cm) bir VARSAYIMDIR; kendi çarkının yarıçapını ölç ve YARICAP_M'yi değiştir. Bu değer kanat ucunun hızıdır, rüzgârın gerçek hızı değildir: gerçek bir anemometrenin rüzgâr hızıyla ilişkisi kanat şekline bağlı bir kalibrasyon katsayısıyla bulunur ve burada hesaplanmaz."],
  ["Simülatörde gözlenen", "600 d/dk ayarında okuma 600 d/dk (3,14 m/s), 300 d/dk ayarında 300 (1,57 m/s), 60 d/dk ayarında 60 (0,31 m/s) çıktı. 120 d/dk ayarındaki ilk 2 saniyelik pencerede 150 okundu, sonraki pencerede 120: pencere kenarına denk gelen tek bir fazla darbe 2 saniyelik pencerede ±30 d/dk hata yapar. Pencereyi uzatmak hatayı azaltır ama tepkiyi yavaşlatır."],
  ["Sık yapılan hatalar", "Hall sensörünün VCC/GND'sini ters bağlamak; darbeyi LOW yerine HIGH ile saymak; döngüde uzun delay() kullanıp darbeleri kaçırmak; mıknatısın kutbunu ters yapıştırmak (bazı Hall sensörleri yalnızca tek kutba tepki verir)."],
  ["Dene", "Sonucu 16x2 LCD'de göster (proje 20'deki LCD bloğunu ekle) ya da hıza göre bir LED çubuğu yak."]])

# ---------------- 40
add("elektronik-pusula", "pusula",
 "HMC5883L manyetometresinden I2C ile ham X ve Y değerleri okunur, atan2() ile yön açısı bulunur ve LCD'de derece ile K/KD/D/GD/G/GB/B/KB harfi gösterilir. Wire kütüphanesi ve ham register erişimi öğrenilir.",
 [UNO, "Breadboard", "1 × HMC5883L pusula modülü (I2C)"] + LCDP + ["Jumper kablolar (18 adet)"],
 LCDW + [["A4", "HMC5883L SDA (I2C veri)"], ["A5", "HMC5883L SCL (I2C saat)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + LCDS + [
  "HMC5883L'i a20 (VCC), a21 (GND), a22 (SCL), a23 (SDA) deliklerine tak. e20 → artı rayı, e21 → eksi rayı, A5 → e22 (SCL), A4 → e23 (SDA). Uno'da I2C pinleri A4 (SDA) ve A5 (SCL)'dir.",
  "Kodu yükle (simülatörde çalıştır): sensörün yön (heading) kaydırıcısını değiştir; LCD'de \"Yon: 135\" ve \"GD\" gibi yön harfleri görünür."],
 [["Nasıl çalışıyor?", "Wire.begin() I2C'yi başlatır. setup()'ta HMC5883L'in (adres 0x1E) mod register'ına (0x02) 0x00 yazılır: sürekli ölçüm. loop()'ta 0x03 register'ından başlayarak 6 bayt okunur: X (MSB, LSB), Z (MSB, LSB), Y (MSB, LSB). İki bayt (xh << 8) | xl ile 16 bitlik işaretli sayıya birleştirilir. Yön = atan2(y, x) radyandır; degrees() ile dereceye çevrilir, negatifse 360 eklenir."],
  ["Simülatörde gözlenen", "Yön kaydırıcısı 0 iken X = 400, Y = 0 okundu ve ekran \"Yon: 0\" K gösterdi; 45'te X = 283, Y = 283 (KD); 90'da X = 0, Y = 400 (D); 135'te X = −283, Y = 283 (GD); 180'de X = −400 (G); 270'te B; 315'te KB. Simülatör gürültü, eğim ve sapma modellemez. " + KUT.replace("DHT.h, LiquidCrystal.h ve Keypad.h", "DHT.h, LiquidCrystal.h ve Keypad.h") ],
  ["Gerçek pusula uyarıları", "Gerçek HMC5883L metal ve motor gibi manyetik nesnelerden etkilenir, kalibrasyon (hard/soft iron) ister, sensör yatay tutulmazsa eğim hatası yapar ve gösterdiği yön manyetik kuzeydir (coğrafi kuzeyden sapma = manyetik sapma, yerine göre birkaç derece). Bu projede bunların hiçbiri düzeltilmez."],
  ["Sık yapılan hatalar", "SDA ve SCL'yi ters bağlamak (Wire.available() 0 kalır, ekranda \"Sensor yok!\"); Z ve Y'yi sırasına karşın okumak (sıra X, Z, Y'dir); Wire.begin() unutmak; atan2'de argüman sırasını (y, x) bozmak."],
  ["Dene", "Yön aralıklarını 16 yöne çıkar ya da sensörü kalibre etmek için en büyük/küçük X ve Y değerlerini kaydedip ortalama kaydırmasını çıkar."]])

for k, v in C.items():
    json.dump(v, open(f'{HERE}/content/{k}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(C), 'içerik yazıldı')
