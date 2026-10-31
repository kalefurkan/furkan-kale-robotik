// Akilli ev kontrol paneli: 4 kanalli role modulu, LCD ve iki buton
// SEC butonu (D10) rolenin numarasini degistirir, ACIK/KAPALI butonu (A0) secili roleyi acar/kapatir
#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

const int ROLE_PIN[4] = {6, 7, 8, 9};   // IN1..IN4 (bu role modulu LOW'da calisir)
const int SEC_BUTON = 10;
const int DEGISTIR_BUTON = A0;

bool acik[4] = {false, false, false, false};
int secili = 0;                          // 0..3
bool sonSec = HIGH;
bool sonDegistir = HIGH;

void roleleriYaz() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(ROLE_PIN[i], acik[i] ? LOW : HIGH);   // LOW = role ceker
  }
}

void ekraniYaz() {
  lcd.setCursor(0, 0);
  lcd.print("Secili Role: ");
  lcd.print(secili + 1);
  lcd.print("   ");
  lcd.setCursor(0, 1);
  for (int i = 0; i < 4; i++) {
    lcd.print(i + 1);
    lcd.print(":");
    lcd.print(acik[i] ? "A" : "K");        // A = acik, K = kapali
    lcd.print(" ");
  }
}

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(ROLE_PIN[i], OUTPUT);
    digitalWrite(ROLE_PIN[i], HIGH);       // HIGH = role birakir (bu modul LOW'da ceker)
  }
  pinMode(SEC_BUTON, INPUT_PULLUP);
  pinMode(DEGISTIR_BUTON, INPUT_PULLUP);
  Serial.begin(9600);
  lcd.begin(16, 2);
  ekraniYaz();
}

void loop() {
  bool sec = digitalRead(SEC_BUTON);
  bool degistir = digitalRead(DEGISTIR_BUTON);

  if (sonSec == HIGH && sec == LOW) {      // SEC'e basildi
    secili = (secili + 1) % 4;
    Serial.print("Secili role: ");
    Serial.println(secili + 1);
    ekraniYaz();
  }
  if (sonDegistir == HIGH && degistir == LOW) {   // ACIK/KAPALI'ya basildi
    acik[secili] = !acik[secili];
    roleleriYaz();
    Serial.print("Role ");
    Serial.print(secili + 1);
    Serial.println(acik[secili] ? " ACIK" : " KAPALI");
    ekraniYaz();
  }
  sonSec = sec;
  sonDegistir = degistir;
  delay(20);
}
