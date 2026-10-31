// LED bar grafik: potansiyometreyi çevirdikçe yanan LED sayısı 0 ile 10 arasında değişir
const int POT = A0;                                        // potansiyometrenin orta bacağı
const int LEDLER[] = {2, 3, 4, 5, 6, 7, 8, 9, 10, 11};   // 1. LED soldaki, 10. LED sağdaki
const int LED_SAYISI = 10;

void setup() {
  for (int i = 0; i < LED_SAYISI; i++) {
    pinMode(LEDLER[i], OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(POT);                            // 0 ... 1023
  // 0-1023 aralığını 11 eşit dilime böleriz (0, 1, ... 10 LED); 1023'te sonuç 11 olur, constrain ile 10'a sabitleriz
  int yanacak = map(deger, 0, 1023, 0, LED_SAYISI + 1);
  yanacak = constrain(yanacak, 0, LED_SAYISI);

  for (int i = 0; i < LED_SAYISI; i++) {
    if (i < yanacak) {
      digitalWrite(LEDLER[i], HIGH);                      // soldan başlayarak "yanacak" kadar LED yanar
    } else {
      digitalWrite(LEDLER[i], LOW);
    }
  }

  Serial.print("Pot: ");
  Serial.print(deger);
  Serial.print("  Yanan LED: ");
  Serial.println(yanacak);
  delay(100);
}
