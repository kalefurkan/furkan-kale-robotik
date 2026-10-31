// Sözdizimi denetimi için sahte Arduino.h (gerçek derleyici yerine g++ -fsyntax-only)
#pragma once
#include <cstdint>
#include <cmath>
typedef bool boolean;
typedef uint8_t byte;
typedef unsigned int word;
#define HIGH 1
#define LOW 0
#define INPUT 0
#define OUTPUT 1
#define INPUT_PULLUP 2
#define LED_BUILTIN 13
#define PI 3.1415926535897932384626433832795
#define A0 14
#define A1 15
#define A2 16
#define A3 17
#define A4 18
#define A5 19
void pinMode(uint8_t, uint8_t); void digitalWrite(uint8_t, uint8_t); int digitalRead(uint8_t);
int analogRead(uint8_t); void analogWrite(uint8_t, int);
void delay(unsigned long); void delayMicroseconds(unsigned int);
unsigned long millis(); unsigned long micros();
long map(long, long, long, long, long);
unsigned long pulseIn(uint8_t, uint8_t, unsigned long = 1000000UL);
void tone(uint8_t, unsigned int, unsigned long = 0); void noTone(uint8_t);
long random(long); long random(long, long); void randomSeed(unsigned long);
#define constrain(amt, low, high) ((amt) < (low) ? (low) : ((amt) > (high) ? (high) : (amt)))
#ifndef min
#define min(a, b) ((a) < (b) ? (a) : (b))
#define max(a, b) ((a) > (b) ? (a) : (b))
#endif
struct HardwareSerial {
  void begin(long);
  template <typename T> void print(T, int = 10);
  template <typename T> void println(T, int = 10);
  void println();
};
extern HardwareSerial Serial;
void setup(); void loop();
