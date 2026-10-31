#pragma once
#include "WiFi.h"
class HTTPClient { public: bool begin(const char *); void addHeader(const char *, const char *); int POST(const String &); int POST(uint8_t *, size_t); String getString(); void end(); };
