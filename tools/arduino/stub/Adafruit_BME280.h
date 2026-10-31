#pragma once
#include "Arduino.h"
class Adafruit_BME280 { public: Adafruit_BME280(); bool begin(uint8_t = 0x77); float readTemperature(); float readPressure(); float readHumidity(); float readAltitude(float); };
