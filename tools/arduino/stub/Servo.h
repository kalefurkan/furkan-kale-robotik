#pragma once
#include "Arduino.h"
class Servo { public: uint8_t attach(int); void write(int); int read(); void detach(); };
