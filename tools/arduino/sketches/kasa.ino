// Elektronik kasa: dogru sifre (1234#) kilidi (servo) acar; yanlis sifrede buzzer oter, 3 yanlista uzun alarm
#include <Keypad.h>
#include <Servo.h>

const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};       // R1..R4
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};       // C1..C4
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);

const int SERVO_PIN = 10;
const int BUZZER = 11;                         // aktif buzzer
const int KILITLI_ACI = 0;
const int ACIK_ACI = 90;

Servo kilit;
const int SIFRE_UZUNLUK = 4;
const char DOGRU_SIFRE[4] = {'1', '2', '3', '4'};
char girilen[4];
int girilenSayi = 0;
int yanlisSayisi = 0;

void bip(int sureMs) {
  digitalWrite(BUZZER, HIGH);
  delay(sureMs);
  digitalWrite(BUZZER, LOW);
}

bool sifreDogruMu() {
  if (girilenSayi != SIFRE_UZUNLUK) {
    return false;
  }
  for (int i = 0; i < SIFRE_UZUNLUK; i++) {
    if (girilen[i] != DOGRU_SIFRE[i]) {
      return false;
    }
  }
  return true;
}

void setup() {
  pinMode(BUZZER, OUTPUT);
  kilit.attach(SERVO_PIN);
  kilit.write(KILITLI_ACI);
  Serial.begin(9600);
  Serial.println("Kasa kilitli. Sifreyi girip # tusuna bas.");
}

void loop() {
  char tus = tusTakimi.getKey();
  if (tus == NO_KEY) {
    return;
  }

  if (tus == '#') {
    if (sifreDogruMu()) {
      Serial.println("Sifre dogru: kilit acildi");
      yanlisSayisi = 0;
      bip(80);
      delay(80);
      bip(80);                                 // iki kisa bip = basarili
      kilit.write(ACIK_ACI);
      delay(4000);                             // kilit 4 saniye acik
      kilit.write(KILITLI_ACI);
      Serial.println("Kasa tekrar kilitlendi");
    } else {
      yanlisSayisi++;
      Serial.print("Yanlis sifre! Deneme: ");
      Serial.println(yanlisSayisi);
      if (yanlisSayisi >= 3) {
        Serial.println("3 yanlis deneme: ALARM");
        bip(2000);                             // uzun alarm
        yanlisSayisi = 0;
      } else {
        bip(500);                              // yanlis sifre = bir uzun bip
      }
    }
    girilenSayi = 0;
  } else if (tus == '*') {
    girilenSayi = 0;                           // girileni sil
    Serial.println("Girilen silindi");
  } else if (girilenSayi < SIFRE_UZUNLUK) {
    girilen[girilenSayi] = tus;
    girilenSayi++;
    bip(30);                                   // tus sesi
  }
}
