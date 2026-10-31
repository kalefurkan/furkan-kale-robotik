#pragma once
#include "esp32_ortak.h"
#define WL_CONNECTED 3
#define WIFI_STA 1
typedef int wl_status_t;
class IPAddress { public: IPAddress(); String toString() const; };
struct WiFiClass { void mode(int); void begin(const char *, const char *); wl_status_t status(); IPAddress localIP(); void disconnect(); int RSSI(); };
extern WiFiClass WiFi;
