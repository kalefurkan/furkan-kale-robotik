// Gaz kacagi alarmi: MQ-2 gaz/duman sensoru esigi asinca buzzer araliklarla oter
const int GAZ_AO = A0;          // MQ-2 analog cikis
const int GAZ_DO = 7;           // MQ-2 dijital cikis (kart uzerindeki esik asilinca LOW)
const int BUZZER_PIN = 8;
const int ALARM_ESIK = 450;     // bu degerin ustunde alarm baslar
const int HISTEREZIS = 50;      // alarm ancak ESIK - 50'nin altina inince biter (titremeyi onler)

bool alarm = false;
unsigned long sonYazi = 0;     // son durum yazisinin zamani

void setup() {
  pinMode(GAZ_DO, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Gaz alarmi hazir");
}

void loop() {
  int deger = analogRead(GAZ_AO);

  if (!alarm && deger > ALARM_ESIK) {
    alarm = true;
    Serial.print("GAZ ALGILANDI! AO=");
    Serial.println(deger);
  } else if (alarm && deger < ALARM_ESIK - HISTEREZIS) {
    alarm = false;
    Serial.print("Gaz seviyesi normale dondu. AO=");
    Serial.println(deger);
  }

  if (alarm) {
    // saniyede 2.5 bip: 200 ms acik, 200 ms kapali
    digitalWrite(BUZZER_PIN, (millis() / 200) % 2 == 0 ? HIGH : LOW);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  // saniyede bir durumu yaz
  if (millis() - sonYazi >= 1000) {
    sonYazi = millis();
    Serial.print("AO=");
    Serial.print(deger);
    Serial.print(" DO=");
    Serial.println(digitalRead(GAZ_DO));
  }
  delay(10);
}
