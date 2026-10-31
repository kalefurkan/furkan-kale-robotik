// Sesle kontrol edilen robot: ses tanima modulu (seri) + L298N + iki motor
// Modul bir komut taniyinca seri hattan komut numarasini (0-9, ASCII) yollar. 1 ileri, 2 geri, 3 sol, 4 sag, 5 dur
#include <SoftwareSerial.h>

SoftwareSerial ses(2, 3);           // RX = D2 (modul TX), TX = D3 (modul RX)

const int ENA = 5, ENB = 6;
const int IN1 = 7, IN2 = 8, IN3 = 9, IN4 = 10;
const int HIZ = 180;                // 0-255
const unsigned long KOMUT_SURESI = 3000;   // hareket komutu bu sureden sonra kendiliginden durur

unsigned long komutZamani = 0;
bool hareketVar = false;

void motor(int sol, int sag) {      // -255..255, eksi = geri
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

void setup() {
  Serial.begin(9600);
  ses.begin(9600);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  motor(0, 0);
  Serial.println("Ses kontrollu robot hazir");
}

void loop() {
  while (ses.available() > 0) {
    char c = ses.read();
    if (c < '0' || c > '9') {
      continue;                     // satir sonu ve diger karakterleri atla
    }
    int komut = c - '0';
    Serial.print("Komut ");
    Serial.print(komut);
    Serial.print(": ");
    hareketVar = true;
    komutZamani = millis();
    if (komut == 1) {
      motor(HIZ, HIZ);
      Serial.println("ileri");
    } else if (komut == 2) {
      motor(-HIZ, -HIZ);
      Serial.println("geri");
    } else if (komut == 3) {
      motor(-HIZ, HIZ);
      Serial.println("sola don");
    } else if (komut == 4) {
      motor(HIZ, -HIZ);
      Serial.println("saga don");
    } else if (komut == 5) {
      motor(0, 0);
      hareketVar = false;
      Serial.println("dur");
    } else {
      motor(0, 0);
      hareketVar = false;
      Serial.println("taninmayan komut: dur");
    }
  }
  if (hareketVar && millis() - komutZamani > KOMUT_SURESI) {
    motor(0, 0);                    // guvenlik: yeni komut gelmezse robot durur
    hareketVar = false;
    Serial.println("Zaman asimi: dur");
  }
}
