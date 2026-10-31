#pragma once
#include "Arduino.h"
struct SPIClass { void begin(); void begin(int, int, int, int); };
extern SPIClass SPI;
