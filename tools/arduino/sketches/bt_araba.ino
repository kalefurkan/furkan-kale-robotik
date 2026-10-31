// Bluetooth kontrollu robot araba: telefondan gelen harfe gore L298N ile iki DC motor surulur
// F = ileri, B = geri, L = sola don, R = saga don, S = dur, 1..9 = hiz
#include <SoftwareSerial.h>

SoftwareSerial bt(2, 3);   // RX = D2 (HC-05 TXD), TX = D3 (HC-05 RXD, bolucu uzerinden)

const int ENA = 5;   // sol motor hiz (PWM)
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;   // sag motor hiz (PWM)

int hiz = 200;       // 0-255 arasi PWM degeri

void solMotor(int yon) {          // 1 = ileri, -1 = geri, 0 = dur
  digitalWrite(IN1, yon > 0 ? HIGH : LOW);
  digitalWrite(IN2, yon < 0 ? HIGH : LOW);
}

void sagMotor(int yon) {
  digitalWrite(IN3, yon > 0 ? HIGH : LOW);
  digitalWrite(IN4, yon < 0 ? HIGH : LOW);
}

void sur(int sol, int sag) {
  analogWrite(ENA, hiz);
  analogWrite(ENB, hiz);
  solMotor(sol);
  sagMotor(sag);
}

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  bt.begin(9600);
  sur(0, 0);
  Serial.println("Robot araba hazir");
}

void loop() {
  while (bt.available() > 0) {
    char c = bt.read();
    if (c == 'F') {
      sur(1, 1);
      Serial.println("Komut: F -> ILERI");
    } else if (c == 'B') {
      sur(-1, -1);
      Serial.println("Komut: B -> GERI");
    } else if (c == 'L') {
      sur(-1, 1);
      Serial.println("Komut: L -> SOLA");
    } else if (c == 'R') {
      sur(1, -1);
      Serial.println("Komut: R -> SAGA");
    } else if (c == 'S') {
      sur(0, 0);
      Serial.println("Komut: S -> DUR");
    } else if (c >= '1' && c <= '9') {
      hiz = map(c - '0', 1, 9, 80, 255);   // 1 yavas, 9 tam hiz
      analogWrite(ENA, hiz);
      analogWrite(ENB, hiz);
      Serial.print("Hiz: ");
      Serial.println(hiz);
    }
  }
}
