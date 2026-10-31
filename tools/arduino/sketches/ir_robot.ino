// Uzaktan kumandali robot: IR alici (VS1838B) + 21 tuslu kumanda + L298N + 2 DC motor
// 2 ileri, 8 geri, 4 sola, 6 saga, 5 dur, VOL+ / VOL- hiz
#include <IRremote.h>

const int IR_PIN = 2;
IRrecv irrecv(IR_PIN);
decode_results results;

const int ENA = 5;
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;

int hiz = 180;                 // 0-255
int sol = 0;                   // son yon komutlari (-1, 0, 1)
int sag = 0;

void surucu() {                // son komutu motorlara uygular
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, hiz);
  analogWrite(ENB, hiz);
}

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  irrecv.enableIRIn();
  surucu();
  Serial.println("Kumandali robot hazir");
}

void loop() {
  if (irrecv.decode(&results)) {
    unsigned long kod = results.value;
    Serial.print("Kod: ");
    Serial.print(kod, HEX);
    Serial.print(" -> ");
    if (kod == 0xFF18E7) {            // tus 2
      sol = 1;
      sag = 1;
      Serial.println("ILERI");
    } else if (kod == 0xFF4AB5) {     // tus 8
      sol = -1;
      sag = -1;
      Serial.println("GERI");
    } else if (kod == 0xFF10EF) {     // tus 4
      sol = -1;
      sag = 1;
      Serial.println("SOLA");
    } else if (kod == 0xFF5AA5) {     // tus 6
      sol = 1;
      sag = -1;
      Serial.println("SAGA");
    } else if (kod == 0xFF38C7) {     // tus 5
      sol = 0;
      sag = 0;
      Serial.println("DUR");
    } else if (kod == 0xFFA857) {     // VOL+
      hiz = min(hiz + 25, 255);
      Serial.print("HIZ ");
      Serial.println(hiz);
    } else if (kod == 0xFFE01F) {     // VOL-
      hiz = max(hiz - 25, 80);
      Serial.print("HIZ ");
      Serial.println(hiz);
    } else {
      Serial.println("taninmayan tus");
    }
    surucu();
    irrecv.resume();                  // sonraki kodu bekle
  }
  delay(20);
}
