// Butonlu elektronik piyano: her buton farklı bir nota çalar
const int BUZZER = 8;                          // D8 -> pasif buzzer (+), buzzer (-) -> GND
const int BUTONLAR[] = {2, 3, 4, 5};           // butonların bir ucu bu pinlerde, diğer ucu GND
const int NOTALAR[] = {262, 294, 330, 349};    // Do, Re, Mi, Fa (Hz)
const int BUTON_SAYISI = 4;

void setup() {
  for (int i = 0; i < BUTON_SAYISI; i++) {
    pinMode(BUTONLAR[i], INPUT_PULLUP);        // iç direnç: basılmamışken HIGH, basılınca LOW
  }
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

int oncekiBasilan = -1;                        // son durumu hatırla: Seri Monitör'e yalnızca değişince yaz

void loop() {
  int basilan = -1;                            // -1: hiçbir butona basılmıyor
  for (int i = 0; i < BUTON_SAYISI; i++) {
    if (digitalRead(BUTONLAR[i]) == LOW) {     // LOW = basılı
      basilan = i;
    }
  }

  if (basilan >= 0) {
    tone(BUZZER, NOTALAR[basilan]);            // basılan butonun notasını çal
    if (basilan != oncekiBasilan) {
      Serial.print("Buton ");
      Serial.print(basilan + 1);
      Serial.print(" -> ");
      Serial.print(NOTALAR[basilan]);
      Serial.println(" Hz");
    }
  } else {
    noTone(BUZZER);                            // hiçbir buton basılı değilse sus
  }
  oncekiBasilan = basilan;
  delay(20);
}
