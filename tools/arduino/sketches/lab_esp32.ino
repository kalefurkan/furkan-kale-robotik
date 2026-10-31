// IoT kontrollu akilli laboratuvar (ESP32). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
// DHT22 (sicaklik, nem), LDR (isik) ve PIR (hareket) okunur; 4 kanalli role modulu 4 cihazi yonetir:
//   Role 1 = isik   : ortam karanlik VE hareket varsa acilir, hareket bitince 30 saniye sonra kapanir
//   Role 2 = fan    : sicaklik 28 C'yi gecince acilir, 26 C'nin altina inince kapanir (histerezis)
//   Role 3, 4       : yalnizca web sayfasindan elle
// Role 1 ve 2 web sayfasindan elle de degistirilebilir; "Otomatige don" ile otomatik moda doner.
// Gerekli: Arduino IDE + "esp32" kart paketi (Espressif) + "DHT sensor library" (Adafruit) ve "Adafruit Unified Sensor" kutuphaneleri.
#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

const char *AG_ADI = "AG_ADINIZ";               // kendi Wi-Fi agina gore degistir
const char *PAROLA = "PAROLANIZ";

const int DHT_PIN = 4;
const int LDR_PIN = 34;                          // LDR + 10 kOhm bolucunun orta noktasi (isik arttikca gerilim artar)
const int PIR_PIN = 13;                          // PIR OUT (10k + 20k bolucu uzerinden)
const int ROLE_PIN[4] = {26, 27, 32, 33};        // role modulu IN1..IN4 (modul LOW'da ceker)
const int KARANLIK_MV = 1000;                    // bu mV'un altinda ortam karanlik (kendi LDR'ine gore ayarla)
const float FAN_ACIK_C = 28.0;
const float FAN_KAPALI_C = 26.0;
const unsigned long ISIK_SURESI = 30000;

DHT dht(DHT_PIN, DHT22);
WebServer sunucu(80);
bool acik[4] = {false, false, false, false};
bool elle[4] = {false, false, false, false};     // true ise o rolede otomatik devre disi
float sicaklik = 0, nem = 0;
int isikMv = 0;
bool hareket = false;
unsigned long sonHareket = 0;
unsigned long sonOkuma = 0;

void roleYaz(int k, bool ac) {
  acik[k] = ac;
  digitalWrite(ROLE_PIN[k], ac ? LOW : HIGH);    // modul LOW'da ceker
}

void otomatik() {
  if (!elle[0]) {
    bool karanlik = (isikMv < KARANLIK_MV);
    if (hareket) {
      sonHareket = millis();
    }
    bool aktif = (sonHareket != 0) && (millis() - sonHareket < ISIK_SURESI);
    roleYaz(0, karanlik && aktif);
  }
  if (!elle[1]) {
    if (sicaklik > FAN_ACIK_C) {
      roleYaz(1, true);
    } else if (sicaklik < FAN_KAPALI_C) {
      roleYaz(1, false);
    }
  }
}

void anaSayfa() {
  String s = "<html><head><meta charset='utf-8'><meta http-equiv='refresh' content='5'></head><body><h2>Akilli laboratuvar</h2><p>Sicaklik: ";
  s += String(sicaklik, 1);
  s += " C, nem: %";
  s += String(nem, 0);
  s += "</p><p>Isik: ";
  s += String(isikMv);
  s += " mV, hareket: ";
  s += hareket ? "var" : "yok";
  s += "</p>";
  for (int k = 0; k < 4; k++) {
    s += "<p>Cihaz ";
    s += String(k + 1);
    s += ": ";
    s += acik[k] ? "ACIK" : "kapali";
    s += elle[k] ? " (elle)" : "";
    s += " <a href='/role?no=";
    s += String(k + 1);
    s += "&durum=";
    s += acik[k] ? "0" : "1";
    s += "'>degistir</a> <a href='/otomatik?no=";
    s += String(k + 1);
    s += "'>otomatige don</a></p>";
  }
  s += "</body></html>";
  sunucu.send(200, "text/html", s);
}

void roleIstegi() {
  int no = sunucu.arg("no").toInt();
  if (no >= 1 && no <= 4) {
    elle[no - 1] = true;
    roleYaz(no - 1, sunucu.arg("durum").toInt() == 1);
  }
  sunucu.send(200, "text/html", "<html><head><meta http-equiv='refresh' content='0;url=/'></head></html>");
}

void otomatigeDon() {
  int no = sunucu.arg("no").toInt();
  if (no >= 1 && no <= 4) {
    elle[no - 1] = false;
  }
  sunucu.send(200, "text/html", "<html><head><meta http-equiv='refresh' content='0;url=/'></head></html>");
}

void durumJson() {                               // baska bir IoT sistemi icin makine okunur durum
  String s = "{\"sicaklik\":";
  s += String(sicaklik, 1);
  s += ",\"nem\":";
  s += String(nem, 0);
  s += ",\"isik_mv\":";
  s += String(isikMv);
  s += ",\"hareket\":";
  s += hareket ? "true" : "false";
  s += "}";
  sunucu.send(200, "application/json", s);
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIR_PIN, INPUT);
  analogSetPinAttenuation(LDR_PIN, ADC_11db);
  for (int k = 0; k < 4; k++) {
    pinMode(ROLE_PIN[k], OUTPUT);
    roleYaz(k, false);
  }
  WiFi.mode(WIFI_STA);
  WiFi.begin(AG_ADI, PAROLA);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
    delay(500);
  }
  Serial.print("Adres: ");
  Serial.println(WiFi.localIP().toString());
  sunucu.on("/", anaSayfa);
  sunucu.on("/role", roleIstegi);
  sunucu.on("/otomatik", otomatigeDon);
  sunucu.on("/durum", durumJson);
  sunucu.begin();
}

void loop() {
  sunucu.handleClient();
  hareket = (digitalRead(PIR_PIN) == HIGH);
  if (millis() - sonOkuma >= 2000) {             // DHT22 en az 2 saniyede bir okunabilir
    sonOkuma = millis();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t) && !isnan(h)) {
      sicaklik = t;
      nem = h;
    }
    isikMv = analogReadMilliVolts(LDR_PIN);
    Serial.print("T=");
    Serial.print(sicaklik, 1);
    Serial.print(" nem=");
    Serial.print(nem, 0);
    Serial.print(" isik=");
    Serial.print(isikMv);
    Serial.print(" mV hareket=");
    Serial.println(hareket ? "var" : "yok");
  }
  otomatik();
}
