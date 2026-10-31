// RFID kartli kapi sistemi: RC522 kart UID'sini okur, kayitli kart servoyu acar (kapi kilidi)
#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>

const int SS_PIN = 10;     // RC522 SDA (SS)
const int RST_PIN = 9;
const int SERVO_PIN = 6;

MFRC522 rfid(SS_PIN, RST_PIN);
Servo kapi;

// kayitli kartin UID'si (4 bayt)
byte kayitli[4] = {0xA1, 0xB2, 0xC3, 0xD4};

bool kayitliMi() {
  if (rfid.uid.size != 4) {
    return false;
  }
  for (byte i = 0; i < 4; i++) {
    if (rfid.uid.uidByte[i] != kayitli[i]) {
      return false;
    }
  }
  return true;
}

void setup() {
  Serial.begin(9600);
  SPI.begin();             // SPI: MOSI D11, MISO D12, SCK D13
  rfid.PCD_Init();
  kapi.attach(SERVO_PIN);
  kapi.write(0);           // kapi kapali
  Serial.println("Karti okutun");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  Serial.print("UID:");
  for (byte i = 0; i < rfid.uid.size; i++) {
    Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(rfid.uid.uidByte[i], HEX);
  }
  Serial.println();

  if (kayitliMi()) {
    Serial.println("Kart kabul edildi: kapi acik");
    kapi.write(90);
    delay(3000);           // 3 saniye acik kalir
    kapi.write(0);
    Serial.println("Kapi kapandi");
  } else {
    Serial.println("Kart reddedildi");
  }

  rfid.PICC_HaltA();       // karti durdur: ayni kart tekrar tekrar okunmasin
  rfid.PCD_StopCrypto1();
}
