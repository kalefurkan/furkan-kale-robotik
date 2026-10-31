// Akilli yangin sondurme robotu: 3 alev sensoru (sol, orta, sag) + L298N + su pompasi (NPN ile)
// Alev hangi taraftaysa robot ona doner, orta sensor cok guclu alev gorunce (yakin) durur ve pompayi calistirir.
const int DO_PIN[3] = {2, 3, 4};      // alev varken LOW (sol, orta, sag)
const int AO_PIN[3] = {A0, A1, A2};   // alev yaklastikca deger duser
const int ENA = 5, ENB = 6;
const int IN1 = 7, IN2 = 8, IN3 = 9, IN4 = 10;
const int POMPA = 11;                 // NPN transistorun tabanina (1 kOhm uzerinden)

const int YAKIN_ESIK = 200;           // orta sensor AO bunun altina inince alev yakin
const int HIZ = 150;
const unsigned long SULAMA_MS = 3000;

void motor(int sol, int sag) {        // -255..255, eksi = geri
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 3; i++) {
    pinMode(DO_PIN[i], INPUT);
  }
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(POMPA, OUTPUT);
  digitalWrite(POMPA, LOW);
  motor(0, 0);
  Serial.println("Yangin robotu hazir");
}

void loop() {
  bool sol = (digitalRead(DO_PIN[0]) == LOW);
  bool orta = (digitalRead(DO_PIN[1]) == LOW);
  bool sag = (digitalRead(DO_PIN[2]) == LOW);

  if (orta) {
    int deger = analogRead(AO_PIN[1]);
    if (deger < YAKIN_ESIK) {
      motor(0, 0);
      Serial.println("Alev yakin: pompa acik");
      digitalWrite(POMPA, HIGH);
      delay(SULAMA_MS);
      digitalWrite(POMPA, LOW);
      Serial.println("Sulama bitti");
    } else {
      motor(HIZ, HIZ);
      Serial.println("Alev onde: ileri");
    }
  } else if (sol) {
    motor(-HIZ, HIZ);
    Serial.println("Alev solda: sola don");
  } else if (sag) {
    motor(HIZ, -HIZ);
    Serial.println("Alev sagda: saga don");
  } else {
    motor(0, 0);                      // alev yok: dur ve bekle
  }
  delay(200);
}
