// Kullanım: sim rx   (stdin: satırlar; çıktı: servo us değerleri)
//           sim play <adım_ms> <toplam_ms>   (bağımsız sketch; her adımda us yazdırır)
#include "mock.h"
#include <string>
#include <iostream>
unsigned long g_ms = 0; SerialMock Serial; std::vector<int> g_us; int g_servoCount = 0;
static void dump() { for (size_t i = 0; i < g_us.size(); i++) std::printf("%s%d", i ? " " : "", g_us[i]); std::printf("\n"); }
int main(int argc, char **argv) {
  setup();
  if (argc > 1 && std::string(argv[1]) == "rx") {
    std::string line;
    while (std::getline(std::cin, line)) {
      line += "\n";
      for (char c : line) { SerialMock::in().push_back(c); }
      while (Serial.available()) loop();
      std::printf("[US] "); dump();
    }
  } else {
    int step = atoi(argv[2]), total = atoi(argv[3]);
    for (int t = 0; t <= total; t += step) { loop(); std::printf("%lu ", g_ms); dump(); g_ms += step; }
  }
  return 0;
}
