#!/usr/bin/env python3
"""Seviye 5 (81-100) anlatım içerikleri: content5/*.py parçalarını sırayla çalıştırır, content/<id>.json üretir. Kullanım: python3 gen_content5.py"""
import json, os, glob
HERE = os.path.dirname(os.path.abspath(__file__))
C = {}
def add(id, sketch, d, parts, wiring, steps, notes, free=None):
    C[id] = dict(sketch=sketch, d=d, parts=parts, wiring=wiring, steps=steps, notes=notes)
    if free: C[id]['free'] = free

UNO = "Arduino Uno ve USB kablosu"
LCDP = ["1 × 16x2 LCD ekran (HD44780)", "1 × 220 Ω direnç (LCD arka ışığı)"]
def lcdw(rs="D12", e="D11", d=("D5", "D4", "D3", "D2")):
    return [["5V", "Alttaki artı (+) rayı: LCD VDD ve arka ışık direncinin ucu"], ["GND (GND2)", "Alttaki eksi (−) rayı: LCD VSS, V0, RW ve K"],
            [rs, "LCD RS"], [e, "LCD E"], [d[0], "LCD D4"], [d[1], "LCD D5"], [d[2], "LCD D6"], [d[3], "LCD D7"]]
def lcds(rs="D12", e="D11", d=("D5", "D4", "D3", "D2")):
    return ["LCD'yi breadboard'un en üst sırasına (a satırı) tak: 12 pini sırayla 2–13. sütunlara gelsin (VSS, VDD, V0, RS, RW, E, D4, D5, D6, D7, A, K). Gerçek 16x2 LCD'nin 16 pini vardır; D0–D3 pinleri 4 bit modda boş kalır, simülatördeki ekran yalnızca kullanılan 12 pini gösterir.",
        "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
        "LCD güç kabloları: e2 → eksi rayı (VSS), e3 → artı rayı (VDD), e4 → eksi rayı (V0), e6 → eksi rayı (RW), e13 → eksi rayı (K). Arka ışık için 220 Ω direnci d12 ile d16 arasına tak (A bacağı üzerinden) ve e16 → artı rayı.",
        f"LCD veri kabloları: {rs} → e5 (RS), {e} → e7 (E), {d[0]} → e8 (D4), {d[1]} → e9 (D5), {d[2]} → e10 (D6), {d[3]} → e11 (D7)."]
SIM_YOK = "Simülatör sınırı"
GERCEK = "Gerçek kartta ve gerçek motorlarla denenmedi."
MEKANIK = "Robot şasisi, 2 tekerlek, bilyalı (sarhoş) tekerlek ve pil kutusu (devre dışı mekanik parça: devre görüntüsünde yoktur)"
def kut(*bas):
    return f"Gerçek derleme servisi yalnızca Arduino.h, Servo.h, Wire.h, SPI.h, EEPROM.h ve SoftwareSerial.h başlıklarını kabul eder; bu sketch'teki {', '.join(bas)} onların dışındadır, bu yüzden sitedeki gerçek derleme bu sketch'te hata verir. Gerçek kart için Arduino IDE'ye ilgili kütüphaneyi kurmak gerekir."
KUT_YOK = "Bu sketch ek bir kütüphane kullanmaz; yalnızca Arduino çekirdek işlevleri vardır."
LMOT = "L298N ve motorlar için ortak kurulum: L298N'i breadboard'un en üst sırasına (a satırı) tak: 13 pini sırayla a4–a16 deliklerine gelsin (12V, GND, 5V, ENA, IN1, IN2, IN3, IN4, ENB, OUT1, OUT2, OUT3, OUT4)."
def lsteps(extra=""):
    return [LMOT,
        "Arduino 5V pinini alttaki artı (+) rayına, GND2 pinini alttaki eksi (−) rayına kablola.",
        "Güç kaynağı (breadboard dışında, takılı değil): + ucunu e4'e (12V), − ucunu e5'e (GND) kablola. Motorların ve Arduino'nun GND'si ortak olmalı: d5 → eksi rayı. e6 → artı rayı: bu bağlantıyla L298N'in mantık devresi Arduino'nun 5V'unu kullanır; kartın üzerindeki 5V jumper'ını çıkar.",
        "Kontrol kabloları: D5 → e7 (ENA), D7 → e8 (IN1), D8 → e9 (IN2), D9 → e10 (IN3), D10 → e11 (IN4), D6 → e12 (ENB).",
        "Motorlar (breadboard dışında, takılı değil): sol motor için e13 → motor A, e14 → motor B (OUT1, OUT2); sağ motor için e15 → motor A, e16 → motor B (OUT3, OUT4)."]
LWIRE = [["5V", "Alttaki artı (+) rayı: L298N 5V ucu ve diğer modüllerin VCC'si"], ["GND (GND2)", "Alttaki eksi (−) rayı: L298N GND ve diğer modüllerin GND'si"],
         ["D5", "L298N ENA (sol motor hızı, PWM)"], ["D6", "L298N ENB (sağ motor hızı, PWM)"], ["D7", "L298N IN1"], ["D8", "L298N IN2"], ["D9", "L298N IN3"], ["D10", "L298N IN4"]]
LPARTS = ["1 × L298N motor sürücü", "2 × DC motor (robotun sol ve sağ tekerleği)", "1 × ayarlanabilir güç kaynağı (6 V'a ayarlı; gerçekte 4 × AA pil kutusu)"]
GUC = ["Güç ve GND", "Motorları Arduino'nun 5V pininden besleme: motorlar yüzlerce mA çeker. Motor gücü ayrı güç kaynağından (pil kutusu) gelir; L298N'in GND'si Arduino GND'sine mutlaka bağlanmalı, yoksa IN/EN sinyalleri anlamsız olur. L298N yaklaşık 2 V düşürür; motor beslemesini motorun istediği gerilimden yaklaşık 2 V yüksek seç. L298N'in dahili serbest dönüş diyotları vardır, ayrıca diyot eklenmez. Güvenlik: pil kutusunu kısa devre yapma (artı ve eksi uçları birbirine değmesin); lityum/Li-ion pil kullanıyorsan yetişkin gözetiminde, koruma devreli paketle çalış; kablolar ısınırsa hemen enerjiyi kes."]

# ---- Seviye 5 ortak metinler ----
GERCEK_DON = "Gerçek donanımda doğrulanmadı."
ESP_GENEL = "ESP32 sketch'i (Arduino-ESP32 çekirdeği) simülatörde ÇALIŞTIRILAMAZ: simülatör ESP32'yi yalnızca çizer, besleme ve gerilim seviyesini denetler. Sitedeki kod gerçek donanımda doğrulanmadı; Arduino IDE'ye ESP32 kart paketi (Espressif) kurulup kendi kartında denenmelidir."
ESP_DERLE = "Sitedeki 'Derle' hizmeti AVR (Uno) içindir; ESP32 başlıklarını (WiFi.h, esp_camera.h vb.) tanımaz ve bu sketch'te hata verir. Kodu Arduino IDE'de ESP32 kart seçerek derle."
PSU = "1 × ayarlanabilir güç kaynağı"
def sec_guc(txt): return ["Güç ve GND", txt]
LS_NOT = "L298N ve motorlar için ortak kurulum: L298N'i breadboard'un en üst sırasına (a satırı) tak: 13 pini sırayla a4–a16 deliklerine gelsin (12V, GND, 5V, ENA, IN1, IN2, IN3, IN4, ENB, OUT1, OUT2, OUT3, OUT4)."
def esp_notes(nasil, gozlenen, sinir, guc, hatalar, dene):
    return [["Nasıl çalışıyor?", nasil], ["Simülatörde gözlenen", gozlenen + " " + GERCEK_DON], [SIM_YOK, sinir + " " + ESP_GENEL + " " + ESP_DERLE],
            ["Güç ve GND", guc], ["Sık yapılan hatalar", hatalar], ["Dene", dene]]
for _f in sorted(glob.glob(f'{HERE}/content5/*.py')):
    exec(open(_f, encoding='utf-8').read())
for k, v in C.items():
    json.dump(v, open(f'{HERE}/content/{k}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(C), 'içerik yazıldı')
