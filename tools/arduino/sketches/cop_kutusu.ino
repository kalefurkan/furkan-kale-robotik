// Akilli cop kutusu: el yaklasinca kapak (servo) acilir, el cekilince birkac saniye sonra yavasca kapanir
#include <Servo.h>

const int TRIG = 7;
const int ECHO = 6;
const int SERVO_PIN = 9;
const int ALGILA_CM = 25;                 // bu mesafeden yakin = el var
const int GEREKLI_OLCUM = 3;              // yanlis alarmlari azaltmak icin art arda 3 olcum gerekir
const unsigned long ACIK_KALMA_MS = 3000; // el cekildikten sonra kapak 3 sn acik kalir
const int KAPALI_ACI = 0;
const int ACIK_ACI = 110;

Servo kapak;
int aci = KAPALI_ACI;
int ardArda = 0;                          // art arda kac olcumde el goruldu
bool acik = false;
unsigned long sonGorulme = 0;

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
  kapak.attach(SERVO_PIN);
  kapak.write(aci);
  Serial.begin(9600);
}

void loop() {
  float cm = mesafeOlc();

  if (cm > 0 && cm < ALGILA_CM) {
    ardArda++;
    sonGorulme = millis();
  } else {
    ardArda = 0;
  }

  if (ardArda >= GEREKLI_OLCUM && !acik) {
    acik = true;
    Serial.println("El algilandi: kapak aciliyor");
  }
  if (acik && ardArda == 0 && millis() - sonGorulme > ACIK_KALMA_MS) {
    acik = false;
    Serial.println("Kapak kapaniyor");
  }

  // kapagi 5'er derece ilerleterek hareket ettir
  int hedef = KAPALI_ACI;
  if (acik) {
    hedef = ACIK_ACI;
  }
  if (aci < hedef) {
    aci += 5;
    if (aci > hedef) aci = hedef;
    kapak.write(aci);
  } else if (aci > hedef) {
    aci -= 5;
    if (aci < hedef) aci = hedef;
    kapak.write(aci);
  }
  delay(30);
}
