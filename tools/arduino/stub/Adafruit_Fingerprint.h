#pragma once
#include "Arduino.h"
#include "SoftwareSerial.h"
#define FINGERPRINT_OK 0x00
#define FINGERPRINT_NOFINGER 0x02
#define FINGERPRINT_NOTFOUND 0x09
class Adafruit_Fingerprint { public: Adafruit_Fingerprint(SoftwareSerial*); void begin(uint32_t); bool verifyPassword(); uint8_t getImage(); uint8_t image2Tz(uint8_t = 1); uint8_t fingerFastSearch(); uint8_t fingerSearch(uint8_t = 1);
  uint8_t createModel(); uint8_t storeModel(uint16_t); uint8_t deleteModel(uint16_t); uint8_t emptyDatabase(); uint8_t getTemplateCount(); uint16_t fingerID; uint16_t confidence; uint16_t templateCount; };
