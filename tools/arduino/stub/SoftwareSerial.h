#pragma once
#include "Arduino.h"
class SoftwareSerial { public: SoftwareSerial(uint8_t, uint8_t); void begin(long); int available(); int read(); int peek(); size_t write(uint8_t); bool listen(); bool isListening();
  template <typename T> void print(T, int = 10); template <typename T> void println(T, int = 10); void println(); };
