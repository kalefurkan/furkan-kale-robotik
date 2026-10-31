// Sifreli kapi kilidi: 4x4 tus takimi + LCD + servo. Dogru sifre (1234#) servoyu acar.
#include <Keypad.h>
#include <LiquidCrystal.h>
#include <Servo.h>

// --- tus takimi ---
const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {10, 9, 8, 7};      // R1..R4
byte sutunPinleri[SUTUN] = {A0, A1, A2, A3};   // C1..C4 (analog pinler dijital olarak kullanilir)
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);

// --- LCD ve servo ---
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
Servo kilit;
const int SERVO_PIN = 6;
const int KILITLI_ACI = 0;
const int ACIK_ACI = 90;

// --- sifre ---
const int SIFRE_UZUNLUK = 4;
const char DOGRU_SIFRE[4] = {'1', '2', '3', '4'};
char girilen[4];
int girilenSayi = 0;

void girisEkrani() {
  lcd.setCursor(0, 0);
  lcd.print("Sifre giriniz:  ");
  lcd.setCursor(0, 1);
  lcd.print("                ");
  lcd.setCursor(0, 1);
  for (int i = 0; i < girilenSayi; i++) {
    lcd.print("*");                      // sifreyi ekranda gizle
  }
}

bool sifreDogruMu() {
  if (girilenSayi != SIFRE_UZUNLUK) {
    return false;                       // eksik ya da fazla tus
  }
  for (int i = 0; i < SIFRE_UZUNLUK; i++) {
    if (girilen[i] != DOGRU_SIFRE[i]) {
      return false;
    }
  }
  return true;
}

void setup() {
  kilit.attach(SERVO_PIN);
  kilit.write(KILITLI_ACI);
  lcd.begin(16, 2);
  girisEkrani();
}

void loop() {
  char tus = tusTakimi.getKey();        // basilan tus; basis yoksa NO_KEY
  if (tus == NO_KEY) {
    return;
  }

  if (tus == '#') {                     // # = onayla
    if (sifreDogruMu()) {
      lcd.setCursor(0, 0);
      lcd.print("Sifre dogru!    ");
      lcd.setCursor(0, 1);
      lcd.print("Kapi acik       ");
      kilit.write(ACIK_ACI);
      delay(3000);                      // kapi 3 saniye acik kalir
      kilit.write(KILITLI_ACI);
    } else {
      lcd.setCursor(0, 0);
      lcd.print("Yanlis sifre!   ");
      lcd.setCursor(0, 1);
      lcd.print("Tekrar deneyin  ");
      delay(1500);
    }
    girilenSayi = 0;
    girisEkrani();
  } else if (tus == '*') {              // * = girileni sil
    girilenSayi = 0;
    girisEkrani();
  } else if (girilenSayi < SIFRE_UZUNLUK) {
    girilen[girilenSayi] = tus;         // yeni tusu kaydet
    girilenSayi++;
    girisEkrani();
  }
}
