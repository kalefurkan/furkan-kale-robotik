// Ses kontrollu isik sistemi: alkis (yuksek ses) algilaninca role isigi acar, bir alkis daha kapatir
const int ROLE_PIN = 7;        // NPN surucu transistorun tabani (1 kOhm uzerinden)
const int SES_DO = 3;          // ses sensoru dijital cikis (esik asilinca HIGH)
const int SES_AO = A0;         // ses sensoru analog cikis (ses siddeti)

bool isikAcik = false;
bool sonSes = LOW;
unsigned long sonTetik = 0;    // son alkis zamani (ard arda tetiklenmeyi onlemek icin)
bool tetiklendiMi = false;     // henuz hic alkis algilandi mi?
unsigned long sonYazi = 0;

void setup() {
  pinMode(ROLE_PIN, OUTPUT);
  digitalWrite(ROLE_PIN, LOW);
  pinMode(SES_DO, INPUT);
  Serial.begin(9600);
  Serial.println("Ses kontrollu isik hazir: alkis bekleniyor");
}

void loop() {
  bool ses = digitalRead(SES_DO);

  // yalnizca LOW'dan HIGH'a gecis (yeni alkis) ve en az 500 ms ara
  if (ses == HIGH && sonSes == LOW && (!tetiklendiMi || millis() - sonTetik > 500)) {
    tetiklendiMi = true;
    isikAcik = !isikAcik;
    digitalWrite(ROLE_PIN, isikAcik ? HIGH : LOW);
    sonTetik = millis();
    Serial.print("Alkis algilandi: isik ");
    Serial.println(isikAcik ? "ACIK" : "KAPALI");
  }
  sonSes = ses;

  // saniyede bir ses seviyesini yaz
  if (millis() - sonYazi >= 1000) {
    sonYazi = millis();
    Serial.print("Ses seviyesi: ");
    Serial.println(analogRead(SES_AO));
  }
  delay(10);
}
