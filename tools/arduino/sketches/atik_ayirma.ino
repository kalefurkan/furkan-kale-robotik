// Otomatik atik ayristirma: IR sensor (atik geldi) + TCS3200 renk sensoru + servo (yonlendirici)
// Renge gore: mavi = plastik, yesil = cam, kirmizi = metal, diger = genel. Servo ilgili kutuya doner.
const int S0 = 4;
const int S1 = 5;
const int S2 = 6;
const int S3 = 7;
const int SENSOR_OUT = 8;
const int IR_PIN = 2;
const int SERVO_PIN = 9;

#include <Servo.h>
Servo yonlendirici;

const int KUTU_ACI[4] = {20, 65, 115, 160};   // 0 plastik, 1 cam, 2 metal, 3 genel
const int ORTA = 90;

int okuRenk(int s2, int s3) {                  // 0-255 arasi parlaklik (acik renk = yuksek)
  digitalWrite(S2, s2);
  digitalWrite(S3, s3);
  delay(30);
  long darbe = pulseIn(SENSOR_OUT, LOW);       // mikrosaniye, parlaksa kisa
  if (darbe == 0) {
    return 0;                                  // darbe gelmedi (sensor bagli degil)
  }
  long frekans = 500000L / darbe;              // Hz: yarim periyottan frekans
  int deger = map(frekans, 1000, 20000, 0, 255);   // siyah = 1 kHz, beyaz = 20 kHz (%20 olcek)
  return constrain(deger, 0, 255);
}

int siniflandir(int r, int g, int b) {         // kutu numarasi dondurur
  if (r < 60 && g < 60 && b < 60) {
    return 3;                                  // cok koyu: genel
  }
  if (b > r + 40 && b > g + 20) {
    return 0;                                  // mavi: plastik
  }
  if (g > r + 40 && g > b + 40) {
    return 1;                                  // yesil: cam
  }
  if (r > g + 40 && r > b + 40) {
    return 2;                                  // kirmizi: metal
  }
  return 3;                                    // diger: genel
}

void setup() {
  pinMode(S0, OUTPUT);
  pinMode(S1, OUTPUT);
  pinMode(S2, OUTPUT);
  pinMode(S3, OUTPUT);
  pinMode(SENSOR_OUT, INPUT);
  pinMode(IR_PIN, INPUT);
  digitalWrite(S0, HIGH);                      // frekans olcegi %20
  digitalWrite(S1, LOW);
  yonlendirici.attach(SERVO_PIN);
  yonlendirici.write(ORTA);
  Serial.begin(9600);
  Serial.println("Atik ayirma hazir");
}

void loop() {
  if (digitalRead(IR_PIN) == LOW) {            // atik geldi (engel var)
    delay(300);                                // atik otursun
    int r = okuRenk(LOW, LOW);
    int g = okuRenk(HIGH, HIGH);
    int b = okuRenk(LOW, HIGH);
    int kutu = siniflandir(r, g, b);
    Serial.print("Renk R=");
    Serial.print(r);
    Serial.print(" G=");
    Serial.print(g);
    Serial.print(" B=");
    Serial.print(b);
    if (kutu == 0) {
      Serial.println(" -> PLASTIK kutusu");
    } else if (kutu == 1) {
      Serial.println(" -> CAM kutusu");
    } else if (kutu == 2) {
      Serial.println(" -> METAL kutusu");
    } else {
      Serial.println(" -> GENEL kutu");
    }
    yonlendirici.write(KUTU_ACI[kutu]);
    delay(1000);                               // atigin kaymasi icin bekle
    yonlendirici.write(ORTA);
    while (digitalRead(IR_PIN) == LOW) {       // atik gidene kadar bekle
      delay(50);
    }
    delay(200);
  }
  delay(50);
}
