#pragma once
#include "Arduino.h"
typedef int esp_err_t;
#define ESP_OK 0
typedef enum { PIXFORMAT_RGB565, PIXFORMAT_YUV422, PIXFORMAT_GRAYSCALE, PIXFORMAT_JPEG } pixformat_t;
typedef enum { FRAMESIZE_QQVGA, FRAMESIZE_QVGA, FRAMESIZE_VGA, FRAMESIZE_SVGA } framesize_t;
typedef struct { int ledc_timer; int ledc_channel; int pin_d0, pin_d1, pin_d2, pin_d3, pin_d4, pin_d5, pin_d6, pin_d7;
  int pin_xclk, pin_pclk, pin_vsync, pin_href, pin_sccb_sda, pin_sccb_scl, pin_pwdn, pin_reset;
  int xclk_freq_hz; pixformat_t pixel_format; framesize_t frame_size; int jpeg_quality; size_t fb_count; } camera_config_t;
typedef struct { uint8_t *buf; size_t len; size_t width; size_t height; } camera_fb_t;
esp_err_t esp_camera_init(const camera_config_t *); camera_fb_t *esp_camera_fb_get(); void esp_camera_fb_return(camera_fb_t *);
#define LEDC_CHANNEL_0 0
#define LEDC_TIMER_0 0
