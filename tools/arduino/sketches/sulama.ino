// Otomatik bitki sulama: toprak kuruysa role pompayi calistirir
const int NEM_PIN = A0;          // toprak nem sensoru (OUT)
const int ROLE_PIN = 7;          // D7 -> 1k direnc -> NPN taban: transistor role bobinini surer

// Kalibrasyon (sensoru kuru havada ve suda olcerek bul). Bu sensorde nem artinca okunan deger DUSER.
const int KURU = 921;
const int ISLAK = 256;

const int SULA_ALT = 30;         // nem % bu degerin altina inerse sulama baslar
const int DUR_UST = 50;          // nem % bu degere cikinca sulama durur (histerezis)
const unsigned long POMPA_MAKS_MS = 5000;  // guvenlik: pompa en fazla 5 sn art arda calisir
const unsigned long BEKLEME_MS = 8000;     // sulamadan sonra suyun topraga yayilmasi icin bekleme

bool pompaAcik = false;
unsigned long pompaBaslangic = 0;

void pompa(bool ac) {
  digitalWrite(ROLE_PIN, ac);    // HIGH: role cekilir, pompa ayri guc kaynagindan beslenir
  pompaAcik = ac;
}

void setup() {
  pinMode(ROLE_PIN, OUTPUT);
  pompa(false);
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(NEM_PIN);
  int nem = map(ham, KURU, ISLAK, 0, 100);
  nem = constrain(nem, 0, 100);

  if (!pompaAcik && nem < SULA_ALT) {
    pompa(true);
    pompaBaslangic = millis();
    Serial.println("Toprak kuru: pompa ACIK");
  } else if (pompaAcik && (nem >= DUR_UST || millis() - pompaBaslangic > POMPA_MAKS_MS)) {
    pompa(false);
    Serial.println("Pompa KAPALI");
    delay(BEKLEME_MS);           // su topraga yayilsin; bu sirada sensor degeri yeniden okunmaz
  }

  Serial.print("Ham: ");
  Serial.print(ham);
  Serial.print("  Nem: %");
  Serial.println(nem);
  delay(500);
}
