// Gercek zamanli saat: DS3231 (I2C) tarih, saat ve sicakligi 16x2 LCD'de gosterir
#include <Wire.h>
#include <RTClib.h>
#include <LiquidCrystal.h>

RTC_DS3231 rtc;
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void iki(int v) {            // tek haneli sayinin onune 0 koy: 5 -> 05
  if (v < 10) {
    lcd.print("0");
  }
  lcd.print(v);
}

void gunAdi(int gun) {       // dayOfTheWeek(): 0 = Pazar, 1 = Pazartesi ...
  if (gun == 0) lcd.print("Paz");
  else if (gun == 1) lcd.print("Pts");
  else if (gun == 2) lcd.print("Sal");
  else if (gun == 3) lcd.print("Car");
  else if (gun == 4) lcd.print("Per");
  else if (gun == 5) lcd.print("Cum");
  else lcd.print("Cts");
}

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  if (!rtc.begin()) {        // DS3231 I2C'de bulunamazsa
    lcd.print("RTC bulunamadi");
    Serial.println("RTC bulunamadi");
    while (true) {
      delay(1000);
    }
  }
  if (rtc.lostPower()) {     // pil bittiyse saat sifirlanir: derleme anina ayarla
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }
}

void loop() {
  DateTime simdi = rtc.now();

  lcd.setCursor(0, 0);
  iki(simdi.day());
  lcd.print(".");
  iki(simdi.month());
  lcd.print(".");
  lcd.print(simdi.year());
  lcd.print(" ");
  gunAdi(simdi.dayOfTheWeek());

  lcd.setCursor(0, 1);
  iki(simdi.hour());
  lcd.print(":");
  iki(simdi.minute());
  lcd.print(":");
  iki(simdi.second());
  lcd.print(" ");
  lcd.print(rtc.getTemperature(), 1);   // DS3231'in kendi sicaklik sensoru
  lcd.print(" C");

  Serial.print(simdi.year());
  Serial.print("-");
  Serial.print(simdi.month());
  Serial.print("-");
  Serial.print(simdi.day());
  Serial.print(" ");
  Serial.print(simdi.hour());
  Serial.print(":");
  Serial.print(simdi.minute());
  Serial.print(":");
  Serial.println(simdi.second());
  delay(1000);
}
