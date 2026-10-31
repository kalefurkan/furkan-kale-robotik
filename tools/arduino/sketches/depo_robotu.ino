// Otonom depo robotu: 5 kanalli IR dizisi ile cizgi izler, RC522 ile yerdeki RFID etiketlerini okur
// Etiket = istasyon. Hedef istasyonda durur, 3 saniye yuk birakir; son istasyonda (Cikis) kalir.
#include <SPI.h>
#include <MFRC522.h>

const int SENS[5] = {2, A0, A1, A2, A3};   // OUT1..OUT5 (OUT1 en solda)
const int ENA = 5, ENB = 6;
const int IN1 = 7, IN2 = 8, IN3 = 9, IN4 = 4;
const int SS_PIN = 10;
const int RST_PIN = 3;

MFRC522 rfid(SS_PIN, RST_PIN);

// istasyon etiketleri: her istasyon icin UID'nin 4 bayti (0 = Raf 1, 1 = Raf 2, 2 = Cikis)
const byte ETIKET[12] = {0xA1, 0xB2, 0xC3, 0xD4,
                         0x5A, 0x6B, 0x7C, 0x8D,
                         0x99, 0x88, 0x77, 0x66};

const int TEMEL = 150;      // duz giderken hiz (0-255)
const int KP = 45;          // cizgi duzeltme katsayisi (yuzde)
int sonKonum = 0;
bool bitti = false;

void motor(int sol, int sag) {        // -255..255, eksi = geri
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

int istasyonNo() {                    // okunan UID hangi istasyon? bulunamazsa -1
  if (rfid.uid.size < 4) {
    return -1;
  }
  for (int k = 0; k < 3; k++) {
    bool esit = true;
    for (int i = 0; i < 4; i++) {
      if (rfid.uid.uidByte[i] != ETIKET[k * 4 + i]) {
        esit = false;
      }
    }
    if (esit) {
      return k;
    }
  }
  return -1;
}

void cizgiIzle() {
  int toplam = 0;
  int agirlik = 0;
  for (int i = 0; i < 5; i++) {
    int v = digitalRead(SENS[i]);
    toplam += v;
    agirlik += v * (i - 2) * 100;     // OUT1 = -200 ... OUT5 = +200
  }
  if (toplam == 0) {
    if (sonKonum >= 0) {
      motor(130, -130);               // cizgi kayboldu: son gorulen tarafa don
    } else {
      motor(-130, 130);
    }
    return;
  }
  int konum = agirlik / toplam;
  sonKonum = konum;
  int duzeltme = konum * KP / 100;
  motor(constrain(TEMEL + duzeltme, -255, 255), constrain(TEMEL - duzeltme, -255, 255));
}

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  for (int i = 0; i < 5; i++) {
    pinMode(SENS[i], INPUT);
  }
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  motor(0, 0);
  Serial.println("Depo robotu hazir: hedef Raf 2");
}

void loop() {
  if (bitti) {
    motor(0, 0);
    return;
  }
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    int no = istasyonNo();
    if (no == 1) {
      motor(0, 0);
      Serial.println("Raf 2: hedef, yuk birakiliyor");
      delay(3000);
      Serial.println("Raf 2: yuk birakildi, devam");
    } else if (no == 0) {
      Serial.println("Raf 1: hedef degil, gecis");
    } else if (no == 2) {
      motor(0, 0);
      Serial.println("Cikis: gorev bitti");
      bitti = true;
    } else {
      Serial.println("Bilinmeyen etiket: yok sayildi");
    }
    rfid.PICC_HaltA();
  }
  cizgiIzle();
  delay(10);
}
