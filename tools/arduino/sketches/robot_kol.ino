// Robot kol: 4 servo (taban, omuz, dirsek, kavrama) + analog joystick
// Joystick butonu moduna gecer: mod 0 = taban (X) ve omuz (Y), mod 1 = kavrama (X) ve dirsek (Y)
#include <Servo.h>

const int PIN_X = A0;
const int PIN_Y = A1;
const int PIN_SW = 2;

Servo kol[4];                          // 0 taban, 1 omuz, 2 dirsek, 3 kavrama
const int KOL_PIN[4] = {3, 4, 5, 6};
int aci[4] = {90, 90, 90, 90};

int mod = 0;
unsigned long sonBas = 0;
unsigned long sonYaz = 0;
int sonYazilan[4] = {-1, -1, -1, -1};

void hareket(int servo, int okuma) {   // joystick okumasina gore acisi 1 derece degisir
  if (okuma > 650) {
    aci[servo] = min(aci[servo] + 1, 180);
  } else if (okuma < 370) {
    aci[servo] = max(aci[servo] - 1, 0);
  }
  kol[servo].write(aci[servo]);
}

void setup() {
  pinMode(PIN_SW, INPUT_PULLUP);
  for (int i = 0; i < 4; i++) {
    kol[i].attach(KOL_PIN[i]);
    kol[i].write(aci[i]);
  }
  Serial.begin(9600);
  Serial.println("Robot kol hazir: mod 0 (taban + omuz)");
}

void loop() {
  int x = analogRead(PIN_X);
  int y = analogRead(PIN_Y);

  if (digitalRead(PIN_SW) == LOW && millis() - sonBas > 300) {   // buton: mod degistir
    mod = 1 - mod;
    sonBas = millis();
    if (mod == 0) {
      Serial.println("Mod 0: taban (X) + omuz (Y)");
    } else {
      Serial.println("Mod 1: kavrama (X) + dirsek (Y)");
    }
  }

  if (mod == 0) {
    hareket(0, x);
    hareket(1, y);
  } else {
    hareket(3, x);
    hareket(2, y);
  }

  if (millis() - sonYaz >= 500) {      // aci degistiyse yaz
    sonYaz = millis();
    bool degisti = false;
    for (int i = 0; i < 4; i++) {
      if (aci[i] != sonYazilan[i]) {
        degisti = true;
      }
    }
    if (degisti) {
      Serial.print("Aci taban=");
      Serial.print(aci[0]);
      Serial.print(" omuz=");
      Serial.print(aci[1]);
      Serial.print(" dirsek=");
      Serial.print(aci[2]);
      Serial.print(" kavrama=");
      Serial.println(aci[3]);
      for (int i = 0; i < 4; i++) {
        sonYazilan[i] = aci[i];
      }
    }
  }
  delay(20);
}
