// Bluetooth kontrollu LED: telefondan '1' gelirse LED yanar, '0' gelirse soner (HC-05 + SoftwareSerial)
#include <SoftwareSerial.h>

SoftwareSerial bt(10, 11);   // RX = D10 (HC-05 TXD'den gelir), TX = D11 (HC-05 RXD'ye gider, bolucu uzerinden)
const int LED_PIN = 8;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  bt.begin(9600);            // HC-05 varsayilan hizi 9600
  Serial.println("Bluetooth LED hazir");
}

void loop() {
  while (bt.available() > 0) {
    char c = bt.read();      // telefondan gelen tek karakter
    if (c == '1') {
      digitalWrite(LED_PIN, HIGH);
      bt.println("LED ACIK");
      Serial.println("Komut: 1 -> LED ACIK");
    } else if (c == '0') {
      digitalWrite(LED_PIN, LOW);
      bt.println("LED KAPALI");
      Serial.println("Komut: 0 -> LED KAPALI");
    }
  }
}
