// Reaksiyon hız testi: LED yanınca butona ne kadar çabuk bastığını ms olarak ölçer
const int LED = 8;        // D8 -> LED (+) -> 220 ohm -> GND
const int BUTON = 2;      // butonun bir ucu D2, diğer ucu GND (INPUT_PULLUP)
const int BUZZER = 9;     // D9 -> aktif buzzer (+), buzzer (-) -> GND

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  randomSeed(analogRead(A0));        // boştaki A0 pini rastgele gürültü okur: her açılışta farklı bekleme süreleri
}

void loop() {
  digitalWrite(LED, LOW);
  Serial.println("Hazır ol! LED yanınca butona bas.");

  // 2 ile 5 saniye arasında rastgele bekle; bu sırada butona basılırsa erken basmış sayılır
  unsigned long bekleme = random(2000, 5001);
  unsigned long baslangic = millis();
  bool erken = false;
  while (millis() - baslangic < bekleme) {
    if (digitalRead(BUTON) == LOW) {
      erken = true;
      break;
    }
  }

  if (erken) {
    Serial.println("Çok erken bastın! Tekrar deneyelim.");
    while (digitalRead(BUTON) == LOW) {   // butonu bırakmasını bekle
      delay(10);
    }
    delay(1500);
    return;                                // loop() başa döner: yeni tur
  }

  digitalWrite(LED, HIGH);                 // LED yandı: süre ölçümü başlasın
  unsigned long yanmaZamani = millis();
  Serial.println("ŞİMDİ BAS!");

  while (digitalRead(BUTON) == HIGH) {     // butona basılana kadar bekle
  }
  unsigned long tepki = millis() - yanmaZamani;   // basma süresi (ms)

  digitalWrite(BUZZER, HIGH);              // kısa bip
  Serial.print("Tepki süresi: ");
  Serial.print(tepki);
  Serial.println(" ms");
  delay(300);
  digitalWrite(BUZZER, LOW);
  digitalWrite(LED, LOW);

  while (digitalRead(BUTON) == LOW) {      // butonu bırakmasını bekle
    delay(10);
  }
  delay(2000);                             // yeni tura geçmeden önce sonucu okumak için süre
}
