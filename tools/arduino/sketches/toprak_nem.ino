// Toprak nem olcer: sensor degerini yuzdeye cevirip LCD'de gosterir
#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
const int SENSOR = A0;

// Kalibrasyon (sensoru havada/kuru ve suda olcerek bul). Bu sensorde nem artinca okunan deger DUSER.
const int KURU = 921;
const int ISLAK = 256;

void setup() {
  lcd.begin(16, 2);
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(SENSOR);
  int yuzde = map(ham, KURU, ISLAK, 0, 100); // KURU -> %0, ISLAK -> %100
  yuzde = constrain(yuzde, 0, 100);

  lcd.setCursor(0, 0);
  lcd.print("Toprak Nem: %");
  lcd.print(yuzde);
  lcd.print("  ");

  lcd.setCursor(0, 1);
  if (yuzde < 30) {
    lcd.print("Kuru - sula!    ");
  } else if (yuzde < 60) {
    lcd.print("Nemli           ");
  } else {
    lcd.print("Islak           ");
  }

  Serial.print("Ham: ");
  Serial.print(ham);
  Serial.print("  Nem: %");
  Serial.println(yuzde);
  delay(300);
}
