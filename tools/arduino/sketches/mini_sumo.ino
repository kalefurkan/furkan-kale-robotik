// Mini sumo robot: 2 IR kenar sensoru + HC-SR04 rakip sensoru + L298N + 2 DC motor
// Dohyo siyah, kenar cizgisi beyaz: IR sensor beyaz cizgiyi gorunce LOW verir.
const int KENAR_SOL = 2;
const int KENAR_SAG = 3;
const int TRIG = 4;
const int ECHO = 11;

const int ENA = 5;
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;

const int RAKIP_CM = 40;       // bundan yakinsa rakip var say
const int HIZ = 220;
const int ARAMA_HIZ = 130;

int sonDurum = -1;             // 0 bekle, 1 ara, 2 saldir, 3 sol kenar, 4 sag kenar

void motor(int sol, int sag) {
  digitalWrite(IN1, sol > 0 ? HIGH : LOW);
  digitalWrite(IN2, sol < 0 ? HIGH : LOW);
  digitalWrite(IN3, sag > 0 ? HIGH : LOW);
  digitalWrite(IN4, sag < 0 ? HIGH : LOW);
  analogWrite(ENA, abs(sol));
  analogWrite(ENB, abs(sag));
}

long mesafeOlc() {
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

void durum(int d) {                      // durum degisince bir kez yazar
  if (d == sonDurum) {
    return;
  }
  sonDurum = d;
  if (d == 0) {
    Serial.println("Bekle: 5 saniye sonra mac basliyor");
  } else if (d == 1) {
    Serial.println("Rakip araniyor: yerinde don");
  } else if (d == 2) {
    Serial.println("RAKIP VAR: saldir");
  } else if (d == 3) {
    Serial.println("SOL KENAR: geri, saga don");
  } else {
    Serial.println("SAG KENAR: geri, sola don");
  }
}

void setup() {
  pinMode(KENAR_SOL, INPUT);
  pinMode(KENAR_SAG, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  Serial.begin(9600);
  motor(0, 0);
  durum(0);
  delay(5000);                           // sumo kurali: baslangic bekleme suresi
}

void loop() {
  bool sol = (digitalRead(KENAR_SOL) == LOW);    // beyaz cizgi goruldu
  bool sag = (digitalRead(KENAR_SAG) == LOW);

  if (sol || sag) {                      // kenar: once geri, sonra icerideki tarafa don
    if (sol) {
      durum(3);
      motor(-HIZ, -HIZ);
      delay(300);
      motor(HIZ, -HIZ);
      delay(250);
    } else {
      durum(4);
      motor(-HIZ, -HIZ);
      delay(300);
      motor(-HIZ, HIZ);
      delay(250);
    }
    motor(0, 0);
    return;
  }

  long cm = mesafeOlc();
  if (cm < RAKIP_CM) {
    durum(2);
    motor(HIZ, HIZ);
  } else {
    durum(1);
    motor(ARAMA_HIZ, -ARAMA_HIZ);
  }
  delay(40);
}
