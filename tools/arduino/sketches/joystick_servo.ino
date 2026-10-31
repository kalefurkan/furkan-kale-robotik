// Joystick kontrollu servo: X ekseni servo acisini belirler, joystick dugmesi (SW) servoyu 90 dereceye ortalar
#include <Servo.h>

Servo servo;
const int X_PIN = A0;
const int Y_PIN = A1;
const int SW_PIN = 2;
const int SERVO_PIN = 9;

void setup() {
  Serial.begin(9600);
  pinMode(SW_PIN, INPUT_PULLUP);   // SW basilinca GND'ye baglanir: LOW
  servo.attach(SERVO_PIN);
  servo.write(90);
}

void loop() {
  int x = analogRead(X_PIN);       // 0-1023, orta nokta yaklasik 512
  int y = analogRead(Y_PIN);
  bool basili = (digitalRead(SW_PIN) == LOW);

  int aci = map(x, 0, 1023, 0, 180);
  if (x > 492 && x < 532) {
    aci = 90;                      // ortada kucuk bir olu bolge: servo titremesin
  }
  if (basili) {
    aci = 90;                      // dugmeye basinca merkeze don
  }
  servo.write(aci);

  Serial.print("X=");
  Serial.print(x);
  Serial.print(" Y=");
  Serial.print(y);
  Serial.print(" SW=");
  Serial.print(basili ? "basili" : "birakildi");
  Serial.print(" aci=");
  Serial.println(aci);
  delay(200);
}
