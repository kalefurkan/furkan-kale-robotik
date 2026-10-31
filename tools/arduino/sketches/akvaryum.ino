// Otomatik akvaryum kontrolu: DS18B20 sicaklik sensoru + role (isitici) + NPN suruculu pompa
// Isitici: sicaklik 24.0'in altina inince acilir, 26.0'in ustune cikinca kapanir (histerezis).
// Pompa: her 20 saniyenin ilk 5 saniyesinde calisir (zamanlayici). Sensor okunamazsa isitici kapatilir.
#include <OneWire.h>
#include <DallasTemperature.h>

OneWire oneWire(2);                    // DQ = D2 (4.7 kOhm cekme direnciyle 5V'a)
DallasTemperature sensors(&oneWire);

const int ROLE_PIN = 7;                // NPN -> role bobini (isitici)
const int POMPA_PIN = 5;               // 1 kOhm -> NPN tabani (pompa)

const float ALT_ESIK = 24.0;
const float UST_ESIK = 26.0;
const unsigned long CEVRIM_MS = 20000;
const unsigned long POMPA_MS = 5000;

bool isitici = false;
bool pompa = false;

void isiticiYaz(bool ac) {
  if (ac == isitici) {
    return;
  }
  isitici = ac;
  digitalWrite(ROLE_PIN, ac ? HIGH : LOW);
  if (ac) {
    Serial.println("ISITICI ACIK");
  } else {
    Serial.println("ISITICI KAPALI");
  }
}

void pompaYaz(bool ac) {
  if (ac == pompa) {
    return;
  }
  pompa = ac;
  digitalWrite(POMPA_PIN, ac ? HIGH : LOW);
  if (ac) {
    Serial.println("POMPA ACIK");
  } else {
    Serial.println("POMPA KAPALI");
  }
}

void setup() {
  pinMode(ROLE_PIN, OUTPUT);
  pinMode(POMPA_PIN, OUTPUT);
  digitalWrite(ROLE_PIN, LOW);
  digitalWrite(POMPA_PIN, LOW);
  Serial.begin(9600);
  sensors.begin();
  Serial.print("Akvaryum hazir, bulunan sensor: ");
  Serial.println(sensors.getDeviceCount());
}

void loop() {
  sensors.requestTemperatures();             // donusum ~750 ms surer
  float t = sensors.getTempCByIndex(0);

  if (t == DEVICE_DISCONNECTED_C) {          // sensor yok ya da hat bozuk
    isiticiYaz(false);
    Serial.println("SENSOR HATASI: isitici kapatildi");
  } else {
    Serial.print("Sicaklik: ");
    Serial.print(t, 1);
    Serial.println(" C");
    if (t < ALT_ESIK) {
      isiticiYaz(true);
    } else if (t > UST_ESIK) {
      isiticiYaz(false);
    }
  }

  pompaYaz((millis() % CEVRIM_MS) < POMPA_MS);   // zamanlayici
  delay(250);
}
