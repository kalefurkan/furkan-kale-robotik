// Cok katli akilli otopark: her katta bir HC-SR04 (park yeri dolu mu?), LCD durum ekrani, servo bariyer, giris butonu
// Sensor aracin ustune 15 cm'den yakinsa kat DOLU sayilir. Bos yer varsa buton servo bariyeri acar.
#include <LiquidCrystal.h>
#include <Servo.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
Servo bariyer;

const int KAT = 3;
const int TRIG[3] = {6, 8, A1};
const int ECHO[3] = {7, 10, A0};
const int BUTON = 13;                  // giris butonu (INPUT_PULLUP)
const int SERVO_PIN = 9;
const int DOLU_CM = 15;                // bundan yakinsa dolu

bool dolu[3] = {false, false, false};
int sonDurum = -1;                     // ekran/Serial'i yalniz degisince yaz

int mesafeOlc(int k) {                 // cm, olcemezse 999
  digitalWrite(TRIG[k], LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG[k], HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG[k], LOW);
  long sure = pulseIn(ECHO[k], HIGH, 30000);
  if (sure == 0) {
    return 999;
  }
  return (int)(sure * 0.0343 / 2);
}

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  bariyer.attach(SERVO_PIN);
  bariyer.write(0);                    // bariyer kapali
  pinMode(BUTON, INPUT_PULLUP);
  for (int k = 0; k < KAT; k++) {
    pinMode(TRIG[k], OUTPUT);
    pinMode(ECHO[k], INPUT);
  }
  Serial.println("Otopark hazir");
}

void ekranYaz(int bos) {
  lcd.setCursor(0, 0);
  for (int k = 0; k < KAT; k++) {
    lcd.print("K");
    lcd.print(k + 1);
    lcd.print(dolu[k] ? ":D " : ":B ");
  }
  lcd.print("   ");
  lcd.setCursor(0, 1);
  if (bos > 0) {
    lcd.print("Bos kat: ");
    lcd.print(bos);
    lcd.print("      ");
  } else {
    lcd.print("OTOPARK DOLU    ");
  }
}

void loop() {
  int bos = 0;
  int durum = 0;                       // 3 bitlik durum: degisimi anlamak icin
  for (int k = 0; k < KAT; k++) {
    int d = mesafeOlc(k);
    dolu[k] = (d < DOLU_CM);
    if (dolu[k]) {
      durum = durum | (1 << k);
    } else {
      bos++;
    }
    delay(30);                         // sensorler birbirinin yankisini duymasin
  }
  if (durum != sonDurum) {
    sonDurum = durum;
    ekranYaz(bos);
    Serial.print("Bos kat: ");
    Serial.println(bos);
  }

  if (digitalRead(BUTON) == LOW) {     // arac giris butonuna bastı
    if (bos > 0) {
      Serial.println("Giris serbest: bariyer acik");
      bariyer.write(90);
      delay(3000);
      bariyer.write(0);
      Serial.println("Bariyer kapandi");
    } else {
      Serial.println("Giris yok: otopark dolu");
    }
    delay(300);                        // buton titreşimi
  }
  delay(100);
}
