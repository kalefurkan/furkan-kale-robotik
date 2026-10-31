// Hareket algilayan gece lambasi: PIR hareket gorunce LED yanar, hareket bitince 5 saniye sonra soner
const int PIR_PIN = 2;
const int LED_PIN = 8;
const unsigned long YANIK_KALMA_MS = 5000;   // son hareketten sonra lamba bu kadar yanik kalir

unsigned long sonHareket = 0;
bool lambaAcik = false;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(PIR_PIN) == HIGH) {
    sonHareket = millis();                   // her harekette sure yeniden baslar
    if (!lambaAcik) {
      lambaAcik = true;
      digitalWrite(LED_PIN, HIGH);
      Serial.println("Hareket var: lamba yandi");
    }
  } else if (lambaAcik && millis() - sonHareket > YANIK_KALMA_MS) {
    lambaAcik = false;
    digitalWrite(LED_PIN, LOW);
    Serial.println("Hareket yok: lamba sondu");
  }
  delay(50);
}
