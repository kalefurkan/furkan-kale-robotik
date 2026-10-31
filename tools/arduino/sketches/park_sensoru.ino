// Park sensoru: nesne yaklastikca buzzer daha sik oter ve LED daha hizli yanip soner; cok yakinda surekli yanar
const int TRIG = 7;
const int ECHO = 6;
const int BUZZER = 8;           // aktif buzzer
const int LED = 9;
const int UYARI_CM = 30;        // bu mesafeden yakinda uyari baslar
const int COK_YAKIN_CM = 8;     // bu mesafeden yakinda surekli uyari

float mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);     // 10 mikrosaniyelik tetik darbesi
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long sure = pulseIn(ECHO, HIGH, 30000);   // en fazla 30 ms bekle
  if (sure == 0) return -1;                  // yanki gelmedi
  return sure * 0.0343 / 2.0;                // ses hizi 0,0343 cm/mikrosaniye; gidis-donus oldugu icin /2
}

void uyariVer(bool acik) {
  digitalWrite(BUZZER, acik);
  digitalWrite(LED, acik);
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  float cm = mesafeOlc();
  Serial.println(cm);

  if (cm > 0 && cm < COK_YAKIN_CM) {
    uyariVer(true);                          // cok yakin: surekli ot ve yan
    delay(100);
  } else if (cm > 0 && cm < UYARI_CM) {
    uyariVer(true);                          // kisa bip + LED yanmasi
    delay(40);
    uyariVer(false);
    // yaklastikca bekleme kisalir: 8 cm -> 40 ms, 30 cm -> 400 ms
    delay(map((long)cm, COK_YAKIN_CM, UYARI_CM, 40, 400));
  } else {
    uyariVer(false);                         // nesne yok ya da uzakta
    delay(100);
  }
}
