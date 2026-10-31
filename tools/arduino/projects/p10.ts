import { Builder, Project, YEL, BLK, BLU, GRN, ORG, RED } from "../lib";
// 10 - Dijital Zar: 7 LED (A c{n}, K c{n+1}), her LED'in 220 Ω direnci dikey (e->h), alt şeritten B- rayına. Buton c24/c26.
const NS = [2, 5, 8, 11, 14, 17, 20];
const p: Project = {
  id: "dijital-zar",
  sketch: "zar",
  build(b: Builder) {
    NS.forEach((n, i) => {
      b.plug(`c${n}`, { id: `led${i + 1}`, type: "led", pin: "A", props: { color: "red" } });
      b.plug(`e${n + 1}`, { id: `r${i + 1}`, type: "resistor", pin: "A", props: { ohms: 220 }, rotation: 90 });
      b.wire(`uno.D${i + 2}`, `bb.a${n}`, YEL);
      b.wire(`bb.j${n + 1}`, `bb.B-${n}`, BLK);
    });
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("c24", { id: "btn1", type: "button", pin: "A" });
    b.wire("uno.D9", "bb.e24", BLU);
    b.wire("bb.e26", "uno.GND3", BLK);
  },
  sim: { runMs: 9000, sampleMs: 50, events: [
    { t: 1000, set: { btn1: { pressed: true } } }, { t: 1300, set: { btn1: { pressed: false } } },
    { t: 3000, set: { btn1: { pressed: true } } }, { t: 3300, set: { btn1: { pressed: false } } },
    { t: 5000, set: { btn1: { pressed: true } } }, { t: 5300, set: { btn1: { pressed: false } } },
    { t: 7000, set: { btn1: { pressed: true } } }, { t: 7300, set: { btn1: { pressed: false } } } ] },
  shoot: { actions: [{ press: "btn1", hold: 150 }, { waitText: "Zar:", timeout: 8000 }], settleMs: 300 },
};
export default p;
