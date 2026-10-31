// Gunes takip sistemi: 2 LDR + servo + gunes paneli gerilim olcumu
// Hangi LDR daha cok isik aliyorsa servo paneli o tarafa dondurur (tek eksen).
#include <Servo.h>

const int LDR_SOL = A0;
const int LDR_SAG = A1;
const int PANEL_PIN = A2;              // panel gerilimi, 10k + 10k bolucuden (yariya iner)
const int SERVO_PIN = 9;

const int OLU_BOLGE = 40;              // iki LDR bu kadar farkliysa hareket et
const int ADIM = 1;                    // her adimda 1 derece
const int ACI_MIN = 10;
const int ACI_MAX = 170;

Servo tablo;
int aci = 90;
unsigned long sonYaz = 0;

int oku(int pin) {                     // 8 okumanin ortalamasi
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(pin);
    delay(2);
  }
  return toplam / 8;
}

void setup() {
  tablo.attach(SERVO_PIN);
  tablo.write(aci);
  Serial.begin(9600);
  Serial.println("Gunes takip hazir");
}

void loop() {
  int sol = oku(LDR_SOL);
  int sag = oku(LDR_SAG);
  int fark = sag - sol;                // + ise sag LDR daha aydinlik

  if (fark > OLU_BOLGE) {
    aci = min(aci + ADIM, ACI_MAX);
    tablo.write(aci);
  } else if (fark < -OLU_BOLGE) {
    aci = max(aci - ADIM, ACI_MIN);
    tablo.write(aci);
  }

  if (millis() - sonYaz >= 1000) {
    sonYaz = millis();
    int panelAdc = oku(PANEL_PIN);
    long panelMv = (long)panelAdc * 2 * 5000 / 1023;   // bolucu nedeniyle x2
    Serial.print("LDR sol=");
    Serial.print(sol);
    Serial.print(" sag=");
    Serial.print(sag);
    Serial.print(" aci=");
    Serial.print(aci);
    Serial.print(" panel=");
    Serial.print(panelMv);
    Serial.println(" mV");
  }
  delay(40);
}
