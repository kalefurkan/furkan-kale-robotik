// Dokunmatik LED kontrolü: TTP223 modülüne dokunulunca LED yanar, parmak çekilince söner
const int DOKUNMATIK = 2;   // TTP223 OUT bacağı D2'ye bağlı
const int LED = 8;          // D8 -> LED (+) -> 220 ohm direnç -> GND

void setup() {
  pinMode(DOKUNMATIK, INPUT);   // modül kendi çıkışını sürer: dokunulunca HIGH, değilken LOW
  pinMode(LED, OUTPUT);
}

void loop() {
  if (digitalRead(DOKUNMATIK) == HIGH) {   // dokunuluyor mu?
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
}
