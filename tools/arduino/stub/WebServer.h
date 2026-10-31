#pragma once
#include "WiFi.h"
#include "SD.h"
class WebServer { public: WebServer(int); void begin(); void handleClient(); void on(const char *, void (*)()); void onNotFound(void (*)());
  void send(int, const char *, const String &); String arg(const char *); bool hasArg(const char *); void sendHeader(const char *, const char *); size_t streamFile(File &, const String &); };
