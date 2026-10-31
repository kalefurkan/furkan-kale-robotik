// Akilli sera otomasyonu: DHT22 (hava) + toprak nem sensoru + fan + pompa (ikisi de NPN suruculu)
// Fan: sicaklik 28 C ustunde ya da nem %85 ustunde acilir, sicaklik 26 C altina ve nem %80 altina inince kapanir.
// Pompa: toprak kuruysa en fazla 3 saniye calisir; sonraki sulamaya kadar en az 10 saniye beklenir.
#include <DHT.h>

DHT dht(4, DHT22);                     // DATA = D4

const int NEM_PIN = A0;
const int POMPA_PIN = 5;
const int FAN_PIN = 6;

const float SICAK_ACIK = 28.0;
const float SICAK_KAPALI = 26.0;
const float HAVA_NEMI_ACIK = 85.0;
const float HAVA_NEMI_KAPALI = 80.0;
const int TOPRAK_KURU = 700;           // bu degerin ustu: toprak kuru
const unsigned long POMPA_SURE = 3000;
const unsigned long POMPA_BEKLEME = 10000;

bool fan = false;
bool pompa = false;
unsigned long pompaBasladi = 0;
unsigned long pompaBitti = 0;
unsigned long sonYaz = 0;

void fanYaz(bool ac) {
  if (ac == fan) {
    return;
  }
  fan = ac;
  digitalWrite(FAN_PIN, ac ? HIGH : LOW);
  if (ac) {
    Serial.println("FAN ACIK");
  } else {
    Serial.println("FAN KAPALI");
  }
}

void pompaYaz(bool ac) {
  if (ac == pompa) {
    return;
  }
  pompa = ac;
  digitalWrite(POMPA_PIN, ac ? HIGH : LOW);
  if (ac) {
    pompaBasladi = millis();
    Serial.println("POMPA ACIK");
  } else {
    pompaBitti = millis();
    Serial.println("POMPA KAPALI");
  }
}

void setup() {
  pinMode(POMPA_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(POMPA_PIN, LOW);
  digitalWrite(FAN_PIN, LOW);
  Serial.begin(9600);
  dht.begin();
  Serial.println("Sera hazir");
  pompaBitti = millis() - POMPA_BEKLEME;   // ilk sulama beklemeden olabilsin
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int toprak = analogRead(NEM_PIN);

  if (isnan(t) || isnan(h)) {              // sensor okunamadi: fani guvenlik icin ac
    fanYaz(true);
  } else {
    if (t > SICAK_ACIK || h > HAVA_NEMI_ACIK) {
      fanYaz(true);
    } else if (t < SICAK_KAPALI && h < HAVA_NEMI_KAPALI) {
      fanYaz(false);
    }
  }

  if (pompa) {
    if (millis() - pompaBasladi >= POMPA_SURE || toprak < TOPRAK_KURU - 200) {
      pompaYaz(false);
    }
  } else if (toprak > TOPRAK_KURU && millis() - pompaBitti >= POMPA_BEKLEME) {
    pompaYaz(true);
  }

  if (millis() - sonYaz >= 2000) {
    sonYaz = millis();
    Serial.print("Hava: ");
    Serial.print(t, 1);
    Serial.print(" C, nem %");
    Serial.print(h, 0);
    Serial.print(" | toprak: ");
    Serial.println(toprak);
  }
  delay(100);
}
