import { Builder, Project, lcdBlock, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 53 - Akıllı Ev Kontrol Paneli: LCD bloğu (a2..a13) + SEÇ butonu c24/c26 (D10) + AÇIK/KAPALI butonu c28/c30 (A0)
// 4 kanallı röle modülü ve 4 ampul breadboard dışında: VCC -> artı ray, GND -> eksi ray, IN1..IN4 -> D6..D9, COM1..4 -> artı ray, NO_k -> ampul_k.A, ampul_k.B -> eksi ray
const p: Project = {
  id: "akilli-ev-kontrol-paneli",
  sketch: "ev_panel",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("c24", { id: "btn1", type: "button", pin: "A" });
    b.wire("uno.D10", "bb.e24", YEL);
    b.wire("bb.e26", "bb.B-24", BLK);
    b.plug("c28", { id: "btn2", type: "button", pin: "A" });
    b.wire("uno.A0", "bb.e28", GRN);
    b.wire("bb.e30", "bb.B-25", BLK);
    b.free("rl1", "relay4", 400, 470);
    [0, 1, 2, 3].forEach((k) => b.free(`bulb${k + 1}`, "bulb", 440 + k * 90, 330));
    b.wire("rl1.VCC", "bb.B+5", RED);
    b.wire("rl1.GND", "bb.B-8", BLK);
    b.wire("uno.D6", "rl1.IN1", BLU);
    b.wire("uno.D7", "rl1.IN2", ORG);
    b.wire("uno.D8", "rl1.IN3", GRN);
    b.wire("uno.D9", "rl1.IN4", YEL);
    [1, 2, 3, 4].forEach((k) => {
      b.wire(`rl1.COM${k}`, `bb.B+${6 + k}`, RED);
      b.wire(`rl1.NO${k}`, `bulb${k}.A`, ORG);
      b.wire(`bulb${k}.B`, `bb.B-${14 + k}`, BLK);
    });
  },
  sim: { runMs: 12000, sampleMs: 20, events: [
    { t: 1500, set: { btn1: { pressed: true } } }, { t: 1650, set: { btn1: { pressed: false } } },
    { t: 2500, set: { btn2: { pressed: true } } }, { t: 2650, set: { btn2: { pressed: false } } },
    { t: 3500, set: { btn1: { pressed: true } } }, { t: 3650, set: { btn1: { pressed: false } } },
    { t: 4500, set: { btn2: { pressed: true } } }, { t: 4650, set: { btn2: { pressed: false } } },
    { t: 6000, set: { btn1: { pressed: true } } }, { t: 6150, set: { btn1: { pressed: false } } },
    { t: 7000, set: { btn1: { pressed: true } } }, { t: 7150, set: { btn1: { pressed: false } } },
    { t: 8000, set: { btn2: { pressed: true } } }, { t: 8150, set: { btn2: { pressed: false } } },
    { t: 10000, set: { btn2: { pressed: true } } }, { t: 10150, set: { btn2: { pressed: false } } } ] },
  shoot: { actions: [{ press: "btn1", hold: 120 }, { wait: 300 }, { press: "btn2", hold: 120 }, { wait: 300 }, { press: "btn1", hold: 120 }, { wait: 300 }, { press: "btn2", hold: 120 }, { wait: 500 }], settleMs: 100, startWaitMs: 500 },
};
export default p;
