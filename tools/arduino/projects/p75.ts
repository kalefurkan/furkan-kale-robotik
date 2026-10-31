import { Builder, Project, RED, BLK, YEL, GRN, ORG, BLU, WHT } from "../lib";
// 75 - MQTT Akıllı Ev Sistemi: ESP-01 a2..a6 (+ bölücü, 3,3 V kaynak breadboard dışında); DHT22 a12(VCC) a13(DATA -> D4) a14(GND);
// LDR c20/c21 + 10 kΩ d21->d25 (A0); 4 kanallı röle modülü (serbest) IN1..IN4 = D5..D8 ve 4 ampul breadboard dışında
const p: Project = {
  id: "mqtt-akilli-ev-sistemi",
  sketch: "mqtt_ev",
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
    b.plug("a12", { id: "dht1", type: "dht22", pin: "VCC", props: { tempC: 24, humidity: 50 } });
    b.wire("bb.e12", "bb.B+11", RED);
    b.wire("uno.D4", "bb.e13", WHT);
    b.wire("bb.e14", "bb.B-13", BLK);
    b.plug("c20", { id: "ldr1", type: "ldr", pin: "A", props: { light: 0.8 } });
    b.plug("d21", { id: "r3", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("uno.A0", "bb.e21", BLU);
    b.wire("bb.e25", "bb.B-24", BLK);
    b.free("rl1", "relay4", 400, 470);
    [0, 1, 2, 3].forEach((k) => b.free(`bulb${k + 1}`, "bulb", 440 + k * 90, 330));
    b.wire("rl1.VCC", "bb.B+5", RED);
    b.wire("rl1.GND", "bb.B-8", BLK);
    b.wire("uno.D5", "rl1.IN1", BLU);
    b.wire("uno.D6", "rl1.IN2", ORG);
    b.wire("uno.D7", "rl1.IN3", GRN);
    b.wire("uno.D8", "rl1.IN4", YEL);
    [1, 2, 3, 4].forEach((k) => {
      b.wire(`rl1.COM${k}`, `bb.B+${6 + k}`, RED);
      b.wire(`rl1.NO${k}`, `bulb${k}.A`, ORG);
      b.wire(`bulb${k}.B`, `bb.B-${14 + k}`, BLK);
    });
  },
  sim: { runMs: 32000, sampleMs: 20, events: [
    { t: 14000, set: { dht1: { tempC: 30 } } },
    { t: 19000, set: { ldr1: { light: 0.05 } } },
    { t: 23000, set: { dht1: { tempC: 21 } } },
    { t: 26000, set: { dht1: { tempC: 15 } } },
    { t: 29000, set: { dht1: { tempC: 24 }, ldr1: { light: 0.8 } } } ] },
  shoot: { actions: [{ wait: 8000 }, { select: "dht1" }, { slider: { value: 30, index: 0 } }, { wait: 800 }], settleMs: 100, startWaitMs: 500 },
};
export default p;
