#pragma once
#include "Arduino.h"
class ESP32PWM { public: static void allocateTimer(int); };
class Servo { public: uint8_t attach(int, int = 500, int = 2400); void setPeriodHertz(int); void write(int); void writeMicroseconds(int); int read(); int readMicroseconds(); bool attached(); void detach(); };
