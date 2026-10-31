// HC-SR04 ultrasonik sensör ile mesafe ölçer
const int TRIG = 9;        // tetik (trigger) pini: ses darbesini başlatır
const int ECHO = 10;       // yankı (echo) pini: darbenin geri dönüş süresini verir

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  // 1) 10 mikrosaniyelik tetik darbesi gönder
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  // 2) ECHO pininin HIGH kaldığı süreyi (mikrosaniye) ölç
  long sure = pulseIn(ECHO, HIGH);

  // 3) Ses yaklaşık 0.0343 cm/µs hızla gider; gidiş-dönüş olduğu için ikiye böleriz
  float mesafe = sure * 0.0343 / 2;

  if (sure == 0) {
    Serial.println("Nesne algılanamadı (menzil dışı)");
  } else {
    Serial.print("Mesafe: ");
    Serial.print(mesafe);
    Serial.println(" cm");
  }
  delay(500);
}
