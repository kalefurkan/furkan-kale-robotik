// NFC kontrollu erisim sistemi: PN532 (I2C) + 16x2 LCD
// Kart okununca UID yetkili listesiyle karsilastirilir; sonuc LCD'ye ve Seri Monitor'e yazilir.
#include <Wire.h>
#include <Adafruit_PN532.h>
#include <LiquidCrystal.h>

const int IRQ_PIN = 6;
const int RST_PIN = 7;
Adafruit_PN532 nfc(IRQ_PIN, RST_PIN);
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Yetkili kartlarin 4 baytlik UID'leri (kendi kartlarinin UID'sini once Seri Monitor'den ogren)
byte YETKILI[2][4] = {
  {0xA1, 0xB2, 0xC3, 0xD4},    // kart 0: Ali
  {0xDE, 0xAD, 0xBE, 0xEF}     // kart 1: Ayse
};

uint8_t uid[7];                // okunan kartin UID baytlari
uint8_t uzunluk = 0;           // UID uzunlugu (4 ya da 7)

int kartBul() {                // yetkili kart numarasi, yoksa -1
  if (uzunluk != 4) {
    return -1;
  }
  for (int k = 0; k < 2; k++) {
    bool ayni = true;
    for (int i = 0; i < 4; i++) {
      if (uid[i] != YETKILI[k][i]) {
        ayni = false;
      }
    }
    if (ayni) {
      return k;
    }
  }
  return -1;
}

void uidYaz() {                // her bayti 2 hane hex yazar
  for (uint8_t i = 0; i < uzunluk; i++) {
    if (uid[i] < 16) {
      Serial.print("0");
    }
    Serial.print(uid[i], HEX);
  }
}

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.print("NFC erisim");
  nfc.begin();
  uint32_t surum = nfc.getFirmwareVersion();
  if (!surum) {
    lcd.setCursor(0, 1);
    lcd.print("PN532 YOK");
    Serial.println("PN532 bulunamadi: kablolari kontrol et");
    while (true) {
      delay(1000);
    }
  }
  nfc.SAMConfig();
  Serial.print("PN532 hazir, yazilim v");
  Serial.println((surum >> 16) & 0xFF);
  lcd.clear();
  lcd.print("Karti yaklastir");
}

void loop() {
  uzunluk = 0;
  bool okundu = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uzunluk, 300);
  if (!okundu) {
    return;                      // kart yok, tekrar dene
  }
  Serial.print("Kart UID: ");
  uidYaz();
  int kart = kartBul();
  lcd.clear();
  if (kart == 0) {
    Serial.println("  -> ERISIM VAR (Ali)");
    lcd.print("ERISIM VAR");
    lcd.setCursor(0, 1);
    lcd.print("Hos geldin Ali");
  } else if (kart == 1) {
    Serial.println("  -> ERISIM VAR (Ayse)");
    lcd.print("ERISIM VAR");
    lcd.setCursor(0, 1);
    lcd.print("Hos geldin Ayse");
  } else {
    Serial.println("  -> ERISIM YOK");
    lcd.print("ERISIM YOK");
    lcd.setCursor(0, 1);
    lcd.print("Yetkisiz kart");
  }
  delay(2000);
  lcd.clear();
  lcd.print("Karti yaklastir");
}
