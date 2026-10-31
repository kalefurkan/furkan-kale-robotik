import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 96 - Mini Hava İstasyonu ve Veri Sunucusu (ESP32 DevKit USB ile beslenir, 3,3 V): BME280 a4(VCC) a5(GND) a6(SCL -> IO22) a7(SDA -> IO21); SD modülü a12(GND) a13(VCC) a14(MISO) a15(MOSI) a16(SCK) a17(CS)
const p: Project = {
  id: "mini-hava-istasyonu-ve-veri-sunucusu",
  sketch: "hava_istasyonu_esp32",
  esp32: true,
  builder: { noUno: true },
  build(b: Builder) {
    b.free("esp1", "esp32", 330, 600, { usbPower: true });
    b.wire("esp1.GND", "bb.B-1", BLK);
    b.wire("esp1.3V3", "bb.T+1", ORG);
    b.plug("a4", { id: "bme1", type: "bme280", pin: "VCC", props: { tempC: 24, humidity: 48, pressureHpa: 1012, i2cAddr: 118 } });
    b.wire("bb.e4", "bb.T+4", ORG);
    b.wire("bb.e5", "bb.B-5", BLK);
    b.wire("esp1.IO22", "bb.e6", BLU);
    b.wire("esp1.IO21", "bb.e7", GRN);
    b.plug("a12", { id: "sd1", type: "sdcard", pin: "GND" });
    b.wire("bb.e12", "bb.B-12", BLK);
    b.wire("bb.e13", "bb.T+13", ORG);
    b.wire("esp1.IO19", "bb.e14", GRN);
    b.wire("esp1.IO23", "bb.e15", BLU);
    b.wire("esp1.IO18", "bb.e16", WHT);
    b.wire("esp1.IO5", "bb.e17", YEL);
  },
  sim: { runMs: 1000 },
  shoot: { actions: [{ wait: 800 }], settleMs: 5000, startWaitMs: 500 },
};
export default p;
