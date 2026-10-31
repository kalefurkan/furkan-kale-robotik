// Internet uzerinden sensor izleme: DHT22 + ESP-01 (AT komutlari) -> ThingSpeak benzeri bir servise HTTP GET
// Sicaklik ve nem (10 ile carpilmis tam sayi: 245 = 24.5) "field1" ve "field2" olarak gonderilir.
// NOT: Simulatorde gercek ag olmadigi icin AT+CIPSTART ERROR doner; gonderme basari yolu simulatorde denenemez.
#include <SoftwareSerial.h>
#include <DHT.h>

SoftwareSerial esp(2, 3);      // RX = D2 (ESP TX), TX = D3 (ESP RX, bolucu uzerinden)
DHT dht(4, DHT22);             // DATA = D4

const long GONDERME_ARALIGI = 6000;   // ms. Gercek ThingSpeak ucretsiz hesapta en az 15000 ms olmali
unsigned long sonGonder = 0;
int gonderilen = 0;
int basarisiz = 0;

bool bekle2(char a, char b, int ms) {   // ms boyunca ESP'den gelen metinde a,b ardisik harflerini ara
  char onceki = 0;
  bool bulundu = false;
  unsigned long t0 = millis();
  while (millis() - t0 < ms) {
    while (esp.available() > 0) {
      char c = esp.read();
      if (onceki == a && c == b) {
        bulundu = true;
      }
      onceki = c;
    }
    delay(2);
  }
  return bulundu;
}

int basamak(int n) {                    // sayinin yazilis uzunlugu (eksi isareti dahil)
  int say = 1;
  if (n < 0) {
    say = 2;
    n = -n;
  }
  while (n >= 10) {
    n = n / 10;
    say++;
  }
  return say;
}

bool gonder(int t10, int h10) {
  esp.println("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80");
  if (!bekle2('O', 'K', 1500)) {
    return false;                       // baglanti kurulamadi
  }
  int uzunluk = 20 + 16 + 8 + basamak(t10) + 8 + basamak(h10) + 2;
  esp.print("AT+CIPSEND=");
  esp.println(uzunluk);
  if (!bekle2('>', ' ', 1000)) {
    return false;
  }
  esp.print("GET /update?api_key=ABCDEFGH12345678&field1=");
  esp.print(t10);
  esp.print("&field2=");
  esp.println(h10);
  bool tamam = bekle2('O', 'K', 3000);
  esp.println("AT+CIPCLOSE");
  return tamam;
}

void setup() {
  Serial.begin(9600);
  esp.begin(9600);
  dht.begin();
  Serial.println("Sensor izleme hazir");
  delay(500);
  esp.println("AT+CWMODE=1");
  bekle2('O', 'K', 500);
  esp.println("AT+CWJAP=\"MakersHub\",\"12345678\"");
  if (bekle2('I', 'P', 6000)) {
    Serial.println("Wi-Fi baglandi");
  } else {
    Serial.println("Wi-Fi BAGLANAMADI");
  }
  sonGonder = millis();
}

void loop() {
  if (millis() - sonGonder >= GONDERME_ARALIGI) {
    sonGonder = millis();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (isnan(t) || isnan(h)) {
      Serial.println("DHT22 okunamadi");
      return;
    }
    int t10 = (int)(t * 10);
    int h10 = (int)(h * 10);
    Serial.print("Olcum: ");
    Serial.print(t, 1);
    Serial.print(" C, nem %");
    Serial.println(h, 1);
    if (gonder(t10, h10)) {
      gonderilen++;
      Serial.println("Gonderildi");
    } else {
      basarisiz++;
      Serial.print("Gonderilemedi (toplam basarisiz: ");
      Serial.print(basarisiz);
      Serial.println(")");
    }
  }
  delay(50);
}
