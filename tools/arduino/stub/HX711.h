#pragma once
#include "Arduino.h"
class HX711 { public: HX711(); void begin(byte, byte); bool is_ready(); long read(); long read_average(byte = 10); double get_value(byte = 1); float get_units(byte = 1); void set_scale(float = 1.f); float get_scale(); void tare(byte = 10); void set_offset(long); long get_offset(); };
