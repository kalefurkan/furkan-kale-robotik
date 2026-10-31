// Otomatik kapi: HC-SR04 biri yaklasinca servoyu (kapi) acar, uzaklasinca kapatir
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int ACMA_CM = 20;                // bu mesafeden yakinda kapi acilir
const unsigned long BEKLEME_MS = 2000; // kisi uzaklasinca kapi 2 sn daha acik kalir
const int KAPALI_ACI = 0;
const int ACIK_ACI = 90;

Servo kapi;
int aci = KAPALI_ACI;                  // servonun su anki acisi
unsigned long sonGorulme = 0;          // kisiyi en son gordugumuz an (ms)
bool kisiVar = false;

float mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return -1;
  return sure * 0.0343 / 2.0;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  kapi.attach(SERVO_PIN);
  kapi.write(aci);
  Serial.begin(9600);
}

void loop() {
  float cm = mesafeOlc();

  if (cm > 0 && cm < ACMA_CM) {
    kisiVar = true;
    sonGorulme = millis();             // her gorulusunde bekleme suresi yeniden baslar
  } else if (kisiVar && millis() - sonGorulme > BEKLEME_MS) {
    kisiVar = false;                   // kisi gitti ve bekleme bitti
  }

  // kapiyi hedefe dogru 3'er derece ilerlet (ani hareket yerine yumusak acilis)
  int hedef = KAPALI_ACI;
  if (kisiVar) {
    hedef = ACIK_ACI;
  }
  if (aci < hedef) {
    aci += 3;
    if (aci > hedef) aci = hedef;
    kapi.write(aci);
  } else if (aci > hedef) {
    aci -= 3;
    if (aci < hedef) aci = hedef;
    kapi.write(aci);
  }

  Serial.print("Mesafe: ");
  Serial.print(cm, 0);
  Serial.print(" cm  Kapi acisi: ");
  Serial.println(aci);
  delay(20);
}
