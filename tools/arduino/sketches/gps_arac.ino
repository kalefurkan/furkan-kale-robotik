// GPS destekli otonom arac: NEO-6M (konum) + HMC5883L (pusula) + L298N (iki motor)
// Aracin yonu pusuladan, hedefe giden yon (kerteriz) GPS konumundan hesaplanir; arac hedefe dogru doner ve gider.
#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <Wire.h>

SoftwareSerial gpsSerial(2, 3);   // RX = D2 (NEO-6M TX'ten gelir), TX = D3
TinyGPSPlus gps;

const int HMC_ADRES = 0x1E;       // HMC5883L I2C adresi
const int ENA = 5, ENB = 6;       // motor hizlari (PWM)
const int IN1 = 7, IN2 = 8;       // sol motor yonu
const int IN3 = 9, IN4 = 10;      // sag motor yonu

const double HEDEF_ENLEM = 41.0090;    // hedef nokta (derece)
const double HEDEF_BOYLAM = 28.9790;
const double VARIS_M = 5.0;            // hedefe bu kadar metre kala dur
const int HIZ = 170;                   // 0-255
const int YON_TOLERANS = 15;           // derece

unsigned long sonKarar = 0;
bool vardi = false;

// Pusuladan arac yonu (0-360 derece, 0 = manyetik kuzey)
int aracYonu() {
  Wire.beginTransmission(HMC_ADRES);
  Wire.write(0x03);
  Wire.endTransmission();
  Wire.requestFrom(HMC_ADRES, 6);
  if (Wire.available() < 6) {
    return -1;
  }
  int xh = Wire.read();
  int xl = Wire.read();
  int zh = Wire.read();             // sira: X, Z, Y
  int zl = Wire.read();
  int yh = Wire.read();
  int yl = Wire.read();
  int x = (xh << 8) | xl;
  int y = (yh << 8) | yl;
  float aci = degrees(atan2(y, x));
  if (aci < 0) {
    aci = aci + 360;
  }
  return (int)(aci + 0.5) % 360;
}

void motor(int sol, int sag) {      // -255..255: eksi = geri
  digitalWrite(IN1, sol > 0);
  digitalWrite(IN2, sol < 0);
  digitalWrite(IN3, sag > 0);
  digitalWrite(IN4, sag < 0);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(HMC_ADRES);
  Wire.write(0x02);                 // mod register'i
  Wire.write(0x00);                 // surekli olcum
  Wire.endTransmission();
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  motor(0, 0);
  Serial.println("GPS arac hazir");
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
  if (millis() - sonKarar < 500) {
    return;                         // yarim saniyede bir karar ver
  }
  sonKarar = millis();

  if (!gps.location.isValid() || gps.location.age() > 3000) {
    motor(0, 0);
    Serial.println("Konum yok: arac duruyor");
    return;
  }
  int yon = aracYonu();
  if (yon < 0) {
    motor(0, 0);
    Serial.println("Pusula yok: arac duruyor");
    return;
  }

  // Kucuk mesafelerde duz yaklasim: kuzey ve dogu farklari metre cinsinden
  double enlem = gps.location.lat();
  double boylam = gps.location.lng();
  double kuzey = (HEDEF_ENLEM - enlem) * 111320.0;
  double dogu = (HEDEF_BOYLAM - boylam) * 111320.0 * cos(radians(enlem));
  double mesafe = sqrt(kuzey * kuzey + dogu * dogu);
  int kerteriz = (int)degrees(atan2(dogu, kuzey));   // hedefe giden yon
  if (kerteriz < 0) {
    kerteriz = kerteriz + 360;
  }
  int fark = kerteriz - yon;                          // -180..180 arasina getir
  if (fark > 180) {
    fark = fark - 360;
  }
  if (fark < -180) {
    fark = fark + 360;
  }

  Serial.print("mesafe=");
  Serial.print(mesafe, 0);
  Serial.print(" m kerteriz=");
  Serial.print(kerteriz);
  Serial.print(" yon=");
  Serial.print(yon);
  Serial.print(" -> ");

  if (mesafe < VARIS_M) {
    motor(0, 0);
    if (!vardi) {
      vardi = true;
    }
    Serial.println("HEDEFE VARILDI");
  } else if (fark > YON_TOLERANS) {
    motor(HIZ, -HIZ);               // saga don (yerinde)
    Serial.println("saga don");
  } else if (fark < -YON_TOLERANS) {
    motor(-HIZ, HIZ);               // sola don
    Serial.println("sola don");
  } else {
    motor(HIZ, HIZ);                // ileri
    Serial.println("ileri");
  }
}
