// Deprem algilama ve uyari: SW-420 titresim sensoru titresimi sayar, yeterince cok titresim olursa buzzer oter
#include <LiquidCrystal.h>

const int TITRESIM_PIN = 6;       // SW-420 DO (titresimde HIGH)
const int BUZZER_PIN = 8;
const int ESIK = 3;               // 1 saniyede en az bu kadar titresim darbesi: uyari
const unsigned long UYARI_SURE = 3000;   // uyari en az 3 saniye surer

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

int sayac = 0;                    // icinde bulunulan saniyedeki darbe sayisi
int sonSaniye = 0;                // bir onceki saniyenin darbe sayisi (ekranda gosterilir)
bool sonDurum = LOW;
unsigned long saniyeBaslangic = 0;
unsigned long uyariBitis = 0;     // uyari bu ana kadar suruyor

void setup() {
  pinMode(TITRESIM_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  lcd.begin(16, 2);
  Serial.println("Deprem alarmi hazir");
}

void loop() {
  bool durum = digitalRead(TITRESIM_PIN);
  if (durum == HIGH && sonDurum == LOW) {   // yeni bir titresim darbesi
    sayac++;
  }
  sonDurum = durum;

  // her saniye sonunda darbe sayisini degerlendir
  if (millis() - saniyeBaslangic >= 1000) {
    saniyeBaslangic = millis();
    sonSaniye = sayac;
    if (sonSaniye >= ESIK) {
      if (millis() >= uyariBitis) {
        Serial.print("DEPREM UYARISI! Titresim sayisi: ");
        Serial.println(sonSaniye);
      }
      uyariBitis = millis() + UYARI_SURE;
    }
    sayac = 0;
  }

  bool uyari = (millis() < uyariBitis);
  digitalWrite(BUZZER_PIN, uyari ? HIGH : LOW);

  lcd.setCursor(0, 0);
  lcd.print("Titresim: ");
  lcd.print(sonSaniye);
  lcd.print("/sn  ");
  lcd.setCursor(0, 1);
  if (uyari) {
    lcd.print("DEPREM UYARISI!");
  } else {
    lcd.print("Durum: SAKIN   ");
  }
  delay(5);
}
