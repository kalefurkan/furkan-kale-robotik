// LM35 ile sıcaklık ölçer: çıkış gerilimi 10 mV / °C
const int LM35 = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(LM35);                      // 0 ... 1023 (0 V ... 5 V)
  float gerilim = deger * 5.0 / 1023.0;              // ADC değerini volta çevir (5V referans)
  float sicaklik = gerilim * 100.0;                  // 10 mV/°C = 0.01 V/°C  ->  °C = volt x 100

  Serial.print("ADC: ");
  Serial.print(deger);
  Serial.print("  Sıcaklık: ");
  Serial.print(sicaklik);
  Serial.println(" C");
  delay(1000);
}
