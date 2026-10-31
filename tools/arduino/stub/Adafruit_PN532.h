#pragma once
#include "Arduino.h"
#define PN532_MIFARE_ISO14443A 0x00
class Adafruit_PN532 { public: Adafruit_PN532(uint8_t, uint8_t); void begin(); uint32_t getFirmwareVersion(); bool SAMConfig(); bool readPassiveTargetID(uint8_t, uint8_t *, uint8_t *, uint16_t = 0); };
