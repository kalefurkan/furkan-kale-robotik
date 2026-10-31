// Akilli ev enerji yonetimi (ESP32). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
// ACS712 ile toplam akim olculur, 4 kanalli role modulu 4 yuku (lamba) acip kapatir.
// Toplam akim siniri asilirsa en az onemli yuk (en buyuk numara) otomatik kapatilir. Web sayfasindan yukler elle de kumanda edilir.
// Gerekli: Arduino IDE + "esp32" kart paketi (Espressif), kart: "ESP32 Dev Module". Kutuphane eklemek gerekmez.
#include <WiFi.h>
#include <WebServer.h>

const char *AG_ADI = "AG_ADINIZ";          // kendi Wi-Fi agina gore degistir
const char *PAROLA = "PAROLANIZ";

const int ACS_PIN = 34;                    // ACS712 OUT -> 10k + 20k bolucu -> IO34 (yalniz giris)
const int ROLE_PIN[4] = {26, 27, 32, 33};  // role modulu IN1..IN4 (modul LOW'da ceker)
const float BOLUCU = 1.5;                  // (10k + 20k) / 20k: ACS712 5 V ciktisini 3,3 V'a indirir
const float DUYARLILIK = 0.185;            // 5 A'lik ACS712: 185 mV / A
const float AKIM_SINIRI = 1.5;             // A: bu degeri asinca yuk atilir

WebServer sunucu(80);
bool acik[4] = {false, false, false, false};
float sifirV = 2.5;                        // akim yokken ACS712 cikis gerilimi (acilista olculur)
float akim = 0;
unsigned long sonOlcum = 0;

float sensorGerilimi() {                   // 64 okumanin ortalamasi, volt cinsinden (bolucu duzeltilmis)
  long toplam = 0;
  for (int i = 0; i < 64; i++) {
    toplam += analogReadMilliVolts(ACS_PIN);
    delay(1);
  }
  return (toplam / 64.0) / 1000.0 * BOLUCU;
}

void roleYaz(int k, bool ac) {
  acik[k] = ac;
  digitalWrite(ROLE_PIN[k], ac ? LOW : HIGH);   // modul LOW'da ceker
}

void anaSayfa() {
  String s = "<html><head><meta charset='utf-8'><meta http-equiv='refresh' content='3'></head><body>";
  s += "<h2>Ev enerji yonetimi</h2><p>Toplam akim: ";
  s += String(akim, 2);
  s += " A (sinir ";
  s += String(AKIM_SINIRI, 1);
  s += " A)</p>";
  for (int k = 0; k < 4; k++) {
    s += "<p>Yuk ";
    s += String(k + 1);
    s += ": ";
    s += acik[k] ? "ACIK" : "kapali";
    s += " <a href='/role?no=";
    s += String(k + 1);
    s += "&durum=";
    s += acik[k] ? "0" : "1";
    s += "'>degistir</a></p>";
  }
  s += "</body></html>";
  sunucu.send(200, "text/html", s);
}

void roleIstegi() {
  int no = sunucu.arg("no").toInt();
  int durum = sunucu.arg("durum").toInt();
  if (no >= 1 && no <= 4) {
    roleYaz(no - 1, durum == 1);
  }
  sunucu.send(200, "text/html", "<html><head><meta http-equiv='refresh' content='0;url=/'></head></html>");
}

void setup() {
  Serial.begin(115200);
  for (int k = 0; k < 4; k++) {
    pinMode(ROLE_PIN[k], OUTPUT);
    roleYaz(k, false);                     // hepsi kapali basla
  }
  analogSetPinAttenuation(ACS_PIN, ADC_11db);
  delay(500);
  sifirV = sensorGerilimi();               // tum yukler kapaliyken sifir akim gerilimi
  Serial.print("Sifir akim gerilimi: ");
  Serial.println(sifirV, 3);

  WiFi.mode(WIFI_STA);
  WiFi.begin(AG_ADI, PAROLA);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
    delay(500);
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi baglandi, adres: ");
    Serial.println(WiFi.localIP().toString());
  } else {
    Serial.println("Wi-Fi baglanamadi: yalnizca otomatik yuk atma calisir");
  }
  sunucu.on("/", anaSayfa);
  sunucu.on("/role", roleIstegi);
  sunucu.begin();
}

void loop() {
  sunucu.handleClient();
  if (millis() - sonOlcum >= 1000) {
    sonOlcum = millis();
    akim = abs(sensorGerilimi() - sifirV) / DUYARLILIK;
    Serial.print("Akim: ");
    Serial.print(akim, 2);
    Serial.println(" A");
    if (akim > AKIM_SINIRI) {                // yuk atma: en az onemli (son) acik yuku kapat
      for (int k = 3; k >= 0; k--) {
        if (acik[k]) {
          roleYaz(k, false);
          Serial.print("Sinir asildi: yuk ");
          Serial.print(k + 1);
          Serial.println(" kapatildi");
          break;
        }
      }
    }
  }
}
