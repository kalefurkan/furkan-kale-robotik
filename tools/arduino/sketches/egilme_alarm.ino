// Eğilme algılayıcı alarm: eğim sensörü eğilince aktif buzzer öter
const int EGIM = 2;       // eğim sensörünün bir ucu D2, diğer ucu GND (INPUT_PULLUP)
const int BUZZER = 8;     // D8 -> aktif buzzer (+), buzzer (-) -> GND

void setup() {
  pinMode(EGIM, INPUT_PULLUP);   // iç direnç: sensör açıkken HIGH, kapanınca (eğilince) LOW
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

bool alarmVar = false;                  // alarmın şu an çalıp çalmadığını hatırla

void loop() {
  if (digitalRead(EGIM) == LOW) {       // sensör iletiyor = eğildi
    digitalWrite(BUZZER, HIGH);         // aktif buzzer: HIGH verince kendi kendine öter
    if (!alarmVar) {                    // mesajı yalnızca eğilme başladığında bir kez yaz
      Serial.println("Eğildi! Alarm çalıyor.");
      alarmVar = true;
    }
  } else {
    digitalWrite(BUZZER, LOW);
    if (alarmVar) {
      Serial.println("Düz duruyor. Alarm kapalı.");
      alarmVar = false;
    }
  }
  delay(50);
}
