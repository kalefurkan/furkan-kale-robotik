// Robotik haritalama ve navigasyon: TFmini LiDAR (mesafe) + enkoderli motorlar (yol) + MPU6050 (yon) + L298N
// Robot ileri gider, konumunu (x, y) enkoder ve jiroskopla hesaplar; onunde engel (< 40 cm) gorunce durur,
// engelin konumunu haritaya yazar, 90 derece sola doner ve devam eder. 3 engelden sonra harita yazdirilir.
#include <Wire.h>
#include <SoftwareSerial.h>

SoftwareSerial lidar(12, 13);          // RX = D12 (TFmini TX), TX = D13 (TFmini RX)
const int MPU = 0x68;

const int ENC_SOL_A = 2, ENC_SOL_B = 4;
const int ENC_SAG_A = 3, ENC_SAG_B = 11;
const int ENA = 5, ENB = 6;
const int IN1 = 7, IN2 = 8, IN3 = 9, IN4 = 10;

const float TIK_MM = 0.93;             // 1 enkoder tigi kac mm
const int HIZ = 200;                   // 0-255
const int ENGEL_CM = 40;               // bundan yakinsa engel
const int MAKS_ENGEL = 3;

volatile long solTik = 0;
volatile long sagTik = 0;
long oncekiTik = 0;

float x = 0, y = 0;                    // robotun konumu (mm)
float yon = 0;                         // yon (derece, 0 = baslangicta bakilan yon, sola doner artar)
unsigned long sonZaman = 0;
int mesafe = 999;                      // LiDAR mesafesi (cm)

int haritaX[3];                        // bulunan engel noktalari (mm)
int haritaY[3];
int engelSayisi = 0;

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

void lidarOku() {                      // 9 baytlik TFmini cercevesi: 0x59 0x59 DL DH SL SH TL TH CS
  while (lidar.available() >= 9) {
    if (lidar.read() != 0x59) {
      continue;
    }
    if (lidar.read() != 0x59) {
      continue;
    }
    int dl = lidar.read();
    int dh = lidar.read();
    int sl = lidar.read();
    int sh = lidar.read();
    int tl = lidar.read();
    int th = lidar.read();
    int cs = lidar.read();
    int toplam = (0x59 + 0x59 + dl + dh + sl + sh + tl + th) & 0xFF;
    if (toplam == cs) {                // sagliyorsa kabul et
      mesafe = dl + dh * 256;
    }
  }
}

void konumGuncelle() {                 // enkoderden yol, jiroskoptan yon
  unsigned long simdi = millis();
  yon = yon + jiroZ() * (simdi - sonZaman) / 1000.0;
  sonZaman = simdi;
  long tik = (solTik + sagTik) / 2;
  float yolMm = (tik - oncekiTik) * TIK_MM;
  oncekiTik = tik;
  x = x + yolMm * cos(radians(yon));
  y = y + yolMm * sin(radians(yon));
}

void solaDon90() {
  float baslangic = yon;
  motor(-150, 150);
  while (yon - baslangic < 90) {
    konumGuncelle();
    delay(5);
  }
  motor(0, 0);
  oncekiTik = (solTik + sagTik) / 2;   // donuste biriken tikleri yol sayma
  delay(300);
  while (lidar.available() > 0) {
    lidar.read();                      // donus sirasindaki eski olcumleri at
  }
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
  lidar.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  attachInterrupt(digitalPinToInterrupt(ENC_SOL_A), isrSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENC_SAG_A), isrSag, RISING);
  Serial.println("Haritalama robotu hazir");
  delay(1000);
  sonZaman = millis();
}

void loop() {
  if (engelSayisi >= MAKS_ENGEL) {
    motor(0, 0);
    return;
  }
  lidarOku();
  konumGuncelle();

  if (mesafe < ENGEL_CM) {
    motor(0, 0);
    // engelin konumu = robot konumu + mesafe (robotun baktigi yonde)
    int ex = (int)(x + mesafe * 10.0 * cos(radians(yon)));
    int ey = (int)(y + mesafe * 10.0 * sin(radians(yon)));
    haritaX[engelSayisi] = ex;
    haritaY[engelSayisi] = ey;
    engelSayisi++;
    Serial.print("Engel ");
    Serial.print(engelSayisi);
    Serial.print(": robot x=");
    Serial.print((int)x);
    Serial.print(" y=");
    Serial.print((int)y);
    Serial.print(" mm, yon=");
    Serial.print((int)yon);
    Serial.print(", mesafe=");
    Serial.print(mesafe);
    Serial.print(" cm -> nokta (");
    Serial.print(ex);
    Serial.print(", ");
    Serial.print(ey);
    Serial.println(")");
    if (engelSayisi >= MAKS_ENGEL) {
      Serial.println("HARITA (mm):");
      for (int i = 0; i < engelSayisi; i++) {
        Serial.print("  ");
        Serial.print(haritaX[i]);
        Serial.print(", ");
        Serial.println(haritaY[i]);
      }
      return;
    }
    solaDon90();
    mesafe = 999;                       // eski olcumu unut, yeni yonde yeniden olc
    return;
  }
  motor(HIZ, HIZ);
  delay(10);
}
