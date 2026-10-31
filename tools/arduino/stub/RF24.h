#pragma once
#include "Arduino.h"
#define RF24_PA_MIN 0
#define RF24_PA_LOW 1
#define RF24_PA_HIGH 2
#define RF24_PA_MAX 3
class RF24 { public: RF24(uint16_t, uint16_t); bool begin(); void openWritingPipe(const uint8_t*); void openReadingPipe(uint8_t, const uint8_t*); void setPALevel(uint8_t); void setChannel(uint8_t);
  void startListening(); void stopListening(); bool available(); void read(void*, uint8_t); bool write(const void*, uint8_t); };
