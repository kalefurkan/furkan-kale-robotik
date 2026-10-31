// Bilgisayarda ÇALIŞTIRILABİLEN sahte Arduino ortamı (yalnızca ServoLab testleri için).
#pragma once
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cmath>
#include <deque>
#include <vector>
#include <string>
typedef uint8_t byte;
#define F(x) (x)
extern unsigned long g_ms;
inline unsigned long millis() { return g_ms; }
inline void delay(unsigned long ms) { g_ms += ms; }
struct SerialMock {
  static std::deque<int> &in() { static std::deque<int> d; return d; }
  void begin(long) {}
  int available() { return (int)in().size(); }
  int read() { if (in().empty()) return -1; int c = in().front(); in().pop_front(); return c; }
  template <typename T> void print(T v) { std::printf("[TX]%s", str(v).c_str()); }
  template <typename T> void println(T v) { std::printf("[TX]%s\n", str(v).c_str()); }
  static std::string str(const char *s) { return s; }
  static std::string str(int v) { return std::to_string(v); }
};
extern SerialMock Serial;
struct SoftwareSerial : SerialMock { SoftwareSerial(uint8_t, uint8_t) {} };
extern std::vector<int> g_us;
extern int g_servoCount;
struct Servo {
  int id = -1;
  uint8_t attach(int, int, int) { id = g_servoCount++; if ((int)g_us.size() <= id) g_us.resize(id + 1, 0); return id; }
  void writeMicroseconds(int us) { g_us[id] = us; }
};
void setup(); void loop();
