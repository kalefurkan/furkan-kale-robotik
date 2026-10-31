// Pasif buzzer ile melodi: "Twinkle Twinkle Little Star" ezgisi
const int BUZZER = 8;   // D8 -> pasif buzzer (+), buzzer (-) -> GND

// Nota frekansları (Hz)
const int DO_ = 262;    // C4
const int RE_ = 294;    // D4
const int MI_ = 330;    // E4
const int FA_ = 349;    // F4
const int SOL_ = 392;   // G4
const int LA_ = 440;    // A4

const int NOTA_SAYISI = 14;
// Nota dizisi ve her notanın süresi (1000 / değer ms): 4 = çeyrek nota, 2 = yarım nota
const int NOTALAR[] = {DO_, DO_, SOL_, SOL_, LA_, LA_, SOL_, FA_, FA_, MI_, MI_, RE_, RE_, DO_};
const int SURELER[] = {4, 4, 4, 4, 4, 4, 2, 4, 4, 4, 4, 4, 4, 2};

void setup() {
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < NOTA_SAYISI; i++) {
    int sure = 1000 / SURELER[i];      // nota süresi (ms)
    Serial.print("Çalan nota: ");
    Serial.print(NOTALAR[i]);
    Serial.println(" Hz");
    tone(BUZZER, NOTALAR[i]);          // notayı çalmaya başla
    delay(sure);                       // nota süresi kadar çal
    noTone(BUZZER);                    // sesi kapat: notalar arasında kısa bir sessizlik olur
    delay(sure / 4);                   // notalar birbirine karışmasın diye kısa ara
  }
  delay(2000);                         // melodi bitti, 2 saniye bekle ve tekrarla
}
