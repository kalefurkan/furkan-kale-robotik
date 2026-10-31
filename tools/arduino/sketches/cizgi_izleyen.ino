// Cizgi izleyen robot: 5 kanalli IR dizisi + L298N + 2 DC motor
// Siyah cizgi ustundeki kanal HIGH verir. OUT1 en solda, OUT5 en sagdadir.
const int SENS[5] = {2, 3, 4, 11, 12};   // OUT1..OUT5

const int ENA = 5;    // sol motor hiz (PWM)
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;    // sag motor hiz (PWM)

const int TEMEL = 170;   // duz giderken motor hizi (0-255)
const int KP = 45;       // duzeltme katsayisi (yuzde olarak)

int sonKonum = 0;        // cizgi en son hangi tarafta gorundu
int sonSol = 999;
int sonSag = 999;

void motor(int sol, int sag) {        // -255..255, eksi = geri
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

void setup() {
  for (int i = 0; i < 5; i++) {
    pinMode(SENS[i], INPUT);
  }
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  Serial.println("Cizgi izleyen robot hazir");
}

void loop() {
  int toplam = 0;      // cizgiyi gorenlerin sayisi
  int agirlik = 0;     // konum puanlarinin toplami
  for (int i = 0; i < 5; i++) {
    int v = digitalRead(SENS[i]);
    toplam += v;
    agirlik += v * (i - 2) * 100;      // OUT1 = -200 ... OUT5 = +200
  }

  int sol;
  int sag;
  if (toplam == 0) {
    // cizgi kayboldu: en son gorulen tarafa dogru yerinde don
    if (sonKonum >= 0) {
      sol = 150;
      sag = -150;
    } else {
      sol = -150;
      sag = 150;
    }
  } else {
    int konum = agirlik / toplam;      // -200 ... +200
    sonKonum = konum;
    int duzeltme = konum * KP / 100;
    sol = constrain(TEMEL + duzeltme, -255, 255);
    sag = constrain(TEMEL - duzeltme, -255, 255);
  }
  motor(sol, sag);

  if (sol != sonSol || sag != sonSag) {
    Serial.print("Cizgi gorenler: ");
    Serial.print(toplam);
    Serial.print("  sol=");
    Serial.print(sol);
    Serial.print("  sag=");
    Serial.println(sag);
    sonSol = sol;
    sonSag = sag;
  }
  delay(10);
}
