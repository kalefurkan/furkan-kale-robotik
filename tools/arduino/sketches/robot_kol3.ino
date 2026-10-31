// 3 eksenli robot kol: taban ve omuz step motorlari (A4988) + gripper servosu, joystick ile kontrol
// Joystick X = taban donusu, Y = omuz, joystick butonu = gripper ac/kapat
#include <AccelStepper.h>
#include <Servo.h>

AccelStepper taban(AccelStepper::DRIVER, 2, 3);   // STEP D2, DIR D3
AccelStepper omuz(AccelStepper::DRIVER, 4, 5);    // STEP D4, DIR D5
Servo gripper;

const int VRX = A0;
const int VRY = A1;
const int SW = 7;                 // joystick butonu (INPUT_PULLUP)
const int SERVO_PIN = 9;
const int GRIPPER_ACIK = 20;
const int GRIPPER_KAPALI = 70;
const int OLU_BOLGE = 80;         // merkez etrafinda (512) hareketsiz bolge
const float MAKS_HIZ = 400;       // adim/saniye

bool kapali = false;
bool butonOnceki = false;
unsigned long sonYaz = 0;

float hizHesapla(int ham) {       // joystick degerini -MAKS_HIZ..+MAKS_HIZ hiza cevir
  int fark = ham - 512;
  if (abs(fark) < OLU_BOLGE) {
    return 0;
  }
  return MAKS_HIZ * fark / 512.0;
}

void setup() {
  Serial.begin(9600);
  pinMode(SW, INPUT_PULLUP);
  taban.setMaxSpeed(MAKS_HIZ);
  omuz.setMaxSpeed(MAKS_HIZ);
  gripper.attach(SERVO_PIN);
  gripper.write(GRIPPER_ACIK);
  Serial.println("Robot kol hazir");
}

void loop() {
  taban.setSpeed(hizHesapla(analogRead(VRX)));
  omuz.setSpeed(hizHesapla(analogRead(VRY)));
  taban.runSpeed();
  omuz.runSpeed();

  bool basili = (digitalRead(SW) == LOW);
  if (basili && !butonOnceki) {            // yalniz basma anında bir kez
    kapali = !kapali;
    gripper.write(kapali ? GRIPPER_KAPALI : GRIPPER_ACIK);
    Serial.println(kapali ? "Gripper: KAPALI" : "Gripper: ACIK");
  }
  butonOnceki = basili;

  if (millis() - sonYaz >= 1000) {         // saniyede bir konum yaz
    sonYaz = millis();
    Serial.print("taban=");
    Serial.print(taban.currentPosition());
    Serial.print(" omuz=");
    Serial.println(omuz.currentPosition());
  }
}
