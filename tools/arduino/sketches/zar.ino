// Dijital zar: butona basınca 1-6 arası rastgele sayı, 7 LED ile zar deseni olarak gösterilir
const int BUTON = 9;                           // buton: D9 ile GND arası (INPUT_PULLUP)
const int LEDLER[] = {2, 3, 4, 5, 6, 7, 8};    // zar üzerindeki 7 nokta (aşağıdaki desen tablosuna bak)

// Zar düzeni:   L0   L1
//               L2 L3 L4      (L3 ortadaki nokta)
//               L5   L6
// Her zar yüzü tek bir sayıyla saklanır: LED'lerin her biri sayının bir bitidir
// (L0 = 1, L1 = 2, L2 = 4, L3 = 8, L4 = 16, L5 = 32, L6 = 64). Yanacak LED'lerin değerleri toplanır.
const int DESEN[] = {
  0,     // 0: kullanılmaz
  8,     // 1: L3                         (ortadaki nokta)
  65,    // 2: L0 + L6                    (çapraz iki nokta)
  73,    // 3: L0 + L3 + L6
  99,    // 4: L0 + L1 + L5 + L6          (dört köşe)
  107,   // 5: L0 + L1 + L3 + L5 + L6     (dört köşe + orta)
  119    // 6: L0 + L1 + L2 + L4 + L5 + L6 (iki sütun)
};

void zarGoster(int sayi) {
  for (int i = 0; i < 7; i++) {
    int yansin = (DESEN[sayi] >> i) & 1;      // i. bit 1 ise bu LED yanacak
    digitalWrite(LEDLER[i], yansin);
  }
}

void setup() {
  for (int i = 0; i < 7; i++) {
    pinMode(LEDLER[i], OUTPUT);
  }
  pinMode(BUTON, INPUT_PULLUP);
  randomSeed(analogRead(A0));      // boşta duran A0 pini rastgele gürültü okur: her açılışta farklı sayı dizisi
  Serial.begin(9600);
  zarGoster(6);                    // açılış testi: bütün noktalar
}

void loop() {
  if (digitalRead(BUTON) == LOW) {                 // butona basıldı
    for (int i = 0; i < 8; i++) {                  // "zar yuvarlanıyor" animasyonu
      zarGoster(random(1, 7));
      delay(60);
    }
    int sonuc = random(1, 7);                      // 1, 2, 3, 4, 5 veya 6 (7 dahil değildir)
    zarGoster(sonuc);
    Serial.print("Zar: ");
    Serial.println(sonuc);
    while (digitalRead(BUTON) == LOW) {            // buton bırakılana kadar bekle
      delay(10);
    }
    delay(50);                                     // buton titreşimini atla
  }
}
