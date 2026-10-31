// Otomatik el dezenfektani: IR sensor eli gorunce pompa kisa sure calisir
const int IR_PIN = 2;               // IR engel sensoru: engel (el) varken LOW
const int POMPA_PIN = 9;            // transistorun taban direncine giden pin
const unsigned long POMPA_MS = 1500; // pompa suresi (dezenfektan miktarini belirler)

bool elVardi = false;               // el hala sensorun onunde mi? (tekrar tekrar pompalamayi engeller)

void setup() {
  pinMode(IR_PIN, INPUT);
  pinMode(POMPA_PIN, OUTPUT);
  digitalWrite(POMPA_PIN, LOW);
  Serial.begin(9600);
}

void loop() {
  int durum = digitalRead(IR_PIN);

  if (durum == LOW && !elVardi) {   // el yeni geldi
    elVardi = true;
    Serial.println("El algilandi: pompa calisiyor");
    digitalWrite(POMPA_PIN, HIGH);
    delay(POMPA_MS);
    digitalWrite(POMPA_PIN, LOW);
    Serial.println("Pompa durdu");
  }
  if (durum == HIGH) {
    elVardi = false;                // el cekildi: yeni dezenfektan icin hazir
  }
  delay(50);
}
