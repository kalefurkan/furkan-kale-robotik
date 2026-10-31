// RFID personel giris sistemi: RC522 karti okur, LCD'de kisi adini gosterir, buzzer ile bildirir
#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal.h>

const int SS_PIN = 10;
const int RST_PIN = 9;
const int BUZZER_PIN = 8;

MFRC522 rfid(SS_PIN, RST_PIN);
LiquidCrystal lcd(2, 3, 4, 5, 6, 7);   // RS, E, D4, D5, D6, D7 (D11-D13 SPI icin ayrildi)

// kayitli kartlar: her kart 4 bayt; 0-3 = Ahmet, 4-7 = Zeynep
byte kayitli[8] = {0xA1, 0xB2, 0xC3, 0xD4, 0x5A, 0x6B, 0x7C, 0x8D};

bool kartEslesti(int kisi) {            // kisi 0 = Ahmet, 1 = Zeynep
  if (rfid.uid.size != 4) {
    return false;
  }
  for (int i = 0; i < 4; i++) {
    if (rfid.uid.uidByte[i] != kayitli[kisi * 4 + i]) {
      return false;
    }
  }
  return true;
}

void bip(int kez) {
  for (int i = 0; i < kez; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(120);
    digitalWrite(BUZZER_PIN, LOW);
    delay(120);
  }
}

void beklemeEkrani() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Personel Giris");
  lcd.setCursor(0, 1);
  lcd.print("Karti okutun");
}

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  lcd.begin(16, 2);
  beklemeEkrani();
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  Serial.print("UID:");
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      lcd.print("0");                    // tek haneli baytin onune 0 koy
      Serial.print(" 0");
    } else {
      Serial.print(" ");
    }
    lcd.print(rfid.uid.uidByte[i], HEX);
    Serial.print(rfid.uid.uidByte[i], HEX);
  }
  Serial.println();

  lcd.setCursor(0, 1);
  if (kartEslesti(0)) {
    lcd.print("Giris: Ahmet");
    Serial.println("Giris: Ahmet");
    bip(1);
  } else if (kartEslesti(1)) {
    lcd.print("Giris: Zeynep");
    Serial.println("Giris: Zeynep");
    bip(1);
  } else {
    lcd.print("Giris reddedildi");
    Serial.println("Giris reddedildi");
    bip(3);
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(1500);                           // sonucu birkac saniye goster
  beklemeEkrani();
}
