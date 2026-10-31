// SD karta veri kaydedici: DHT11 olcumlerini 2 saniyede bir VERI.CSV dosyasina ekler
#include <SPI.h>
#include <SD.h>
#include <DHT.h>

const int CS_PIN = 4;        // SD modulu CS (SPI: MOSI D11, MISO D12, SCK D13)
const int DHT_PIN = 2;
const int KAYIT_SAYISI = 6;  // bu kadar satir yazinca dosya okunup ekrana basilir

DHT dht(DHT_PIN, DHT11);
int sayac = 0;
bool bitti = false;

void setup() {
  Serial.begin(9600);
  dht.begin();
  if (!SD.begin(CS_PIN)) {   // kart yoksa ya da CS yanlissa false doner
    Serial.println("SD kart hatasi!");
    bitti = true;
    return;
  }
  Serial.println("SD kart hazir");
  File dosya = SD.open("veri.csv", FILE_WRITE);   // dosya yoksa olusturulur, varsa sonuna eklenir
  if (dosya) {
    dosya.println("sure_sn;sicaklik;nem");         // baslik satiri
    dosya.close();
  }
}

void loop() {
  if (bitti) {
    return;
  }
  float sicaklik = dht.readTemperature();
  float nem = dht.readHumidity();

  if (!isnan(sicaklik) && !isnan(nem)) {
    File dosya = SD.open("veri.csv", FILE_WRITE);
    if (dosya) {
      dosya.print(millis() / 1000);
      dosya.print(";");
      dosya.print(sicaklik, 1);
      dosya.print(";");
      dosya.println(nem, 0);
      dosya.close();                                 // close() veriyi karta kesin yazar
      sayac++;
      Serial.print("Kayit ");
      Serial.print(sayac);
      Serial.println(" yazildi");
    }
  }

  if (sayac >= KAYIT_SAYISI) {
    Serial.println("--- VERI.CSV icerigi ---");
    File oku = SD.open("veri.csv");
    while (oku.available()) {
      Serial.print((char)oku.read());
    }
    oku.close();
    bitti = true;
  }
  delay(2000);
}
