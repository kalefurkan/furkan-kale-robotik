// Elektronik terazi: HX711 + yuk hucresi agirligi olcer, LCD'de gram olarak gosterir
#include <HX711.h>
#include <LiquidCrystal.h>

const int DT_PIN = A1;
const int SCK_PIN = A0;
const float OLCEK = 420.0;     // kalibrasyon: ham deger / gram (kendi yuk hucrene gore bulunur)

HX711 terazi;
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.print("Terazi hazir...");
  terazi.begin(DT_PIN, SCK_PIN);
  terazi.set_scale(OLCEK);     // ham degeri grama cevirir
  terazi.tare();               // bos terazide sifirla (dara)
  lcd.clear();
  lcd.print("Agirlik:");
  Serial.println("Terazi hazir: tabla bos olmali, dara alindi");
}

void loop() {
  float gram = terazi.get_units(5);   // 5 olcumun ortalamasi
  if (gram < 0.5 && gram > -0.5) {
    gram = 0;                          // kucuk gurultuyu sifir say
  }
  lcd.setCursor(0, 1);
  lcd.print(gram, 1);
  lcd.print(" g       ");
  Serial.print("Agirlik: ");
  Serial.print(gram, 1);
  Serial.println(" g");
  delay(500);
}
