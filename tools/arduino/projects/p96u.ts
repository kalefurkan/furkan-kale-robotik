import { Builder, Project, RED, BLK, BLU, YEL, GRN, WHT } from "../lib";
// 96 doğrulama devresi (siteye girmez): Uno + BME280 a12 + SD a4..a9 (CS D4)
const p: Project = {
  id: "mini-hava-istasyonu-ve-veri-sunucusu--uno",
  sketch: "hava_sd_uno",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "sd1", type: "sdcard", pin: "GND" });
    b.wire("bb.e4", "bb.B-3", BLK);
    b.wire("bb.e5", "bb.B+4", RED);
    b.wire("uno.D12", "bb.e6", GRN);
    b.wire("uno.D11", "bb.e7", BLU);
    b.wire("uno.D13", "bb.e8", WHT);
    b.wire("uno.D4", "bb.e9", YEL);
    b.plug("a12", { id: "bme1", type: "bme280", pin: "VCC", props: { tempC: 22.5, humidity: 52, pressureHpa: 1013, i2cAddr: 118 } });
    b.wire("bb.e12", "bb.B+12", RED);
    b.wire("bb.e13", "bb.B-13", BLK);
    b.wire("uno.A5", "bb.e14", BLU);
    b.wire("uno.A4", "bb.e15", GRN);
  },
  sim: { runMs: 10000, sampleMs: 50, events: [ { t: 3000, set: { bme1: { tempC: 26, humidity: 45, pressureHpa: 1008 } } } ] },
};
export default p;
