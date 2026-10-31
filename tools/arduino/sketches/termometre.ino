// Dijital termometre: DHT11 sicaklik ve nemi 16x2 LCD'de gosterir
#include <DHT.h>
#include <LiquidCrystal.h>

const int DHT_PIN = 8;          // DHT11 DATA bacagi D8'e bagli
DHT dht(DHT_PIN, DHT11);        // sensor nesnesi: pin ve sensor turu

// LCD pinleri: RS, E, D4, D5, D6, D7 (4 bit baglanti)
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  dht.begin();
  lcd.begin(16, 2);             // 16 sutun, 2 satir
  lcd.setCursor(0, 0);
  lcd.print("Dijital Termo");
}

void loop() {
  float sicaklik = dht.readTemperature();   // santigrat derece
  float nem = dht.readHumidity();           // bagil nem (%)

  if (isnan(sicaklik) || isnan(nem)) {
    // sensor okunamadi (kablo gevsek ya da guc yok)
    lcd.setCursor(0, 0);
    lcd.print("Sensor hatasi!  ");
    lcd.setCursor(0, 1);
    lcd.print("Kablo kontrol    ");
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Sicaklik: ");
    lcd.print(sicaklik, 1);                 // 1 basamak ondalik
    lcd.print(" C  ");                      // ASCII: derece simgesi yok
    lcd.setCursor(0, 1);
    lcd.print("Nem: %");
    lcd.print(nem, 0);                      // ondaliksiz
    lcd.print("        ");                  // eski rakamlari silmek icin bosluk
  }
  delay(2000);                              // DHT11 en sik 1-2 saniyede bir okunur
}
