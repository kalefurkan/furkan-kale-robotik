// Kablosuz hava kalitesi agi - sensor dugumu (ESP32). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
// MQ-135 (hava kalitesi) ve MQ-2 (gaz/duman) okunur, her 10 saniyede bir Wi-Fi uzerinden bir sunucuya (HTTP POST, JSON) gonderilir.
// Birden fazla dugum ayni sunucuya kendi DUGUM_ADI ile gonderirse "ag" olusur.
// Gerekli: Arduino IDE + "esp32" kart paketi (Espressif), kart: "ESP32 Dev Module". Kutuphane eklemek gerekmez.
#include <WiFi.h>
#include <HTTPClient.h>

const char *AG_ADI = "AG_ADINIZ";                       // kendi Wi-Fi agina gore degistir
const char *PAROLA = "PAROLANIZ";
const char *SUNUCU = "http://192.168.1.50:5000/veri";    // verileri alacak sunucunun adresi (kendi sunucunu kur)
const char *DUGUM_ADI = "dugum1";

const int MQ135_AO = 34, MQ135_DO = 32;                 // bolucu uzerinden (5 V -> 3,3 V)
const int MQ2_AO = 35, MQ2_DO = 33;
const float BOLUCU = 1.5;                               // (10k + 20k) / 20k
const unsigned long GONDERME_ARASI = 10000;
unsigned long sonGonderme = 0;

float sensorGerilimi(int pin) {                         // sensor cikisinin volt degeri (bolucu duzeltilmis), 16 okuma ortalamasi
  long toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam += analogReadMilliVolts(pin);
    delay(2);
  }
  return (toplam / 16.0) / 1000.0 * BOLUCU;
}

const char *seviye(float volt) {                        // kalibrasyonsuz, goreli yorum (kendi sensorunle esikleri ayarla)
  if (volt < 1.0) {
    return "iyi";
  }
  if (volt < 2.0) {
    return "orta";
  }
  return "kotu";
}

void wifiBaglan() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(AG_ADI, PAROLA);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
    delay(500);
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi baglandi: ");
    Serial.println(WiFi.localIP().toString());
  } else {
    Serial.println("Wi-Fi baglanamadi, tekrar denenecek");
  }
}

void setup() {
  Serial.begin(115200);
  analogSetPinAttenuation(MQ135_AO, ADC_11db);
  analogSetPinAttenuation(MQ2_AO, ADC_11db);
  pinMode(MQ135_DO, INPUT);
  pinMode(MQ2_DO, INPUT);
  Serial.println("MQ sensorleri isiniyor (gercekte 24 saat on isitma onerilir; en az birkac dakika bekle)");
  delay(5000);
  wifiBaglan();
}

void loop() {
  if (millis() - sonGonderme < GONDERME_ARASI) {
    return;
  }
  sonGonderme = millis();

  float hava = sensorGerilimi(MQ135_AO);
  float gaz = sensorGerilimi(MQ2_AO);
  bool havaAlarm = (digitalRead(MQ135_DO) == LOW);      // MQ modulu esigi astiginda DO LOW olur
  bool gazAlarm = (digitalRead(MQ2_DO) == LOW);

  String govde = "{\"dugum\":\"";
  govde += DUGUM_ADI;
  govde += "\",\"hava_volt\":";
  govde += String(hava, 2);
  govde += ",\"hava\":\"";
  govde += seviye(hava);
  govde += "\",\"gaz_volt\":";
  govde += String(gaz, 2);
  govde += ",\"gaz_alarm\":";
  govde += gazAlarm ? "true" : "false";
  govde += ",\"hava_alarm\":";
  govde += havaAlarm ? "true" : "false";
  govde += "}";
  Serial.println(govde);

  if (WiFi.status() != WL_CONNECTED) {
    wifiBaglan();
    return;
  }
  HTTPClient http;
  http.begin(SUNUCU);
  http.addHeader("Content-Type", "application/json");
  int kod = http.POST(govde);
  Serial.print("Sunucu yaniti: ");
  Serial.println(kod);                                  // 200 beklenir; negatifse baglanti hatasi
  http.end();
}
