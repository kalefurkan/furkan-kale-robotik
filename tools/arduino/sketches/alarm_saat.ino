// Alarm saat: DS3231 saati tutar, belirlenen saat ve dakikada buzzer 10 saniye boyunca oter
#include <Wire.h>
#include <RTClib.h>
#include <LiquidCrystal.h>

RTC_DS3231 rtc;
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

const int BUZZER_PIN = 8;
const int ALARM_SAAT = 8;      // alarm 08:00'de caliyor
const int ALARM_DAKIKA = 0;
const int ALARM_SURE = 10;     // saniye

bool alarmVardi = false;

void iki(int v) {
  if (v < 10) {
    lcd.print("0");
  }
  lcd.print(v);
}

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  lcd.begin(16, 2);
  if (!rtc.begin()) {
    lcd.print("RTC bulunamadi");
    while (true) {
      delay(1000);
    }
  }
}

void loop() {
  DateTime simdi = rtc.now();

  // alarm penceresi: ayarlanan saat:dakikanin ilk 10 saniyesi
  bool calsin = (simdi.hour() == ALARM_SAAT && simdi.minute() == ALARM_DAKIKA && simdi.second() < ALARM_SURE);

  lcd.setCursor(0, 0);
  lcd.print("Saat ");
  iki(simdi.hour());
  lcd.print(":");
  iki(simdi.minute());
  lcd.print(":");
  iki(simdi.second());
  lcd.setCursor(0, 1);
  if (calsin) {
    lcd.print("ALARM CALIYOR!  ");
  } else {
    lcd.print("Alarm ");
    iki(ALARM_SAAT);
    lcd.print(":");
    iki(ALARM_DAKIKA);
    lcd.print("     ");
  }

  if (calsin) {
    // saniyede 2 bip: 250 ms acik, 250 ms kapali
    digitalWrite(BUZZER_PIN, (millis() / 250) % 2 == 0 ? HIGH : LOW);
    if (!alarmVardi) {
      Serial.println("ALARM! Zaman geldi");
      alarmVardi = true;
    }
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    if (alarmVardi) {
      Serial.println("Alarm bitti");
      alarmVardi = false;
    }
  }
  delay(100);
}
