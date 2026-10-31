// Akilli gece lambasi: ortam karardikca RGB LED'in parlakligi artar
const int LDR_PIN = A0;         // LDR + 10k direnc gerilim bolucusunun orta noktasi
const int KIRMIZI = 9;          // PWM pinleri (analogWrite)
const int YESIL = 10;
const int MAVI = 11;

const int KARANLIK = 100;       // bu degerin altinda tam karanlik (olculen degerle degistir)
const int AYDINLIK = 800;       // bu degerin ustunde lamba tamamen soner

void setup() {
  pinMode(KIRMIZI, OUTPUT);
  pinMode(YESIL, OUTPUT);
  pinMode(MAVI, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int isik = analogRead(LDR_PIN);                   // 0-1023: yuksek = aydinlik (LDR 5V tarafinda)
  isik = constrain(isik, KARANLIK, AYDINLIK);
  int parlaklik = map(isik, KARANLIK, AYDINLIK, 255, 0);   // karardikca parlaklik artar

  // sicak beyaz isik: kirmizi tam, yesil biraz, mavi az
  analogWrite(KIRMIZI, parlaklik);
  analogWrite(YESIL, parlaklik / 2);
  analogWrite(MAVI, parlaklik / 5);

  Serial.print("Isik: ");
  Serial.print(analogRead(LDR_PIN));
  Serial.print("  Parlaklik: ");
  Serial.println(parlaklik);
  delay(200);
}
