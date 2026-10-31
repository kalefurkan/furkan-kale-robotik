// DHT11 ile ortamın sıcaklığını ve nemini ölçer
#include <DHT.h>                    // Adafruit "DHT sensor library" (Arduino IDE'de Kütüphane Yöneticisi'nden kur)

const int DHT_PIN = 2;              // DHT11 DATA bacağı D2'ye bağlı
DHT dht(DHT_PIN, DHT11);            // sensör tipi: DHT11

void setup() {
  Serial.begin(9600);
  dht.begin();                      // sensörü başlat
}

void loop() {
  float sicaklik = dht.readTemperature();   // °C
  float nem = dht.readHumidity();           // % bağıl nem

  if (isnan(sicaklik) || isnan(nem)) {      // okuma başarısızsa NaN (sayı değil) döner
    Serial.println("Sensör okunamadı! Bağlantıları kontrol et.");
  } else {
    Serial.print("Sıcaklık: ");
    Serial.print(sicaklik);
    Serial.print(" C   Nem: %");
    Serial.println(nem);
  }
  delay(2000);                              // DHT11 en fazla 1-2 saniyede bir okunabilir
}
