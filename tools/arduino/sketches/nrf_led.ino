// Kablosuz kumandali LED: buton durumu NRF24L01 ile gonderilir, alici tarafta LED yanar
// Gercekte iki ayri Arduino kullanilir (kumanda ve alici); simulatorde tek Arduino'ya iki modul baglanir
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

RF24 verici(7, 8);            // kumanda modulu: CE = D7, CSN = D8
RF24 alici(9, 10);            // alici modul: CE = D9, CSN = D10
const byte adres[6] = "00001"; // iki modul ayni adresi kullanir

const int BUTON_PIN = 2;
const int LED_PIN = 6;
int sonDurum = -1;

void setup() {
  pinMode(BUTON_PIN, INPUT_PULLUP);   // basilinca LOW
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);

  verici.begin();
  verici.openWritingPipe(adres);
  verici.setPALevel(RF24_PA_MIN);
  verici.stopListening();             // gonderici modu

  alici.begin();
  alici.openReadingPipe(1, adres);
  alici.setPALevel(RF24_PA_MIN);
  alici.startListening();             // dinleyici modu
  Serial.println("NRF24L01 hazir");
}

void loop() {
  // kumanda: buton durumu degisince gonder (1 = basili, 0 = birakildi)
  int durum = (digitalRead(BUTON_PIN) == LOW) ? 1 : 0;
  if (durum != sonDurum) {
    bool basarili = verici.write(&durum, sizeof(durum));
    Serial.print("Gonderildi: ");
    Serial.print(durum);
    Serial.println(basarili ? " (onaylandi)" : " (basarisiz)");
    sonDurum = durum;
  }

  // alici: paket geldiyse LED'i guncelle
  if (alici.available()) {
    int gelen = 0;
    alici.read(&gelen, sizeof(gelen));
    digitalWrite(LED_PIN, gelen == 1 ? HIGH : LOW);
    Serial.print("Alindi: ");
    Serial.println(gelen);
  }
  delay(20);
}
