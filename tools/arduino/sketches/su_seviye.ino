// Su seviye olcer: su seviye sensorunun analog degerini yuzdeye cevirip LCD'de gosterir
#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
const int SENSOR = A0;

// Kalibrasyon: sensor kuruyken ve tamamen suya batikken okunan degerler (kendi sensorunle olc)
const int KURU = 0;
const int DOLU = 696;

void setup() {
  lcd.begin(16, 2);
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(SENSOR);
  int yuzde = map(ham, KURU, DOLU, 0, 100);
  yuzde = constrain(yuzde, 0, 100);          // olcum sinirlarin disina tasarsa kirp

  lcd.setCursor(0, 0);
  lcd.print("Su Seviyesi:%");
  lcd.print(yuzde);
  lcd.print("   ");

  // ikinci satirda 16 karakterlik cubuk
  int dolu = map(yuzde, 0, 100, 0, 16);
  lcd.setCursor(0, 1);
  for (int i = 0; i < 16; i++) {
    if (i < dolu) {
      lcd.print("#");
    } else {
      lcd.print("-");
    }
  }

  Serial.print("Ham: ");
  Serial.print(ham);
  Serial.print("  Seviye: %");
  Serial.println(yuzde);
  delay(300);
}
