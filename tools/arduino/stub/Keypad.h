#pragma once
#include "Arduino.h"
#define NO_KEY '\0'
#define makeKeymap(x) ((char*)(x))
class Keypad { public: Keypad(char*, byte*, byte*, byte, byte); char getKey(); char waitForKey(); };
