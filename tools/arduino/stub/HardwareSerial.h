#pragma once
#include "esp32_ortak.h"
#define SERIAL_8N1 0x800001c
struct HardwareSerialEsp { void begin(unsigned long, uint32_t = SERIAL_8N1, int = -1, int = -1); int available(); int read(); String readStringUntil(char); };
extern HardwareSerialEsp Serial1;
extern HardwareSerialEsp Serial2;
