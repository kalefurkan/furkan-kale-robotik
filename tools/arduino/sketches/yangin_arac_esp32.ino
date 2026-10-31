// Otonom yangin algilama araci (ESP32-CAM + alev sensoru + L298N). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
// Arac kisa adimlarla ileri gider ve her adimdan sonra durup bakar: alev sensoru ya da kamerada cok parlak alan varsa yangin sayilir,
// arac durur ve uyari yazar. Kamera yalnizca kaba bir "parlak alan" ipucu verir; yangin tanima algoritmasi degildir.
// Gerekli: Arduino IDE + "esp32" kart paketi (Espressif), kart: "AI Thinker ESP32-CAM", PSRAM: Disabled (IO16'yi serbest birakmak icin).
// Yukleme sirasinda alev sensorunun IO2 ve IO16 kablolarini cikar; IO0 -> GND ile yukle, sonra IO0'i ayir.
#include "esp_camera.h"

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

const int ALEV_DO = 2;                    // alev varken LOW
const int ALEV_AO = 16;                   // analog deger (alev yaklastikca duser); ADC2 kanali: Wi-Fi acikken okunmaz, bu projede Wi-Fi yok
const int IN1 = 13, IN2 = 15, IN3 = 14, IN4 = 12;   // L298N (ENA/ENB jumper takili)
const int AO_ESIK = 1500;                 // 12 bit ADC; bu degerin altinda alev yakin sayilir (kendi sensorune gore ayarla)
const int PARLAK_ESIK = 240;              // 0-255 gri ton: bundan parlak piksel sayilir
const int PARLAK_ADET = 400;              // 160x120 karede bu kadar parlak piksel varsa kamera ipucu verir

void motor(int sol, int sag) {            // -1 geri, 0 dur, 1 ileri
  digitalWrite(IN1, sol > 0);
  digitalWrite(IN2, sol < 0);
  digitalWrite(IN3, sag > 0);
  digitalWrite(IN4, sag < 0);
}

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
  c.pixel_format = PIXFORMAT_GRAYSCALE;
  c.frame_size = FRAMESIZE_QQVGA;         // 160 x 120
  c.fb_count = 1;
  return esp_camera_init(&c) == ESP_OK;
}

int parlakPikselSay() {                   // kameradaki cok parlak piksellerin sayisi
  camera_fb_t *kare = esp_camera_fb_get();
  if (!kare) {
    return 0;
  }
  int adet = 0;
  for (size_t i = 0; i < kare->len; i++) {
    if (kare->buf[i] >= PARLAK_ESIK) {
      adet++;
    }
  }
  esp_camera_fb_return(kare);
  return adet;
}

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ALEV_DO, INPUT);
  motor(0, 0);
  if (!kameraBaslat()) {
    Serial.println("Kamera baslamadi: 5 V beslemeyi (en az 500 mA) ve modulu kontrol et");
    while (true) { delay(1000); }
  }
  Serial.println("Yangin algilama araci hazir");
}

void loop() {
  motor(1, 1);                            // 400 ms ileri
  delay(400);
  motor(0, 0);
  delay(300);                             // dur, titresim bitsin

  bool alevSensoru = (digitalRead(ALEV_DO) == LOW) || (analogRead(ALEV_AO) < AO_ESIK);
  int parlak = parlakPikselSay();
  bool kamera = (parlak > PARLAK_ADET);

  if (alevSensoru || kamera) {
    Serial.print("YANGIN SUPHESI: alev sensoru=");
    Serial.print(alevSensoru ? "evet" : "hayir");
    Serial.print(", parlak piksel=");
    Serial.println(parlak);
    while (true) {                        // arac durur; gercek sistemde burada alarm/bildirim gonderilir
      motor(0, 0);
      delay(1000);
      Serial.println("Arac durdu: yangin suphesi surer");
    }
  }
  Serial.print("Temiz: parlak piksel=");
  Serial.println(parlak);
}
