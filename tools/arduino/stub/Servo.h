#pragma once
#include "Arduino.h"
class Servo { public: uint8_t attach(int, int = 544, int = 2400); void write(int); void writeMicroseconds(int); int read(); int readMicroseconds(); bool attached(); void detach(); };
