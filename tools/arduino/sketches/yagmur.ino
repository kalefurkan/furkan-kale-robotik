// Yagmur algilama: yagmur sensoru (AO analog + DO dijital) ve buzzer
const int AO_PIN = A0;          // analog cikis: kuru ~1023, islandikca duser
const int DO_PIN = 2;           // dijital cikis: islak = LOW (modul esigi asinca)
const int BUZZER = 8;           // aktif buzzer

const int HAFIF_ESIK = 800;     // bunun altinda hafif yagmur (olculen degerle ayarla)
const int SIDDETLI_ESIK = 450;  // bunun altinda siddetli yagmur

void bip(int sureMs) {
  digitalWrite(BUZZER, HIGH);
  delay(sureMs);
  digitalWrite(BUZZER, LOW);
}

void setup() {
  pinMode(DO_PIN, INPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int analog = analogRead(AO_PIN);
  int dijital = digitalRead(DO_PIN);

  Serial.print("AO: ");
  Serial.print(analog);
  Serial.print("  DO: ");
  Serial.print(dijital);
  if (analog < SIDDETLI_ESIK) {
    Serial.println("  Siddetli yagmur");
    digitalWrite(BUZZER, HIGH);             // siddetli yagmur: buzzer surekli oter
    delay(200);
  } else if (analog < HAFIF_ESIK) {
    Serial.println("  Hafif yagmur");
    digitalWrite(BUZZER, LOW);
    bip(100);
    delay(700);                             // yavas bip
  } else {
    Serial.println("  Kuru");
    digitalWrite(BUZZER, LOW);              // yagmur bitti: buzzer sussun
    delay(300);
  }
}
