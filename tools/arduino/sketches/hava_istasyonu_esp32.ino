// Mini hava istasyonu ve veri sunucusu (ESP32). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
// BME280 sicaklik, nem ve basinci olcer; ESP32 degerleri SD karta CSV olarak kaydeder ve kendi web sayfasinda gosterir.
// Gerekli: Arduino IDE + "esp32" kart paketi (Espressif) + "Adafruit BME280 Library" (ve Adafruit Unified Sensor) kutuphaneleri.
#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

const char *AG_ADI = "AG_ADINIZ";            // kendi Wi-Fi agina gore degistir
const char *PAROLA = "PAROLANIZ";

const int SD_CS = 5;                          // SD modulu: CS IO5, MOSI IO23, MISO IO19, SCK IO18 (ESP32'nin varsayilan SPI pinleri)
const unsigned long KAYIT_ARASI = 60000;      // 1 dakikada bir kayit

Adafruit_BME280 bme;                          // I2C: SDA = IO21, SCL = IO22
WebServer sunucu(80);
float sicaklik = 0, nem = 0, basinc = 0;
bool sdVar = false;
unsigned long sonKayit = 0;

void olc() {
  sicaklik = bme.readTemperature();
  nem = bme.readHumidity();
  basinc = bme.readPressure() / 100.0F;       // Pa -> hPa
}

void sdyeYaz() {
  if (!sdVar) {
    return;
  }
  File dosya = SD.open("/olcum.csv", FILE_APPEND);
  if (dosya) {
    dosya.print(millis() / 1000);
    dosya.print(";");
    dosya.print(sicaklik, 1);
    dosya.print(";");
    dosya.print(nem, 0);
    dosya.print(";");
    dosya.println(basinc, 0);
    dosya.close();                            // close() veriyi karta kesin yazar
  }
}

void anaSayfa() {
  olc();
  String s = "<html><head><meta charset='utf-8'><meta http-equiv='refresh' content='5'></head><body>";
  s += "<h2>Mini hava istasyonu</h2><p>Sicaklik: ";
  s += String(sicaklik, 1);
  s += " C</p><p>Nem: %";
  s += String(nem, 0);
  s += "</p><p>Basinc: ";
  s += String(basinc, 0);
  s += " hPa</p><p><a href='/kayit'>SD kart kaydi (CSV)</a></p></body></html>";
  sunucu.send(200, "text/html", s);
}

void kayitSayfasi() {
  if (!sdVar) {
    sunucu.send(200, "text/plain", "SD kart yok");
    return;
  }
  File dosya = SD.open("/olcum.csv");
  if (!dosya) {
    sunucu.send(200, "text/plain", "Kayit yok");
    return;
  }
  sunucu.streamFile(dosya, "text/plain");     // dosyayi tarayiciya gonder
  dosya.close();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  if (!bme.begin(0x76)) {                     // bazi modullerde adres 0x77'dir
    Serial.println("BME280 bulunamadi: baglantilari ve adresi kontrol et");
    while (true) { delay(1000); }
  }
  sdVar = SD.begin(SD_CS);
  if (sdVar) {
    File dosya = SD.open("/olcum.csv", FILE_APPEND);
    if (dosya) {
      dosya.println("sure_sn;sicaklik;nem;basinc");
      dosya.close();
    }
  }
  Serial.println(sdVar ? "SD kart hazir" : "SD kart yok: yalniz web sayfasi calisir");
  WiFi.mode(WIFI_STA);
  WiFi.begin(AG_ADI, PAROLA);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
    delay(500);
  }
  Serial.print("Adres: ");
  Serial.println(WiFi.localIP().toString());
  sunucu.on("/", anaSayfa);
  sunucu.on("/kayit", kayitSayfasi);
  sunucu.begin();
}

void loop() {
  sunucu.handleClient();
  if (millis() - sonKayit >= KAYIT_ARASI) {
    sonKayit = millis();
    olc();
    sdyeYaz();
    Serial.print("Kayit: ");
    Serial.print(sicaklik, 1);
    Serial.println(" C");
  }
}
