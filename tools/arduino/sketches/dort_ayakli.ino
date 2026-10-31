// Dort ayakli yuruyen robot: 8 servo (her bacakta 1 kalca + 1 diz servosu)
// Bacaklar: 0 on sol, 1 on sag, 2 arka sol, 3 arka sag. Capraz bacaklar birlikte adim atar (tirap yuruyusu).
#include <Servo.h>

Servo kalca[4];
Servo diz[4];
const int KALCA_PIN[4] = {2, 3, 4, 5};
const int DIZ_PIN[4] = {6, 7, 8, 9};

const int ORTA = 90;       // dik durus
const int ILERI = 25;      // kalca salinim acisi
const int KALDIR = 55;     // diz acisi: ayak havada
const int BEKLE = 200;     // her evre sonrasi bekleme (ms)

int adimSayisi = 0;

bool solBacak(int i) {
  return i == 0 || i == 2;
}

// cift 0: on sol + arka sag havada, cift 1: on sag + arka sol havada
bool havada(int i, int cift) {
  if (i == 0 || i == 3) {
    return cift == 0;
  }
  return cift == 1;
}

void kalcaYaz(int i, int yon) {          // yon +1 ileri, -1 geri (sol/sag tarafi aynalidir)
  int aci = solBacak(i) ? ORTA + yon * ILERI : ORTA - yon * ILERI;
  kalca[i].write(aci);
}

void yariAdim(int cift) {
  for (int i = 0; i < 4; i++) {            // 1. evre: havadakiler kalkar, yerdekiler geri iter
    if (havada(i, cift)) {
      diz[i].write(KALDIR);
    } else {
      kalcaYaz(i, -1);
    }
  }
  delay(BEKLE);
  for (int i = 0; i < 4; i++) {            // 2. evre: havadakiler one sallanir
    if (havada(i, cift)) {
      kalcaYaz(i, 1);
    }
  }
  delay(BEKLE);
  for (int i = 0; i < 4; i++) {            // 3. evre: ayaklar yere iner
    if (havada(i, cift)) {
      diz[i].write(ORTA);
    }
  }
  delay(BEKLE);
}

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 4; i++) {
    kalca[i].attach(KALCA_PIN[i]);
    diz[i].attach(DIZ_PIN[i]);
    kalca[i].write(ORTA);
    diz[i].write(ORTA);
  }
  Serial.println("Dort ayakli robot hazir: ayakta");
  delay(1500);
}

void loop() {
  adimSayisi++;
  Serial.print("Adim ");
  Serial.print(adimSayisi);
  Serial.println(": on sol + arka sag one");
  yariAdim(0);
  Serial.println("  on sag + arka sol one");
  yariAdim(1);
  if (adimSayisi == 4) {
    for (int i = 0; i < 4; i++) {
      kalca[i].write(ORTA);
      diz[i].write(ORTA);
    }
    Serial.println("4 adim tamam: ayakta bekle");
    delay(3000);
    adimSayisi = 0;
  }
}
