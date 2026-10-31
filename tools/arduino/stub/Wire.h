#pragma once
#include "Arduino.h"
struct TwoWire { void begin(); void beginTransmission(int); size_t write(int); int endTransmission(); int requestFrom(int, int); int available(); int read(); };
extern TwoWire Wire;
