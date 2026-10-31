// Mini CNC plotter: 2 adet A4988 + step motor (X ve Y ekseni) + kalem kaldiran servo
// Kare ve capraz cizgi cizer. Cizgilerin duz olmasi icin iki eksen ayni anda varir (hizlar mesafeyle orantili).
#include <AccelStepper.h>
#include <Servo.h>

AccelStepper xEkseni(AccelStepper::DRIVER, 2, 3);   // STEP = D2, DIR = D3
AccelStepper yEkseni(AccelStepper::DRIVER, 4, 5);   // STEP = D4, DIR = D5
Servo kalem;

const int SERVO_PIN = 9;
const int KALEM_YUKARI = 90;          // kalem kagittan ayrik
const int KALEM_ASAGI = 30;           // kalem kagitta
const int ADIM_MM = 10;               // 1 mm = 10 adim (ornek: 1,8 derece motor + 20 disli GT2 kasnak, tam adim)
const float HIZ = 400;                // adim/saniye (en uzun eksen icin)

// cizim: (x, y) noktalari mm cinsinden; ilk nokta baslangic, sonuncusu bitis
const int N = 6;
const int PX[6] = {0, 20, 20, 0, 0, 20};
const int PY[6] = {0, 0, 20, 20, 0, 20};

void git(int xmm, int ymm) {
  long hx = (long)xmm * ADIM_MM;
  long hy = (long)ymm * ADIM_MM;
  long dx = abs(hx - xEkseni.currentPosition());
  long dy = abs(hy - yEkseni.currentPosition());
  long enUzun = max(dx, dy);
  if (enUzun == 0) {
    return;
  }
  xEkseni.moveTo(hx);
  yEkseni.moveTo(hy);
  xEkseni.setSpeed(hx >= xEkseni.currentPosition() ? HIZ * dx / enUzun : -HIZ * dx / enUzun);
  yEkseni.setSpeed(hy >= yEkseni.currentPosition() ? HIZ * dy / enUzun : -HIZ * dy / enUzun);
  while (xEkseni.distanceToGo() != 0 || yEkseni.distanceToGo() != 0) {
    xEkseni.runSpeedToPosition();     // sabit hizla hedefe, varinca durur
    yEkseni.runSpeedToPosition();
  }
}

void setup() {
  Serial.begin(9600);
  xEkseni.setMaxSpeed(1000);
  yEkseni.setMaxSpeed(1000);
  kalem.attach(SERVO_PIN);
  kalem.write(KALEM_YUKARI);
  delay(500);
  Serial.println("Plotter hazir");

  for (int i = 0; i < N; i++) {
    git(PX[i], PY[i]);
    Serial.print("Nokta ");
    Serial.print(i);
    Serial.print(": x=");
    Serial.print(xEkseni.currentPosition() / ADIM_MM);
    Serial.print(" mm y=");
    Serial.print(yEkseni.currentPosition() / ADIM_MM);
    Serial.println(" mm");
    if (i == 0) {
      kalem.write(KALEM_ASAGI);        // baslangic noktasina varinca kalemi indir
      delay(300);
    }
  }
  kalem.write(KALEM_YUKARI);
  Serial.println("Cizim bitti");
}

void loop() {
}
