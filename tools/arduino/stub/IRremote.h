#pragma once
#include "Arduino.h"
struct decode_results { unsigned long value; };
class IRrecv { public: IRrecv(int pin); void enableIRIn(); bool decode(decode_results *r); void resume(); };
