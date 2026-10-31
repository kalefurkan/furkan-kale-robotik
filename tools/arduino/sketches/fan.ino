// Otomatik fan: sicaklik esigi asilinca fan doner, sicaklik dusunce durur
#include <DHT.h>

const int DHT_PIN = 8;          // DHT11 DATA pini
const int FAN_PIN = 9;          // transistorun taban direncine giden pin (fan dogrudan bu pine baglanmaz!)
const float ESIK = 28.0;        // fan bu sicaklikta (C) acilir
const float HISTEREZIS = 1.0;   // fan ESIK - 1 C'ye inince kapanir (surekli ac-kapa yapmasin)

DHT dht(DHT_PIN, DHT11);
bool fanAcik = false;

void setup() {
  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float sicaklik = dht.readTemperature();

  if (isnan(sicaklik)) {
    fanAcik = false;                         // sensor okunamazsa guvenli tarafta kal: fan kapali
    Serial.println("Sensor okunamadi");
  } else {
    if (!fanAcik && sicaklik >= ESIK) {
      fanAcik = true;                        // esigi astik: fani ac
    } else if (fanAcik && sicaklik <= ESIK - HISTEREZIS) {
      fanAcik = false;                       // yeterince sogudu: fani kapat
    }
    Serial.print("Sicaklik: ");
    Serial.print(sicaklik, 1);
    Serial.print(" C   Fan: ");
    if (fanAcik) {
      Serial.println("ACIK");
    } else {
      Serial.println("KAPALI");
    }
  }

  if (fanAcik) {
    digitalWrite(FAN_PIN, HIGH);             // transistoru iletime sok: fan 5V rayindan beslenir
  } else {
    digitalWrite(FAN_PIN, LOW);
  }
  delay(1000);
}
