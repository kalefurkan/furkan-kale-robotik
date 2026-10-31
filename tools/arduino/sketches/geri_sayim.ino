// Dijital geri sayim sayaci: keypad ile saniye gir, # ile baslat, * ile sil; sure bitince buzzer oter
#include <Keypad.h>
#include <LiquidCrystal.h>

const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {10, 9, 8, 7};      // R1..R4
byte sutunPinleri[SUTUN] = {A0, A1, A2, A3};   // C1..C4 (analog pinler dijital kullanilir)
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
const int BUZZER = 6;                          // aktif buzzer

long girilen = 0;                              // klavyeden girilen saniye
int basamak = 0;                               // girilen rakam sayisi (en fazla 4)

void yaz2(int sayi) {                          // iki basamakli yaz: 05
  if (sayi < 10) lcd.print("0");
  lcd.print(sayi);
}

void sureyiGoster(long sn, int mod) {      // mod: 0 = giris, 1 = geri sayim, 2 = bitti
  lcd.setCursor(0, 0);
  if (mod == 0) {
    lcd.print("Sure gir(sn) #:  ");
  } else if (mod == 1) {
    lcd.print("Kalan sure:     ");
  } else {
    lcd.print("SURE DOLDU!     ");
  }
  lcd.setCursor(0, 1);
  yaz2(sn / 60);
  lcd.print(":");
  yaz2(sn % 60);
  lcd.print("          ");
}

void bip(int ms) {
  digitalWrite(BUZZER, HIGH);
  delay(ms);
  digitalWrite(BUZZER, LOW);
}

void sayimiYap(long toplam) {
  unsigned long baslangic = millis();
  long onceki = -1;
  while (true) {
    long gecen = (millis() - baslangic) / 1000;
    long kalan = toplam - gecen;
    if (kalan <= 0) {
      break;
    }
    if (kalan != onceki) {                     // ekrani yalnizca saniye degisince guncelle
      sureyiGoster(kalan, 1);
      onceki = kalan;
    }
    if (tusTakimi.getKey() == '*') {           // sayim sirasinda * = iptal
      return;
    }
  }
  sureyiGoster(0, 2);
  for (int i = 0; i < 3; i++) {                // 3 bip
    bip(300);
    delay(200);
  }
}

void setup() {
  pinMode(BUZZER, OUTPUT);
  lcd.begin(16, 2);
  sureyiGoster(0, 0);
}

void loop() {
  char tus = tusTakimi.getKey();
  if (tus == NO_KEY) {
    return;
  }
  if (tus >= '0' && tus <= '9') {
    if (basamak < 4) {
      girilen = girilen * 10 + (tus - '0');    // rakami sayinin sagina ekle
      basamak++;
    }
    sureyiGoster(girilen, 0);
  } else if (tus == '*') {
    girilen = 0;
    basamak = 0;
    sureyiGoster(0, 0);
  } else if (tus == '#' && girilen > 0) {
    sayimiYap(girilen);
    girilen = 0;
    basamak = 0;
    sureyiGoster(0, 0);
  }
}
