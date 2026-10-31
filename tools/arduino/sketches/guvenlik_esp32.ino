// Cok sensorlu akilli guvenlik sistemi (ESP32-CAM + PIR + RC522). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
// Sistem "kurulu" iken PIR hareket gorurse kamera bir fotograf (JPEG) ceker ve bir sunucuya gonderir (HTTP POST).
// Yetkili RFID karti okutulunca sistem kurulur / devre disi birakilir.
// Gerekli: Arduino IDE + "esp32" kart paketi (Espressif) + "MFRC522" kutuphanesi (miguelbalboa); kart: "AI Thinker ESP32-CAM", PSRAM: Disabled.
// Yukleme sirasinda RC522 ve PIR kablolarini cikar (IO2, IO12, IO15 yukleme/acilis pinleridir); IO0 -> GND ile yukle.
#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

const char *AG_ADI = "AG_ADINIZ";                          // kendi Wi-Fi agina gore degistir
const char *PAROLA = "PAROLANIZ";
const char *SUNUCU = "http://192.168.1.50:5000/foto";       // fotografi alacak sunucu (kendi sunucunu kur)

// AI-Thinker ESP32-CAM kamera pinleri (kartin uzerinde sabittir)
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

// RC522: kartin varsayilan SPI pinleri kamera/SD ile paylasildigindan ozel pinler (devrede ayni)
const int RC_SCK = 14, RC_MISO = 12, RC_MOSI = 13, RC_SS = 15, RC_RST = 2;
const int PIR_PIN = 16;                                     // PIR OUT (10k + 20k bolucu uzerinden)
const byte YETKILI[4] = {0xA1, 0xB2, 0xC3, 0xD4};           // yetkili kartin UID'si (kendi kartinla degistir)

MFRC522 rfid(RC_SS, RC_RST);
bool kurulu = true;
unsigned long sonFoto = 0;
unsigned long sonKart = 0;

bool kameraBaslat() {
  camera_config_t c = {};
  c.ledc_channel = LEDC_CHANNEL_0;
  c.ledc_timer = LEDC_TIMER_0;
  c.pin_d0 = Y2_GPIO_NUM; c.pin_d1 = Y3_GPIO_NUM; c.pin_d2 = Y4_GPIO_NUM; c.pin_d3 = Y5_GPIO_NUM;
  c.pin_d4 = Y6_GPIO_NUM; c.pin_d5 = Y7_GPIO_NUM; c.pin_d6 = Y8_GPIO_NUM; c.pin_d7 = Y9_GPIO_NUM;
  c.pin_xclk = XCLK_GPIO_NUM; c.pin_pclk = PCLK_GPIO_NUM; c.pin_vsync = VSYNC_GPIO_NUM; c.pin_href = HREF_GPIO_NUM;
  c.pin_sccb_sda = SIOD_GPIO_NUM; c.pin_sccb_scl = SIOC_GPIO_NUM;   // eski cekirdeklerde pin_sscb_sda / pin_sscb_scl
  c.pin_pwdn = PWDN_GPIO_NUM; c.pin_reset = RESET_GPIO_NUM;
  c.xclk_freq_hz = 20000000;
  c.pixel_format = PIXFORMAT_JPEG;
  c.frame_size = FRAMESIZE_QVGA;          // 320 x 240
  c.jpeg_quality = 12;                    // 0-63, kucuk sayi = daha iyi kalite
  c.fb_count = 1;
  return esp_camera_init(&c) == ESP_OK;
}

bool yetkiliMi() {
  if (rfid.uid.size < 4) {
    return false;
  }
  for (int i = 0; i < 4; i++) {
    if (rfid.uid.uidByte[i] != YETKILI[i]) {
      return false;
    }
  }
  return true;
}

void fotoGonder() {
  camera_fb_t *kare = esp_camera_fb_get();
  if (!kare) {
    Serial.println("Foto alinamadi");
    return;
  }
  Serial.print("Foto cekildi: ");
  Serial.print(kare->len);
  Serial.println(" bayt");
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SUNUCU);
    http.addHeader("Content-Type", "image/jpeg");
    int kod = http.POST(kare->buf, kare->len);
    Serial.print("Sunucu yaniti: ");
    Serial.println(kod);
    http.end();
  } else {
    Serial.println("Wi-Fi yok: foto gonderilemedi");
  }
  esp_camera_fb_return(kare);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  SPI.begin(RC_SCK, RC_MISO, RC_MOSI, RC_SS);   // ozel SPI pinleri
  rfid.PCD_Init();
  if (!kameraBaslat()) {
    Serial.println("Kamera baslamadi: 5 V beslemeyi (en az 500 mA) ve modulu kontrol et");
    while (true) { delay(1000); }
  }
  WiFi.mode(WIFI_STA);
  WiFi.begin(AG_ADI, PAROLA);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
    delay(500);
  }
  Serial.println("Guvenlik sistemi hazir: KURULU (PIR ilk dakikada isinir)");
}

void loop() {
  if (millis() - sonKart > 1500 && rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    sonKart = millis();
    if (yetkiliMi()) {
      kurulu = !kurulu;
      Serial.println(kurulu ? "Yetkili kart: sistem KURULDU" : "Yetkili kart: sistem DEVRE DISI");
    } else {
      Serial.println("Yetkisiz kart: yok sayildi");
    }
    rfid.PICC_HaltA();
  }
  if (kurulu && digitalRead(PIR_PIN) == HIGH && millis() - sonFoto > 10000) {   // en fazla 10 saniyede bir foto
    sonFoto = millis();
    Serial.println("HAREKET algilandi");
    fotoGonder();
  }
  delay(50);
}
