#pragma once
#include "Arduino.h"
struct TinyGPSLocation { bool isValid(); bool isUpdated(); double lat(); double lng(); uint32_t age(); };
struct TinyGPSDate { bool isValid(); uint16_t year(); uint8_t month(); uint8_t day(); };
struct TinyGPSTime { bool isValid(); uint8_t hour(); uint8_t minute(); uint8_t second(); };
struct TinyGPSSpeed { bool isValid(); double kmph(); double mps(); };
struct TinyGPSAltitude { bool isValid(); double meters(); };
struct TinyGPSInteger { bool isValid(); uint32_t value(); };
class TinyGPSPlus { public: bool encode(char); TinyGPSLocation location; TinyGPSDate date; TinyGPSTime time; TinyGPSSpeed speed; TinyGPSAltitude altitude; TinyGPSInteger satellites;
  uint32_t charsProcessed(); uint32_t sentencesWithFix(); uint32_t failedChecksum(); };
