// Kablosuz sicaklik istasyonu: DHT11 olcer, LCD'de gosterir, HC-05 ile telefona yollar
// Telefondan 'F' gelirse Fahrenheit, 'C' gelirse Celsius gosterilir
#include <DHT.h>
#include <LiquidCrystal.h>
#include <SoftwareSerial.h>

const int DHT_PIN = 8;
DHT dht(DHT_PIN, DHT11);
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
SoftwareSerial bt(10, 9);   // RX = D10 (HC-05 TXD), TX = D9 (HC-05 RXD, bolucu uzerinden)

bool fahrenheit = false;

void setup() {
  dht.begin();
  lcd.begin(16, 2);
  lcd.print("Kablosuz Ist.");
  Serial.begin(9600);
  bt.begin(9600);
}

void loop() {
  // telefondan gelen komutlari oku
  while (bt.available() > 0) {
    char c = bt.read();
    if (c == 'F') {
      fahrenheit = true;
      Serial.println("Komut: F -> Fahrenheit");
    } else if (c == 'C') {
      fahrenheit = false;
      Serial.println("Komut: C -> Celsius");
    }
  }

  float sicaklik = dht.readTemperature(fahrenheit);
  float nem = dht.readHumidity();

  if (isnan(sicaklik) || isnan(nem)) {
    lcd.setCursor(0, 0);
    lcd.print("Sensor hatasi!  ");
    lcd.setCursor(0, 1);
    lcd.print("Kablo kontrol    ");
    bt.println("Sensor hatasi");
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Sicaklik: ");
    lcd.print(sicaklik, 1);
    lcd.print(fahrenheit ? " F  " : " C  ");
    lcd.setCursor(0, 1);
    lcd.print("Nem: %");
    lcd.print(nem, 0);
    lcd.print("        ");

    // ayni olcumu Bluetooth ile telefona gonder
    bt.print("Sicaklik: ");
    bt.print(sicaklik, 1);
    bt.print(fahrenheit ? " F" : " C");
    bt.print("  Nem: %");
    bt.println(nem, 0);
    Serial.print("Gonderildi: ");
    Serial.print(sicaklik, 1);
    Serial.print(fahrenheit ? " F " : " C ");
    Serial.println(nem, 0);
  }
  delay(2000);
}
