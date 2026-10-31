#pragma once
#include "Arduino.h"
#define FILE_READ 0
#define FILE_WRITE 1
class File { public: operator bool(); int available(); int read(); int peek(); size_t size(); void close();
  template <typename T> size_t print(T, int = 10); template <typename T> size_t println(T, int = 10); size_t println(); size_t write(uint8_t); bool seek(unsigned long); unsigned long position(); };
class SDClass { public: bool begin(uint8_t); File open(const char*, uint8_t = FILE_READ); bool exists(const char*); bool remove(const char*); };
extern SDClass SD;
