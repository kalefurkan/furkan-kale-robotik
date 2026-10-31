// GPS konum takip sistemi: NEO-6M NMEA cumlelerini gonderir, TinyGPS++ ayristirir, LCD'de enlem ve boylam gosterilir
#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <LiquidCrystal.h>

SoftwareSerial gpsSerial(8, 9);   // RX = D8 (NEO-6M TX'ten gelir), TX = D9 (kullanilmiyor)
TinyGPSPlus gps;
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

unsigned long sonGuncelleme = 0;

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);            // NEO-6M varsayilan hizi 9600
  lcd.begin(16, 2);
  lcd.print("GPS araniyor");
}

void loop() {
  // gelen NMEA karakterlerini TinyGPS++'a ver
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  if (millis() - sonGuncelleme >= 1000) {   // saniyede bir ekrani guncelle
    sonGuncelleme = millis();
    lcd.clear();
    // isValid() bir kez konum alindiktan sonra hep true kalir; konum guncel mi diye age() de bakilir
    if (gps.location.isValid() && gps.location.age() < 3000) {
      lcd.setCursor(0, 0);
      lcd.print("Enlem ");
      lcd.print(gps.location.lat(), 4);
      lcd.setCursor(0, 1);
      lcd.print("Boylam ");
      lcd.print(gps.location.lng(), 4);

      Serial.print("Konum: ");
      Serial.print(gps.location.lat(), 6);
      Serial.print(", ");
      Serial.print(gps.location.lng(), 6);
      Serial.print(" uydu=");
      Serial.print(gps.satellites.value());
      Serial.print(" yukseklik=");
      Serial.print(gps.altitude.meters(), 0);
      Serial.print(" m hiz=");
      Serial.print(gps.speed.kmph(), 0);
      Serial.println(" km/s");
    } else {
      lcd.setCursor(0, 0);
      lcd.print("Konum yok");
      lcd.setCursor(0, 1);
      lcd.print("Uydu bekleniyor");
      Serial.println("Konum yok: uydu bekleniyor");
    }
  }
}
