#pragma once
#include "Arduino.h"
class MFRC522 { public:
  struct Uid { byte size; byte uidByte[10]; byte sak; } uid;
  MFRC522(byte, byte); void PCD_Init(); bool PICC_IsNewCardPresent(); bool PICC_ReadCardSerial(); byte PICC_HaltA(); void PCD_StopCrypto1(); };
