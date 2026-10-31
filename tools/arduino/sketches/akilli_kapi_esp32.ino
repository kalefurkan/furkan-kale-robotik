// Goruntu islemeli akilli kapi (ESP32-CAM, AI-Thinker). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
// Kamera iki ardisik gri tonlu kareyi karsilastirir; yeterince piksel degistiyse (hareket) servo kapiyi 5 saniye acar.
// Bu bir HAREKET algilamadir: kisi taniyip kimlik dogrulamaz.
// Gerekli: Arduino IDE + "esp32" kart paketi (Espressif) + "ESP32Servo" kutuphanesi. Kart: "AI Thinker ESP32-CAM".
// Yukleme: FTDI/USB-seri adaptor, IO0 -> GND (yukleme sirasinda), sonra IO0'i ayir ve RESET'e bas.
#include "esp_camera.h"
#include <ESP32Servo.h>

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

const int SERVO_PIN = 13;                 // devrede servo sinyali IO13
const int KAPALI_ACI = 0;
const int ACIK_ACI = 90;
const int FARK_ESIGI = 30;                // bir pikselin "degisti" sayilmasi icin gri ton farki (0-255)
const int PIKSEL_ESIGI = 600;             // 160x120 karede bu kadar piksel degisirse hareket var (kendi ortamina gore ayarla)
const unsigned long ACIK_SURE = 5000;

Servo kapi;
uint8_t onceki[160 * 120];
bool oncekiVar = false;
unsigned long acilma = 0;
bool acikMi = false;

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

void setup() {
  Serial.begin(115200);
  ESP32PWM::allocateTimer(2);             // kamera XCLK'si LEDC zamanlayici 0'i kullanir; servo icin baska zamanlayici ayir
  kapi.setPeriodHertz(50);
  kapi.attach(SERVO_PIN, 500, 2400);
  kapi.write(KAPALI_ACI);
  if (!kameraBaslat()) {
    Serial.println("Kamera baslamadi: 5 V beslemeyi (en az 500 mA) ve modulu kontrol et");
    while (true) { delay(1000); }
  }
  Serial.println("Akilli kapi hazir");
}

void loop() {
  camera_fb_t *kare = esp_camera_fb_get();
  if (kare && kare->len >= 160 * 120) {
    int degisen = 0;
    if (oncekiVar) {
      for (int i = 0; i < 160 * 120; i++) {
        int fark = (int)kare->buf[i] - (int)onceki[i];
        if (abs(fark) > FARK_ESIGI) {
          degisen++;
        }
      }
    }
    for (int i = 0; i < 160 * 120; i++) {
      onceki[i] = kare->buf[i];
    }
    oncekiVar = true;
    if (degisen > PIKSEL_ESIGI && !acikMi) {
      Serial.print("Hareket: ");
      Serial.print(degisen);
      Serial.println(" piksel degisti -> kapi aciliyor");
      kapi.write(ACIK_ACI);
      acikMi = true;
      acilma = millis();
    }
  }
  if (kare) {
    esp_camera_fb_return(kare);
  }
  if (acikMi && millis() - acilma > ACIK_SURE) {
    kapi.write(KAPALI_ACI);
    acikMi = false;
    Serial.println("Kapi kapandi");
  }
  delay(100);
}
