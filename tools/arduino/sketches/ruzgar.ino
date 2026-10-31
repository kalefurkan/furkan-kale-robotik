// Mini ruzgar hiz olcer: Hall sensoru donen kanattaki miknatisi her turda bir kez gorur.
// Belirli bir surede darbe sayilir -> devir/dakika (rpm) -> cevre hizi hesaplanir.
const int HALL_PIN = 2;                       // Hall sensoru DO cikisi (miknatis yakinken LOW)
const float YARICAP_M = 0.05;                 // VARSAYIM: kanat ucunun donme yaricapi 5 cm (kendi kanadinla olc)
const unsigned long PENCERE_MS = 2000;        // darbeler 2 saniye boyunca sayilir

int darbe = 0;
int onceki = HIGH;
unsigned long pencereBaslangic = 0;

void setup() {
  pinMode(HALL_PIN, INPUT);
  Serial.begin(9600);
  pencereBaslangic = millis();
}

void loop() {
  int durum = digitalRead(HALL_PIN);
  if (onceki == HIGH && durum == LOW) {       // HIGH -> LOW: miknatis sensorun onunden gecmeye basladi
    darbe++;
  }
  onceki = durum;

  if (millis() - pencereBaslangic >= PENCERE_MS) {
    float rpm = darbe * 60000.0 / PENCERE_MS;                 // darbe sayisi = tur sayisi
    float hiz = 2.0 * 3.14159 * YARICAP_M * rpm / 60.0;       // cevre hizi (m/s) = 2 * pi * r * tur/saniye
    Serial.print("Devir: ");
    Serial.print(rpm, 0);
    Serial.print(" d/dk   Kanat ucu hizi: ");
    Serial.print(hiz, 2);
    Serial.print(" m/s (");
    Serial.print(hiz * 3.6, 1);
    Serial.println(" km/sa)");
    darbe = 0;
    pencereBaslangic = millis();
  }
  delay(1);                                   // sensoru saniyede ~1000 kez oku
}
