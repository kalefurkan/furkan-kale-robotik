#pragma once
#include "Arduino.h"
struct TwoWire { void begin(); void beginTransmission(int); size_t write(int); int endTransmission(bool stop = true); int requestFrom(int, int, bool stop = true); int available(); int read(); };
extern TwoWire Wire;
