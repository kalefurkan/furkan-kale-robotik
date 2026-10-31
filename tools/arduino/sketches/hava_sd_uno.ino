// Dogrulama surumu (Uno): BME280 olcumlerini SD karta CSV olarak yazar ve geri okur (ESP32 projesinin Wi-Fi'siz hali)
#include <SPI.h>
#include <SD.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;          // I2C: SDA = A4, SCL = A5
const int CS_PIN = 4;         // SD modulu CS (SPI: MOSI D11, MISO D12, SCK D13)
int sayac = 0;

void setup() {
  Serial.begin(9600);
  if (!bme.begin(0x76)) {
    Serial.println("BME280 bulunamadi");
    while (true) { delay(1000); }
  }
  if (!SD.begin(CS_PIN)) {
    Serial.println("SD kart hatasi");
    while (true) { delay(1000); }
  }
  File dosya = SD.open("olcum.csv", FILE_WRITE);
  dosya.println("sure_sn;sicaklik;nem;basinc");
  dosya.close();
  Serial.println("Istasyon hazir");
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0;
  File dosya = SD.open("olcum.csv", FILE_WRITE);
  dosya.print(millis() / 1000);
  dosya.print(";");
  dosya.print(t, 1);
  dosya.print(";");
  dosya.print(h, 0);
  dosya.print(";");
  dosya.println(p, 0);
  dosya.close();
  sayac++;
  Serial.print("Kayit ");
  Serial.print(sayac);
  Serial.print(": ");
  Serial.print(t, 1);
  Serial.println(" C");
  if (sayac == 4) {
    Serial.println("--- OLCUM.CSV ---");
    File oku = SD.open("olcum.csv");
    while (oku.available()) {
      Serial.print((char)oku.read());
    }
    oku.close();
  }
  delay(2000);
}
