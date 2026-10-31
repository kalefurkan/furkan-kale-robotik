// Otomatik engel algilayan robot kol: taban servosu HC-SR04'u tarar, nesne bulunca kavrama servosu kapanir
#include <Servo.h>

const int TRIG = 2;
const int ECHO = 3;

Servo taban;
Servo kavrama;

const int ESIK_CM = 20;        // bundan yakin nesne bulundu say
const int ACIK = 100;          // kavrama acisi: acik
const int KAPALI = 40;         // kavrama acisi: kapali

int aci = 0;
int yon = 3;                   // her adimda 3 derece (eksi = geri tarama)

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

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  taban.attach(9);
  kavrama.attach(10);
  taban.write(aci);
  kavrama.write(ACIK);
  Serial.begin(9600);
  Serial.println("Algilayan kol hazir: taraniyor");
  delay(500);
}

void loop() {
  taban.write(aci);
  delay(60);                   // servonun gitmesini bekle
  long cm = mesafeOlc();

  if (cm < ESIK_CM) {
    Serial.print("NESNE: aci=");
    Serial.print(aci);
    Serial.print(" mesafe=");
    Serial.print(cm);
    Serial.println(" cm");
    kavrama.write(KAPALI);     // tut
    Serial.println("Kavrama KAPANDI");
    delay(1500);
    kavrama.write(ACIK);       // birak
    Serial.println("Kavrama ACILDI");
    delay(500);
    aci = aci + yon * 5;       // nesnenin ilerisine gec, ayni nesneyi tekrar sayma
  } else {
    aci = aci + yon;
  }

  if (aci >= 180) {            // sinira gelince yon degistir
    aci = 180;
    yon = -3;
    Serial.println("Tarama: geri");
  } else if (aci <= 0) {
    aci = 0;
    yon = 3;
    Serial.println("Tarama: ileri");
  }
}
