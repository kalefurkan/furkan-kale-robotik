// LED ile ışık şiddeti göstergesi: ortam aydınlandıkça yanan LED sayısı artar
const int LDR = A0;                          // 5V - LDR - A0 - 10k - GND (gerilim bölücü)
const int LEDLER[] = {2, 3, 4, 5, 6};        // 1. LED en sol, 5. LED en sağ
const int LED_SAYISI = 5;

// Kendi ortamına göre ayarla: Seri Monitör'de karanlıkta ve en aydınlıkta okuduğun değerler
const int KARANLIK = 50;    // bu değer ve altında hiç LED yanmaz
const int AYDINLIK = 900;   // bu değer ve üstünde 5 LED de yanar

void setup() {
  for (int i = 0; i < LED_SAYISI; i++) {
    pinMode(LEDLER[i], OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  int isik = analogRead(LDR);                                   // 0 ... 1023, aydınlandıkça artar
  int yanacak = map(isik, KARANLIK, AYDINLIK, 0, LED_SAYISI);   // ışığı 0 ... 5 aralığına çevir
  yanacak = constrain(yanacak, 0, LED_SAYISI);                  // aralığın dışına taşmayı engelle

  for (int i = 0; i < LED_SAYISI; i++) {
    if (i < yanacak) {
      digitalWrite(LEDLER[i], HIGH);   // ilk "yanacak" kadar LED yanar
    } else {
      digitalWrite(LEDLER[i], LOW);
    }
  }

  Serial.print("Isik: ");
  Serial.print(isik);
  Serial.print("  Yanan LED: ");
  Serial.println(yanacak);
  delay(200);
}
