// Mini elektronik sayaç: butona her basışta sayı artar ve 16x2 LCD'de görünür
#include <LiquidCrystal.h>

// LCD pinleri: RS, E, D4, D5, D6, D7 (4 bit bağlantı)
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

const int BUTON = 7;            // butonun bir ucu D7, diğer ucu GND (INPUT_PULLUP)
int sayac = 0;
int oncekiDurum = HIGH;         // butonun önceki durumu: basılmamışken HIGH

void ekranaYaz() {
  lcd.setCursor(0, 0);          // 1. satır, 1. sütun
  lcd.print("Mini Sayac");
  lcd.setCursor(0, 1);          // 2. satır, 1. sütun
  lcd.print("Sayi: ");
  lcd.print(sayac);
  lcd.print("     ");           // eski rakamları silmek için sonuna boşluk yaz
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  lcd.begin(16, 2);             // 16 sütun, 2 satırlık ekran
  ekranaYaz();
}

void loop() {
  int durum = digitalRead(BUTON);

  // HIGH -> LOW geçişi = butona yeni basıldı (basılı tutmak tekrar saymaz)
  if (oncekiDurum == HIGH && durum == LOW) {
    sayac++;
    if (sayac > 9999) {
      sayac = 0;                // ekran taşmasın
    }
    ekranaYaz();
    delay(50);                  // buton titreşimini (debounce) atla
  }
  oncekiDurum = durum;
}
