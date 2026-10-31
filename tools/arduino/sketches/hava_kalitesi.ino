// Hava kalitesi olcer: MQ-135 gaz sensoru analog degerini LCD'de gosterir ve IYI / ORTA / KOTU diye siniflar
#include <LiquidCrystal.h>

const int AO_PIN = A0;        // MQ-135 analog cikis
const int DO_PIN = 7;         // MQ-135 dijital cikis (kart uzerindeki esik asilinca LOW)
const int ORTA_ESIK = 400;    // bu degerin ustu: ORTA
const int KOTU_ESIK = 700;    // bu degerin ustu: KOTU

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  pinMode(DO_PIN, INPUT);
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.print("MQ-135 isiniyor");
  delay(2000);                // gercek sensor 24 saate kadar isinma ister; burada kisa bekleme
  lcd.clear();
}

void loop() {
  int deger = analogRead(AO_PIN);            // 0-1023: gaz arttikca yukselir

  lcd.setCursor(0, 0);
  lcd.print("Gaz: ");
  lcd.print(deger);
  lcd.print("     ");
  lcd.setCursor(0, 1);
  lcd.print("Hava: ");
  if (deger < ORTA_ESIK) {
    lcd.print("IYI    ");
  } else if (deger < KOTU_ESIK) {
    lcd.print("ORTA   ");
  } else {
    lcd.print("KOTU   ");
  }

  Serial.print("AO=");
  Serial.print(deger);
  Serial.print(" DO=");
  Serial.println(digitalRead(DO_PIN));
  delay(500);
}
