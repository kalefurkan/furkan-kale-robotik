// Dogrulama surumu (Uno): ESP32 projesindeki akim olcme ve yuk atma mantiginin Wi-Fi'siz hali
// ACS712 -> A0, 4 kanalli role modulu IN1..IN4 -> D4..D7 (modul LOW'da ceker)
const int ACS_PIN = A0;
const int ROLE_PIN[4] = {4, 5, 6, 7};
const float DUYARLILIK = 0.185;           // V / A
const float AKIM_SINIRI = 1.5;            // A
bool acik[4] = {false, false, false, false};
float sifirV = 2.5;

float sensorGerilimi() {
  long toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam += analogRead(ACS_PIN);
    delay(1);
  }
  return (toplam / 16.0) * 5.0 / 1023.0;
}

void roleYaz(int k, bool ac) {
  acik[k] = ac;
  digitalWrite(ROLE_PIN[k], ac ? LOW : HIGH);
}

void setup() {
  Serial.begin(9600);
  for (int k = 0; k < 4; k++) {
    pinMode(ROLE_PIN[k], OUTPUT);
    roleYaz(k, false);
  }
  delay(300);
  sifirV = sensorGerilimi();
  Serial.print("Sifir akim gerilimi: ");
  Serial.println(sifirV, 3);
  for (int k = 0; k < 4; k++) {            // yukleri sirayla ac
    roleYaz(k, true);
    Serial.print("Yuk ");
    Serial.print(k + 1);
    Serial.println(" acildi");
    delay(500);
  }
}

void loop() {
  float v = sensorGerilimi() - sifirV;
  float akim = abs(v) / DUYARLILIK;
  Serial.print("Akim: ");
  Serial.print(akim, 2);
  Serial.println(" A");
  if (akim > AKIM_SINIRI) {
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
  delay(1000);
}
