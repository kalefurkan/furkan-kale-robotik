// Akilli tarim robotu: bitki sirasi boyunca ilerler, her bitkide durup toprak nemini olcer, kuruysa pompayi calistirir
// L298N (iki tekerlek motoru) + toprak nem sensoru (A0) + NPN transistorle surulen su pompasi (D11)
const int ENA = 5, ENB = 6;
const int IN1 = 7, IN2 = 8, IN3 = 9, IN4 = 10;
const int POMPA = 11;          // NPN transistorun tabanina (1 kOhm uzerinden)
const int SENSOR = A0;

const int KURU = 921;          // havada okunan deger (nem %0)
const int ISLAK = 256;         // suda okunan deger (nem %100)
const int ESIK = 35;           // bu yuzdenin altinda toprak kuru sayilir
const int BITKI_SAYISI = 3;
const int HIZ = 150;           // 0-255

void motor(int sol, int sag) {          // -255..255, eksi = geri
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

int nemYuzde() {                        // 5 olcumun ortalamasi
  long toplam = 0;
  for (int i = 0; i < 5; i++) {
    toplam += analogRead(SENSOR);
    delay(20);
  }
  int ham = toplam / 5;
  int yuzde = map(ham, KURU, ISLAK, 0, 100);   // nem artinca okunan deger duser
  return constrain(yuzde, 0, 100);
}

void setup() {
  Serial.begin(9600);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(POMPA, OUTPUT);
  digitalWrite(POMPA, LOW);
  motor(0, 0);
  Serial.println("Tarim robotu hazir");
}

void loop() {
  for (int bitki = 1; bitki <= BITKI_SAYISI; bitki++) {
    motor(HIZ, HIZ);                    // sonraki bitkiye ilerle
    delay(2000);
    motor(0, 0);
    delay(500);                         // robot otursun, sonra olc

    int nem = nemYuzde();
    Serial.print("Bitki ");
    Serial.print(bitki);
    Serial.print(": nem %");
    Serial.print(nem);
    if (nem < ESIK) {
      Serial.println(" -> kuru, pompa acik");
      digitalWrite(POMPA, HIGH);
      delay(2000);                      // 2 saniye sula
      digitalWrite(POMPA, LOW);
      Serial.println("   sulama bitti");
    } else {
      Serial.println(" -> yeterli, gec");
    }
    delay(500);
  }
  Serial.println("Sira bitti: robot bekliyor");
  while (true) {
    delay(1000);                        // gorev tamam: durdu
  }
}
