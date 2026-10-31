#!/usr/bin/env python3
"""Seviye 3 (41-60) anlatım içerikleri: content/<id>.json üretir. Kullanım: python3 gen_content3.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
C = {}
def add(id, sketch, d, parts, wiring, steps, notes, free=None):
    C[id] = dict(sketch=sketch, d=d, parts=parts, wiring=wiring, steps=steps, notes=notes)
    if free: C[id]['free'] = free

UNO = "Arduino Uno ve USB kablosu"
LCDP = ["1 × 16x2 LCD ekran (HD44780)", "1 × 220 Ω direnç (LCD arka ışığı)"]
def lcdw(rs="D12", e="D11", d=("D5", "D4", "D3", "D2")):
    return [["5V", "Alttaki artı (+) rayı: LCD VDD ve arka ışık direncinin ucu"], ["GND (GND2)", "Alttaki eksi (−) rayı: LCD VSS, V0, RW ve K"],
            [rs, "LCD RS"], [e, "LCD E"], [d[0], "LCD D4"], [d[1], "LCD D5"], [d[2], "LCD D6"], [d[3], "LCD D7"]]
def lcds(rs="D12", e="D11", d=("D5", "D4", "D3", "D2")):
    return ["LCD'yi breadboard'un en üst sırasına (a satırı) tak: 12 pini sırayla 2–13. sütunlara gelsin (VSS, VDD, V0, RS, RW, E, D4, D5, D6, D7, A, K). Gerçek 16x2 LCD'nin 16 pini vardır; D0–D3 pinleri 4 bit modda boş kalır, simülatördeki ekran yalnızca kullanılan 12 pini gösterir.",
        "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
        "LCD güç kabloları: e2 → eksi rayı (VSS), e3 → artı rayı (VDD), e4 → eksi rayı (V0), e6 → eksi rayı (RW), e13 → eksi rayı (K). Arka ışık için 220 Ω direnci d12 ile d16 arasına tak (A bacağı üzerinden) ve e16 → artı rayı.",
        f"LCD veri kabloları: {rs} → e5 (RS), {e} → e7 (E), {d[0]} → e8 (D4), {d[1]} → e9 (D5), {d[2]} → e10 (D6), {d[3]} → e11 (D7)."]
SIMSINIR = "Simülatörde gerçek Bluetooth/radyo/uydu/parmak izi donanımı yoktur; bu proje bu yüzden simülatörde yalnızca verilen veriyle çalışır. Gerçek kartta denenmedi."
SIM_YOK = "Simülatör sınırı"
def kut(*bas, gercek=None):
    ok = "Gerçek derleme servisi yalnızca Arduino.h, Servo.h, Wire.h, SPI.h, EEPROM.h ve SoftwareSerial.h başlıklarını kabul eder"
    return f"{ok}; bu sketch'teki {', '.join(bas)} onların dışındadır, sitedeki gerçek derleme bu sketch'te hata verir. Gerçek kart için Arduino IDE'ye ilgili kütüphaneyi kurmak gerekir."

# ---------------- 41
add("bluetooth-kontrollu-led", "bt_led",
 "Telefondan HC-05 Bluetooth modülüne gönderilen '1' LED'i yakar, '0' söndürür. SoftwareSerial ile ikinci bir seri hat kurmayı ve 5 V / 3,3 V seviye uyumunu (gerilim bölücü) öğrenirsin. Simülatörde Bluetooth eşleşmesi yoktur; telefon metni kutudan gönderilir.",
 [UNO, "Breadboard", "1 × HC-05 Bluetooth modülü", "1 × LED (yeşil)", "1 × 220 Ω direnç (LED için)", "1 × 1 kΩ direnç (gerilim bölücü)", "1 × 2 kΩ direnç (gerilim bölücü)", "Jumper kablolar (9 adet)"],
 [["5V", "Alttaki artı (+) rayı: HC-05 VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: HC-05 GND, LED direnci ve gerilim bölücü"], ["D8", "LED anodu (c4)"], ["D10", "HC-05 TXD (Arduino'nun RX'i)"], ["D11", "1 kΩ direncin ucu → HC-05 RXD (Arduino'nun TX'i)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "LED'i c4 (anot, uzun bacak) ve c5 (katot) deliklerine tak. 220 Ω direnci d5 ile d9 arasına tak. D8 pinini e4'e, e9'u eksi rayına kablola.",
  "HC-05'i a14 (VCC), a15 (GND), a16 (TXD), a17 (RXD) deliklerine tak. e14 → artı rayı, e15 → eksi rayı.",
  "HC-05'in TXD ucu Arduino'nun D10 (RX) pinine gider: e16 → D10.",
  "HC-05'in RXD ucu 3,3 V mantıklıdır, Arduino TX'i ise 5 V verir. Bu yüzden gerilim bölücü kur: 1 kΩ direnci d17 ile d21 arasına, 2 kΩ direnci dikey olarak e17 ile h17 arasına tak. D11 pinini e21'e, j17'yi eksi rayına kablola. Bölücü çıkışı (RXD) 5 V × 2 / 3 ≈ 3,3 V olur.",
  "Kodu yükle (simülatörde çalıştır): HC-05 modülünü seç, kutuya 1 yaz ve \"Telefondan gönder\"e bas: LED yanar. 0 gönderince söner."],
 [["Nasıl çalışıyor?", "HC-05 telefonla Bluetooth üzerinden, Arduino ile seri hat (UART) üzerinden konuşur. D0/D1 pinleri USB'ye ayrılı olduğu için SoftwareSerial bt(10, 11) ile D10'u RX, D11'i TX yapan ikinci bir seri hat kurulur; hız 9600 baud'dur (HC-05'in varsayılan hızı). bt.available() kaç karakter geldiğini söyler, bt.read() bir karakter okur. Gelen karakter '1' ise LED yanar, '0' ise söner; başka karakterler yok sayılır. Arduino ayrıca bt.println() ile telefona \"LED ACIK\" / \"LED KAPALI\" yazar."],
  ["Neden gerilim bölücü?", "HC-05'in veri girişi (RXD) 3,3 V ile çalışır, Arduino Uno'nun çıkışı ise 5 V'tur. 1 kΩ + 2 kΩ gerilim bölücü 5 V'u yaklaşık 3,3 V'a indirir. TXD → D10 yönünde bölücü gerekmez: HC-05'in 3,3 V'luk HIGH seviyesini Arduino HIGH olarak okur."],
  ["Simülatörde gözlenen", "Simülatörde gerçek Bluetooth eşleşmesi yoktur; \"telefondan\" gelen metin modülün kutusuna yazılıp gönderilir (9600 baud). Çalıştırınca Seri Monitör'de \"Bluetooth LED hazir\" yazdı; 1,5 saniyede 1 gönderince \"Komut: 1 -> LED ACIK\" yazıldı ve LED yandı, 3. saniyede 0 gönderince \"Komut: 0 -> LED KAPALI\" yazıldı ve LED söndü; 7 gönderince hiçbir şey olmadı; 5. saniyede 1 ile LED yeniden yandı. Gerçek kartta ve gerçek telefonla denenmedi."],
  [SIM_YOK, "Eşleşme (PIN 1234 ya da 0000), telefon uygulaması, AT komutları ve radyo menzili simüle edilmez. Gerilim bölücü kullandığın için simülatör Arduino'dan telefona giden \"LED ACIK\" yanıtını modülün ekranında göstermez (simülatör yalnızca doğrudan bağlı RXD hattını izler); gerçek devrede bu yanıt telefona gider. Bu sketch yalnızca SoftwareSerial.h kullanır; bu başlık gerçek derleme servisinin izinli başlıkları arasındadır."],
  ["Sık yapılan hatalar", "TXD ve RXD'yi çapraz bağlamamak (modülün TXD'si Arduino'nun RX pinine, RXD'si TX pinine gider); bt.begin() hızını modülünkinden farklı seçmek (anlamsız karakterler gelir); RXD'yi doğrudan 5 V'luk D11'e bağlamak (modülü zorlar); HC-05'e 5V yerine 3,3 V vermek (bu modül kartı 3,6–6 V ister); D0/D1 pinlerini hem USB hem Bluetooth için kullanmak (yükleme sırasında hata verir)."],
  ["Dene", "'2' gönderince LED'in yanıp sönmesini sağla ya da yeni bir LED ekleyip '3' ve '4' komutlarıyla ikinci LED'i kontrol et."]])

# ---------------- 42
add("bluetooth-kontrollu-robot-araba", "bt_araba",
 "Telefondan HC-05 ile gelen F, B, L, R, S harflerine göre L298N motor sürücü iki DC motoru ileri, geri, sola, sağa sürer ve durdurur; 1–9 rakamları PWM ile hızı ayarlar. H köprü mantığını (IN1/IN2) ve hız denetimini (ENA/ENB) öğrenirsin. Simülatörde Bluetooth eşleşmesi yoktur; telefon komutu kutudan gönderilir.",
 [UNO, "Breadboard", "1 × HC-05 Bluetooth modülü", "1 × L298N motor sürücü", "2 × DC motor (robot arabanın sol ve sağ tekerleği)", "1 × ayarlanabilir güç kaynağı (6 V'a ayarlı; gerçekte 4 × AA pil kutusu)", "1 × 1 kΩ direnç (gerilim bölücü)", "1 × 2 kΩ direnç (gerilim bölücü)", "Jumper kablolar (21 adet)"],
 [["5V", "Alttaki artı (+) rayı: HC-05 VCC ve L298N 5V ucu"], ["GND (GND2)", "Alttaki eksi (−) rayı: HC-05 GND, gerilim bölücü ve L298N GND"], ["D2", "HC-05 TXD (Arduino'nun RX'i)"], ["D3", "1 kΩ direncin ucu → HC-05 RXD (Arduino'nun TX'i)"],
  ["D5", "L298N ENA (sol motor hızı, PWM)"], ["D6", "L298N ENB (sağ motor hızı, PWM)"], ["D7", "L298N IN1"], ["D8", "L298N IN2"], ["D9", "L298N IN3"], ["D10", "L298N IN4"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın ve güç kaynağı kapalı olsun.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "L298N'i breadboard'un en üst sırasına (a satırı) tak: 13 pini sırayla a4–a16 deliklerine gelsin (12V, GND, 5V, ENA, IN1, IN2, IN3, IN4, ENB, OUT1, OUT2, OUT3, OUT4).",
  "Güç kaynağı (breadboard dışında, takılı değil): + ucunu e4'e (12V), − ucunu e5'e (GND) kablola. Motorların ve Arduino'nun GND'si ortak olmalı: d5 → eksi rayı. e6 → artı rayı: bu bağlantıyla L298N'in mantık devresi Arduino'nun 5V'unu kullanır; kartın üzerindeki 5V jumper'ını çıkar.",
  "Kontrol kabloları: D5 → e7 (ENA), D7 → e8 (IN1), D8 → e9 (IN2), D9 → e10 (IN3), D10 → e11 (IN4), D6 → e12 (ENB).",
  "Motorlar (breadboard dışında, takılı değil): sol motor için e13 → motor A, e14 → motor B (OUT1, OUT2); sağ motor için e15 → motor A, e16 → motor B (OUT3, OUT4).",
  "HC-05'i a20 (VCC), a21 (GND), a22 (TXD), a23 (RXD) deliklerine tak. e20 → artı rayı, e21 → eksi rayı, e22 → D2.",
  "Gerilim bölücü: 1 kΩ direnci d23 ile d27 arasına, 2 kΩ direnci dikey olarak e23 ile h23 arasına tak. D3 pinini e27'ye, j23'ü eksi rayına kablola.",
  "Kodu yükle (simülatörde çalıştır): HC-05'i seç, kutuya F yaz ve \"Telefondan gönder\"e bas: iki motor ileri döner. B, L, R, S ve 1–9 ile diğer komutları dene."],
 [["Nasıl çalışıyor?", "L298N'in her kanalı bir H köprüdür. Bir motorun iki ucuna IN1/IN2 ile polarite verilir: IN1 = HIGH, IN2 = LOW ileri; IN1 = LOW, IN2 = HIGH geri; ikisi de LOW (ya da ikisi de HIGH) motoru durdurur. ENA/ENB pinleri kanalı açar; bu pinlere analogWrite() ile PWM verilirse motorun ortalama gerilimi, yani hızı değişir. Kod, sur(sol, sag) fonksiyonuyla iki motorun yönünü birlikte ayarlar: L komutunda sol motor geri, sağ motor ileri döner (araba yerinde sola döner)."],
  ["Komut tablosu", "F: ileri. B: geri. L: sola dön. R: sağa dön. S: dur. 1–9: hız (map ile 80–255 arası PWM; varsayılan 200)."],
  ["Simülatörde gözlenen", "Simülatörde gerçek Bluetooth eşleşmesi yoktur; komut harfi modülün kutusuna yazılıp gönderilir. Seri Monitör'de \"Robot araba hazir\" yazdı. 1,5. saniyede F gönderince L298N modülü \"A: ileri %78 · B: ileri %78\" gösterdi ve iki motor ileri döndü; L gönderince \"A: geri · B: ileri\", R gönderince \"A: ileri · B: geri\", B gönderince iki kanal da geri, S gönderince \"A: fren · B: fren\" oldu. 5 gönderince Seri Monitör'e \"Hiz: 167\" yazıldı ve sonraki F'de görev oranı %65'e indi. Motor modelinde 6 V tam hızdır; PWM %78 ve L298N'in yaklaşık 2 V gerilim düşümü yüzünden motor yaklaşık yarı hızda (0,49) döndü, her motor yaklaşık 97 mA çekti. Gerçek kartta ve gerçek motorlarla denenmedi."],
  [SIM_YOK, "Bluetooth eşleşmesi, telefon uygulaması, tekerlek yükü, motor ataleti, L298N'in ısınması ve akım sınırı simüle edilmez. Gerilim bölücü kullandığın için simülatör Arduino'dan telefona giden verileri göstermez; bu sketch telefona veri de göndermez. Sketch yalnızca SoftwareSerial.h kullanır; bu başlık gerçek derleme servisinin izinli başlıkları arasındadır."],
  ["Güç ve GND", "Motorları Arduino'nun 5V pininden besleme, çünkü motorlar yüzlerce mA çeker. Motor gücü ayrı güç kaynağından (pil kutusu) gelir; ama L298N'in GND'si Arduino GND'sine mutlaka bağlanmalı, yoksa IN/EN sinyalleri anlamsız olur. L298N yaklaşık 2 V gerilim düşürür; bu yüzden motor beslemesini motorun istediği gerilimden yaklaşık 2 V yüksek seç. L298N'de motorun ters EMK'sı için dahili serbest dönüş diyotları vardır; bu yüzden devreye ayrıca diyot eklenmez."],
  ["Sık yapılan hatalar", "Motor beslemesinin GND'sini Arduino GND'sine bağlamamak; IN pinlerini ENA/ENB ile karıştırmak; ENA'yı boş bırakıp (jumper takılı) hız kontrolü beklemek; TXD ve RXD'yi çapraz bağlamamak; RXD'yi gerilim bölücüsüz 5 V'luk D3'e bağlamak; HC-05'in hız ayarını (9600) kodla uyumsuz yapmak."],
  ["Dene", "Hız komutuna '+' ve '-' ekle (hız 20'şer artsın/azalsın) ya da F komutunda motorlardan birini biraz yavaşlatarak arabanın düz gitmesini ayarla."]],
 free=["psu1", "m1", "m2"])

# ---------------- 43
add("joystick-kontrollu-servo", "joystick_servo",
 "Analog joystick'in X ekseni servonun açısını belirler (0–180°), joystick düğmesi servoyu 90° merkeze getirir. analogRead ile iki eksen okumayı, map() ile aralık çevirmeyi ve INPUT_PULLUP ile düğme okumayı öğrenirsin.",
 [UNO, "Breadboard", "1 × analog joystick modülü (VRx, VRy, SW)", "1 × servo motor (SG90)", "Jumper kablolar (10 adet)"],
 [["5V", "Alttaki artı (+) rayı: joystick +5V ve servo VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: joystick GND ve servo GND"], ["A0", "Joystick VRx (X ekseni)"], ["A1", "Joystick VRy (Y ekseni)"], ["D2", "Joystick SW (düğme)"], ["D9", "Servo sinyal (SIG)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "Joystick'i a4 (GND), a5 (+5V), a6 (VRx), a7 (VRy), a8 (SW) deliklerine tak.",
  "Joystick kabloları: e4 → eksi rayı, e5 → artı rayı, e6 → A0, e7 → A1, e8 → D2.",
  "Servoyu d12 (SIG), d13 (VCC), d14 (GND) deliklerine tak. Servo sinyal kablosu: b12 → D9. Servo güç kabloları: b13 → artı rayı, b14 → eksi rayı.",
  "Kodu yükle (simülatörde çalıştır): joystick'in X kaydırıcısını değiştir; servo kolu 0–180° arasında onu izler. Düğmeye basınca servo 90°'ye döner."],
 [["Nasıl çalışıyor?", "Joystick içinde iki potansiyometre vardır: biri X, biri Y yönünü ölçer. Bırakınca iki eksen de yaklaşık orta noktaya (analogRead ≈ 512) döner. map(x, 0, 1023, 0, 180) bu değeri servo açısına çevirir. Ortada 492–532 arası küçük bir ölü bölge bırakılır; böylece joystick gevşekken servo titremez. Joystick'in SW ucu düğmedir: basılınca GND'ye bağlanır. pinMode(2, INPUT_PULLUP) ile dahili direnç etkinleştirildiği için basılmadığında HIGH, basılınca LOW okunur."],
  ["Simülatörde gözlenen", "X kaydırıcısı ortada (0,5) iken Seri Monitör \"X=512\" ve servo 90°; X = 0,8 iken \"X=819, aci=144\"; en sağda (1,0) \"X=1023, aci=180\"; en solda \"X=0, aci=0\"; 0,25'te \"X=256, aci=45\". Düğmeye basılıyken X = 0,9 olduğu halde açı 90° kaldı ve \"SW=basili\" yazıldı; bırakınca servo 162°'ye döndü. Y ekseni yalnızca ekrana yazılır (Y = 1,0'da \"Y=1023\"). Simülatörde joystick yay etkisi, gürültü ve ölü bölge yoktur; gerçek joystick merkezde 500–520 arasında oynar. Gerçek kartta denenmedi."],
  [SIM_YOK, "Joystick ve servo simülatörde çalışır; kayan kaydırıcılar fiziksel kolun yerini tutar. Sketch yalnızca Servo.h kullanır; bu başlık gerçek derleme servisinin izinli başlıkları arasındadır."],
  ["Sık yapılan hatalar", "Joystick VCC'sini 3,3 V'a bağlamak (değerler daralır); X ve Y'yi A0/A1'de karıştırmak; SW pinini INPUT_PULLUP yapmayıp boş bırakmak (rastgele okur); servoyu Arduino 5V pininden güçlü motorlarla beslemek (SG90 küçük olduğu için sorun olmaz, büyük servolara ayrı güç gerekir)."],
  ["Dene", "Y eksenini ikinci bir servoya bağla (pan-tilt kamera düzeneği) ya da servoyu açıya değil dönüş hızına göre kontrol et."]])

# ---------------- 44
add("kablosuz-sicaklik-istasyonu", "kablosuz_istasyon",
 "DHT11 sıcaklık ve nemi 16x2 LCD'de gösterir, aynı ölçümü HC-05 ile telefona yollar; telefondan gelen F ve C harfleri birimi Fahrenheit/Celsius yapar. Üç modülü (DHT, LCD, Bluetooth) tek sketch'te birleştirmeyi öğrenirsin. Simülatörde Bluetooth eşleşmesi yoktur; telefon komutu kutudan gönderilir.",
 [UNO, "Breadboard", "1 × HC-05 Bluetooth modülü", "1 × DHT11 sıcaklık ve nem sensörü (3 pinli modül)"] + LCDP + ["1 × 1 kΩ direnç (gerilim bölücü)", "1 × 2 kΩ direnç (gerilim bölücü)", "Jumper kablolar (22 adet)"],
 lcdw() + [["D8", "DHT11 DATA"], ["D9", "1 kΩ direncin ucu → HC-05 RXD (Arduino'nun TX'i)"], ["D10", "HC-05 TXD (Arduino'nun RX'i)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + lcds() + [
  "HC-05'i a21 (VCC), a22 (GND), a23 (TXD), a24 (RXD) deliklerine tak. e21 → artı rayı, e22 → eksi rayı, e23 → D10.",
  "Gerilim bölücü: 1 kΩ direnci d24 ile d20 arasına, 2 kΩ direnci dikey olarak e24 ile h24 arasına tak. D9 pinini e20'ye, j24'ü eksi rayına kablola.",
  "DHT11'i c27 (VCC), c28 (DATA), c29 (GND) deliklerine tak. e27 → artı rayı, e29 → eksi rayı, D8 pinini e28'e kablola.",
  "Kodu yükle (simülatörde çalıştır): LCD'de \"Sicaklik: 27.0 C\" ve \"Nem: %55\" görünür. DHT11 kaydırıcısını değiştir; HC-05'i seçip F gönder: sıcaklık Fahrenheit'a döner, C gönderince tekrar Celsius olur."],
 [["Nasıl çalışıyor?", "Her 2 saniyede bir DHT11'den sıcaklık ve nem okunur, LCD'ye yazılır ve bt.print() ile Bluetooth'a gönderilir (telefondaki seri terminal uygulaması \"Sicaklik: 27.0 C  Nem: %55\" satırlarını gösterir). Döngünün başında bt.available() ile telefondan komut gelip gelmediğine bakılır: 'F' gelirse dht.readTemperature(true) Fahrenheit, 'C' gelirse Celsius okur. D0/D1 USB'ye ayrılı olduğu için Bluetooth için SoftwareSerial bt(10, 9) kullanılır: D10 RX, D9 TX."],
  ["Gerilim bölücü", "HC-05'in RXD girişi 3,3 V mantıklıdır; Arduino D9 pini ise 5 V verir. 1 kΩ + 2 kΩ gerilim bölücü bu seviyeyi yaklaşık 3,3 V'a indirir. HC-05'in TXD çıkışı (3,3 V) Arduino için HIGH sayıldığından o yönde bölücü gerekmez."],
  ["Simülatörde gözlenen", "Simülatörde gerçek Bluetooth eşleşmesi yoktur; komut harfi modülün kutusuna yazılıp gönderilir. Sensör 27 °C ve %55 iken LCD \"Sicaklik: 27.0 C\" / \"Nem: %55\" gösterdi; 31 °C ve %70'e getirince \"31.0 C\" / \"%70\"; F gönderince \"Sicaklik: 87.8 F\" (31 °C = 87,8 °F), C gönderince tekrar \"31.0 C\"; 18 °C ve %35'e getirince \"18.0 C\" / \"%35\". Seri Monitör'e her ölçümde \"Gonderildi: ...\" ve komutlarda \"Komut: F -> Fahrenheit\" yazıldı. Gerçek kartta ve gerçek telefonla denenmedi."],
  [SIM_YOK, "Bluetooth eşleşmesi, telefon uygulaması ve radyo menzili simüle edilmez. Gerilim bölücü kullandığın için simülatör Arduino'dan telefona giden \"Sicaklik: ...\" satırlarını modülün ekranında göstermez (simülatör yalnızca doğrudan bağlı RXD hattını izler); bu yüzden gönderilen veriyi Seri Monitör'e de yazdırdık. Gerçek devrede aynı satır telefona gider. " + kut("DHT.h ve LiquidCrystal.h")],
  ["Sık yapılan hatalar", "HC-05'in TXD ve RXD'sini çapraz bağlamamak; RXD'yi gerilim bölücüsüz bağlamak; Bluetooth ve LCD için aynı pinleri kullanmak (LCD D2–D5, D11, D12'de, Bluetooth D9 ve D10'da); DHT11'i 2 saniyeden sık okumak; dht.readTemperature() sonucunu isnan() ile denetlememek."],
  ["Dene", "Telefondan 'T' gelince yalnızca bir ölçümü anında göndersin; ya da sıcaklık 30 °C'yi aşınca bt.println(\"UYARI: SICAK\") ile telefonu uyar."]])

# ---------------- 45
add("rfid-kartli-kapi-sistemi", "rfid_kapi",
 "RC522 okuyucu kartın UID numarasını SPI ile okur; kayıtlı kart (A1 B2 C3 D4) servoyu 90°'ye çevirip kapıyı 3 saniye açar, tanınmayan kart reddedilir. SPI haberleşmesini, MFRC522 kütüphanesini ve baytları karşılaştırmayı öğrenirsin. Simülatörde gerçek RFID alanı yoktur; kart UID'si ve 'kart yakın' bilgisi arayüzden verilir.",
 [UNO, "Breadboard", "1 × RC522 RFID okuyucu modülü (kart ve anahtarlık ile)", "1 × servo motor (SG90)", "Jumper kablolar (12 adet)"],
 [["3V3", "RC522 3.3V (yalnızca 3,3 V ile beslenir)"], ["5V", "Alttaki artı (+) rayı: servo VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: RC522 GND ve servo GND"], ["D9", "RC522 RST"], ["D10", "RC522 SDA (SS, çip seçme)"], ["D11", "RC522 MOSI"], ["D12", "RC522 MISO"], ["D13", "RC522 SCK"], ["D6", "Servo sinyal (SIG)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "RC522'yi a4 (3.3V), a5 (RST), a6 (GND), a7 (MISO), a8 (MOSI), a9 (SCK), a10 (SDA) deliklerine tak.",
  "DİKKAT: RC522 yalnızca 3,3 V ile beslenir, 5 V verirsen bozulur. Arduino 3V3 pinini e4'e kablola.",
  "RC522 kabloları: e6 → eksi rayı (GND), D9 → e5 (RST), D12 → e7 (MISO), D11 → e8 (MOSI), D13 → e9 (SCK), D10 → e10 (SDA).",
  "Servoyu d14 (SIG), d15 (VCC), d16 (GND) deliklerine tak. b14 → D6, b15 → artı rayı, b16 → eksi rayı.",
  "Kodu yükle (simülatörde çalıştır): RC522'yi seç, \"kart yakın\" seçeneğini aç. Kart UID'si A1B2C3D4 ise servo 90°'ye döner; başka bir UID girersen servo kıpırdamaz."],
 [["Nasıl çalışıyor?", "RC522, kartla 13,56 MHz radyo alanı üzerinden konuşur; Arduino ile SPI üzerinden konuşur (MOSI D11, MISO D12, SCK D13, SS D10, RST D9). setup()'ta SPI.begin() ve rfid.PCD_Init() çağrılır. loop()'ta PICC_IsNewCardPresent() yeni kart var mı diye bakar, PICC_ReadCardSerial() kartın UID'sini rfid.uid içine okur (uid.size bayt sayısı, uid.uidByte[i] baytlar). UID, koddaki kayıtli[] dizisiyle bayt bayt karşılaştırılır. Eşleşirse servo 90° olur, 3 saniye sonra 0°'ye döner. PICC_HaltA() kartı durdurur; aynı kart yeniden okutulmak için çekilip tekrar yaklaştırılmalıdır."],
  ["Simülatörde gözlenen", "Kart yokken Seri Monitör'de yalnızca \"Karti okutun\" göründü. 1,5. saniyede A1B2C3D4 kartı yaklaşınca \"UID: A1 B2 C3 D4\" ve \"Kart kabul edildi: kapi acik\" yazıldı, servo 0°'den 90°'ye döndü, 3 saniye sonra \"Kapi kapandi\" yazılıp servo 0°'ye geri geldi. 6. saniyede başka kart (11223344) yaklaşınca \"UID: 11 22 33 44\" ve \"Kart reddedildi\" yazıldı, servo hareket etmedi. 9,5. saniyede kayıtlı kart yeniden okutulunca kapı yeniden açıldı. Gerçek kartta ve gerçek RFID etiketiyle denenmedi."],
  [SIM_YOK, "Simülatörde gerçek RFID alanı, anten menzili ve kart çarpışması yoktur: kart, modülün ayarlarındaki UID ve \"kart yakın\" kutusuyla temsil edilir. Yalnızca UID okunur; kart belleğine okuma/yazma ve MIFARE kimlik doğrulama simüle edilmez. " + kut("MFRC522.h")],
  ["Güvenlik uyarısı", "Bu proje bir öğrenme örneğidir: kart UID'leri kolayca kopyalanabilir, gerçek kapı kilidi için yeterli güvenlik sağlamaz. Servo kapıyı yalnızca temsil eder."],
  ["Sık yapılan hatalar", "RC522'yi 5 V'a bağlamak (bozulur); MOSI/MISO/SCK'yi D11/D12/D13 dışına bağlamak (Uno'da donanım SPI pinleri sabittir); SPI.begin() ya da PCD_Init() çağırmamak; SS pinini koddakiyle (10) uyumsuz bağlamak; PICC_HaltA() koymamak (aynı kart ardı ardına okunur)."],
  ["Dene", "İkinci bir kayıtlı kart UID'si ekle ya da kabul edilen kartta yeşil, reddedilen kartta kırmızı LED yak."]])

# ---------------- 46
add("rfid-personel-giris-sistemi", "rfid_personel",
 "RC522 ile okunan kartın UID'si LCD'de gösterilir; kayıtlı kartlar için kişinin adı yazılır ve buzzer bir kez, tanınmayan kart için üç kez öter. SPI ile LCD'yi aynı anda kullanmayı (pinleri paylaştırmayı) ve baytları dizide aramayı öğrenirsin. Simülatörde gerçek RFID alanı yoktur; kart UID'si arayüzden verilir.",
 [UNO, "Breadboard", "1 × RC522 RFID okuyucu modülü (kart ve anahtarlık ile)"] + LCDP + ["1 × aktif buzzer", "Jumper kablolar (23 adet)"],
 [["3V3", "RC522 3.3V (yalnızca 3,3 V ile beslenir)"], ["5V", "Alttaki artı (+) rayı: LCD VDD ve arka ışık direncinin ucu"], ["GND (GND2)", "Alttaki eksi (−) rayı: LCD VSS, V0, RW, K, RC522 GND ve buzzer −"],
  ["D2", "LCD RS"], ["D3", "LCD E"], ["D4", "LCD D4"], ["D5", "LCD D5"], ["D6", "LCD D6"], ["D7", "LCD D7"], ["D8", "Buzzer + (anot)"],
  ["D9", "RC522 RST"], ["D10", "RC522 SDA (SS, çip seçme)"], ["D11", "RC522 MOSI"], ["D12", "RC522 MISO"], ["D13", "RC522 SCK"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + lcds("D2", "D3", ("D4", "D5", "D6", "D7")) + [
  "Bu projede LCD'yi D2–D7 pinlerine bağladık, çünkü D11, D12 ve D13 pinleri RC522'nin SPI hattına ayrılmıştır.",
  "RC522'yi a20 (3.3V), a21 (RST), a22 (GND), a23 (MISO), a24 (MOSI), a25 (SCK), a26 (SDA) deliklerine tak. DİKKAT: RC522 yalnızca 3,3 V ile beslenir. Arduino 3V3 pinini e20'ye kablola.",
  "RC522 kabloları: e22 → eksi rayı, D9 → e21 (RST), D12 → e23 (MISO), D11 → e24 (MOSI), D13 → e25 (SCK), D10 → e26 (SDA).",
  "Aktif buzzer'ı c28 (+) ve c29 (−) deliklerine tak. D8 pinini e28'e, e29'u eksi rayına kablola.",
  "Kodu yükle (simülatörde çalıştır): RC522'yi seç, \"kart yakın\" seçeneğini aç. A1B2C3D4 UID'si için LCD'de \"Giris: Ahmet\", 5A6B7C8D için \"Giris: Zeynep\" görünür; başka UID için \"Giris reddedildi\" yazılır."],
 [["Nasıl çalışıyor?", "RC522 Arduino ile SPI üzerinden konuşur (MOSI D11, MISO D12, SCK D13, SS D10, RST D9). Kart okununca UID baytları hem LCD'ye hem Seri Monitör'e onaltılık (HEX) olarak yazılır; tek haneli bayt başına 0 eklenir. kayitli[] dizisinde iki kişinin 4'er baytlık kart numarası art arda durur; kartEslesti(kisi) bunları bayt bayt karşılaştırır (çok boyutlu dizi yerine kisi × 4 + i indeksi kullanılır). Eşleşen kart için buzzer 120 ms öter; eşleşmeyen için üç kez öter. Sonuç 1,5 saniye gösterilip ekran \"Karti okutun\"a döner."],
  ["Simülatörde gözlenen", "Başlangıçta LCD \"Personel Giris\" / \"Karti okutun\" gösterdi. 1,5. saniyede A1B2C3D4 kartı yaklaşınca LCD'de \"A1B2C3D4\" ve \"Giris: Ahmet\" yazıldı, buzzer bir kez (120 ms) öttü; 4,5. saniyede 5A6B7C8D için \"Giris: Zeynep\" ve bir bip; 7,5. saniyede tanınmayan 99887766 için \"Giris reddedildi\" ve üç bip oldu. Her sonuçtan yaklaşık 1,7 saniye sonra ekran bekleme metnine döndü. Gerçek kartta ve gerçek RFID etiketiyle denenmedi."],
  [SIM_YOK, "Simülatörde gerçek RFID alanı ve anten menzili yoktur: kart, modülün ayarlarındaki UID ve \"kart yakın\" kutusuyla temsil edilir. Yalnızca UID okunur; kart belleği ve MIFARE kimlik doğrulaması yoktur. " + kut("MFRC522.h ve LiquidCrystal.h")],
  ["Sık yapılan hatalar", "LCD'yi D11–D13'e bağlayıp SPI ile çakıştırmak; RC522'yi 5 V'a bağlamak; MOSI ve MISO'yu ters bağlamak; UID'yi 0 ile doldurmayı unutmak (0A yerine A görünür); kayıtlı kartları dizide sırasını karıştırmak."],
  ["Dene", "Üçüncü bir kişi ekle (kayitli[] dizisini 12 bayta çıkar) ya da her kişinin kaç kez giriş yaptığını sayıp LCD'de göster."]])

# ---------------- 47
add("sd-karta-veri-kaydedici", "sd_kayit",
 "DHT11'in ölçtüğü sıcaklık ve nem 2 saniyede bir SD karttaki VERI.CSV dosyasına satır satır eklenir; altı kayıttan sonra dosya geri okunup Seri Monitör'e yazılır. SD kart modülünü (SPI), dosya açma/yazma/kapatma ve CSV biçimini öğrenirsin.",
 [UNO, "Breadboard", "1 × SD kart modülü (FAT32 biçimli bir SD kart takılı)", "1 × DHT11 sıcaklık ve nem sensörü (3 pinli modül)", "Jumper kablolar (11 adet)"],
 [["5V", "Alttaki artı (+) rayı: SD modülü VCC ve DHT11 VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: SD modülü GND ve DHT11 GND"], ["D2", "DHT11 DATA"], ["D4", "SD modülü CS (çip seçme)"], ["D11", "SD modülü MOSI"], ["D12", "SD modülü MISO"], ["D13", "SD modülü SCK"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın. SD kartı modüle tak (kart önce bilgisayarda FAT32 biçimlendirilmiş olmalı).",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "SD kart modülünü a4 (GND), a5 (VCC), a6 (MISO), a7 (MOSI), a8 (SCK), a9 (CS) deliklerine tak.",
  "SD modülü kabloları: e4 → eksi rayı, e5 → artı rayı, D12 → e6 (MISO), D11 → e7 (MOSI), D13 → e8 (SCK), D4 → e9 (CS).",
  "DHT11'i c14 (VCC), c15 (DATA), c16 (GND) deliklerine tak. e14 → artı rayı, e16 → eksi rayı, D2 pinini e15'e kablola.",
  "Kodu yükle (simülatörde çalıştır): Seri Monitör'de \"SD kart hazir\" ve her 2 saniyede \"Kayit N yazildi\" görünür; altıncı kayıttan sonra VERI.CSV içeriği ekrana basılır. SD modülünü seçersen dosya adı ve satırları modülün bilgisinde de görünür."],
 [["Nasıl çalışıyor?", "SD kart modülü Arduino ile SPI üzerinden konuşur (MOSI D11, MISO D12, SCK D13); çip seçme (CS) pini kodda SD.begin(4) ile belirtilir. SD.open(\"veri.csv\", FILE_WRITE) dosyayı açar (yoksa oluşturur, varsa sonuna ekler). print() ve println() ile satır yazılır; sütunlar noktalı virgülle ayrılır (CSV). close() veriyi karta kesin olarak yazar; kapatılmazsa veri kaybolabilir. Dosya adı 8.3 biçiminde olmalıdır (en çok 8 harf + 3 harflik uzantı). Sonunda SD.open(\"veri.csv\") ile dosya okunur: available() okunacak bayt kaldı mı der, read() bir bayt verir."],
  ["Simülatörde gözlenen", "Seri Monitör'de \"SD kart hazir\" yazdı; ilk kayıt hemen yazıldı, sonra her 2 saniyede bir \"Kayit 2 yazildi\" … \"Kayit 6 yazildi\" göründü. Sensör kaydırıcısı 3., 5. ve 7. saniyelerde 29 °C/%58, 31 °C/%62, 33 °C/%66'ya getirildi. Altıncı kayıttan sonra dosya şu satırlarla basıldı: sure_sn;sicaklik;nem / 0;27.0;55 / 2;27.0;55 / 4;29.0;58 / 6;31.0;62 / 8;33.0;66 / 10;33.0;66 (toplam 89 bayt). SD modülü \"hazır · 1 dosya\" gösterdi. Gerçek kartta denenmedi."],
  [SIM_YOK, "Simülatörde SD kart bellekte tutulan sahte bir dosya sistemidir: dosyalar yalnızca simülasyon boyunca durur, yeniden başlatınca silinir; kart kapasitesi, hızı, biçimlendirme ve veri bozulması yoktur. Kart takılı değilse ya da CS pini yanlışsa SD.begin() başarısız olur (\"SD kart hatasi!\"). " + kut("SD.h ve DHT.h")],
  ["Sık yapılan hatalar", "CS pinini kodda farklı seçmek (SD.begin() false döner); dosya adını 8.3 kuralına uymayan uzun yazmak; close() unutmak; SD kartı FAT32 yerine başka biçimde kullanmak; 5 V'luk Arduino'ya seviye dönüştürücüsü olmayan çıplak microSD yuvası bağlamak."],
  ["Dene", "Kaydı 10 saniyede bir yapacak şekilde değiştir ya da bir düğmeye basıldığında dosyayı okuyup ekrana yazdır."]])

# ---------------- 48
add("gercek-zamanli-saat", "saat_ds3231",
 "DS3231 gerçek zamanlı saat modülünden I2C ile tarih, saat, haftanın günü ve sıcaklık okunur ve 16x2 LCD'de gösterilir. RTClib kütüphanesini, DateTime nesnesini ve rakamları iki haneye tamamlamayı öğrenirsin.",
 [UNO, "Breadboard", "1 × DS3231 RTC modülü (I2C, CR2032 pilli)"] + LCDP + ["Jumper kablolar (18 adet)"],
 lcdw() + [["A4", "DS3231 SDA (I2C veri)"], ["A5", "DS3231 SCL (I2C saat)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + lcds() + [
  "DS3231'i a21 (VCC), a22 (GND), a23 (SCL), a24 (SDA) deliklerine tak. e21 → artı rayı, e22 → eksi rayı, A5 → e23 (SCL), A4 → e24 (SDA). Uno'da I2C pinleri A4 (SDA) ve A5 (SCL)'dir.",
  "Kodu yükle (simülatörde çalıştır): LCD'nin ilk satırında \"31.12.2025 Car\" gibi tarih ve gün, ikinci satırında saat ve sıcaklık görünür. Saat saniye saniye ilerler."],
 [["Nasıl çalışıyor?", "DS3231 kendi kristali ve pili sayesinde Arduino kapalıyken de saati tutan bir I2C modülüdür (adres 0x68). rtc.begin() I2C'yi başlatır ve modülü arar. rtc.now() bir DateTime nesnesi döndürür; year(), month(), day(), hour(), minute(), second() alanları ve dayOfTheWeek() (0 = Pazar) bu nesneden okunur. Tek haneli sayılar iki() fonksiyonuyla başına 0 eklenerek yazılır (5 yerine 05). rtc.getTemperature() modülün kendi sıcaklık sensörünü okur. Pil bitmişse rtc.lostPower() true döner ve saat rtc.adjust(DateTime(F(__DATE__), F(__TIME__))) ile derleme anına ayarlanır."],
  ["Simülatörde gözlenen", "Saat başlangıç değeri 31.12.2025 23:59:50 olarak verildi; LCD \"31.12.2025 Car\" / \"23:59:50 25.0 C\" ile başladı ve her saniye ilerledi. 10. saniyede ekran \"01.01.2026 Per\" / \"00:00:00\" oldu: ay, yıl ve haftanın günü (Çarşamba → Perşembe) otomatik değişti. Sıcaklık kaydırıcısı 6. saniyede 28,5 °C yapılınca ekran \"28.5 C\" gösterdi. Seri Monitör'e her saniye \"2025-12-31 23:59:51\" gibi satır yazıldı. Gerçek kartta denenmedi."],
  [SIM_YOK, "Simülatörde saat, modülün \"başlangıç saati\" ayarından başlayıp sanal zamanla ilerler; kristal sapması, pil ve alarm/SQW çıkışları yoktur, rtc.lostPower() her zaman false döner, __DATE__/__TIME__ simülasyonun başlatıldığı anı verir. Gerçek DS3231 yılda birkaç dakikadan az sapar. " + kut("RTClib.h ve LiquidCrystal.h") + " Wire.h izinlidir."],
  ["Sık yapılan hatalar", "SDA ve SCL'yi ters bağlamak (ekranda \"RTC bulunamadi\" görünür); rtc.begin() çağırmamak; sayıyı iki haneye tamamlamayı unutmak (09:05 yerine 9:5 görünür); her açılışta rtc.adjust() çağırıp saati derleme anına sıfırlamak (yalnızca lostPower() true iken ayarla)."],
  ["Dene", "Saati 12 saatlik biçimde göster (öğleden önce/sonra) ya da bir düğmeye basınca ay ve yıl yerine sıcaklığı büyük göster."]])

# ---------------- 49
add("alarm-saat", "alarm_saat",
 "DS3231 saati LCD'de gösterilir; saat 08:00 olunca buzzer 10 saniye boyunca saniyede iki bip çalar ve LCD'de ALARM CALIYOR! yazar. Saat/dakika karşılaştırmasını, millis() ile bip ritmi üretmeyi ve alarm durumunu bir değişkenle izlemeyi öğrenirsin.",
 [UNO, "Breadboard", "1 × DS3231 RTC modülü (I2C, CR2032 pilli)"] + LCDP + ["1 × aktif buzzer", "Jumper kablolar (20 adet)"],
 lcdw() + [["A4", "DS3231 SDA (I2C veri)"], ["A5", "DS3231 SCL (I2C saat)"], ["D8", "Buzzer + (anot)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + lcds() + [
  "DS3231'i a21 (VCC), a22 (GND), a23 (SCL), a24 (SDA) deliklerine tak. e21 → artı rayı, e22 → eksi rayı, A5 → e23 (SCL), A4 → e24 (SDA).",
  "Aktif buzzer'ı c27 (+) ve c28 (−) deliklerine tak. D8 pinini e27'ye, e28'i eksi rayına kablola.",
  "Kodu yükle (simülatörde çalıştır): DS3231'in başlangıç saati 07:59:50'dir; 10 saniye sonra LCD'de \"ALARM CALIYOR!\" yazar ve buzzer öter. Alarm saatini koddaki ALARM_SAAT ve ALARM_DAKIKA ile değiştirebilirsin."],
 [["Nasıl çalışıyor?", "Her 100 ms'de rtc.now() ile saat okunur. Saat ALARM_SAAT, dakika ALARM_DAKIKA ve saniye ALARM_SURE'den küçükse (alarm penceresi: 08:00:00–08:00:09) calsin değişkeni true olur. Alarm sırasında buzzer, (millis() / 250) % 2 ifadesiyle 250 ms açık, 250 ms kapalı yani saniyede 2 bip çalar. alarmVardi değişkeni, \"ALARM!\" ve \"Alarm bitti\" mesajlarının her alarmda yalnızca bir kez yazılmasını sağlar. Alarm bitince buzzer LOW olur ve ekran \"Alarm 08:00\" gösterir."],
  ["Simülatörde gözlenen", "Saat 07:59:50'den başladı; LCD \"Saat 07:59:50\" ve \"Alarm 08:00\" gösterdi. 10. saniyede (08:00:00) Seri Monitör'e \"ALARM! Zaman geldi\" yazıldı, LCD'nin ikinci satırı \"ALARM CALIYOR!\" oldu ve buzzer öttü: 10 saniye boyunca 20 bip (her biri yaklaşık 250 ms açık). 08:00:10'da buzzer sustu, Seri Monitör'e \"Alarm bitti\" yazıldı, ekran \"Alarm 08:00\"a döndü. Gerçek kartta denenmedi."],
  [SIM_YOK, "Simülatörde buzzerın sesi yoktur; \"öter\" durumu gösterilir. Saat modülün \"başlangıç saati\" ayarından başlayıp sanal zamanla ilerler (kristal sapması ve pil yoktur). Alarm kodla yapıldığı için DS3231'in kendi alarm yazmaçları ve SQW çıkışı kullanılmaz ve simüle edilmez. " + kut("RTClib.h ve LiquidCrystal.h") + " Wire.h izinlidir."],
  ["Sık yapılan hatalar", "Saniyeyi kontrol etmeyip yalnızca saat ve dakikaya bakmak (alarm bir dakika boyunca çalar); SDA ve SCL'yi ters bağlamak (\"RTC bulunamadi\"); buzzer + ve − uçlarını ters takmak; tone() yerine aktif buzzer için digitalWrite kullanmamak (aktif buzzer sabit frekanslıdır, tone() gerekmez)."],
  ["Dene", "Alarmı kapatmak için bir düğme ekle (INPUT_PULLUP ile D7) ya da alarm 10 saniye yerine düğmeye basılana kadar çalsın."]])

# ---------------- 50
add("gps-konum-takip-sistemi", "gps_takip",
 "NEO-6M GPS modülünün seri hattan gönderdiği NMEA cümleleri TinyGPS++ kütüphanesiyle ayrıştırılır; enlem ve boylam LCD'de, uydu sayısı, yükseklik ve hız Seri Monitör'de gösterilir. Seri veri ayrıştırmayı ve konum verisinin güncel olup olmadığını (age) denetlemeyi öğrenirsin. Simülatörde uydu yoktur; konum arayüzden verilir.",
 [UNO, "Breadboard", "1 × NEO-6M GPS modülü"] + LCDP + ["Jumper kablolar (18 adet)"],
 lcdw() + [["D8", "NEO-6M TX (Arduino'nun RX'i)"], ["D9", "NEO-6M RX (Arduino'nun TX'i; sketch GPS'e veri göndermez, isteğe bağlıdır)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + lcds() + [
  "NEO-6M'i a21 (VCC), a22 (GND), a23 (TX), a24 (RX) deliklerine tak. e21 → artı rayı, e22 → eksi rayı.",
  "GPS'in TX ucu Arduino'nun RX'ine, RX ucu TX'ine gider (çapraz): e23 → D8, e24 → D9. D0/D1 USB için ayrıldığından SoftwareSerial gpsSerial(8, 9) ile ikinci bir seri hat kuruldu.",
  "Kodu yükle (simülatörde çalıştır): ilk saniyede LCD \"Konum yok\" der; GPS modülü seçilip \"konum sabit\" açıkken LCD'de \"Enlem 41.0082\" ve \"Boylam 28.9784\" görünür. Modülden enlem/boylamı değiştirince ekran güncellenir."],
 [["Nasıl çalışıyor?", "GPS modülü saniyede bir NMEA cümlesi gönderir (örneğin $GPRMC ve $GPGGA). Bunlar enlem, boylam, uydu sayısı, yükseklik ve hız gibi bilgileri metin olarak taşır. gpsSerial.read() ile okunan her karakter gps.encode()'a verilir; TinyGPS++ cümleyi toplar, sağlama toplamını (checksum) denetler ve alanları ayrıştırır. gps.location.lat() ve lng() derece cinsinden ondalık sayı verir (güney ve batı negatif). gps.location.isValid() bir kez konum alındıktan sonra hep true kalır, bu yüzden konumun güncel olup olmadığı gps.location.age() < 3000 (son 3 saniye) ile de denetlenir."],
  ["Simülatörde gözlenen", "Simülatörde gerçek uydu yoktur; NEO-6M modülü, arayüzden verilen enlem, boylam, yükseklik, hız ve uydu sayısıyla her saniye RMC ve GGA cümlesi üretir. İlk saniyede Seri Monitör'de \"Konum yok: uydu bekleniyor\" yazdı; 2. saniyeden itibaren \"Konum: 41.008202, 28.978399 uydu=7 yukseklik=40 m hiz=0 km/s\" yazıldı (altı basamak, kayan noktalı sayı yuvarlaması), LCD \"Enlem 41.0082\" / \"Boylam 28.9784\" gösterdi. 5. saniyede konum 39.9208, 32.8541'e (938 m, 36 km/s, 9 uydu) değişince LCD ve Seri Monitör birkaç saniye içinde güncellendi. 9. saniyede \"konum sabit\" kapatılınca eski konum 3 saniye daha gösterildi, sonra \"Konum yok\" / \"Uydu bekleniyor\" oldu; 13. saniyede konum yeniden verilince (38.4237, 27.1428) ekran toparlandı. Gerçek GPS ile ve açık havada denenmedi."],
  [SIM_YOK, "Simülatörde uydu alımı yoktur; NEO-6M modülü verilen koordinatları NMEA cümlesine çevirir. İlk sabitleme süresi (soğuk başlangıçta birkaç dakika), iç mekanda sinyal kaybı, UBX yapılandırma komutları ve güncelleme hızı simüle edilmez. Gerçek GPS'e açık havada ve uzun süre bekleyerek konum alırsın. " + kut("TinyGPS++.h ve LiquidCrystal.h") + " SoftwareSerial.h izinlidir."],
  ["Sık yapılan hatalar", "TX/RX'i çapraz bağlamamak (GPS TX → Arduino RX); baud hızını 9600'den farklı seçmek; GPS'i iç mekanda deneyip \"Konum yok\"u arıza sanmak; loop() içinde uzun delay() kullanmak (SoftwareSerial 64 baytlık tamponu taşar, cümleler kaybolur); isValid() true diye konumun güncel olduğunu varsaymak."],
  ["Dene", "Konumu 5 saniyede bir kaydet ve iki nokta arasındaki mesafeyi gps.distanceBetween() ile hesapla ya da hız 50 km/s'i aşınca uyarı ver."]])

# ---------------- 51
add("kablosuz-kumandali-led", "nrf_led",
 "Butona basılınca NRF24L01 radyo modülü bir paket gönderir, karşı modül paketi alır ve alıcı taraftaki LED yanar. RF24 kütüphanesini, gönderici/alıcı (dinleyici) modunu ve adres eşleşmesini öğrenirsin. Gerçekte iki ayrı Arduino gerekir; simülatörde radyo yoktur ve iki modül tek Arduino'ya bağlanır.",
 [UNO, "Breadboard", "2 × NRF24L01 radyo modülü (3,3 V)", "1 × buton", "1 × LED (kırmızı)", "1 × 220 Ω direnç (LED için)", "Jumper kablolar (19 adet)"],
 [["3V3", "Her iki NRF24L01'in 3.3V ucu (yalnızca 3,3 V ile beslenir)"], ["GND (GND2)", "Alttaki eksi (−) rayı: NRF24L01 GND'leri, buton ve LED direnci"], ["D2", "Buton"], ["D6", "LED anodu (c25)"],
  ["D7", "Kumanda modülü CE"], ["D8", "Kumanda modülü CSN"], ["D9", "Alıcı modülü CE"], ["D10", "Alıcı modülü CSN"], ["D11", "İki modülün MOSI ucu"], ["D12", "İki modülün MISO ucu"], ["D13", "İki modülün SCK ucu"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino GND2 pinini alttaki eksi (−) rayına kablola. Bu projede 5V pini kullanılmaz.",
  "Birinci NRF24L01'i (kumanda) a2 (GND), a3 (3.3V), a4 (CE), a5 (CSN), a6 (SCK), a7 (MOSI), a8 (MISO) deliklerine tak. İkincisini (alıcı) a12–a18 deliklerine aynı sırayla tak.",
  "DİKKAT: NRF24L01 yalnızca 3,3 V ile beslenir, 5 V verirsen bozulur. Kumanda modülü kabloları: e2 → eksi rayı, Arduino 3V3 → e3, D7 → e4 (CE), D8 → e5 (CSN), D13 → e6 (SCK), D11 → e7 (MOSI), D12 → e8 (MISO).",
  "Alıcı modülü kabloları: e12 → eksi rayı, d3 → d13 (3,3 V), D9 → e14 (CE), D10 → e15 (CSN). SPI hatları iki modülde ortaktır: d6 → d16 (SCK), d7 → d17 (MOSI), d8 → d18 (MISO).",
  "Butonu c21 ve c23 deliklerine tak. D2 pinini e21'e, e23'ü eksi rayına kablola.",
  "LED'i c25 (anot, uzun bacak) ve c26 (katot) deliklerine tak. 220 Ω direnci d26 ile d30 arasına tak. D6 pinini e25'e, e30'u eksi rayına kablola.",
  "Kodu yükle (simülatörde çalıştır): butona bas ve basılı tut; LED yanar. Bırakınca söner."],
 [["Nasıl çalışıyor?", "NRF24L01, 2,4 GHz radyo ile kısa paketler yollayan bir modüldür; Arduino ile SPI üzerinden konuşur (MOSI D11, MISO D12, SCK D13) ve ek olarak CE ve CSN pinlerini kullanır. RF24 verici(7, 8) ve RF24 alici(9, 10) nesneleri CE ve CSN pinlerini belirtir. Gönderici openWritingPipe(adres) ve stopListening() ile, alıcı openReadingPipe(1, adres) ve startListening() ile ayarlanır; iki modül aynı adresi (\"00001\") ve kanalı kullanmalıdır. verici.write(&durum, sizeof(durum)) bir int'i bayt olarak gönderir, alici.available() paket var mı der, alici.read() paketi okur. Buton durumu yalnızca değişince gönderilir (1 = basılı, 0 = bırakıldı)."],
  ["Simülatörde gözlenen", "Seri Monitör'de \"NRF24L01 hazir\" yazdı. Başlangıçta durum 0 gönderildi ve alındı. 2. saniyede butona basılınca \"Gonderildi: 1 (onaylandi)\" ve hemen ardından \"Alindi: 1\" yazıldı, LED yandı; 3,5. saniyede bırakılınca \"Gonderildi: 0\" / \"Alindi: 0\" ile söndü; 5. saniyede 0,4 saniyelik kısa basış da LED'i bu kadar süre yaktı. Kumanda modülü \"gönderici · kanal 76\", alıcı modülü \"dinliyor · kanal 76\" durumunu gösterdi. Gerçek radyo ile ve gerçek iki Arduino ile denenmedi."],
  [SIM_YOK, "Simülatörde gerçek radyo, menzil, girişim ve kayıp paket yoktur; aynı devredeki iki modül arasında adres ve kanal eşleşirse paket iletilir ve otomatik onay (ACK) varsayılır. Ayrı Arduino'lar arasında haberleşme de yoktur: gerçekte kumanda (buton + gönderici) ve alıcı (LED + dinleyici) ayrı Arduino'lardır ve her biri kendi sketch'ini çalıştırır; burada ikisi tek sketch'te birleştirildi. Gerçek NRF24L01'de VCC ile GND arasına 10 µF kapasitör eklemek gürültüyü azaltır; simülatörde kapasitör yoktur. " + kut("nRF24L01.h ve RF24.h") + " SPI.h izinlidir."],
  ["Sık yapılan hatalar", "NRF24L01'i 5 V'a bağlamak; iki modülde adresi farklı yazmak (paket iletilmez, write() false döner); alıcıda startListening() ya da vericide stopListening() unutmak; CE/CSN pinlerini koddakiyle uyumsuz bağlamak; Uno'nun 3,3 V pininin zayıf olduğunu unutup uzun mesafe/yüksek güçte sorun yaşamak (ayrı 3,3 V regülatörü gerekebilir)."],
  ["Dene", "Gönderilen veriyi bir sayıya dönüştür (örneğin potansiyometre değeriyle LED parlaklığını uzaktan ayarla) ya da alıcıdan geri onay paketi gönder."]])

# ---------------- 52
add("kablosuz-sensor-agi", "nrf_sensor",
 "Sensör düğümü DHT11'den sıcaklık ve nemi okuyup {düğüm no, sıcaklık, nem} paketi olarak NRF24L01 ile yollar; merkez düğüm paketi alıp Seri Monitör'e yazar ve 30 °C'yi aşınca uyarı verir. Veri paketi tasarlamayı, dizi göndermeyi ve çok düğümlü ağ fikrini öğrenirsin. Gerçekte iki ayrı Arduino gerekir; simülatörde radyo yoktur ve iki modül tek Arduino'ya bağlanır.",
 [UNO, "Breadboard", "2 × NRF24L01 radyo modülü (3,3 V)", "1 × DHT11 sıcaklık ve nem sensörü (3 pinli modül)", "Jumper kablolar (19 adet)"],
 [["3V3", "Her iki NRF24L01'in 3.3V ucu (yalnızca 3,3 V ile beslenir)"], ["5V", "Alttaki artı (+) rayı: DHT11 VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: NRF24L01 GND'leri ve DHT11 GND"], ["D2", "DHT11 DATA"],
  ["D7", "Sensör düğümü modülü CE"], ["D8", "Sensör düğümü modülü CSN"], ["D9", "Merkez modülü CE"], ["D10", "Merkez modülü CSN"], ["D11", "İki modülün MOSI ucu"], ["D12", "İki modülün MISO ucu"], ["D13", "İki modülün SCK ucu"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "Birinci NRF24L01'i (sensör düğümü) a2 (GND), a3 (3.3V), a4 (CE), a5 (CSN), a6 (SCK), a7 (MOSI), a8 (MISO) deliklerine tak. İkincisini (merkez) a12–a18 deliklerine aynı sırayla tak.",
  "DİKKAT: NRF24L01 yalnızca 3,3 V ile beslenir, 5 V verirsen bozulur. Sensör düğümü kabloları: e2 → eksi rayı, Arduino 3V3 → e3, D7 → e4 (CE), D8 → e5 (CSN), D13 → e6 (SCK), D11 → e7 (MOSI), D12 → e8 (MISO).",
  "Merkez modülü kabloları: e12 → eksi rayı, d3 → d13 (3,3 V), D9 → e14 (CE), D10 → e15 (CSN). SPI hatları iki modülde ortaktır: d6 → d16 (SCK), d7 → d17 (MOSI), d8 → d18 (MISO).",
  "DHT11'i c21 (VCC), c22 (DATA), c23 (GND) deliklerine tak. e21 → artı rayı, e23 → eksi rayı, D2 pinini e22'ye kablola.",
  "Kodu yükle (simülatörde çalıştır): Seri Monitör'de her 2 saniyede \"Dugum 1: 27 C, nem %55\" gibi satır görünür. DHT11 kaydırıcısını 30 °C'nin üstüne çıkarınca satırın sonuna UYARI eklenir."],
 [["Nasıl çalışıyor?", "Sensör düğümü her 2 saniyede DHT11'i okur ve üç tamsayılık paket hazırlar: paket[0] düğüm numarası, paket[1] sıcaklık, paket[2] nem. verici.write(&paket, sizeof(paket)) bu diziyi 6 bayt olarak yollar. Merkez düğüm alici.available() ile paket var mı bakar, alici.read(&gelen, sizeof(gelen)) ile aynı düzende okur. Paketin başındaki düğüm numarası sayesinde gerçek bir ağda birden çok sensör düğümü aynı merkeze veri gönderebilir ve merkez hangisinden geldiğini anlar. NRF24L01 paketlerini en çok 32 bayt taşır."],
  ["Simülatörde gözlenen", "Seri Monitör'de \"Sensor agi hazir\" yazdı. Sensör 27 °C ve %55 iken merkez \"Dugum 1: 27 C, nem %55\" yazdı; 3. saniyede kaydırıcı 31 °C ve %70'e alınınca bir sonraki satır \"Dugum 1: 31 C, nem %70  UYARI: SICAK\" oldu; 7. saniyede 18 °C ve %35'e inince \"Dugum 1: 18 C, nem %35\" yazıldı ve uyarı gitti. 12 saniyede 6 paket gönderildi/alındı; modüller \"gönderici · kanal 76\" ve \"dinliyor · kanal 76\" gösterdi. Gerçek radyo ile ve gerçek iki Arduino ile denenmedi."],
  [SIM_YOK, "Simülatörde gerçek radyo, menzil, girişim ve kayıp paket yoktur; aynı devredeki iki modül arasında adres ve kanal eşleşirse paket iletilir ve otomatik onay (ACK) varsayılır. Ayrı Arduino'lar arasında haberleşme yoktur: gerçekte sensör düğümü ve merkez ayrı Arduino'lardır, her biri kendi sketch'ini çalıştırır; burada ikisi tek sketch'te birleştirildi, ağda tek sensör düğümü bulunur. " + kut("nRF24L01.h, RF24.h ve DHT.h") + " SPI.h izinlidir."],
  ["Sık yapılan hatalar", "NRF24L01'i 5 V'a bağlamak; iki modülde adresi (\"node1\") farklı yazmak; gönderici ve alıcıda paket düzenini (dizi boyutu, değişken türü) farklı tutmak (veriler karışır); DHT11'i 2 saniyeden sık okumak; 32 baytı aşan paket göndermek."],
  ["Dene", "Paketin içine ışık (LDR) değerini de ekle ya da düğüm numarasını değiştirerek (ör. 2) merkezin hangi düğümden geldiğini ayırt etmesini sağla."]])

# ---------------- 53
add("akilli-ev-kontrol-paneli", "ev_panel",
 "İki butonla (SEÇ ve AÇIK/KAPALI) 4 kanallı röle modülünün istenen kanalı açılıp kapanır; 4 ampul ev ışıklarını temsil eder, LCD hangi rölenin seçili ve hangilerinin açık olduğunu gösterir. Aktif LOW röle mantığını, dizilerle çoklu çıkış yönetimini ve buton kenar algılamayı öğrenirsin.",
 [UNO, "Breadboard", "1 × 4 kanallı röle modülü (5 V, aktif LOW)", "4 × ampul (3 V; ev lambalarını temsil eder)"] + LCDP + ["2 × buton", "Jumper kablolar (36 adet)"],
 [["5V", "Alttaki artı (+) rayı: LCD VDD, arka ışık direnci, röle VCC ve COM1–COM4"], ["GND (GND2)", "Alttaki eksi (−) rayı: LCD VSS, V0, RW, K, röle GND, butonlar ve ampuller"],
  ["D12", "LCD RS"], ["D11", "LCD E"], ["D5", "LCD D4"], ["D4", "LCD D5"], ["D3", "LCD D6"], ["D2", "LCD D7"],
  ["D6", "Röle IN1"], ["D7", "Röle IN2"], ["D8", "Röle IN3"], ["D9", "Röle IN4"], ["D10", "SEÇ butonu"], ["A0", "AÇIK/KAPALI butonu"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + lcds() + [
  "SEÇ butonunu c24 ve c26 deliklerine tak: D10 → e24, e26 → eksi rayı. AÇIK/KAPALI butonunu c28 ve c30 deliklerine tak: A0 → e28, e30 → eksi rayı.",
  "4 kanallı röle modülü ve 4 ampul breadboard dışındadır (takılı değil), kablolarla bağlanır. Röle VCC → artı rayı, röle GND → eksi rayı. Röle girişleri: D6 → IN1, D7 → IN2, D8 → IN3, D9 → IN4.",
  "Röle kontakları: COM1, COM2, COM3, COM4 uçlarının her birini artı rayında ayrı bir deliğe kablola (ampullerin + beslemesi buradan geçer).",
  "NO1, NO2, NO3, NO4 uçlarını sırayla ampul 1, 2, 3, 4'ün A ucuna kablola. Ampullerin B uçlarını eksi rayına bağla. NC uçları boş kalır.",
  "Kodu yükle (simülatörde çalıştır): SEÇ butonuna basınca \"Secili Role\" numarası değişir; AÇIK/KAPALI butonuna basınca seçili rölenin ampulü yanar ya da söner, LCD'nin ikinci satırında \"1:K 2:A 3:K 4:K\" gibi durum görünür (A = açık, K = kapalı)."],
 [["Nasıl çalışıyor?", "Bu röle modülü aktif LOW'dur: IN pini LOW olunca röle çeker (COM–NO bağlanır), HIGH olunca bırakır. Bu yüzden kod rölenin \"açık\" durumunu digitalWrite(pin, LOW) ile verir. acik[] dizisi dört kanalın durumunu tutar, ROLE_PIN[] dizisi pin numaralarını. SEC butonu secili değişkenini 0–3 arasında döndürür; AÇIK/KAPALI butonu acik[secili] değerini tersine çevirip roleleriYaz() ile tüm pinleri günceller. Butonlar INPUT_PULLUP olduğu için basılınca LOW okunur; kod yalnızca HIGH'dan LOW'a geçişte (kenar) bir kez işlem yapar, böylece buton basılı tutulunca röle sürekli değişmez. A0 analog pini burada dijital giriş olarak kullanılır."],
  ["Simülatörde gözlenen", "Açılışta dört röle de bırakmış durumdaydı, LCD \"Secili Role: 1\" ve \"1:K 2:K 3:K 4:K\" gösterdi. 1,5. saniyede SEÇ'e basılınca \"Secili role: 2\"; 2,5. saniyede AÇIK/KAPALI'ya basılınca \"Role 2 ACIK\" yazıldı, 2. röle çekti ve 2. ampul yandı; 3,5. saniyede SEÇ ile 3. röle seçildi, 4,5. saniyede açıldı (\"3:A\"). SEÇ'e iki kez basılınca seçim 4'e, sonra 1'e döndü; 8. saniyede 1. röle açıldı, 10. saniyede tekrar basılınca kapandı (\"Role 1 KAPALI\"). Gerçek kartta ve gerçek röle modülüyle denenmedi."],
  [SIM_YOK, "Simülatörde röle kontağı ve ampuller 5 V ile çalışır; şebeke gerilimi (220 V) ve röle sıçraması modellenmez. Röle modülündeki JD-VCC jumper'ı, optokuplör ve bobin akımı yoktur. GERÇEK EV LAMBALARINI RÖLEYLE BAĞLAMAK TEHLİKELİDİR: 220 V can güvenliği riski taşır; öğretmen ya da yetişkin gözetimi olmadan denenmez, bu projede yalnızca 5 V'luk ampullerle çalışılır. " + kut("LiquidCrystal.h") + ""],
  ["Sık yapılan hatalar", "Aktif LOW rölede mantığı ters kurmak (LOW = kapalı sanmak); röle pinlerini setup()'ta pinMode(OUTPUT) yapıp HIGH yazmamak (başlangıçta röleler çekebilir); COM ucunu eksi ya da boş bırakmak; ampulün B ucunu GND'ye bağlamamak; butonları INPUT_PULLUP yapmamak (kenar algılama çalışmaz)."],
  ["Dene", "Dördüncü bir düğme ile \"hepsini kapat\" fonksiyonu ekle ya da bir kanalın açık kalma süresini millis() ile 10 saniye ile sınırla (otomatik kapanma)."]],
 free=["rl1", "bulb1", "bulb2", "bulb3", "bulb4"])

# ---------------- 54
add("ses-kontrollu-isik-sistemi", "ses_isik",
 "Ses sensörü yüksek bir ses (alkış) duyunca röle lambayı açar, bir alkış daha kapatır. Ses sensörünün analog ve dijital çıkışını, NPN transistörle röle sürmeyi, ters (flyback) diyodu ve kenar algılamayı öğrenirsin.",
 [UNO, "Breadboard", "1 × ses sensörü modülü (mikrofonlu, LM393)", "1 × röle (5 V, tek kontaklı)", "1 × NPN transistör (BC547 tipi)", "1 × 1 kΩ direnç (transistör taban direnci)", "1 × diyot (1N4007, bobin koruma diyodu)", "1 × ampul (3 V, röleyle anahtarlanan lamba)", "Jumper kablolar (14 adet)"],
 [["5V", "Alttaki artı (+) rayı: ses sensörü VCC, röle bobini, ters diyot katodu ve röle COM (lambanın + beslemesi)"], ["GND (GND2)", "Alttaki eksi (−) rayı: ses sensörü GND, transistör emitörü ve lamba"], ["D7", "1 kΩ direncin ucu (transistör tabanı)"], ["D3", "Ses sensörü DO (dijital çıkış)"], ["A0", "Ses sensörü AO (analog çıkış)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "Röleyi a2 (C1), a3 (C2), a4 (COM), a5 (NO), a6 (NC) deliklerine tak. e2 → artı rayı: bobinin bir ucu 5 V'a gider.",
  "Ters diyodu c3 (anot) ve c7 (katot, çizgili uç) deliklerine tak; e7 → artı rayı. Diyot bobine paralel ve ters yönde bağlanır.",
  "NPN transistörü a12 (C), a13 (B), a14 (E) deliklerine tak. e12 → e3: kolektör röle bobininin diğer ucuna (C2) gider. e14 → eksi rayı (emitör GND).",
  "1 kΩ direnci d13 ile d17 arasına tak (taban direnci) ve D7 pinini e17'ye kablola.",
  "Ses sensörünü a20 (VCC), a21 (GND), a22 (AO), a23 (DO) deliklerine tak. e20 → artı rayı, e21 → eksi rayı, A0 → e22, D3 → e23.",
  "Lamba (ampul) breadboard dışındadır (takılı değil): e4 → artı rayı (röle COM'u 5 V'ta), e5 → ampulün A ucu (röle NO), ampulün B ucu → eksi rayı.",
  "Kodu yükle (simülatörde çalıştır): ses sensörünün ses kaydırıcısını hızla yukarı çekip bırak (alkış): lamba yanar. Bir alkış daha atınca söner."],
 [["Nasıl çalışıyor?", "Ses sensörü modülü mikrofon sinyalini yükseltir; AO pini ses şiddetine göre değişen gerilim, DO pini ise karttaki eşik aşılınca HIGH veren dijital çıkıştır. Kod DO'yu okur: LOW'dan HIGH'a geçişte (yani yeni bir alkışta) isikAcik değişkeni tersine çevrilir ve D7 ile transistör sürülür. Ard arda tetiklenmeyi önlemek için iki alkış arasında en az 500 ms aranır. NPN transistör D7'nin küçük akımıyla röle bobinini sürer; röle COM–NO kontağı lambanın devresini kapatır. Saniyede bir AO okunup Seri Monitör'e yazılır."],
  ["Ters diyot neden gerekli?", "Röle bobini akım kesilince uçlarında ters yönde yüksek gerilim doğurur ve transistörü bozabilir. Bobine paralel, ters yönde bağlı diyot bu akımı bobinin içinde dolaştırır. Diyodun katodu (çizgili uç) 5 V tarafına, anodu transistör tarafına bakar."],
  ["Simülatörde gözlenen", "Sessizken (ses 0,1) AO ≈ 225 okundu ve lamba söndü. 2. saniyede ses 0,9'a çıkınca (alkış) Seri Monitör'e \"Alkis algilandi: isik ACIK\" yazıldı, röle çekti, lamba yandı; AO ≈ 798 okundu. 3,5. saniyede ses 0,3'e çıkınca (gürültü, AO ≈ 368) DO eşiği aşmadı ve hiçbir şey olmadı. 4,5. saniyedeki alkışta \"isik KAPALI\", 5,2. saniyedekinde \"isik ACIK\", 7. saniyedekinde yine \"isik KAPALI\" yazıldı. Gerçek kartta ve gerçek mikrofonla denenmedi."],
  [SIM_YOK, "Simülatörde gerçek ses yoktur: ses şiddeti modülün kaydırıcısıyla verilir; DO eşiği %50'de sabittir (gerçek modüldeki ayar potu yok), frekans ve mikrofon gürültüsü modellenmez. Gerçek mikrofon her yüksek sesi (kapı çarpması, konuşma) alkış sayar; hassasiyet pot ile ayarlanır. Sketch kütüphane kullanmaz, gerçek derleme servisiyle derlenebilir."],
  ["Sık yapılan hatalar", "Röleyi doğrudan Arduino pinine bağlamak (bobin akımı fazladır); ters diyodu unutmak ya da ters takmak; taban direncini koymamak; ses sensörünün eşik potunu ayarlamamak (lamba hiç tetiklenmez ya da sürekli tetiklenir); LOW→HIGH geçişi yerine sadece HIGH'ı okuyup lambayı titretmek."],
  ["Dene", "İki alkışı (500 ms içinde) birlikte algılayıp yalnızca çift alkışta lambayı değiştir ya da lambayı 30 saniye sonra otomatik kapat."]],
 free=["lamp1"])

# ---------------- 55
add("parmak-iziyle-kapi-kilidi", "parmak_kapi",
 "AS608 parmak izi sensörü okutulan parmağı kayıtlı şablonlarla karşılaştırır; tanınan parmakta servo kapıyı 3 saniye açar, tanınmayan parmak reddedilir. SoftwareSerial ile ikinci bir seri hat, Adafruit_Fingerprint kütüphanesi ve dönüş kodlarını yorumlamayı öğrenirsin. Simülatörde gerçek parmak izi taraması yoktur; parmak ve kimlik arayüzden verilir.",
 [UNO, "Breadboard", "1 × AS608 parmak izi sensörü", "1 × servo motor (SG90)", "Jumper kablolar (9 adet)"],
 [["5V", "Alttaki artı (+) rayı: AS608 VCC ve servo VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: AS608 GND ve servo GND"], ["D2", "AS608 TX (Arduino'nun RX'i)"], ["D3", "AS608 RX (Arduino'nun TX'i)"], ["D9", "Servo sinyal (SIG)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "AS608'i a4 (VCC), a5 (GND), a6 (TX), a7 (RX) deliklerine tak. e4 → artı rayı, e5 → eksi rayı.",
  "AS608'in TX ucu Arduino'nun RX'ine, RX ucu TX'ine gider (çapraz): D2 → e6, D3 → e7. D0/D1 USB için ayrıldığından SoftwareSerial sensorSerial(2, 3) ile ikinci bir seri hat kuruldu.",
  "Servoyu d12 (SIG), d13 (VCC), d14 (GND) deliklerine tak. Sinyal: b12 → D9. Güç: b13 → artı rayı, b14 → eksi rayı.",
  "Kodu yükle (simülatörde çalıştır): AS608'i seç; \"parmak sensörde\" seçeneğini aç ve kimliği 1 ya da 2 yap (kayıtlı): servo kapıyı 90°'ye açar. Kimliği 9 yaparsan parmak tanımlı olmaz."],
 [["Nasıl çalışıyor?", "AS608 sensörü parmak izi görüntüsünü kendi içinde işler ve Arduino ile seri hatla (57600 baud) konuşur. setup()'ta finger.begin(57600) ve finger.verifyPassword() sensörün bağlı olup olmadığını denetler; finger.getTemplateCount() kayıtlı parmak sayısını verir. parmakAra() üç adımda çalışır: getImage() sensörden görüntü alır (parmak yoksa FINGERPRINT_NOFINGER döner), image2Tz() görüntüyü şablona çevirir, fingerFastSearch() sensör belleğindeki şablonlarda arar; eşleşirse finger.fingerID kayıt numarasını verir, bulunamazsa FINGERPRINT_NOTFOUND döner. Tanınan parmakta servo 90°'ye döner, 3 saniye sonra 0°'ye döner."],
  ["Simülatörde gözlenen", "Açılışta Seri Monitör'de \"Sensor bulundu\" ve \"Kayitli parmak sayisi: 2\" yazdı. Parmak yokken servo 0°'de kaldı. 2. saniyede kimlik 2 olan parmak sensöre konunca (yaklaşık 0,65 saniyelik okuma süresinden sonra) \"Parmak tanindi, kimlik=2\" ve \"Kapi acik\" yazıldı, servo 90°'ye döndü; 3 saniye sonra \"Kapi kapandi\" yazıldı ve servo 0°'ye geldi. 7. saniyede kayıtsız kimlik (9) ile \"Parmak tanimli degil: giris reddedildi\" yazıldı ve servo kıpırdamadı. 10. saniyede kimlik 1 ile kapı yeniden açıldı. Gerçek kartta ve gerçek parmak iziyle denenmedi."],
  [SIM_YOK, "Simülatörde gerçek parmak izi taraması yoktur: \"parmak sensörde\" kutusu ve parmak kimliği arayüzden verilir; aynı kimlik kayıtlı şablonla eşleşir ve güven puanı sabittir. Görüntü kalitesi, ıslak/kuru parmak, ışık ve sensörün kendi LED'i simüle edilmez. Parmak kaydı (enroll) bu projede yapılmaz: kayıtlı kimlikler (1 ve 2) sensör ayarlarında hazır verilir; gerçekte parmakları önce kaydetmen gerekir. Gerçek parmak izi kapı kilidi olarak güvenlik açısından yetersizdir, yalnızca öğrenme amaçlıdır. " + kut("Adafruit_Fingerprint.h") + " SoftwareSerial.h ve Servo.h izinlidir."],
  ["Sık yapılan hatalar", "TX/RX'i çapraz bağlamamak (\"Sensor bulunamadi\"); baud hızını 57600'den farklı seçmek; sensörü 3,3 V ile besleyip modülün 5 V istediğini unutmak (bazı kartlar 3,3 V ister, modülünün yazısına bak); getImage() sonucunu denetlemeden devam etmek; servoyu çok uzun süre açık bırakmak."],
  ["Dene", "Yanlış parmak art arda 3 kez denenirse sistemi 10 saniye kilitle ya da kapı açıldığında buzzer çaldır."]])

# ---------------- 56
add("elektronik-terazi", "terazi",
 "HX711 yük hücresi yükselticisi bir ağırlığı ham sayıya çevirir; kalibrasyon katsayısı ve dara (tare) ile bu sayı gram olarak 16x2 LCD'de gösterilir. HX711 kütüphanesini, kalibrasyonu ve dara almayı öğrenirsin. Simülatörde yük hücresi yoktur; ağırlık modülün kaydırıcısından verilir.",
 [UNO, "Breadboard", "1 × HX711 modülü ve yük hücresi (5 kg)"] + LCDP + ["Jumper kablolar (18 adet)"],
 lcdw() + [["A1", "HX711 DT (veri)"], ["A0", "HX711 SCK (saat)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın ve terazi tablası boş olsun."] + lcds() + [
  "HX711'i a21 (VCC), a22 (GND), a23 (DT), a24 (SCK) deliklerine tak. e21 → artı rayı, e22 → eksi rayı, A1 → e23 (DT), A0 → e24 (SCK). Yük hücresinin dört teli (kırmızı E+, siyah E−, beyaz A−, yeşil A+) modülün kendi vidalı klemenslerine bağlıdır; bu bağlantı simülatörde gösterilmez.",
  "Kodu yükle (simülatörde çalıştır): tabla boşken dara alınır ve LCD \"0.0 g\" gösterir. HX711'i seçip ağırlık kaydırıcısını yukarı çek: LCD gramı gösterir."],
 [["Nasıl çalışıyor?", "Yük hücresi, üzerine konan ağırlıkla çok küçük bir gerilim değişimi verir; HX711 bunu 24 bitlik sayıya çevirir ve iki telli bir hatla (DT, SCK) Arduino'ya gönderir. terazi.begin(DT, SCK) pinleri tanıtır. terazi.tare() boş tablanın ham değerini ofset olarak saklar (dara). terazi.set_scale(OLCEK) ham fark değerini gram'a çeviren katsayıyı ayarlar. terazi.get_units(5) 5 ölçümün ortalamasını (ham değer − ofset) / ölçek olarak gram verir. Kalibrasyonu kendi yük hücren için şöyle yaparsın: set_scale() ile ölçeği 1 yapıp bilinen bir ağırlığı (örneğin 100 g) koy, get_units() değerini oku ve bunu ağırlığa böl; çıkan sayı OLCEK'tir."],
  ["Simülatörde gözlenen", "Simülatörde ham değer = 87000 + 420 × ağırlık(g) olarak verilir, bu yüzden kodda OLCEK = 420 seçildi. Dara tabla boşken (0 g) alındı ve Seri Monitör'de \"Terazi hazir: tabla bos olmali, dara alindi\" yazdı; LCD \"Agirlik:\" ve \"0.0 g\" gösterdi. Kaydırıcı 4. saniyede 250 g yapılınca \"250.0 g\", 7. saniyede 1200,5 g yapılınca \"1200.5 g\", 10. saniyede 0 yapılınca \"0.0 g\", 12,5. saniyede 75 g yapılınca \"75.0 g\" göründü. Simülatörde her ölçüm yaklaşık 100 ms sürdüğü için get_units(5) yarım saniye alır. Gerçek kartta denenmedi."],
  [SIM_YOK, "Simülatörde gerçek yük hücresi yoktur; ağırlık kaydırıcıdan 0–5000 g aralığında verilir. Gürültü, sıcaklık kayması, taşma, kazanç/kanal seçimi ve yük hücresinin E+/E−/A+/A− bağlantıları modellenmez; gerçek terazide kalibrasyon ve dara her açılışta gereklidir. Gerçek HX711 modülünde doğruluk için yük hücresi sağlam bir tabana vidalanmalıdır. " + kut("HX711.h ve LiquidCrystal.h")],
  ["Sık yapılan hatalar", "DT ve SCK pinlerini koddakiyle (A1, A0) uyumsuz bağlamak (ekran 0 kalır); dara almadan önce tablaya bir şey koymak; kalibrasyon katsayısını başka yük hücresinden almak; negatif okumayı (tablaya ters bakan hücre) fark etmemek; yük hücresinin tellerini yanlış sırayla bağlamak (değerler ters çıkar)."],
  ["Dene", "Bir düğme ekleyip dara (tare) almayı düğmeye bağla ya da ağırlık 500 g'ı aşınca ekrana \"FAZLA YUK\" yazdır."]])

# ---------------- 57
add("hava-kalitesi-olcer", "hava_kalitesi",
 "MQ-135 gaz sensörünün analog çıkışı okunur, ham değer LCD'de gösterilir ve hava IYI / ORTA / KOTU olarak sınıflandırılır. Gaz sensörünün çalışma ilkesini, analog değeri eşiklerle yorumlamayı ve sensörün sınırlarını öğrenirsin. Simülatörde gaz miktarı modülün kaydırıcısından verilir.",
 [UNO, "Breadboard", "1 × MQ-135 hava kalitesi sensörü modülü"] + LCDP + ["Jumper kablolar (18 adet)"],
 lcdw() + [["A0", "MQ-135 AO (analog çıkış)"], ["D7", "MQ-135 DO (dijital çıkış)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + lcds() + [
  "MQ-135'i a21 (VCC), a22 (GND), a23 (AO), a24 (DO) deliklerine tak. e21 → artı rayı, e22 → eksi rayı, A0 → e23 (AO), D7 → e24 (DO).",
  "Kodu yükle (simülatörde çalıştır): MQ-135'i seçip gaz kaydırıcısını değiştir. Gaz arttıkça LCD'deki sayı yükselir ve \"Hava: IYI\" önce ORTA sonra KOTU olur."],
 [["Nasıl çalışıyor?", "MQ-135'in içinde ısıtılan bir metal oksit tabaka vardır; amonyak, benzen, duman gibi gazlar tabakanın direncini değiştirir ve modül bunu gerilime çevirir. AO pini gaz arttıkça yükselen analog gerilim verir, analogRead() bunu 0–1023 sayısına çevirir. DO pini, karttaki ayar potuyla belirlenen eşik aşılınca LOW olan dijital çıkıştır. Kod AO değerini iki eşikle karşılaştırır: 400'ün altı IYI, 400–700 arası ORTA, 700 ve üstü KOTU. Seri Monitör'e hem AO hem DO yazılır."],
  ["Simülatörde gözlenen", "Simülatörde sensörün gaz kaydırıcısı ppm cinsinden verilir ve basit bir logaritmik modelle gerilime çevrilir (sensör 5 V'a bağlıyken). Açılışta \"MQ-135 isiniyor\" yazdı, 2 saniye sonra ölçüm başladı. 20 ppm'de AO = 208 ve LCD \"Gaz: 208\" / \"Hava: IYI\", DO = 1; 100 ppm'de AO = 501 ve \"ORTA\"; 400 ppm'de AO = 754 ve \"KOTU\" (DO = 0); 900 ppm'de AO = 902 ve \"KOTU\"; 20 ppm'e dönünce tekrar IYI oldu. Eşikler (400 ve 700) bu simülatör modeline göre seçilmiş örnek değerlerdir. Gerçek kartta denenmedi."],
  [SIM_YOK, "Simülatörde ısınma süresi (gerçekte 24 saat ilk ısınma, sonra her açılışta birkaç dakika), gaz türü ayrımı (NH₃, CO₂, benzen), R0 kalibrasyonu ve sıcaklık/nem etkisi yoktur; DO eşiği sabittir (gerçek kartta ayar potu var). Gerçek MQ-135 tek başına doğru ppm vermez; eşikleri kendi sensörüne göre denemeyle belirlemelisin. Isıtıcı yaklaşık 150 mA çeker. Bu proje bir güvenlik ölçüm cihazı değildir. " + kut("LiquidCrystal.h")],
  ["Sık yapılan hatalar", "Sensörü ısınmadan okuyup değerleri hatalı sanmak; MQ-135'i 3,3 V'a bağlamak (ısıtıcı yetersiz kalır, 5 V ister); AO yerine DO'yu analogRead ile okumak; eşiği hiç denemeden sabit tutmak; sensörün gaz türünü ayırt ettiğini sanmak (yalnızca toplam etki ölçer)."],
  ["Dene", "KOTU durumunda bir buzzer ve kırmızı LED ekleyip alarm ver ya da son 10 ölçümün ortalamasını alarak ekranı yumuşat."]])

# ---------------- 58
add("gaz-kacagi-alarmi", "gaz_alarm",
 "MQ-2 gaz/duman sensörü analog değeri eşiği aşınca buzzer aralıklı (bip bip) öter; değer eşiğin biraz altına inince alarm biter. Gaz sensörünü okumayı, eşik ve histerezisle alarm mantığı kurmayı öğrenirsin. Simülatörde gaz miktarı modülün kaydırıcısından verilir.",
 [UNO, "Breadboard", "1 × MQ-2 gaz/duman sensörü modülü", "1 × aktif buzzer", "Jumper kablolar (8 adet)"],
 [["5V", "Alttaki artı (+) rayı: MQ-2 VCC"], ["GND (GND2)", "Alttaki eksi (−) rayı: MQ-2 GND ve buzzer −"], ["A0", "MQ-2 AO (analog çıkış)"], ["D7", "MQ-2 DO (dijital çıkış)"], ["D8", "Buzzer + (anot)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın.",
  "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
  "MQ-2'yi a4 (VCC), a5 (GND), a6 (AO), a7 (DO) deliklerine tak. e4 → artı rayı, e5 → eksi rayı, A0 → e6 (AO), D7 → e7 (DO).",
  "Aktif buzzer'ı c12 (+) ve c13 (−) deliklerine tak. D8 pinini e12'ye, e13'ü eksi rayına kablola.",
  "Kodu yükle (simülatörde çalıştır): MQ-2'nin gaz kaydırıcısını yükselt. Değer eşiği aşınca Seri Monitör'e \"GAZ ALGILANDI!\" yazılır ve buzzer aralıklı öter."],
 [["Nasıl çalışıyor?", "MQ-2 ısıtılan bir metal oksit tabaka içerir; LPG, duman, hidrojen gibi yanıcı gazlar tabakanın direncini düşürür ve AO gerilimi yükselir. analogRead() 0–1023 değer verir. Kod ALARM_ESIK = 450 üstünde alarmı başlatır, alarm ancak değer ALARM_ESIK − HISTEREZIS = 400'ün altına inince biter. Bu histerezis, değer eşik civarında oynadığında alarmın sürekli açılıp kapanmasını önler. Alarm sırasında (millis() / 200) % 2 ifadesiyle buzzer 200 ms açık, 200 ms kapalı öter. Durum bilgisi saniyede bir Seri Monitör'e yazılır."],
  ["Simülatörde gözlenen", "Temiz havada (300 ppm) AO = 168 okundu ve buzzer sustu. 4. saniyede gaz 1000 ppm'e çıkınca AO = 427 oldu; eşiğin (450) altında kaldığı için alarm çalmadı. 7. saniyede 2500 ppm'e çıkınca AO = 624 ve DO = 0 oldu: Seri Monitör'e \"GAZ ALGILANDI! AO=624\" yazıldı, buzzer 200 ms açık / 200 ms kapalı öttü. 11. saniyede gaz 1000 ppm'e inince AO = 427 oldu ama bu değer 400'ün altına inmediği için alarm sürdü (histerezis); 13. saniyede 300 ppm'e inince \"Gaz seviyesi normale dondu. AO=168\" yazıldı ve buzzer sustu. Eşik değerleri bu simülatör modeline göre seçilmiştir. Gerçek kartta denenmedi."],
  [SIM_YOK, "Simülatörde ısınma süresi, gaz türü ayrımı (LPG/duman/hidrojen), R0 kalibrasyonu ve sıcaklık/nem etkisi yoktur; DO eşiği sabittir (gerçek kartta ayar potu var), AO modeli logaritmik ve basittir. Gerçek MQ-2 ilk kullanımda uzun süre ısınmalı, eşikler denemeyle ayarlanmalıdır. BU DEVRE GERÇEK BİR GÜVENLİK ALARMI DEĞİLDİR: gerçek gaz kaçağı tespiti için sertifikalı bir dedektör kullanılmalıdır. Sketch kütüphane kullanmaz, gerçek derleme servisiyle derlenebilir."],
  ["Sık yapılan hatalar", "Sensörü ısınmadan okuyup tetiklendi sanmak; eşiği denemeden seçmek (sürekli alarm ya da hiç alarm); histerezis koymayıp eşik civarında buzzerın titremesine yol açmak; MQ-2'yi 3,3 V'a bağlamak (ısıtıcı yetersiz kalır); aktif buzzer için tone() kullanmaya çalışmak."],
  ["Dene", "Alarm sırasında kırmızı bir LED'i buzzer ile birlikte yak-söndür ya da bir düğmeyle alarmı 30 saniye susturmayı ekle."]])

# ---------------- 59
add("deprem-algilama-ve-uyari", "deprem",
 "SW-420 titreşim sensörünün darbeleri saniyede sayılır; bir saniyede en az 3 darbe gelirse LCD'de DEPREM UYARISI! yazar ve buzzer en az 3 saniye öter. Sensör darbelerini sayma, zaman penceresiyle değerlendirme ve uyarı süresini millis() ile yönetmeyi öğrenirsin. Bu devre gerçek bir deprem erken uyarı sistemi değildir; yalnızca titreşimi algılar.",
 [UNO, "Breadboard", "1 × SW-420 titreşim sensörü modülü"] + LCDP + ["1 × aktif buzzer", "Jumper kablolar (19 adet)"],
 lcdw() + [["D6", "SW-420 DO (dijital çıkış)"], ["D8", "Buzzer + (anot)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın."] + lcds() + [
  "SW-420'yi a21 (VCC), a22 (GND), a23 (DO) deliklerine tak. e21 → artı rayı, e22 → eksi rayı, D6 → e23.",
  "Aktif buzzer'ı c27 (+) ve c28 (−) deliklerine tak. D8 pinini e27'ye, e28'i eksi rayına kablola.",
  "Kodu yükle (simülatörde çalıştır): SW-420'yi seçip \"titret\" düğmesine hızla art arda bas. Saniyede en az 3 darbe olunca LCD'de \"DEPREM UYARISI!\" görünür ve buzzer öter."],
 [["Nasıl çalışıyor?", "SW-420 içinde bir titreşim anahtarı ve bir karşılaştırıcı (LM393) vardır; sarsıntıda DO pini kısa süre HIGH olur. Kod LOW'dan HIGH'a her geçişi bir darbe sayar (sayac). Her saniye sonunda o saniyedeki darbe sayısı sonSaniye değişkenine alınır ve ESIK = 3 ile karşılaştırılır. Eşik aşılırsa uyariBitis, şimdiki zaman + 3000 ms olarak ayarlanır; uyari = (millis() < uyariBitis) doğru olduğu sürece buzzer öter ve LCD uyarı gösterir. Böylece tek bir tıkırtı uyarı vermez, ama sürekli sarsıntı verir."],
  ["Simülatörde gözlenen", "Açılışta LCD \"Titresim: 0/sn\" / \"Durum: SAKIN\" gösterdi. 2. saniyede tek bir darbe gelince \"Titresim: 1/sn\" oldu ama eşik (3) aşılmadığı için uyarı olmadı. 5. saniyede 8 hızlı darbe (yaklaşık saniyede 6) verilince Seri Monitör'e \"DEPREM UYARISI! Titresim sayisi: 6\" yazıldı, LCD \"DEPREM UYARISI!\" gösterdi ve buzzer 6,04. saniyeden 9,04. saniyeye kadar (3 saniye) öttü; sonra LCD \"Durum: SAKIN\"a döndü. 11 ve 11,4. saniyelerdeki iki darbe eşik altında kaldı. Gerçek kartta denenmedi."],
  [SIM_YOK, "Simülatörde titreşim, modülün \"titret\" düğmesiyle verilir; darbe sıklığı, genliği, hassasiyet potu ve gürültü yoktur. Bazı SW-420 modüllerinde çıkış mantığı ters olabilir (titreşimde LOW). Gerçek bir deprem sismik dalgalarla (P ve S dalgaları) ilerler ve gerçek erken uyarı sistemleri ivmeölçer ağları kullanır; bu devre bir sınıf ya da masa sarsıntısını bile ayırt edemez, deprem ölçümü ya da güvenlik amaçlı kullanılamaz. " + kut("LiquidCrystal.h")],
  ["Sık yapılan hatalar", "Her HIGH okumasını darbe saymak (kenar algılama yapmamak); eşiği çok düşük seçmek (her masa vuruşu uyarı verir); uyarı süresini millis() yerine delay() ile beklemek (sensör o sırada okunamaz); sensörün hassasiyet potunu ayarlamamak; SW-420'yi tek sarsıntıdan sonra bir daha okumamak."],
  ["Dene", "Uyarı sırasında LCD'ye son uyarının kaçıncı saniyede başladığını (millis() / 1000) yaz ya da ESIK ve uyarı süresini bir potansiyometreyle ayarlanabilir yap."]])

# ---------------- 60
add("enerji-tuketim-olcer", "enerji_olcer",
 "ACS712 akım sensörünün çıkış gerilimi okunur, akım (A), güç (W) ve harcanan enerji (Wh) hesaplanıp LCD'de gösterilir. Hall etkili akım sensörünün çalışmasını, sıfır akım kalibrasyonunu, ortalama almayı ve güç ile enerji formüllerini öğrenirsin. Simülatörde akım modülün kaydırıcısından verilir. Yalnızca düşük gerilimli devrelerde kullanılır.",
 [UNO, "Breadboard", "1 × ACS712 akım sensörü modülü (5 A)"] + LCDP + ["Jumper kablolar (17 adet)"],
 lcdw() + [["A0", "ACS712 OUT (analog çıkış)"]],
 ["Devreyi enerjisiz kur: USB kablosu takılı olmasın ve ölçülecek yük bağlı olmasın (başlangıçta sıfır akım kalibrasyonu yapılır)."] + lcds() + [
  "ACS712'yi a21 (VCC), a22 (OUT), a23 (GND) deliklerine tak. e21 → artı rayı, e23 → eksi rayı, A0 → e22 (OUT).",
  "Gerçek devrede ölçülecek yük, modülün IP+ ve IP− vidalı uçlarına seri bağlanır; bu uçlar simülatörde modellenmez, akım modülün kaydırıcısından verilir. Yalnızca 5 V gibi düşük gerilimli devreleri ölç.",
  "Kodu yükle (simülatörde çalıştır): yük bağlı değilken (0 A) kalibrasyon yapılır. ACS712'yi seçip akım kaydırıcısını 1,5 A'e getir: LCD'de yaklaşık \"Akim: 1.48 A\", \"7.4W\" ve artan bir enerji (Wh) değeri görünür."],
 [["Nasıl çalışıyor?", "ACS712'de akım yolu üzerinden geçen akımın oluşturduğu manyetik alanı ölçen bir Hall sensörü vardır. 5 A'lik modelde çıkış gerilimi akım yokken 2,5 V'tur ve her amper için 185 mV değişir (DUYARLILIK = 0,185). Kod önce yük yokken çıkışı ölçüp ofsetV'ye kaydeder (kalibrasyon). Sonra akim = (v − ofsetV) / 0,185 ile amperi, guc = |akim| × GERILIM ile watt'ı hesaplar. Enerji, gücün zamanla toplamıdır: toplamWh += guc × (geçen süre) / 3 600 000. Gürültüyü azaltmak için her ölçüm 20 okumanın ortalamasıdır ve ±0,05 A'den küçük değerler sıfır sayılır. GERILIM sabit 5 V kabul edildi; gerçek devrede yük geriliminin de ölçülmesi gerekir."],
  ["Simülatörde gözlenen", "Açılışta Seri Monitör'e \"Sifir akim cikisi (V): 2.500\" yazıldı. Akım kaydırıcısı 0,5 A iken \"Akim=0.48 A, Guc=2.4 W\", 1,5 A iken \"1.48 A, 7.4 W\", 3 A iken \"2.98 A, 14.9 W\" ve −1 A iken \"-1.00 A, 5.0 W\" okundu (10 bitlik ADC adımı yaklaşık 0,026 A olduğu için sonuçlar 0,02 A kadar sapar). Enerji sayacı 18 saniyede yaklaşık 0,031 Wh'e ulaştı; LCD'de örneğin \"Akim: 1.48 A\" ve \"7.4W E:0.008Wh\" göründü. Gerçek kartta denenmedi."],
  [SIM_YOK, "Simülatörde ACS712'nin IP+/IP− akım yolu modellenmez: devredeki gerçek akım okunmaz, akım kaydırıcıdan verilir; ofset kayması, gürültü ve bant genişliği de yoktur. Gerçek ACS712 gürültülüdür, ofseti 2,5 V'tan sapabilir ve küçük akımlarda (0,1 A altı) güvenilmezdir. UYARI: Bu proje yalnızca düşük gerilimli (örneğin 5 V) devreleri ölçmek içindir; ŞEBEKE GERİLİMİNE (220 V) BAĞLAMAK ÖLÜMCÜL OLABİLİR, öğretmen/yetişkin gözetimi ve uygun yalıtım olmadan denenmez. " + kut("LiquidCrystal.h")],
  ["Sık yapılan hatalar", "Sıfır akım kalibrasyonunu yük bağlıyken yapmak (ofset yanlış olur); sensörü 3,3 V ile beslemek (5 V ister); IP+/IP−'yi yüke paralel bağlamak (sensör bozulur, akım yoluna seri girmeli); 5 A'lik modeli 5 A üstünde kullanmak; gerilimi sabit sanıp güç hesabını yanlış yapmak."],
  ["Dene", "Enerji sayacını bir düğmeyle sıfırla ya da enerjiye elektrik birim fiyatı (örneğin kWh başına TL) çarparak maliyeti LCD'de göster."]])

# @@END@@
for k, v in C.items():
    json.dump(v, open(f'{HERE}/content/{k}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(C), 'içerik yazıldı')
