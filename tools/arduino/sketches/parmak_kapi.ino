// Parmak iziyle kapi kilidi: AS608 sensoru kayitli parmagi taniyinca servo kapiyi acar
#include <SoftwareSerial.h>
#include <Adafruit_Fingerprint.h>
#include <Servo.h>

SoftwareSerial sensorSerial(2, 3);   // RX = D2 (AS608 TX), TX = D3 (AS608 RX)
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&sensorSerial);
Servo kapi;

const int SERVO_PIN = 9;
const int KAPALI_ACI = 0;
const int ACIK_ACI = 90;

// Parmagi arar: kayitli kimligi, parmak yoksa -1, tanimsiz parmak icin -2 dondurur
int parmakAra() {
  uint8_t p = finger.getImage();            // sensorden goruntu al
  if (p != FINGERPRINT_OK) {
    return -1;                               // parmak yok
  }
  p = finger.image2Tz();                     // goruntuyu ozellik sablonuna cevir
  if (p != FINGERPRINT_OK) {
    return -1;
  }
  p = finger.fingerFastSearch();             // kayitli sablonlar arasinda ara
  if (p == FINGERPRINT_NOTFOUND) {
    return -2;
  }
  if (p != FINGERPRINT_OK) {
    return -1;
  }
  return finger.fingerID;                    // eslesen kayit numarasi
}

void setup() {
  Serial.begin(9600);
  kapi.attach(SERVO_PIN);
  kapi.write(KAPALI_ACI);
  finger.begin(57600);                       // AS608 varsayilan hizi 57600
  if (finger.verifyPassword()) {
    Serial.println("Sensor bulundu");
  } else {
    Serial.println("Sensor bulunamadi: kablolari kontrol et");
    while (true) {
      delay(1);
    }
  }
  finger.getTemplateCount();
  Serial.print("Kayitli parmak sayisi: ");
  Serial.println(finger.templateCount);
}

void loop() {
  int sonuc = parmakAra();
  if (sonuc >= 0) {
    Serial.print("Parmak tanindi, kimlik=");
    Serial.println(sonuc);
    Serial.println("Kapi acik");
    kapi.write(ACIK_ACI);
    delay(3000);
    kapi.write(KAPALI_ACI);
    Serial.println("Kapi kapandi");
  } else if (sonuc == -2) {
    Serial.println("Parmak tanimli degil: giris reddedildi");
    delay(1500);
  }
  delay(100);
}
