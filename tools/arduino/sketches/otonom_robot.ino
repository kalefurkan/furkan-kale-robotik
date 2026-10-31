// 2 tekerlekli otonom robot: enkoderli 2 DC motor + MPU6050 + L298N
// Yolu: 50 cm ileri, 90 derece don, bunu 4 kez tekrarla (kare). Mesafe enkoderle, donus jiroskopla olculur.
#include <Wire.h>

const int MPU = 0x68;

const int ENC_SOL_A = 2;       // kesme pini
const int ENC_SOL_B = 4;
const int ENC_SAG_A = 3;       // kesme pini
const int ENC_SAG_B = 11;

const int ENA = 5;
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;

const float TIK_MM = 0.93;     // 1 tik kac mm (tekerlek capi 65 mm, tur basina 220 tik)
const int HEDEF_MM = 500;
const int HIZ = 200;           // 0-255
const float KP_EGIM = 2.0;     // iki tekerlek farki icin duzeltme

volatile long solTik = 0;
volatile long sagTik = 0;

int adim = 0;                  // 0..7: cift = ileri, tek = don
float donAci = 0;
unsigned long sonZaman = 0;

void isrSol() {
  if (digitalRead(ENC_SOL_B)) {
    solTik--;
  } else {
    solTik++;
  }
}

void isrSag() {
  if (digitalRead(ENC_SAG_B)) {
    sagTik--;
  } else {
    sagTik++;
  }
}

void motor(int sol, int sag) {         // -255..255
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

float jiroZ() {                        // Z ekseni donus hizi (derece/saniye)
  Wire.beginTransmission(MPU);
  Wire.write(0x47);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int gz = Wire.read() << 8 | Wire.read();
  return gz / 131.0;
}

void setup() {
  pinMode(ENC_SOL_A, INPUT);
  pinMode(ENC_SOL_B, INPUT);
  pinMode(ENC_SAG_A, INPUT);
  pinMode(ENC_SAG_B, INPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  attachInterrupt(digitalPinToInterrupt(ENC_SOL_A), isrSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENC_SAG_A), isrSag, RISING);
  Serial.println("Otonom robot hazir: 2 saniye sonra basliyor");
  delay(2000);
  solTik = 0;
  sagTik = 0;
  sonZaman = millis();
}

void loop() {
  if (adim >= 8) {
    motor(0, 0);
    return;
  }

  if (adim % 2 == 0) {                 // ileri git, iki tekerlek ayni tik sayisinda kalsin
    long sol = solTik;
    long sag = sagTik;
    float mm = (sol + sag) / 2.0 * TIK_MM;
    if (mm >= HEDEF_MM) {
      motor(0, 0);
      Serial.print("Kenar ");
      Serial.print(adim / 2 + 1);
      Serial.print(" bitti: ");
      Serial.print((int)mm);
      Serial.print(" mm, tik sol=");
      Serial.print(sol);
      Serial.print(" sag=");
      Serial.println(sag);
      donAci = 0;
      adim++;
      delay(300);
      sonZaman = millis();          // bekleme suresi aciya katilmasin
      return;
    }
    int duzeltme = (int)(KP_EGIM * (sol - sag));
    motor(constrain(HIZ - duzeltme, 0, 255), constrain(HIZ + duzeltme, 0, 255));
  } else {                              // yerinde don: jiroskop acisini topla
    unsigned long simdi = millis();
    donAci = donAci + jiroZ() * (simdi - sonZaman) / 1000.0;
    sonZaman = simdi;
    if (donAci >= 90) {
      motor(0, 0);
      Serial.print("Donus bitti: ");
      Serial.print((int)donAci);
      Serial.println(" derece");
      solTik = 0;
      sagTik = 0;
      adim++;
      if (adim >= 8) {
        Serial.println("Kare tamamlandi");
      }
      delay(300);
      return;
    }
    motor(-150, 150);
  }
  delay(5);
}
