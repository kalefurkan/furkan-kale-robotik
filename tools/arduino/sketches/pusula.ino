// Elektronik pusula: HMC5883L (I2C) ham register okumasi ile yon acisi ve yon harfi LCD'de
#include <Wire.h>
#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
const int HMC_ADRES = 0x1E;     // HMC5883L I2C adresi

void yonuYaz(int aci) {
  // 8 yon: K=Kuzey, D=Dogu, G=Guney, B=Bati
  int dilim = ((aci + 22) / 45) % 8;
  if (dilim == 0) lcd.print("K ");
  else if (dilim == 1) lcd.print("KD");
  else if (dilim == 2) lcd.print("D ");
  else if (dilim == 3) lcd.print("GD");
  else if (dilim == 4) lcd.print("G ");
  else if (dilim == 5) lcd.print("GB");
  else if (dilim == 6) lcd.print("B ");
  else lcd.print("KB");
}

void setup() {
  Wire.begin();                              // I2C: SDA = A4, SCL = A5
  Wire.beginTransmission(HMC_ADRES);
  Wire.write(0x02);                          // mod register'i
  Wire.write(0x00);                          // 0x00 = surekli olcum
  Wire.endTransmission();
  lcd.begin(16, 2);
  lcd.setCursor(0, 0);
  lcd.print("Pusula HMC5883L");
  Serial.begin(9600);
}

void loop() {
  Wire.beginTransmission(HMC_ADRES);
  Wire.write(0x03);                          // veri register'lari 0x03'ten baslar
  Wire.endTransmission();
  Wire.requestFrom(HMC_ADRES, 6);            // sira: X (MSB, LSB), Z (MSB, LSB), Y (MSB, LSB)

  if (Wire.available() >= 6) {
    int xh = Wire.read();
    int xl = Wire.read();
    int zh = Wire.read();
    int zl = Wire.read();
    int yh = Wire.read();
    int yl = Wire.read();
    int x = (xh << 8) | xl;                  // 16 bit isaretli sayi
    int y = (yh << 8) | yl;

    float aci = degrees(atan2(y, x));        // radyan -> derece
    if (aci < 0) {
      aci = aci + 360;                       // 0-360 araligina getir
    }
    int derece = (int)(aci + 0.5);
    if (derece >= 360) derece = 0;

    lcd.setCursor(0, 1);
    lcd.print("Yon: ");
    lcd.print(derece);
    lcd.print("   ");
    lcd.setCursor(10, 1);
    yonuYaz(derece);

    Serial.print("X=");
    Serial.print(x);
    Serial.print(" Y=");
    Serial.print(y);
    Serial.print(" Yon=");
    Serial.println(derece);
  } else {
    lcd.setCursor(0, 1);
    lcd.print("Sensor yok!     ");
  }
  delay(300);
}
