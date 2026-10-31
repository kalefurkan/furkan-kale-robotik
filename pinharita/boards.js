/* PinHarita kart verisi.
 * Her kartın kaynak bağlantıları `sources` içindedir ve arayüzde "Kaynaklar" bölümünde gösterilir.
 * Pin işlevi: {f, per, def?, flex?}
 *   f    : dig pwm adc dac sda scl mosi miso sck cs tx rx int touch
 *   per  : çevre birimi (ör. "I2C0", "ADC2", "PWM3 A")
 *   def  : Arduino çekirdeğinde varsayılan pin
 *   flex : sabit pin değil, GPIO matrisi ile atanabilir (yalnızca ESP32-S3)
 * Uyarı türleri: unusable (err) · boot · usb · adc2 · cond (koşullu) → warn · led · info → bilgi
 * `verify:true` = kesin doğrulanamadı, arayüzde "doğrula" rozeti çıkar.
 */
(function () {
  'use strict';
  var NOTE_VER = 'Kart sürümüne / modül varyantına göre fark olabilir; kendi kartının belgesini ve kart üzerindeki yazıyı kontrol et.';

  function fn(f, per, o) { var r = { f: f, per: per || null }; if (o) for (var k in o) r[k] = o[k]; return r; }
  function pin(o) {
    o.kind = o.kind || 'gpio';
    o.funcs = o.funcs || [];
    o.warns = o.warns || [];
    return o;
  }
  function W(type, msg, verify) { var w = { type: type, msg: msg }; if (verify) w.verify = true; return w; }
  function power(id, label, phys, kind, extra) { return pin({ id: id, label: label, phys: phys, kind: kind, gpio: null, sym: null, extra: extra || '' }); }

  /* ============ Arduino UNO R4 (Minima / WiFi) ============ */
  var unoSpec = {
    // id: [funcs...], sym, led?
    D0:  { n: 0,  f: [fn('dig'), fn('rx', 'UART Serial1', { def: true })], note: 'Serial1 RX (USB seri ile karışmaz; USB seri "Serial"dir).' },
    D1:  { n: 1,  f: [fn('dig'), fn('tx', 'UART Serial1', { def: true })], note: 'Serial1 TX.' },
    D2:  { n: 2,  f: [fn('dig'), fn('int', 'IRQ')] },
    D3:  { n: 3,  f: [fn('dig'), fn('pwm', 'GPT1 B'), fn('int', 'IRQ')] },
    D4:  { n: 4,  f: [fn('dig')] },
    D5:  { n: 5,  f: [fn('dig'), fn('pwm', 'GPT2 B')] },
    D6:  { n: 6,  f: [fn('dig'), fn('pwm', 'GPT0 B')] },
    D7:  { n: 7,  f: [fn('dig')] },
    D8:  { n: 8,  f: [fn('dig')] },
    D9:  { n: 9,  f: [fn('dig'), fn('pwm', 'GPT7 B')] },
    D10: { n: 10, f: [fn('dig'), fn('pwm', 'GPT3 B'), fn('cs', 'SPI', { def: true })] },
    D11: { n: 11, f: [fn('dig'), fn('pwm', 'GPT1 A'), fn('mosi', 'SPI', { def: true })] },
    D12: { n: 12, f: [fn('dig'), fn('miso', 'SPI', { def: true })] },
    D13: { n: 13, f: [fn('dig'), fn('sck', 'SPI', { def: true })], led: true }
  };
  var unoPins = [];
  Object.keys(unoSpec).forEach(function (id) {
    var s = unoSpec[id], w = [];
    if (s.note) w.push(W('info', s.note));
    if (s.led) w.push(W('led', 'Kart üzerindeki LED (LED_BUILTIN) bu pine bağlıdır; SPI SCK olarak kullanırsan LED titrer.'));
    unoPins.push(pin({ id: id, label: 'D' + s.n, gpio: s.n, sym: String(s.n), funcs: s.f, warns: w, v5: false, level: '5 V' }));
  });
  [['A0', 0, 'RA4M1 P014'], ['A1', 1, 'P000'], ['A2', 2, 'P001'], ['A3', 3, 'P002'], ['A4', 4, 'P101'], ['A5', 5, 'P100']].forEach(function (a) {
    var f = [fn('dig'), fn('adc', 'ADC')];
    var w = [];
    if (a[1] === 0) { f.push(fn('dac', 'DAC 12 bit')); w.push(W('info', 'Kartın tek DAC çıkışı: gerçek analog gerilim üretir (analogWrite + analogWriteResolution(12)).')); }
    if (a[1] === 4) { f.push(fn('sda', 'I2C Wire', { def: true })); w.push(W('info', 'I²C SDA (Wire). SDA/SCL pinleri A4/A5 ile aynı hatlardır.')); }
    if (a[1] === 5) { f.push(fn('scl', 'I2C Wire', { def: true })); w.push(W('info', 'I²C SCL (Wire).')); }
    unoPins.push(pin({ id: a[0], label: a[0], gpio: 14 + a[1], sym: a[0], funcs: f, warns: w, v5: false, level: '5 V' }));
  });
  unoPins.push(power('AREF', 'AREF', null, 'special', 'ADC dış referans gerilimi girişi.'));
  unoPins.push(power('GND1', 'GND', null, 'gnd'));
  unoPins.push(power('GND2', 'GND', null, 'gnd'));
  unoPins.push(power('5V', '5V', null, 'power', '5 V çıkış (USB/VIN ile beslenir).'));
  unoPins.push(power('3V3', '3V3', null, 'power', '3,3 V çıkış (sınırlı akım).'));
  unoPins.push(power('VIN', 'VIN', null, 'power', 'Dış besleme girişi (6–24 V, Arduino belgesine göre).'));
  unoPins.push(power('RESET', 'RESET', null, 'special', 'Reset girişi (GPIO değil).'));

  var uno = {
    id: 'uno-r4', name: 'Arduino UNO R4', sub: 'Minima / WiFi · Renesas RA4M1', logic: 5, wifi: false, flexible: false,
    layout: { kind: 'uno', groups: [
      { title: 'Dijital başlık (D0–D13, AREF, GND)', dir: 'h', pins: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'AREF', 'GND1'] },
      { title: 'Analog başlık (A0–A5)', dir: 'h', pins: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'] },
      { title: 'Güç başlığı', dir: 'h', pins: ['RESET', '3V3', '5V', 'GND2', 'VIN'] }
    ] },
    pins: unoPins,
    code: {
      ar: {
        dig: 'pinMode({s}, OUTPUT);\ndigitalWrite({s}, HIGH);',
        pwm: 'analogWrite({s}, 128);  // 0–255 (varsayılan 8 bit)',
        adc: 'int v = analogRead({s});  // 0–1023; analogReadResolution(14) ile 14 bit',
        dac: 'analogWriteResolution(12);\nanalogWrite(A0, 2048);  // 12 bit DAC',
        int: 'attachInterrupt(digitalPinToInterrupt({s}), isr, FALLING);',
        sda: 'Wire.begin();  // SDA = A4',
        scl: 'Wire.begin();  // SCL = A5',
        mosi: 'SPI.begin();  // CS=D10 MOSI=D11 MISO=D12 SCK=D13',
        miso: 'SPI.begin();  // CS=D10 MOSI=D11 MISO=D12 SCK=D13',
        sck: 'SPI.begin();  // CS=D10 MOSI=D11 MISO=D12 SCK=D13',
        cs: 'pinMode(10, OUTPUT);  // SPI CS (SS) = D10',
        tx: 'Serial1.begin(9600);  // D1 = TX',
        rx: 'Serial1.begin(9600);  // D0 = RX'
      },
      mp: null
    },
    sources: [
      { t: 'ArduinoCore-renesas · MINIMA/pins_arduino.h (A0–A5 = 14–19, SDA=18, SCL=19, SPI 10–13, LED_BUILTIN=13, UART1 TX=1 RX=0)', u: 'https://github.com/arduino/ArduinoCore-renesas/blob/main/variants/MINIMA/pins_arduino.h' },
      { t: 'ArduinoCore-renesas · MINIMA/variant.cpp (pin sırası; PWM "~" işaretleri D3, D5, D6, D9, D10, D11; A0 DAC)', u: 'https://github.com/arduino/ArduinoCore-renesas/blob/main/variants/MINIMA/variant.cpp' },
      { t: 'ArduinoCore-renesas · MINIMA/pinmux.inc (GPT zamanlayıcı kanalları, SCI/IIC/SPI eşlemesi)', u: 'https://github.com/arduino/ArduinoCore-renesas/blob/main/variants/MINIMA/pinmux.inc' },
      { t: 'docs.arduino.cc · UNO R4 Minima (5 V kart, 14 dijital, 6 analog, 12 bit DAC, CAN)', u: 'https://docs.arduino.cc/hardware/uno-r4-minima/' },
      { t: 'docs.arduino.cc · UNO R4 Minima cheat sheet (sayfa içeriği otomatik alınamadı, başvuru olarak listelendi)', u: 'https://docs.arduino.cc/tutorials/uno-r4-minima/cheat-sheet/' }
    ],
    notes: [
      NOTE_VER,
      'Kesme: yalnızca D2 ve D3 işaretlendi (Arduino\'nun klasik UNO uyumu). RA4M1 çekirdek eşlemesinde başka pinlerde de IRQ kanalı görünüyor ama resmî belgeden doğrulanmadı.',
      'CAN (D4/D5 ve D11/D12 civarı) çekirdek eşlemesinde görünüyor; harici alıcı-verici gerekir. Pin atamasını doğrulamadığım için işlev olarak eklenmedi.',
      'Pin başına akım sınırı ve 5 V eşiği RA4M1 veri sayfasındandır; burada doğrulanmadı — LED\'i her zaman dirençle sür.',
      'UNO R4 WiFi ve Minima başlık düzeni aynıdır; WiFi sürümünde ek olarak LED matris ve ESP32-S3 modülü bulunur (bu haritada gösterilmez).'
    ]
  };

  /* ============ ESP32-S3-DevKitC-1 ============ */
  var esp = [];
  var espAdc1 = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9 };
  var espAdc2 = { 11: 0, 12: 1, 13: 2, 14: 3, 15: 4, 16: 5, 17: 6, 18: 7, 19: 8, 20: 9 };
  var espDef = { 8: 'sda', 9: 'scl', 10: 'cs', 11: 'mosi', 12: 'sck', 13: 'miso', 43: 'tx', 44: 'rx' };
  var espPer = { sda: 'I2C0 Wire', scl: 'I2C0 Wire', cs: 'SPI', mosi: 'SPI', sck: 'SPI', miso: 'SPI', tx: 'UART0', rx: 'UART0' };
  var espPhys = {
    J1: [['3V3', 1], ['3V3b', 2], ['RST', 3], [4, 4], [5, 5], [6, 6], [7, 7], [15, 8], [16, 9], [17, 10], [18, 11], [8, 12], [3, 13], [46, 14], [9, 15], [10, 16], [11, 17], [12, 18], [13, 19], [14, 20], ['5V', 21], ['GNDa', 22]],
    J3: [['GNDb', 1], [43, 2], [44, 3], [1, 4], [2, 5], [42, 6], [41, 7], [40, 8], [39, 9], [38, 10], [37, 11], [36, 12], [35, 13], [0, 14], [45, 15], [48, 16], [47, 17], [21, 18], [20, 19], [19, 20], ['GNDc', 21], ['GNDd', 22]]
  };
  var espGroups = { J1: [], J3: [] };
  Object.keys(espPhys).forEach(function (hdr) {
    espPhys[hdr].forEach(function (e) {
      var k = e[0], ph = hdr + '-' + e[1];
      if (typeof k === 'string') {
        var isG = k.indexOf('GND') === 0;
        var id = 'S_' + k;
        if (isG) esp.push(power(id, 'GND', ph, 'gnd'));
        else if (k === 'RST') esp.push(power(id, 'RST (EN)', ph, 'special', 'Reset/EN girişi (GPIO değil).'));
        else if (k === '5V') esp.push(power(id, '5V', ph, 'power', '5 V güç (USB/harici).'));
        else esp.push(power(id, '3V3', ph, 'power', '3,3 V regülatör çıkışı.'));
        espGroups[hdr].push(id);
        return;
      }
      var n = k, id2 = 'GPIO' + n, f = [fn('dig'), fn('int', 'GPIO IRQ')], w = [], v;
      if (espAdc1[n] !== undefined) f.push(fn('adc', 'ADC1', { ch: espAdc1[n] }));
      if (espAdc2[n] !== undefined) { f.push(fn('adc', 'ADC2', { ch: espAdc2[n] })); w.push(W('adc2', 'ADC2 (kanal ' + espAdc2[n] + '): Wi-Fi çalışırken ADC2 çevre birimi Wi-Fi tarafından kullanılır; ESP-IDF belgesi "ADC2 is also used by Wi-Fi" der. Wi-Fi kullanıyorsan analog okumayı ADC1 pinlerine (GPIO1–10) taşı.')); }
      if (n >= 1 && n <= 14) f.push(fn('touch', 'Touch T' + n, { ch: n }));
      // sabit (varsayılan) pinler
      var d = espDef[n];
      if (d) f.push(fn(d, espPer[d], { def: true }));
      // GPIO matrisi: her kullanılabilir pin her seri çevre birimine atanabilir
      var flexOk = !(n === 35 || n === 36 || n === 37);
      if (flexOk) {
        ['sda', 'scl', 'mosi', 'miso', 'sck', 'cs', 'tx', 'rx'].forEach(function (r) { if (d !== r) f.push(fn(r, 'GPIO matrisi', { flex: true })); });
      }
      // PWM: LEDC tüm çıkış yapabilen pinlerde
      f.push(fn('pwm', 'LEDC', { flex: true }));
      // uyarılar
      if (n === 0) w.push(W('boot', 'Strapping pini (Boot modu): açılışta HIGH okunmalı. BOOT düğmesi buna bağlıdır; açılışta LOW tutulursa kart yükleme (download) moduna girer. Dışarıdan çekme/sürme yapma.'));
      if (n === 3) w.push(W('boot', 'Strapping pini (JTAG sinyal kaynağı seçimi): açılış seviyesi JTAG kaynağını belirler. Açılışta sürülen bir sensör/çıkış sorun çıkarabilir.'));
      if (n === 45) w.push(W('boot', 'Strapping pini (VDD_SPI gerilimi): açılışta HIGH/LOW durumu flash besleme gerilimini seçer. Yanlış seviye kartı başlatamaz hale getirebilir.'));
      if (n === 46) w.push(W('boot', 'Strapping pini (boot modu / ROM mesaj yazdırma): açılışta dışarıdan sürülmemeli.'));
      if (n === 19) w.push(W('usb', 'USB D- (yerleşik USB-Serial/JTAG). Normal GPIO yaparsan USB-JTAG ve USB üzerinden seri çıkış çalışmaz. IDF belgesi: GPIO19/20 varsayılan olarak USB-JTAG içindir.'));
      if (n === 20) w.push(W('usb', 'USB D+ (yerleşik USB-Serial/JTAG). Normal GPIO yaparsan USB-JTAG ve USB üzerinden seri çıkış çalışmaz.'));
      if (n === 35 || n === 36 || n === 37) w.push(W('cond', 'Octal SPI flash/PSRAM kullanan modüllerde (ör. ESP32-S3-WROOM-1 R8 / N16R8 varyantları, WROOM-2) bu pin flash/PSRAM ile iç iletişim için kullanılır ve harici kullanıma KAPALIDIR. Quad PSRAM/flash\'lı modüllerde serbest olabilir; modül yazına bak.'));
      if (n === 48) w.push(W('led', 'Kart sürümü v1.0 ise yerleşik RGB LED (WS2812) GPIO48\'dedir. v1.1\'de LED GPIO38\'dedir ve GPIO48 serbesttir. Arduino-ESP32: RGB_BUILTIN / neopixelWrite().'));
      if (n === 38) w.push(W('led', 'Kart sürümü v1.1 ise yerleşik RGB LED (WS2812) GPIO38\'dedir. v1.0\'da LED GPIO48\'dedir ve GPIO38 serbesttir.'));
      if (n === 43 || n === 44) w.push(W('info', 'UART0 (USB-UART köprüsü üzerinden konsol/log çıkışı: TX=GPIO43, RX=GPIO44). Serial Monitor ile paylaşılır.'));
      if (n >= 39 && n <= 42) w.push(W('info', 'JTAG pini (MTCK/MTDO/MTDI/MTMS). Normal GPIO olarak kullanılabilir; harici JTAG hata ayıklayıcı kullanıyorsan çakışır.'));
      if (n === 8) w.push(W('info', 'Arduino-ESP32 varsayılan I²C SDA (pins_arduino.h).'));
      if (n === 9) w.push(W('info', 'Arduino-ESP32 varsayılan I²C SCL (pins_arduino.h).'));
      if (n >= 10 && n <= 13) w.push(W('info', 'Arduino-ESP32 varsayılan SPI pini (SS=10, MOSI=11, SCK=12, MISO=13).'));
      var phys = null;
      Object.keys(espPhys).forEach(function (h) { espPhys[h].forEach(function (x) { if (x[0] === n) phys = h + '-' + x[1]; }); });
      esp.push(pin({ id: id2, label: 'GPIO' + n, phys: phys, gpio: n, sym: String(n), funcs: f, warns: w, v5: false, level: '3,3 V' }));
      espGroups[hdr].push(id2);
    });
  });

  var esp32s3 = {
    id: 'esp32-s3', name: 'ESP32-S3-DevKitC-1', sub: 'Espressif · Xtensa LX7 · Wi-Fi + BLE', logic: 3.3, wifi: true, flexible: true,
    layout: { kind: 'two', groups: [
      { title: 'J1 (sol başlık)', dir: 'v', pins: espGroups.J1 },
      { title: 'J3 (sağ başlık)', dir: 'v', pins: espGroups.J3 }
    ], usb: 'USB-C girişleri kartın alt kenarındadır' },
    pins: esp,
    code: {
      ar: {
        dig: 'pinMode({n}, OUTPUT);\ndigitalWrite({n}, HIGH);',
        pwm: '// Arduino-ESP32 3.x\nledcAttach({n}, 5000, 8);   // pin, frekans, çözünürlük\nledcWrite({n}, 128);\n// 2.x: ledcSetup(0,5000,8); ledcAttachPin({n},0); ledcWrite(0,128);',
        adc: 'int v = analogRead({n});  // 12 bit: 0–4095',
        int: 'attachInterrupt(digitalPinToInterrupt({n}), isr, CHANGE);',
        touch: 'uint32_t t = touchRead({n});  // kapasitif dokunmatik',
        sda: 'Wire.begin({n}, SCL_PIN);  // varsayılan SDA=8, SCL=9',
        scl: 'Wire.begin(SDA_PIN, {n});  // varsayılan SDA=8, SCL=9',
        mosi: 'SPI.begin(SCK_PIN, MISO_PIN, {n}, CS_PIN);  // varsayılan SCK=12 MISO=13 MOSI=11 SS=10',
        miso: 'SPI.begin(SCK_PIN, {n}, MOSI_PIN, CS_PIN);',
        sck: 'SPI.begin({n}, MISO_PIN, MOSI_PIN, CS_PIN);',
        cs: 'pinMode({n}, OUTPUT);  // SPI CS (varsayılan SS=10)',
        tx: 'Serial1.begin(115200, SERIAL_8N1, RX_PIN, {n});  // UART0 varsayılan TX=43',
        rx: 'Serial1.begin(115200, SERIAL_8N1, {n}, TX_PIN);  // UART0 varsayılan RX=44'
      },
      mp: {
        dig: 'p = Pin({n}, Pin.OUT)\np.value(1)',
        pwm: 'pwm = PWM(Pin({n}), freq=1000, duty_u16=32768)',
        adc: 'adc = ADC(Pin({n}))\nv = adc.read_u16()',
        int: 'Pin({n}, Pin.IN).irq(trigger=Pin.IRQ_FALLING, handler=cb)',
        touch: 'from machine import TouchPad\nt = TouchPad(Pin({n}))\nt.read()',
        sda: 'i2c = I2C(0, sda=Pin({n}), scl=Pin(9))',
        scl: 'i2c = I2C(0, sda=Pin(8), scl=Pin({n}))',
        mosi: 'spi = SPI(1, sck=Pin(12), mosi=Pin({n}), miso=Pin(13))',
        miso: 'spi = SPI(1, sck=Pin(12), mosi=Pin(11), miso=Pin({n}))',
        sck: 'spi = SPI(1, sck=Pin({n}), mosi=Pin(11), miso=Pin(13))',
        cs: 'cs = Pin({n}, Pin.OUT, value=1)',
        tx: 'uart = UART(1, baudrate=115200, tx=Pin({n}), rx=Pin(RX_PIN))',
        rx: 'uart = UART(1, baudrate=115200, tx=Pin(TX_PIN), rx=Pin({n}))'
      }
    },
    sources: [
      { t: 'ESP32-S3-DevKitC-1 v1.1 kullanım kılavuzu (J1/J3 başlık tabloları, ADC/dokunmatik kanalları, RGB LED GPIO48→GPIO38, GPIO35–37 uyarısı)', u: 'https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html' },
      { t: 'ESP-IDF · GPIO API (GPIO26–32 flash/PSRAM, GPIO33–37 octal, GPIO19/20 USB-JTAG)', u: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/gpio.html' },
      { t: 'ESP-IDF · ADC oneshot (ADC2 Wi-Fi tarafından da kullanılır)', u: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/adc/adc_oneshot.html' },
      { t: 'arduino-esp32 · variants/esp32s3/pins_arduino.h (TX=43 RX=44, SDA=8 SCL=9, SS=10 MOSI=11 SCK=12 MISO=13, T1–T14=GPIO1–14, A0–A19=GPIO1–20)', u: 'https://github.com/espressif/arduino-esp32/blob/master/variants/esp32s3/pins_arduino.h' },
      { t: 'ESP32-S3 veri sayfası, "Boot Configurations" (strapping pinleri GPIO0/3/45/46) — IDF sayfası strapping pinlerini listelemiyor, veri sayfası bağlantısıyla yönlendiriyor', u: 'https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf', verify: true }
    ],
    notes: [
      NOTE_VER,
      'Strapping pinleri (GPIO0, 3, 45, 46) bilgisi bu geliştirme sırasında veri sayfası PDF\'sinden satır satır alınamadı; Espressif belgelerindeki bilinen listeyle verildi. Başlık tablosu ve ADC/dokunmatik kanalları ise resmî kılavuzdan alındı.',
      'Kartın başlıklarında GPIO22–34 yoktur: GPIO22–25 çipte yok, GPIO26–32 SPI flash/PSRAM için ayrılmış, GPIO33–34 octal flash/PSRAM kullanan modüllerde ayrılmış.',
      'ESP32-S3\'te I²C/SPI/UART sinyalleri GPIO matrisi ile hemen her kullanılabilir pine yönlendirilebilir. Haritada sabit/varsayılan Arduino pinleri rozetle, matris atamaları "esnek" olarak ayrıca sayılır.',
      'Tüm GPIO\'lar 3,3 V mantıklıdır; 5 V sinyali doğrudan bağlama (seviye dönüştürücü kullan).',
      'Dahili RGB LED pini donanım sürümüne göre GPIO48 (v1.0) ya da GPIO38 (v1.1) olur.'
    ]
  };

  /* ============ Raspberry Pi Pico 2 (RP2350) ============ */
  var pico = [];
  var picoLeft = [['GP0', 1], ['GP1', 2], ['GND', 3], ['GP2', 4], ['GP3', 5], ['GP4', 6], ['GP5', 7], ['GND', 8], ['GP6', 9], ['GP7', 10], ['GP8', 11], ['GP9', 12], ['GND', 13], ['GP10', 14], ['GP11', 15], ['GP12', 16], ['GP13', 17], ['GND', 18], ['GP14', 19], ['GP15', 20]];
  var picoRight = [['VBUS', 40], ['VSYS', 39], ['GND', 38], ['3V3_EN', 37], ['3V3', 36], ['ADC_VREF', 35], ['GP28', 34], ['AGND', 33], ['GP27', 32], ['GP26', 31], ['RUN', 30], ['GP22', 29], ['GND', 28], ['GP21', 27], ['GP20', 26], ['GP19', 25], ['GP18', 24], ['GND', 23], ['GP17', 22], ['GP16', 21]];
  var picoGroups = { L: [], R: [] };
  function picoPin(name, ph, side) {
    var m = /^GP(\d+)$/.exec(name);
    var id = m ? name : 'P' + ph;
    if (!m) {
      var k = name === 'GND' || name === 'AGND' ? 'gnd' : (name === 'VBUS' || name === 'VSYS' || name === '3V3' ? 'power' : 'special');
      var ex = { VBUS: 'USB 5 V (USB bağlıyken).', VSYS: 'Sistem besleme girişi (1,8–5,5 V).', '3V3': '3,3 V çıkış.', '3V3_EN': '3,3 V regülatörünü kapatma girişi.', ADC_VREF: 'ADC referans gerilimi.', RUN: 'Reset girişi (GPIO değil).', AGND: 'Analog toprak (ADC için).' }[name] || '';
      pico.push(power(id, name, String(ph), k, ex));
      picoGroups[side].push(id);
      return;
    }
    var n = +m[1];
    var f = [fn('dig'), fn('int', 'GPIO IRQ')], w = [];
    var sl = (n >> 1) & 7, ch = (n & 1) ? 'B' : 'A';
    f.push(fn('pwm', 'PWM' + sl + ' ' + ch));
    if (n >= 26 && n <= 28) f.push(fn('adc', 'ADC' + (n - 26), { ch: n - 26 }));
    var i2c = (n >> 1) & 1;
    f.push(fn((n & 1) ? 'scl' : 'sda', 'I2C' + i2c, { def: n === 4 || n === 5 }));
    var spi = (n >> 3) & 1, role = ['miso', 'cs', 'sck', 'mosi'][n & 3];
    f.push(fn(role, 'SPI' + spi, { def: [16, 17, 18, 19, 12, 13, 14, 15].indexOf(n) >= 0 }));
    if (!(n & 2)) { var u = (((n >> 2) & 3) === 0 || ((n >> 2) & 3) === 3) ? 0 : 1; f.push(fn((n & 1) ? 'rx' : 'tx', 'UART' + u, { def: n <= 1 || n === 8 || n === 9 })); }
    if (n === 4 || n === 5) w.push(W('info', 'arduino-pico varsayılan Wire (I2C0) pinleri GP4/GP5.'));
    if (n >= 26 && n <= 28) w.push(W('info', 'ADC girişi (12 bit, 0–3,3 V). GP26–28 = ADC0–2. Giriş gerilimi 3,3 V\'u geçmemeli.'));
    pico.push(pin({ id: id, label: 'GP' + n, phys: String(ph), gpio: n, sym: String(n), funcs: f, warns: w, v5: false, level: '3,3 V' }));
    picoGroups[side].push(id);
  }
  picoLeft.forEach(function (e) { picoPin(e[0], e[1], 'L'); });
  picoRight.forEach(function (e) { picoPin(e[0], e[1], 'R'); });

  var pico2 = {
    id: 'pico2', name: 'Raspberry Pi Pico 2', sub: 'RP2350 · Cortex-M33 / Hazard3', logic: 3.3, wifi: false, flexible: false,
    layout: { kind: 'two', groups: [
      { title: 'Sol sıra (pin 1–20)', dir: 'v', pins: picoGroups.L },
      { title: 'Sağ sıra (pin 40–21)', dir: 'v', pins: picoGroups.R }
    ], usb: 'Micro-USB bağlantısı kartın üst kenarındadır' },
    pins: pico,
    code: {
      ar: {
        dig: 'pinMode({n}, OUTPUT);\ndigitalWrite({n}, HIGH);',
        pwm: 'analogWrite({n}, 128);  // arduino-pico; varsayılan 8 bit',
        adc: 'int v = analogRead(A{ch});  // A0=GP26 … A2=GP28 (12 bit; analogReadResolution)',
        int: 'attachInterrupt(digitalPinToInterrupt({n}), isr, FALLING);',
        sda: 'Wire{i}.setSDA({n});\nWire{i}.begin();  // varsayılan Wire: SDA=GP4 SCL=GP5',
        scl: 'Wire{i}.setSCL({n});\nWire{i}.begin();',
        mosi: 'SPI{i}.setTX({n});  // MOSI\nSPI{i}.begin();',
        miso: 'SPI{i}.setRX({n});  // MISO\nSPI{i}.begin();',
        sck: 'SPI{i}.setSCK({n});\nSPI{i}.begin();',
        cs: 'SPI{i}.setCS({n});  // ya da pinMode ile elle yönet',
        tx: '// UART{i} TX\nSerial{u}.setTX({n}); Serial{u}.begin(115200);  // Serial1=UART0, Serial2=UART1',
        rx: '// UART{i} RX\nSerial{u}.setRX({n}); Serial{u}.begin(115200);'
      },
      mp: {
        dig: 'p = Pin({n}, Pin.OUT)\np.value(1)',
        pwm: 'pwm = PWM(Pin({n}))\npwm.freq(1000)\npwm.duty_u16(32768)',
        adc: 'adc = ADC(Pin({n}))  # ya da ADC({ch})\nv = adc.read_u16()',
        int: 'Pin({n}, Pin.IN).irq(trigger=Pin.IRQ_FALLING, handler=cb)',
        sda: 'i2c = I2C({i}, sda=Pin({n}), scl=Pin(SCL_PIN))',
        scl: 'i2c = I2C({i}, sda=Pin(SDA_PIN), scl=Pin({n}))',
        mosi: 'spi = SPI({i}, sck=Pin(SCK_PIN), mosi=Pin({n}), miso=Pin(MISO_PIN))',
        miso: 'spi = SPI({i}, sck=Pin(SCK_PIN), mosi=Pin(MOSI_PIN), miso=Pin({n}))',
        sck: 'spi = SPI({i}, sck=Pin({n}), mosi=Pin(MOSI_PIN), miso=Pin(MISO_PIN))',
        cs: 'cs = Pin({n}, Pin.OUT, value=1)',
        tx: 'uart = UART({i}, baudrate=115200, tx=Pin({n}), rx=Pin(RX_PIN))',
        rx: 'uart = UART({i}, baudrate=115200, tx=Pin(TX_PIN), rx=Pin({n}))'
      }
    },
    sources: [
      { t: 'arduino-pico · variants/rpipico2/pins_arduino.h (LED=GP25, Serial1 0/1, Serial2 8/9, SPI0 16/17/18/19, SPI1 12/13/14/15, Wire0 GP4/5, Wire1 GP26/27)', u: 'https://github.com/earlephilhower/arduino-pico/blob/master/variants/rpipico2/pins_arduino.h' },
      { t: 'pico-sdk · rp2350 platform_defs.h (12 PWM dilimi, 2 UART, 2 I2C, 2 SPI, 5 ADC kanalı, ADC taban pini GPIO26)', u: 'https://github.com/raspberrypi/pico-sdk/blob/master/src/rp2350/hardware_regs/include/hardware/platform_defs.h' },
      { t: 'Raspberry Pi Pico 2 veri sayfası (pin diyagramı; PDF indirildi ancak metni araçla okunamadı)', u: 'https://datasheets.raspberrypi.com/pico/pico-2-datasheet.pdf', verify: true },
      { t: 'RP2350 veri sayfası (GPIO işlev tablosu)', u: 'https://datasheets.raspberrypi.com/rp2350/rp2350-datasheet.pdf', verify: true }
    ],
    notes: [
      NOTE_VER,
      'I²C/SPI/UART/PWM eşlemeleri RP2350 işlev seçim desenidir (I2C: (GP>>1)&1, SDA çift/SCL tek; PWM dilimi (GP>>1)&7, kanal A çift/B tek; SPI: GP&3 → RX/CSn/SCK/TX). Varsayılan Arduino pinleri resmî olmayan ama ilgili çekirdek başlığıyla doğrulandı; desenin tamamı veri sayfası tablosuyla satır satır karşılaştırılamadı.',
      'Başlıkta yalnızca GP0–GP22 ve GP26–GP28 vardır (26 kullanılabilir GPIO). GP23/24/25/29 kart içinde kullanılır: GP25 = yerleşik LED (Pico 2 W\'de LED kablosuz çipindedir), GP29 = VSYS/3 ADC ölçümü. Bunlar başlıkta olmadığından haritada yoktur.',
      'GPIO\'lar 3,3 V mantıklıdır. RP2350 GPIO\'larının 5 V\'a dayanıklılığı konusunda ve donanım hatası notlarında (RP2350-E9 vb.) veri sayfasından doğrulama yapılamadı; 5 V sinyali seviye dönüştürücü olmadan bağlama.',
      'Tüm GPIO\'larda PWM bulunur ancak aynı dilimin A ve B kanalları aynı frekansı paylaşır.'
    ]
  };

  /* ============ Raspberry Pi 5 40 pinli başlık ============ */
  var pi = [];
  // [phys, label, gpio|null, kind, funcs-extra, note]
  var piTable = [
    [1, '3V3', null, 'power'], [2, '5V', null, 'power'],
    [3, 'GPIO2', 2, 'gpio', { sda: 'I2C1' }], [4, '5V', null, 'power'],
    [5, 'GPIO3', 3, 'gpio', { scl: 'I2C1' }], [6, 'GND', null, 'gnd'],
    [7, 'GPIO4', 4, 'gpio', {}], [8, 'GPIO14', 14, 'gpio', { tx: 'UART0' }],
    [9, 'GND', null, 'gnd'], [10, 'GPIO15', 15, 'gpio', { rx: 'UART0' }],
    [11, 'GPIO17', 17, 'gpio', {}], [12, 'GPIO18', 18, 'gpio', { pwm: 'PWM0 CH2' }],
    [13, 'GPIO27', 27, 'gpio', {}], [14, 'GND', null, 'gnd'],
    [15, 'GPIO22', 22, 'gpio', {}], [16, 'GPIO23', 23, 'gpio', {}],
    [17, '3V3', null, 'power'], [18, 'GPIO24', 24, 'gpio', {}],
    [19, 'GPIO10', 10, 'gpio', { mosi: 'SPI0' }], [20, 'GND', null, 'gnd'],
    [21, 'GPIO9', 9, 'gpio', { miso: 'SPI0' }], [22, 'GPIO25', 25, 'gpio', {}],
    [23, 'GPIO11', 11, 'gpio', { sck: 'SPI0' }], [24, 'GPIO8', 8, 'gpio', { cs: 'SPI0 CE0' }],
    [25, 'GND', null, 'gnd'], [26, 'GPIO7', 7, 'gpio', { cs: 'SPI0 CE1' }],
    [27, 'ID_SD (GPIO0)', 0, 'gpio', {}], [28, 'ID_SC (GPIO1)', 1, 'gpio', {}],
    [29, 'GPIO5', 5, 'gpio', {}], [30, 'GND', null, 'gnd'],
    [31, 'GPIO6', 6, 'gpio', {}], [32, 'GPIO12', 12, 'gpio', { pwm: 'PWM0 CH0' }],
    [33, 'GPIO13', 13, 'gpio', { pwm: 'PWM0 CH1' }], [34, 'GND', null, 'gnd'],
    [35, 'GPIO19', 19, 'gpio', { pwm: 'PWM0 CH3' }], [36, 'GPIO16', 16, 'gpio', {}],
    [37, 'GPIO26', 26, 'gpio', {}], [38, 'GPIO20', 20, 'gpio', {}],
    [39, 'GND', null, 'gnd'], [40, 'GPIO21', 21, 'gpio', {}]
  ];
  var piGroups = { L: [], R: [] };
  piTable.forEach(function (r) {
    var ph = r[0], id = r[2] === null ? 'H' + ph : 'GPIO' + r[2];
    var side = ph % 2 ? 'L' : 'R';
    if (r[2] === null) {
      var ex = r[1] === '3V3' ? '3,3 V güç (toplam sınırlı akım).' : (r[1] === '5V' ? '5 V güç (adaptörden gelen; GPIO değil).' : '');
      pi.push(power(id, r[1], String(ph), r[3], ex));
    } else {
      var n = r[2], f = [fn('dig'), fn('int', 'GPIO IRQ')], w = [];
      Object.keys(r[4]).forEach(function (k) {
        var v = r[4][k];
        f.push(fn(k, v, { def: true, verify: k === 'pwm' }));
      });
      if (n === 2 || n === 3) w.push(W('info', 'Kartta sabit 1,8 kΩ pull-up direnci var (I²C için). Buton/LED için uygun değil, yazılımla kapatılamaz.'));
      if (n === 0 || n === 1) w.push(W('cond', 'HAT kimlik EEPROM\'u (ID_SD/ID_SC) için ayrılmış. HAT kullanmıyorsan bile genel amaçlı kullanma; ayrılmış kabul et.'));
      if (r[4].pwm) w.push(W('info', 'Donanım PWM için /boot/firmware/config.txt içinde dtoverlay=pwm-2chan (veya pwm) gerekir; kanal numarası ayrıntısı sürüme göre değişebilir.', true));
      if (n === 14 || n === 15) w.push(W('info', 'UART0: konsol (seri login) ile çakışabilir; raspi-config ile seri konsolu kapatıp donanım UART\'ı aç.'));
      pi.push(pin({ id: id, label: r[1], phys: String(ph), gpio: n, sym: String(n), funcs: f, warns: w, v5: false, level: '3,3 V' }));
    }
    piGroups[side].push(id);
  });

  var pi5 = {
    id: 'pi5', name: 'Raspberry Pi 5', sub: '40 pinli GPIO başlığı · BCM2712 / RP1', logic: 3.3, wifi: false, flexible: false, noAdc: true,
    layout: { kind: 'two', groups: [
      { title: 'Tek pinler (1, 3, 5 … 39)', dir: 'v', pins: piGroups.L },
      { title: 'Çift pinler (2, 4, 6 … 40)', dir: 'v', pins: piGroups.R }
    ], usb: 'Pin 1 kartın sol üst köşesinde (SD kart tarafında, başlığın USB karşısı)' },
    pins: pi,
    code: {
      ar: null,
      mp: {
        dig: '# gpiozero\nfrom gpiozero import LED, Button\nled = LED({n})        # çıkış\nbtn = Button({n})     # giriş (dahili pull-up)',
        pwm: '# gpiozero (donanım PWM için dtoverlay gerekir)\nfrom gpiozero import PWMLED\nled = PWMLED({n})\nled.value = 0.5',
        int: 'from gpiozero import Button\nb = Button({n})\nb.when_pressed = callback',
        sda: '# I²C1: sudo raspi-config → Interfaces → I2C\nimport smbus2\nbus = smbus2.SMBus(1)',
        scl: '# I²C1: sudo raspi-config → Interfaces → I2C\nimport smbus2\nbus = smbus2.SMBus(1)',
        mosi: '# SPI0: raspi-config ile SPI aç\nimport spidev\nspi = spidev.SpiDev(); spi.open(0, 0)',
        miso: '# SPI0: raspi-config ile SPI aç\nimport spidev\nspi = spidev.SpiDev(); spi.open(0, 0)',
        sck: '# SPI0: raspi-config ile SPI aç\nimport spidev\nspi = spidev.SpiDev(); spi.open(0, 0)',
        cs: '# SPI0 CE: spi.open(0, 0) → CE0, spi.open(0, 1) → CE1',
        tx: 'import serial\nser = serial.Serial("/dev/ttyAMA0", 115200)',
        rx: 'import serial\nser = serial.Serial("/dev/ttyAMA0", 115200)'
      }
    },
    codeNote: 'Pi 5\'te Arduino kodu yoktur; örnekler Python (gpiozero/lgpio) içindir. Pi 5\'te eski RPi.GPIO kütüphanesi çalışmaz, gpiozero ya da lgpio/libgpiod kullan.',
    sources: [
      { t: 'pinout.xyz (40 pin başlık: fiziksel pin → BCM GPIO, I2C1/SPI0/UART0/PWM/PCM alt işlevleri)', u: 'https://pinout.xyz/' },
      { t: 'Raspberry Pi belgeleri · GPIO (3,3 V mantık, 5 V\'a dayanıklı değil, GP2/GP3 sabit 1,8 kΩ pull-up, pin başı 16 mA / toplam 50 mA, ID EEPROM GP0/GP1)', u: 'https://www.raspberrypi.com/documentation/computers/raspberry-pi.html' }
    ],
    notes: [
      NOTE_VER,
      'Pi 5 başlığında ADC yoktur; analog sensör için harici ADC (ADS1115, MCP3008 vb.) gerekir.',
      'GPIO\'lar 3,3 V mantıklıdır ve 5 V\'a dayanıklı DEĞİLDİR; 5 V çıkışlı sensörü doğrudan bağlama.',
      'Donanım PWM kanalları (GPIO12/13/18/19) ve dtoverlay ayrıntıları bu geliştirmede resmî belgeden satır satır doğrulanmadı; "doğrula" işaretli.',
      'Pi 5\'te ek UART/I²C/SPI birimleri dtoverlay ile başka pinlere alınabilir; bu haritada yalnızca varsayılan başlık işlevleri gösterilir.'
    ]
  };

  var BOARDS = [uno, esp32s3, pico2, pi5];
  if (typeof module !== 'undefined' && module.exports) module.exports = BOARDS;
  else window.PH_BOARDS = BOARDS;
})();
