import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 71 - Wi-Fi Kontrollü Akıllı Ev: ESP-01 a2(VCC) a3(GND) a4(TX -> D2) a5(RX <- D3 bölücüyle) a6(CH_PD); 1 kΩ d5->d9, 2 kΩ dikey e5->h5; 3,3 V güç kaynağı breadboard dışında
// 4 kanallı röle modülü (serbest) IN1 D6, IN2 D7, IN3 D4, IN4 D5; COM -> 5V ray, NO -> ampul; butonlar c14/c16 (D8) ve c20/c22 (D9)
const p: Project = {
  id: "wi-fi-kontrollu-akilli-ev",
  sketch: "wifi_ev",
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
    b.plug("c14", { id: "btn1", type: "button", pin: "A" });
    b.wire("uno.D8", "bb.e14", BLU);
    b.wire("bb.e16", "bb.B-14", BLK);
    b.plug("c20", { id: "btn2", type: "button", pin: "A" });
    b.wire("uno.D9", "bb.e20", WHT);
    b.wire("bb.e22", "bb.B-20", BLK);
    b.free("rl1", "relay4", 400, 470);
    [0, 1, 2, 3].forEach((k) => b.free(`bulb${k + 1}`, "bulb", 440 + k * 90, 330));
    b.wire("rl1.VCC", "bb.B+5", RED);
    b.wire("rl1.GND", "bb.B-8", BLK);
    b.wire("uno.D6", "rl1.IN1", BLU);
    b.wire("uno.D7", "rl1.IN2", ORG);
    b.wire("uno.D4", "rl1.IN3", GRN);
    b.wire("uno.D5", "rl1.IN4", YEL);
    [1, 2, 3, 4].forEach((k) => {
      b.wire(`rl1.COM${k}`, `bb.B+${6 + k}`, RED);
      b.wire(`rl1.NO${k}`, `bulb${k}.A`, ORG);
      b.wire(`bulb${k}.B`, `bb.B-${14 + k}`, BLK);
    });
  },
  sim: { runMs: 13000, sampleMs: 20, events: [
    { t: 9500, set: { btn1: { pressed: true } } }, { t: 9650, set: { btn1: { pressed: false } } },
    { t: 10500, set: { btn2: { pressed: true } } }, { t: 10650, set: { btn2: { pressed: false } } },
    { t: 11500, set: { btn1: { pressed: true } } }, { t: 11650, set: { btn1: { pressed: false } } } ] },
  shoot: { actions: [{ wait: 7500 }, { press: "btn1", hold: 150 }, { wait: 400 }, { press: "btn2", hold: 150 }, { wait: 500 }], settleMs: 100, startWaitMs: 500 },
};
export default p;
