// Otonom akilli robot platformu (ESP32 DevKit ana denetleyici). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
// Ana kart: TFmini LiDAR (Serial2), MPU6050 (I2C), L298N (motorlar) ve ESP32-CAM'den gelen nesne konumu (Serial1).
// Oncelik: 1) onunde engel (LiDAR) varsa dur ve 90 derece don, 2) kamera nesne bildirdiyse ona dogru git, 3) degilse ileri git.
// KAMERA KARTI: ESP32-CAM'in programi bu projede YAZILMADI. Beklenen cikti: nesne gorunce "X=<0..159>" satiri (160 piksel genislik),
// gorunmeyince "X=-1" satiri, 115200 baud (88 numarali projedeki renk tabanli nesne bulma mantigi uyarlanabilir).
// Gerekli: Arduino IDE + "esp32" kart paketi (Espressif), kart: "ESP32 Dev Module".
#include <Wire.h>
#include <HardwareSerial.h>

const int MPU = 0x68;
const int IN1 = 27, IN2 = 14, IN3 = 32, IN4 = 33;       // L298N (ENA/ENB jumper takili)
const int LIDAR_RX = 16, LIDAR_TX = 17;                   // Serial2: TFmini TX (bolucu uzerinden) -> IO16, TFmini RX <- IO17
const int KAMERA_RX = 25, KAMERA_TX = 26;                 // Serial1: ESP32-CAM U0T -> IO25, ESP32-CAM U0R <- IO26
const int ENGEL_CM = 40;
const int GORUS_GENISLIK = 160;

int mesafe = 999;                                         // LiDAR mesafesi (cm)
int nesneX = -1;                                          // kameradan gelen nesne x konumu
unsigned long nesneZamani = 0;
float yon = 0;                                            // jiroskoptan hesaplanan yon (derece)
unsigned long sonZaman = 0;

void motor(int sol, int sag) {                            // -1 geri, 0 dur, 1 ileri
  digitalWrite(IN1, sol > 0);
  digitalWrite(IN2, sol < 0);
  digitalWrite(IN3, sag > 0);
  digitalWrite(IN4, sag < 0);
}

float jiroZ() {                                           // Z ekseni donus hizi (derece/saniye)
  Wire.beginTransmission(MPU);
  Wire.write(0x47);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int gz = Wire.read() << 8 | Wire.read();
  return gz / 131.0;
}

void yonGuncelle() {
  unsigned long simdi = millis();
  yon = yon + jiroZ() * (simdi - sonZaman) / 1000.0;
  sonZaman = simdi;
}

void lidarOku() {                                         // 9 baytlik TFmini cercevesi: 0x59 0x59 DL DH SL SH TL TH CS
  while (Serial2.available() >= 9) {
    if (Serial2.read() != 0x59) {
      continue;
    }
    if (Serial2.read() != 0x59) {
      continue;
    }
    int dl = Serial2.read(), dh = Serial2.read(), sl = Serial2.read(), sh = Serial2.read();
    int tl = Serial2.read(), th = Serial2.read(), cs = Serial2.read();
    if (((0x59 + 0x59 + dl + dh + sl + sh + tl + th) & 0xFF) == cs) {
      mesafe = dl + dh * 256;
    }
  }
}

void kameraOku() {                                        // "X=<sayi>" satirlarini oku
  while (Serial1.available() > 0) {
    String satir = Serial1.readStringUntil('\n');
    if (satir.startsWith("X=")) {
      nesneX = satir.substring(2).toInt();
      nesneZamani = millis();
    }
  }
}

void solaDon90() {
  float baslangic = yon;
  motor(-1, 1);
  while (yon - baslangic < 90) {
    yonGuncelle();
    delay(5);
  }
  motor(0, 0);
  delay(300);
}

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  motor(0, 0);
  Wire.begin(21, 22);
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);                                       // uyku modundan cik
  Wire.write(0);
  Wire.endTransmission(true);
  Serial2.begin(115200, SERIAL_8N1, LIDAR_RX, LIDAR_TX);  // TFmini-S varsayilan hizi 115200
  Serial1.begin(115200, SERIAL_8N1, KAMERA_RX, KAMERA_TX);
  sonZaman = millis();
  Serial.println("Robot platformu hazir");
}

void loop() {
  lidarOku();
  kameraOku();
  yonGuncelle();

  if (mesafe < ENGEL_CM) {                                // 1) engel: dur ve don
    motor(0, 0);
    Serial.print("Engel ");
    Serial.print(mesafe);
    Serial.println(" cm: sola donuluyor");
    solaDon90();
    mesafe = 999;
    while (Serial2.available() > 0) {
      Serial2.read();
    }
    return;
  }
  bool nesneVar = (nesneX >= 0) && (millis() - nesneZamani < 500);
  if (nesneVar) {                                         // 2) kamera nesne gordu: ona dogru git
    if (nesneX < GORUS_GENISLIK / 3) {
      motor(-1, 1);
      Serial.println("Nesne solda: sola don");
    } else if (nesneX > 2 * GORUS_GENISLIK / 3) {
      motor(1, -1);
      Serial.println("Nesne sagda: saga don");
    } else {
      motor(1, 1);
      Serial.println("Nesne ortada: ileri");
    }
  } else {                                                // 3) hicbiri yok: ileri git
    motor(1, 1);
  }
  delay(50);
}
