// Web tabanli akilli sulama: toprak nem sensoru + NPN suruculu pompa + ESP-01 (AT komutlari)
// Otomatik mod: toprak kuruysa pompa calisir, yeterince islaninca durur (histerezis) ve en fazla MAKS_POMPA_MS calisir.
// Web komutlari (ESP-01'den "+IPD...:GET /p" gibi): /p pompa ac, /s pompa durdur, /a otomatik mod
#include <SoftwareSerial.h>

SoftwareSerial esp(2, 3);      // RX = D2 (ESP TX), TX = D3 (ESP RX, bolucu uzerinden)

const int NEM_PIN = A0;
const int POMPA_PIN = 5;       // 1 kOhm direncle NPN tabanina

const int KURU_ESIK = 700;     // bu degerin ustu: kuru (sensor kuruda yuksek gerilim verir)
const int ISLAK_ESIK = 500;    // bu degerin alti: yeterince islak
const unsigned long MAKS_POMPA_MS = 5000;   // pompa bir seferde en fazla bu kadar calissin

bool otomatik = true;
bool pompaAcik = false;
unsigned long pompaBaslangic = 0;
unsigned long sonOlcum = 0;
int asama = 0;

int nemOku() {                 // 8 okumanin ortalamasi
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(NEM_PIN);
    delay(2);
  }
  return toplam / 8;
}

void pompa(bool ac) {
  if (ac == pompaAcik) {
    return;
  }
  pompaAcik = ac;
  digitalWrite(POMPA_PIN, ac ? HIGH : LOW);
  if (ac) {
    pompaBaslangic = millis();
    Serial.println("POMPA ACIK");
  } else {
    Serial.println("POMPA KAPALI");
  }
}

bool bekle2(char a, char b, int ms) {
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

void istekIsle(char c) {       // "GET /p", "GET /s", "GET /a" ayristirir
  if (asama == 0) {
    asama = (c == 'G') ? 1 : 0;
  } else if (asama == 1) {
    asama = (c == 'E') ? 2 : 0;
  } else if (asama == 2) {
    asama = (c == 'T') ? 3 : 0;
  } else if (asama == 3) {
    asama = (c == ' ') ? 4 : 0;
  } else if (asama == 4) {
    asama = (c == '/') ? 5 : 0;
  } else if (asama == 5) {
    if (c == 'p') {
      otomatik = false;
      pompa(true);
      Serial.println("Web: manuel pompa ac");
    } else if (c == 's') {
      otomatik = false;
      pompa(false);
      Serial.println("Web: pompa durdur");
    } else if (c == 'a') {
      otomatik = true;
      Serial.println("Web: otomatik mod");
    }
    asama = 0;
  }
}

void setup() {
  pinMode(POMPA_PIN, OUTPUT);
  digitalWrite(POMPA_PIN, LOW);
  Serial.begin(9600);
  esp.begin(9600);
  Serial.println("Akilli sulama hazir");
  delay(500);
  esp.println("AT+CWMODE=1");
  bekle2('O', 'K', 500);
  esp.println("AT+CWJAP=\"MakersHub\",\"12345678\"");
  if (bekle2('I', 'P', 6000)) {
    Serial.println("Wi-Fi baglandi");
  } else {
    Serial.println("Wi-Fi BAGLANAMADI");
  }
  esp.println("AT+CIPMUX=1");
  bekle2('O', 'K', 500);
  esp.println("AT+CIPSERVER=1,80");
  bekle2('O', 'K', 500);
  Serial.println("Sunucu hazir (web tarafi simulatorde denenemez)");
}

void loop() {
  while (esp.available() > 0) {
    istekIsle(esp.read());
  }

  int nem = nemOku();
  if (millis() - sonOlcum >= 1000) {
    sonOlcum = millis();
    Serial.print("Toprak: ");
    Serial.print(nem);
    Serial.print(pompaAcik ? "  pompa acik" : "  pompa kapali");
    Serial.println(otomatik ? "  [oto]" : "  [manuel]");
  }

  if (otomatik) {
    if (!pompaAcik && nem > KURU_ESIK) {
      pompa(true);
    } else if (pompaAcik && nem < ISLAK_ESIK) {
      pompa(false);
    }
  }
  if (pompaAcik && millis() - pompaBaslangic >= MAKS_POMPA_MS) {
    pompa(false);              // guvenlik: sensor bozuksa pompa surekli calismasin
    otomatik = false;
    Serial.println("SURE DOLDU: pompa durduruldu, otomatik mod kapandi");
  }
  delay(50);
}
