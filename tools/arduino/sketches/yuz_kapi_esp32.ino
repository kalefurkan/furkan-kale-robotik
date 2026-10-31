// Yuz tanima kontrollu kapi - SERVO KAPI KODU (ESP32-CAM). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
//
// KAPSAM VE SINIRLAR: Bu dosya YUZ TANIMA yapmaz. Yuz tanima, Arduino IDE'nin hazir "CameraWebServer" ornegindedir
// (Dosya > Ornekler > ESP32 > Camera > CameraWebServer; ESP32 cekirdegi 2.0.x, kart "AI Thinker ESP32-CAM", PSRAM etkin).
// Ornekte web arayuzunden "Face Recognition" acilir ve "Enroll Face" ile yuzler kaydedilir. Bu dosya o ornege YENI BIR SEKME olarak eklenir
// ve servo kapiyi acar. Yuz tanima sonucu ornegin kendi kodundan gelir; biz yalnizca sonucu servoya baglariz.
//
// BAGLAMA ADIMLARI (CameraWebServer ornegine):
//  1) Bu dosyayi ornegin klasorune yeni sekme olarak ekle (ornegin kapi.ino); Servo icin "ESP32Servo" kutuphanesini kur.
//  2) CameraWebServer.ino icindeki setup() sonunda kapiBaslat(); , loop() icinde kapiKontrol(); cagir.
//  3) app_httpd.cpp icinde yuz tanima sonucunun yazdirildigi yeri bul (esleme bulununca "Match Face ID" yazan satir)
//     ve eslesme (matched_id >= 0) kolunda kapiAc(); cagir. Dosyanin basina: extern void kapiAc();
//     Satirlar ornek surumune gore degisebilir; bu adim kendi surumunde elle yapilir.
//  Cekirdek 3.x surumlerinde ornekteki yuz tanima bolumu kaldirilmis olabilir; bu durumda 2.0.x cekirdegi kullan.
#include <ESP32Servo.h>

const int SERVO_PIN = 13;                 // devrede servo sinyali IO13
const int KAPALI_ACI = 0;
const int ACIK_ACI = 90;
const unsigned long ACIK_SURE = 5000;     // tanima sonrasi kapi bu kadar acik kalir

Servo kapi;
bool kapiAcikMi = false;
unsigned long kapiAcilma = 0;

void kapiBaslat() {
  ESP32PWM::allocateTimer(2);             // kamera XCLK'si LEDC zamanlayici 0'i kullanir; servo icin baska zamanlayici ayir
  kapi.setPeriodHertz(50);
  kapi.attach(SERVO_PIN, 500, 2400);
  kapi.write(KAPALI_ACI);
  Serial.println("Kapi hazir: yuz tanima eslesmesi bekleniyor (deneme icin Seri Monitor'e 'a' yaz)");
}

void kapiAc() {                           // yuz tanima eslesmesi bulununca cagrilir
  if (!kapiAcikMi) {
    Serial.println("Taninan yuz: kapi aciliyor");
    kapi.write(ACIK_ACI);
    kapiAcikMi = true;
  }
  kapiAcilma = millis();                  // eslesme surerse kapi acik kalir
}

void kapiKontrol() {                      // loop() icinde surekli cagrilir
  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 'a') {
      kapiAc();                           // yuz tanima olmadan servo kolunu denemek icin
    }
  }
  if (kapiAcikMi && millis() - kapiAcilma > ACIK_SURE) {
    kapi.write(KAPALI_ACI);
    kapiAcikMi = false;
    Serial.println("Kapi kapandi");
  }
}
