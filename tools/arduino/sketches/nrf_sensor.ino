// Kablosuz sensor agi: sensor dugumu DHT11 verisini NRF24L01 ile yollar, merkez dugum alip ekrana yazar
// Gercekte iki ayri Arduino kullanilir (sensor dugumu ve merkez); simulatorde tek Arduino'ya iki modul baglanir
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <DHT.h>

RF24 verici(7, 8);             // sensor dugumunun modulu: CE = D7, CSN = D8
RF24 alici(9, 10);             // merkez dugumun modulu: CE = D9, CSN = D10
const byte adres[6] = "node1";
const int DUGUM_NO = 1;        // bu sensor dugumunun numarasi (ag birden cok dugum icerebilir)

DHT dht(2, DHT11);

void setup() {
  Serial.begin(9600);
  dht.begin();

  verici.begin();
  verici.openWritingPipe(adres);
  verici.setPALevel(RF24_PA_MIN);
  verici.stopListening();

  alici.begin();
  alici.openReadingPipe(1, adres);
  alici.setPALevel(RF24_PA_MIN);
  alici.startListening();
  Serial.println("Sensor agi hazir");
}

void loop() {
  // --- sensor dugumu: olc ve gonder ---
  float sicaklik = dht.readTemperature();
  float nem = dht.readHumidity();
  if (!isnan(sicaklik) && !isnan(nem)) {
    int paket[3];                       // paket: {dugum no, sicaklik, nem}
    paket[0] = DUGUM_NO;
    paket[1] = (int)sicaklik;
    paket[2] = (int)nem;
    bool basarili = verici.write(&paket, sizeof(paket));
    if (!basarili) {
      Serial.println("Gonderilemedi");
    }
  }

  // --- merkez dugum: gelen paketi oku ---
  if (alici.available()) {
    int gelen[3];
    alici.read(&gelen, sizeof(gelen));
    Serial.print("Dugum ");
    Serial.print(gelen[0]);
    Serial.print(": ");
    Serial.print(gelen[1]);
    Serial.print(" C, nem %");
    Serial.print(gelen[2]);
    if (gelen[1] > 30) {
      Serial.print("  UYARI: SICAK");
    }
    Serial.println();
  }
  delay(2000);                          // DHT11 en sik 2 saniyede bir okunur
}
