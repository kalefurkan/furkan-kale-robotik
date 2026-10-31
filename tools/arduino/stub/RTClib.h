#pragma once
#include "Arduino.h"
class DateTime { public: DateTime(uint32_t = 0); DateTime(uint16_t, uint8_t, uint8_t, uint8_t = 0, uint8_t = 0, uint8_t = 0); DateTime(const char*, const char*);
  uint16_t year() const; uint8_t month() const; uint8_t day() const; uint8_t hour() const; uint8_t minute() const; uint8_t second() const; uint8_t dayOfTheWeek() const; uint32_t unixtime() const; };
class RTC_DS3231 { public: bool begin(); DateTime now(); void adjust(const DateTime&); bool lostPower(); float getTemperature(); };
