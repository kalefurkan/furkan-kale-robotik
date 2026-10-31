// Engelden kacan robot: HC-SR04 mesafe sensoru + L298N + 2 DC motor
const int TRIG = 2;
const int ECHO = 3;

const int ENA = 5;    // sol motor hiz (PWM)
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;    // sag motor hiz (PWM)

const int HIZ = 170;          // motor hizi (0-255)
const int ESIK_CM = 20;       // bundan yakin engel varsa kac

bool solaDon = true;          // her engelde yon degistir

void motor(int sol, int sag) {        // -255..255, eksi = geri
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

long mesafeOlc() {                    // santimetre; eko gelmezse 400
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) {
    return 400;
  }
  return sure / 58;
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  Serial.println("Engelden kacan robot hazir");
}

void loop() {
  long cm = mesafeOlc();
  if (cm < ESIK_CM) {
    Serial.print("ENGEL ");
    Serial.print(cm);
    Serial.println(" cm: dur, geri git, don");
    motor(0, 0);
    delay(200);
    motor(-HIZ, -HIZ);            // biraz geri
    delay(500);
    if (solaDon) {
      motor(-HIZ, HIZ);           // yerinde sola don
      Serial.println("Sola donuluyor");
    } else {
      motor(HIZ, -HIZ);           // yerinde saga don
      Serial.println("Saga donuluyor");
    }
    delay(450);
    solaDon = !solaDon;
    motor(0, 0);
    delay(100);
  } else {
    motor(HIZ, HIZ);              // yol acik: ileri
  }
  delay(60);
}
