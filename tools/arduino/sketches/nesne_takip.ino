// Nesne takip eden robot (ESP32 + OV7670 + L298N). SIMULATORDE CALISTIRILAMAZ; gercek donanimda dogrulanmadi.
// Kamera kirmizi nesnenin goruntudeki yatay konumunu bulur; robot nesneye dogru doner ve ilerler.
// Gerekli: Arduino IDE + "esp32" kart paketi (Espressif), kart: "ESP32 Dev Module".
#include "esp_camera.h"

// ---- OV7670 pinleri (devre ile ayni) ----
const int PIN_SDA = 21, PIN_SCL = 22;                  // kamera SCCB (I2C benzeri) kontrol hatti
const int PIN_XCLK = 27, PIN_PCLK = 14, PIN_VSYNC = 25, PIN_HREF = 26;
const int PIN_D0 = 36, PIN_D1 = 39, PIN_D2 = 34, PIN_D3 = 35, PIN_D4 = 32, PIN_D5 = 33, PIN_D6 = 19, PIN_D7 = 18;

// ---- L298N (ENA/ENB jumper takili: motorlar hep etkin) ----
const int IN1 = 16, IN2 = 17, IN3 = 4, IN4 = 23;

void motor(int sol, int sag) {         // -1 geri, 0 dur, 1 ileri
  digitalWrite(IN1, sol > 0);
  digitalWrite(IN2, sol < 0);
  digitalWrite(IN3, sag > 0);
  digitalWrite(IN4, sag < 0);
}

bool kameraBaslat() {
  camera_config_t c = {};
  c.ledc_channel = LEDC_CHANNEL_0;
  c.ledc_timer = LEDC_TIMER_0;
  c.pin_d0 = PIN_D0; c.pin_d1 = PIN_D1; c.pin_d2 = PIN_D2; c.pin_d3 = PIN_D3;
  c.pin_d4 = PIN_D4; c.pin_d5 = PIN_D5; c.pin_d6 = PIN_D6; c.pin_d7 = PIN_D7;
  c.pin_xclk = PIN_XCLK; c.pin_pclk = PIN_PCLK; c.pin_vsync = PIN_VSYNC; c.pin_href = PIN_HREF;
  c.pin_sccb_sda = PIN_SDA; c.pin_sccb_scl = PIN_SCL;   // eski cekirdeklerde alan adi pin_sscb_sda / pin_sscb_scl
  c.pin_pwdn = -1;                                      // PWDN devrede GND'ye bagli
  c.pin_reset = -1;                                     // RESET devrede 3V3'e bagli
  c.xclk_freq_hz = 10000000;                            // 10 MHz
  c.pixel_format = PIXFORMAT_RGB565;
  c.frame_size = FRAMESIZE_QQVGA;                       // 160 x 120
  c.fb_count = 1;
  return esp_camera_init(&c) == ESP_OK;
}

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  motor(0, 0);
  if (!kameraBaslat()) {
    Serial.println("Kamera baslamadi: kablolari, 3V3 beslemesini ve XCLK'yi kontrol et");
    while (true) { delay(1000); }
  }
  Serial.println("Nesne takip robotu hazir");
}

void loop() {
  camera_fb_t *kare = esp_camera_fb_get();
  if (!kare) {
    motor(0, 0);
    return;
  }
  const int G = kare->width, Y = kare->height;
  long toplamX = 0, adet = 0;
  for (int y = 0; y < Y; y += 2) {                      // her 2 satirda bir
    for (int x = 0; x < G; x += 2) {                    // her 2 pikselde bir
      int i = (y * G + x) * 2;
      uint16_t p = (kare->buf[i] << 8) | kare->buf[i + 1];   // RGB565 (ust bayt once; modulde bayt sirasi degisirse takas et)
      int r = (p >> 11) & 0x1F, g = (p >> 5) & 0x3F, b = p & 0x1F;
      if (r > 20 && g < 24 && b < 12) {                 // "yeterince kirmizi" piksel (esikleri ortama gore ayarla)
        toplamX += x;
        adet++;
      }
    }
  }
  esp_camera_fb_return(kare);

  if (adet < 20) {                                      // nesne yok: dur
    motor(0, 0);
    Serial.println("nesne yok");
    return;
  }
  int merkez = toplamX / adet;                          // nesnenin ortalama x konumu (0..159)
  Serial.print("nesne x=");
  Serial.print(merkez);
  Serial.print(" piksel=");
  Serial.println(adet);
  if (merkez < G / 3) {
    motor(-1, 1);                                       // solda: sola don
  } else if (merkez > 2 * G / 3) {
    motor(1, -1);                                       // sagda: saga don
  } else {
    motor(1, 1);                                        // ortada: ileri
  }
}
