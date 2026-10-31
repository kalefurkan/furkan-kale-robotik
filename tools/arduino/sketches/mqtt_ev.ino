// MQTT akilli ev dugumu: DHT22 + LDR + 4 kanalli role modulu + ESP-01 (AT komutlari)
// Otomasyon (sim'de dogrulanir): karanlikta lamba, sicakta vantilator, soguk havada isitici.
// MQTT (sim'de DOGRULANMAZ): olcumler "ev/salon/..." konularina yayinlanir, "ev/salon/role/N" konusundan komut gelir.
// Bu sketch'te yayin yerel olarak Seri Monitor'e yazilir; gercek MQTT icin NodeMCU + PubSubClient kodu notlarda.
#include <SoftwareSerial.h>
#include <DHT.h>

SoftwareSerial esp(2, 3);      // RX = D2 (ESP TX), TX = D3 (ESP RX, bolucu uzerinden)
DHT dht(4, DHT22);             // DATA = D4

const int LDR_PIN = A0;
const int ROLE_PIN[4] = {5, 6, 7, 8};   // IN1 lamba, IN2 vantilator, IN3 isitici, IN4 priz (modul LOW'da ceker)
const int KARANLIK = 300;      // bu degerin alti karanlik (LDR 10 kOhm ile bolucu)
const float SICAK = 28.0;
const float SOGUK = 18.0;

bool acik[4] = {false, false, false, false};
unsigned long sonYayin = 0;
bool brokerVar = false;

bool bekle2(char a, char b, int ms) {
  char onceki = 0;
  bool bulundu = false;
  unsigned long t0 = millis();
  while (millis() - t0 < ms) {
    while (esp.available() > 0) {
      char c = esp.read();
      if (onceki == a && c == b) {
        bulundu = true;
      }
      onceki = c;
    }
    delay(2);
  }
  return bulundu;
}

void roleYaz(int k, bool durum) {
  if (acik[k] == durum) {
    return;
  }
  acik[k] = durum;
  digitalWrite(ROLE_PIN[k], durum ? LOW : HIGH);
  Serial.print("Role ");
  Serial.print(k + 1);
  if (durum) {
    Serial.println(": ACIK");
  } else {
    Serial.println(": KAPALI");
  }
}

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(ROLE_PIN[i], OUTPUT);
    digitalWrite(ROLE_PIN[i], HIGH);     // baslangicta hepsi kapali
  }
  Serial.begin(9600);
  esp.begin(9600);
  dht.begin();
  Serial.println("MQTT ev dugumu hazir");
  delay(500);
  esp.println("AT+CWMODE=1");
  bekle2('O', 'K', 500);
  esp.println("AT+CWJAP=\"MakersHub\",\"12345678\"");
  if (bekle2('I', 'P', 6000)) {
    Serial.println("Wi-Fi baglandi");
  } else {
    Serial.println("Wi-Fi BAGLANAMADI");
  }
  esp.println("AT+CIPSTART=\"TCP\",\"192.168.1.10\",1883");   // MQTT broker (TCP 1883)
  brokerVar = bekle2('O', 'K', 1500);
  if (brokerVar) {
    Serial.println("Broker'a TCP baglanti kuruldu");
  } else {
    Serial.println("Broker'a baglanilamadi: olcumler yalnizca Seri Monitor'e yazilacak");
  }
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int isik = analogRead(LDR_PIN);

  // otomasyon
  roleYaz(0, isik < KARANLIK);                 // lamba
  if (!isnan(t)) {
    if (t > SICAK) {
      roleYaz(1, true);                        // vantilator
    } else if (t < SICAK - 2) {
      roleYaz(1, false);
    }
    if (t < SOGUK) {
      roleYaz(2, true);                        // isitici
    } else if (t > SOGUK + 2) {
      roleYaz(2, false);
    }
  }

  // "yayin": her 5 saniyede bir konu = deger
  if (millis() - sonYayin >= 5000) {
    sonYayin = millis();
    Serial.print("MQTT ev/salon/sicaklik = ");
    Serial.println(t, 1);
    Serial.print("MQTT ev/salon/nem = ");
    Serial.println(h, 1);
    Serial.print("MQTT ev/salon/isik = ");
    Serial.println(isik);
    if (brokerVar) {
      Serial.println("(broker bagli: gercek yayin burada yapilirdi)");
    }
  }
  delay(100);
}
