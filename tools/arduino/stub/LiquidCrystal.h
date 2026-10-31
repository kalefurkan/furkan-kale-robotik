#pragma once
#include "Arduino.h"
class LiquidCrystal {
 public:
  LiquidCrystal(uint8_t, uint8_t, uint8_t, uint8_t, uint8_t, uint8_t);
  void begin(uint8_t, uint8_t); void clear(); void home(); void setCursor(uint8_t, uint8_t);
  template <typename T> void print(T, int = 10);
};
