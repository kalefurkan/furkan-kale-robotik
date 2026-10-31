// Bluetooth kontrollu akilli robot: HC-05 + L298N + HC-SR04 (carpma korumasi)
// Komutlar: F ileri, B geri, L sola, R saga, S dur, 1..9 hiz, D mesafeyi telefona gonder
#include <SoftwareSerial.h>

SoftwareSerial bt(2, 3);   // RX = D2 (HC-05 TXD), TX = D3 (HC-05 RXD, bolucu uzerinden)

const int TRIG = 4;
const int ECHO = 11;

const int ENA = 5;
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;

const int GUVENLI_CM = 15;    // ileri giderken bundan yakin engelde dur

int hiz = 200;                // 0-255
char komut = 'S';             // son komut
unsigned long sonOlcum = 0;

void motor(int sol, int sag) {        // -255..255, eksi = geri
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

long mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) {
    return 400;
  }
  return sure / 58;
}

void uygula() {                       // son komuta gore motorlari surer
  if (komut == 'F') {
    motor(hiz, hiz);
  } else if (komut == 'B') {
    motor(-hiz, -hiz);
  } else if (komut == 'L') {
    motor(-hiz, hiz);
  } else if (komut == 'R') {
    motor(hiz, -hiz);
  } else {
    motor(0, 0);
  }
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  bt.begin(9600);
  motor(0, 0);
  Serial.println("Akilli robot hazir");
}

void loop() {
  while (bt.available() > 0) {
    char c = bt.read();
    if (c == 'F' || c == 'B' || c == 'L' || c == 'R' || c == 'S') {
      komut = c;
      uygula();
      Serial.print("Komut: ");
      Serial.println(c);
    } else if (c >= '1' && c <= '9') {
      hiz = map(c - '0', 1, 9, 80, 255);
      uygula();
      Serial.print("Hiz: ");
      Serial.println(hiz);
    } else if (c == 'D') {
      long cm = mesafeOlc();
      bt.print("Mesafe: ");
      bt.print(cm);
      bt.println(" cm");
      Serial.print("Mesafe gonderildi: ");
      Serial.println(cm);
    }
  }

  // carpma korumasi: ileri giderken engel yakinsa otomatik dur
  if (komut == 'F' && millis() - sonOlcum >= 100) {
    sonOlcum = millis();
    long cm = mesafeOlc();
    if (cm < GUVENLI_CM) {
      komut = 'S';
      uygula();
      Serial.print("ENGEL ");
      Serial.print(cm);
      Serial.println(" cm: otomatik durdu");
      bt.println("ENGEL! Durdum");
    }
  }
}
