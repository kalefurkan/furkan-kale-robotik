// Denge robotu: MPU6050 (ivme + jiroskop) + L298N + 2 DC motor
// Aciyi tamamlayici filtreyle bulur, PD denetimiyle motorlari one/arkaya surer.
// NOT: Katsayilar (KP, KD) gercek robotta deneyerek ayarlanir; simulator fiziksel dengeyi saglamaz.
#include <Wire.h>

const int MPU = 0x68;

const int ENA = 5;
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;

const float KP = 25.0;         // aci hatasi katsayisi
const float KD = 1.2;          // aci hizi (jiroskop) katsayisi
const float DUSME_ACI = 45.0;  // bundan fazla egilirse motorlari durdur

float aci = 0;                 // filtrelenmis egim acisi (derece)
unsigned long sonZaman = 0;
unsigned long sonYaz = 0;

void motor(int hiz) {          // -255..255: iki motor ayni yone doner
  digitalWrite(IN1, hiz > 0 ? HIGH : LOW);
  digitalWrite(IN2, hiz < 0 ? HIGH : LOW);
  digitalWrite(IN3, hiz > 0 ? HIGH : LOW);
  digitalWrite(IN4, hiz < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(hiz));
  analogWrite(ENB, abs(hiz));
}

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);            // PWR_MGMT_1: uyku modundan cik
  Wire.write(0);
  Wire.endTransmission(true);
  motor(0);
  sonZaman = millis();
  Serial.println("Denge robotu hazir");
}

void loop() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);            // ivme X'ten baslayarak 14 bayt
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 14, true);
  int ax = Wire.read() << 8 | Wire.read();
  int ay = Wire.read() << 8 | Wire.read();
  int az = Wire.read() << 8 | Wire.read();
  int sicaklik = Wire.read() << 8 | Wire.read();
  int gx = Wire.read() << 8 | Wire.read();
  int gy = Wire.read() << 8 | Wire.read();
  int gz = Wire.read() << 8 | Wire.read();

  unsigned long simdi = millis();
  float dt = (simdi - sonZaman) / 1000.0;
  sonZaman = simdi;

  float ivmeAci = degrees(atan2(ay / 16384.0, az / 16384.0));   // ivmeolcerden aci
  float hiz = gx / 131.0;                                       // jiroskop: derece/saniye
  aci = 0.98 * (aci + hiz * dt) + 0.02 * ivmeAci;               // tamamlayici filtre

  int cikis = 0;
  if (abs(aci) < DUSME_ACI) {
    cikis = (int)(KP * aci + KD * hiz);
    cikis = constrain(cikis, -255, 255);
  }
  motor(cikis);

  if (simdi - sonYaz >= 500) {
    sonYaz = simdi;
    Serial.print("aci=");
    Serial.print(aci, 1);
    Serial.print(" hiz=");
    Serial.print(hiz, 1);
    Serial.print(" motor=");
    Serial.println(cikis);
  }
  delay(10);
}
