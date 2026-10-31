// Enerji tuketim olcer: ACS712 (5 A) akimi olcer, sabit gerilimle gucu hesaplar, harcanan enerjiyi toplar
// Dusuk gerilimli (ornegin 5 V) bir devreyi olcmek icin tasarlandi; sebeke gerilimine (220 V) ASLA baglanmaz
#include <LiquidCrystal.h>

const int AKIM_PIN = A0;
const float DUYARLILIK = 0.185;   // ACS712-05B: 185 mV / A
const float GERILIM = 5.0;        // olculen devrenin gerilimi (V), sabit kabul edilir

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

float ofsetV = 2.5;               // akim yokken sensor cikisi (kalibrasyonla bulunur)
float toplamWh = 0;               // harcanan enerji (Wh)
unsigned long sonZaman = 0;

float gerilimOku() {              // 20 okumanin ortalamasi (gurultuyu azaltir)
  long toplam = 0;
  for (int i = 0; i < 20; i++) {
    toplam += analogRead(AKIM_PIN);
  }
  return (toplam / 20.0) * 5.0 / 1024.0;
}

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.print("Kalibrasyon...");
  delay(500);
  ofsetV = gerilimOku();          // yuk bagli degilken: sifir akim noktasi
  lcd.clear();
  sonZaman = millis();
  Serial.print("Sifir akim cikisi (V): ");
  Serial.println(ofsetV, 3);
}

void loop() {
  float v = gerilimOku();
  float akim = (v - ofsetV) / DUYARLILIK;      // amper
  if (akim < 0.05 && akim > -0.05) {
    akim = 0;                                   // kucuk gurultuyu sifir say
  }
  float guc = abs(akim) * GERILIM;              // watt = amper x volt

  unsigned long simdi = millis();
  toplamWh += guc * (simdi - sonZaman) / 3600000.0;   // watt x saat
  sonZaman = simdi;

  lcd.setCursor(0, 0);
  lcd.print("Akim: ");
  lcd.print(akim, 2);
  lcd.print(" A    ");
  lcd.setCursor(0, 1);
  lcd.print(guc, 1);
  lcd.print("W E:");
  lcd.print(toplamWh, 3);
  lcd.print("Wh  ");

  Serial.print("Akim=");
  Serial.print(akim, 2);
  Serial.print(" A, Guc=");
  Serial.print(guc, 1);
  Serial.print(" W, Enerji=");
  Serial.print(toplamWh, 4);
  Serial.println(" Wh");
  delay(500);
}
