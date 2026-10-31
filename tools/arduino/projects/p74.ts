import { Builder, Project, RED, BLK, YEL, GRN, ORG } from "../lib";
// 74 - IoT Hava Durumu İstasyonu: ESP-01 a2..a6 (+ bölücü, 3,3 V kaynak breadboard dışında); BME280 a12(VCC) a13(GND) a14(SCL -> A5) a15(SDA -> A4)
const p: Project = {
  id: "iot-hava-durumu-istasyonu",
  sketch: "hava_istasyonu",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a2", { id: "esp1", type: "esp8266", pin: "VCC", props: { wifiUp: true, wifiSsid: "MakersHub" } });
    b.free("psu1", "psu", 330, 330, { volts: 3.3 });
    b.wire("bb.e2", "psu1.P", ORG);
    b.wire("psu1.N", "bb.B-2", BLK);
    b.wire("bb.e3", "bb.B-3", BLK);
    b.wire("uno.D2", "bb.e4", GRN);
    b.plug("d5", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("e5", { id: "r2", type: "resistor", pin: "A", props: { ohms: 2000 }, rotation: 90 });
    b.wire("uno.D3", "bb.e9", YEL);
    b.wire("bb.j5", "bb.B-5", BLK);
    b.wire("uno.3V3", "bb.e6", ORG);
    b.plug("a12", { id: "bme1", type: "bme280", pin: "VCC", props: { tempC: 22.5, humidity: 52, pressureHpa: 1013, i2cAddr: 118 } });
    b.wire("bb.e12", "bb.B+11", RED);
    b.wire("bb.e13", "bb.B-12", BLK);
    b.wire("uno.A5", "bb.e14", YEL);
    b.wire("uno.A4", "bb.e15", GRN);
  },
  sim: { runMs: 32000, sampleMs: 20, events: [
    { t: 18000, set: { bme1: { tempC: 28.3, humidity: 40, pressureHpa: 1005 } } },
    { t: 26000, set: { bme1: { tempC: 12, humidity: 85, pressureHpa: 990 } } } ] },
  shoot: { actions: [{ wait: 9000 }, { select: "bme1" }, { slider: { value: 28.3, index: 0 } }, { wait: 800 }], settleMs: 100, startWaitMs: 500 },
};
export default p;
