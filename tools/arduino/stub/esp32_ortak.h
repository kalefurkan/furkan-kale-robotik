#pragma once
#include "Arduino.h"
class String {
 public:
  String(); String(const char *); String(int); String(unsigned long); String(long); String(float, int = 2); String(double, int = 2);
  String &operator+=(const String &); String &operator+=(const char *); String &operator+=(char); String operator+(const String &) const;
  int toInt() const; bool startsWith(const char *) const; String substring(unsigned int) const; float toFloat() const; unsigned int length() const; const char *c_str() const; bool operator==(const char *) const;
};
#define ADC_11db 3
void analogSetPinAttenuation(uint8_t, int); uint32_t analogReadMilliVolts(uint8_t);
#define LED_BUILTIN_ESP 2
