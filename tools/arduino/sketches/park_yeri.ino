// Akilli park yeri gostergesi: 3 IR sensor park yerlerini izler, bos yer sayisi LCD'de, bos yerlerin LED'i yanar
#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

const int YER_SAYISI = 3;
const int irPinleri[YER_SAYISI] = {6, 7, 8};    // IR sensor cikislari (arac varken LOW)
const int ledPinleri[YER_SAYISI] = {9, 10, 13}; // yesil LED: yer bossa yanar

void setup() {
  for (int i = 0; i < YER_SAYISI; i++) {
    pinMode(irPinleri[i], INPUT);
    pinMode(ledPinleri[i], OUTPUT);
  }
  lcd.begin(16, 2);
}

void loop() {
  int bos = 0;
  lcd.setCursor(0, 1);
  for (int i = 0; i < YER_SAYISI; i++) {
    bool dolu = (digitalRead(irPinleri[i]) == LOW);   // engel varsa LOW = yer dolu
    digitalWrite(ledPinleri[i], !dolu);               // bos yerin LED'i yanar
    if (!dolu) {
      bos++;
    }
    lcd.print("P");
    lcd.print(i + 1);
    lcd.print(":");
    if (dolu) {
      lcd.print("D ");
    } else {
      lcd.print("B ");
    }
  }
  lcd.print("     ");

  lcd.setCursor(0, 0);
  lcd.print("Bos: ");
  lcd.print(bos);
  lcd.print("/");
  lcd.print(YER_SAYISI);
  lcd.print("       ");
  delay(100);
}
