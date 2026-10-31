// Işıkla kontrol edilen buzzer (theremin): ortam ışığına göre buzzerın sesi (frekansı) değişir
const int LDR = A0;          // 5V - LDR - A0 - 10k - GND (gerilim bölücü)
const int BUZZER = 8;        // D8 -> pasif buzzer (+), buzzer (-) -> GND

// Kendi ortamına göre ayarla: Seri Monitör'de karanlıkta ve en aydınlıkta okuduğun değerler
const int KARANLIK = 50;
const int AYDINLIK = 900;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int isik = analogRead(LDR);                                  // 0 ... 1023, aydınlandıkça artar
  int frekans = map(isik, KARANLIK, AYDINLIK, 200, 2000);      // ışığı 200-2000 Hz aralığına çevir
  frekans = constrain(frekans, 200, 2000);                     // aralığın dışına taşmayı engelle

  tone(BUZZER, frekans);                                       // buzzer bu frekansta öter

  Serial.print("Işık: ");
  Serial.print(isik);
  Serial.print("  Frekans: ");
  Serial.print(frekans);
  Serial.println(" Hz");
  delay(100);
}
