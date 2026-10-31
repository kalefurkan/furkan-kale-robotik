#pragma once
#include "Arduino.h"
#include "OneWire.h"
#define DEVICE_DISCONNECTED_C -127
class DallasTemperature { public: DallasTemperature(OneWire *); void begin(); uint8_t getDeviceCount(); void requestTemperatures(); float getTempCByIndex(uint8_t); float getTempFByIndex(uint8_t); void setResolution(uint8_t); void setWaitForConversion(bool); };
