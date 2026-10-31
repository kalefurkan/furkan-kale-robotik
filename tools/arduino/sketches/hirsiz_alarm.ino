// Hirsiz alarmi: PIR hareket algilayinca pasif buzzer siren calar, LED yanip soner
const int PIR_PIN = 2;
const int BUZZER = 8;               // pasif buzzer: tone() ile calinir
const int LED = 4;
const unsigned long KURULUM_MS = 3000;   // acilista sensorun oturmasi icin bekleme (gercek PIR icin 30-60 sn gerekir)

void siren() {
  // 10 tur: 800 Hz / 1200 Hz sirasiyla, toplam 5 saniye
  for (int i = 0; i < 10; i++) {
    tone(BUZZER, 800);
    digitalWrite(LED, HIGH);
    delay(250);
    tone(BUZZER, 1200);
    digitalWrite(LED, LOW);
    delay(250);
  }
  noTone(BUZZER);
  digitalWrite(LED, LOW);
}

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Sistem kuruluyor...");
  delay(KURULUM_MS);
  Serial.println("Alarm KURULDU");
}

void loop() {
  if (digitalRead(PIR_PIN) == HIGH) {
    Serial.println("HAREKET ALGILANDI! Siren calisiyor");
    siren();
    Serial.println("Alarm tekrar kuruldu");
  }
  delay(100);
}
