// Wi-Fi kontrollu akilli ev: Uno + ESP-01 (AT komutlari) + 4 kanalli role modulu + 2 duvar butonu
// ESP-01 Wi-Fi'ye baglanir ve 80. portta sunucu acar. Web istegi "+IPD...:GET /1/on" gibi gelir: /1/on /1/off ... /4/on /4/off
// Gelen yazi karakter karakter bir "durum makinesi" ile cozulur (String kullanilmaz).
#include <SoftwareSerial.h>

SoftwareSerial esp(2, 3);      // RX = D2 (ESP TX), TX = D3 (ESP RX, bolucu uzerinden)

const int ROLE_PIN[4] = {6, 7, 4, 5};   // IN1..IN4 (modul LOW'da ceker)
const int BUTON_PIN[2] = {8, 9};        // duvar butonlari: role 1 ve role 2 (INPUT_PULLUP)
bool acik[4] = {false, false, false, false};
bool butonOnceki[2] = {false, false};

int asama = 0;                 // "GET /k/on" ayristirma durumu
int kanal = 0;

bool bekle2(char a, char b, int ms) {   // ms boyunca ESP'den gelen metinde a,b ardisik harfleri ara
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

void roleYaz(int k, bool durum) {       // k = 0..3
  acik[k] = durum;
  digitalWrite(ROLE_PIN[k], durum ? LOW : HIGH);
  Serial.print("Role ");
  Serial.print(k + 1);
  if (durum) {
    Serial.println(": ACIK");
  } else {
    Serial.println(": KAPALI");
  }
}

void sonuc(bool tamam) {
  if (tamam) {
    Serial.println("  -> tamam");
  } else {
    Serial.println("  -> BASARISIZ");
  }
}

void istekIsle(char c) {                // "GET /k/on" ya da "GET /k/off"
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
    if (c >= '1' && c <= '4') {
      kanal = c - '1';
      asama = 6;
    } else {
      asama = 0;
    }
  } else if (asama == 6) {
    asama = (c == '/') ? 7 : 0;
  } else if (asama == 7) {
    asama = (c == 'o') ? 8 : 0;
  } else if (asama == 8) {
    if (c == 'n') {
      roleYaz(kanal, true);
    } else if (c == 'f') {
      roleYaz(kanal, false);
    }
    asama = 0;
  }
}

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(ROLE_PIN[i], OUTPUT);
    digitalWrite(ROLE_PIN[i], HIGH);    // baslangicta hepsi kapali
  }
  for (int i = 0; i < 2; i++) {
    pinMode(BUTON_PIN[i], INPUT_PULLUP);
  }
  Serial.begin(9600);
  esp.begin(9600);
  Serial.println("Akilli ev hazir");
  delay(500);

  Serial.print("AT");
  esp.println("AT");
  sonuc(bekle2('O', 'K', 500));
  Serial.print("AT+CWMODE=1");
  esp.println("AT+CWMODE=1");
  sonuc(bekle2('O', 'K', 500));
  Serial.print("Wi-Fi agina baglaniyor");
  esp.println("AT+CWJAP=\"MakersHub\",\"12345678\"");
  sonuc(bekle2('I', 'P', 6000));
  Serial.print("AT+CIPMUX=1");
  esp.println("AT+CIPMUX=1");
  sonuc(bekle2('O', 'K', 500));
  Serial.print("AT+CIPSERVER=1,80");
  esp.println("AT+CIPSERVER=1,80");
  sonuc(bekle2('O', 'K', 500));
  Serial.println("Sunucu istek bekliyor (web tarafi simulatorde denenemez)");
}

void loop() {
  while (esp.available() > 0) {         // ESP'den gelen web istegini coz
    istekIsle(esp.read());
  }
  for (int i = 0; i < 2; i++) {         // duvar butonu: basinca role durumunu ters cevir
    bool bas = (digitalRead(BUTON_PIN[i]) == LOW);
    if (bas && !butonOnceki[i]) {
      roleYaz(i, !acik[i]);
    }
    butonOnceki[i] = bas;
  }
  delay(20);
}
