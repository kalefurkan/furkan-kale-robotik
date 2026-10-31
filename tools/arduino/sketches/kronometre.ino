// Elektronik kronometre: millis() ile sure olcer, 2 buton (baslat/durdur ve sifirla), LCD'de dakika:saniye.onda
#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

const int BTN_BASLAT = 7;        // baslat / durdur (INPUT_PULLUP: basilinca LOW)
const int BTN_SIFIRLA = 6;       // sifirla

bool calisiyor = false;
unsigned long baslangic = 0;     // son baslatmanin millis() degeri
unsigned long biriken = 0;       // durdurulana kadar biriken sure (ms)
int oncekiBaslat = HIGH;
int oncekiSifirla = HIGH;

void sureyiYaz() {
  unsigned long ms = biriken;
  if (calisiyor) {
    ms = biriken + (millis() - baslangic);
  }
  unsigned long toplamSn = ms / 1000;
  int dakika = toplamSn / 60;
  int saniye = toplamSn % 60;
  int onda = (ms % 1000) / 100;

  lcd.setCursor(0, 1);
  if (dakika < 10) lcd.print("0");
  lcd.print(dakika);
  lcd.print(":");
  if (saniye < 10) lcd.print("0");
  lcd.print(saniye);
  lcd.print(".");
  lcd.print(onda);
  lcd.print("        ");
}

void durumuYaz() {
  lcd.setCursor(0, 0);
  if (calisiyor) {
    lcd.print("Kronometre: ACIK");
  } else {
    lcd.print("Kronometre: DUR ");
  }
}

void setup() {
  pinMode(BTN_BASLAT, INPUT_PULLUP);
  pinMode(BTN_SIFIRLA, INPUT_PULLUP);
  lcd.begin(16, 2);
  durumuYaz();
  sureyiYaz();
}

void loop() {
  int baslat = digitalRead(BTN_BASLAT);
  int sifirla = digitalRead(BTN_SIFIRLA);

  if (oncekiBaslat == HIGH && baslat == LOW) {      // baslat/durdur butonuna yeni basildi
    if (calisiyor) {
      biriken = biriken + (millis() - baslangic);   // durdururken gecen sureyi ekle
      calisiyor = false;
    } else {
      baslangic = millis();
      calisiyor = true;
    }
    durumuYaz();
    delay(30);                                      // buton titresimini atla
  }
  if (oncekiSifirla == HIGH && sifirla == LOW) {    // sifirla
    biriken = 0;
    baslangic = millis();
    calisiyor = false;
    durumuYaz();
    delay(30);
  }
  oncekiBaslat = baslat;
  oncekiSifirla = sifirla;

  sureyiYaz();
  delay(50);                                        // ekrani saniyede ~20 kez guncelle
}
