import { Builder, Project, YEL, BLK, BLU, GRN, ORG } from "../lib";
// 9 - Butonlu Elektronik Piyano: 4 buton (A c{n}, B c{n+2}), pasif buzzer c23(+)/c24(-). Topraklar B- rayına.
const COLS = [2, 7, 12, 17];
const p: Project = {
  id: "butonlu-elektronik-piyano",
  sketch: "piyano",
  build(b: Builder) {
    COLS.forEach((n, i) => {
      b.plug(`c${n}`, { id: `btn${i + 1}`, type: "button", pin: "A" });
      b.wire(`uno.D${i + 2}`, `bb.e${n}`, [YEL, GRN, BLU, ORG][i]);
      b.wire(`bb.e${n + 2}`, `bb.B-${n}`, BLK);
    });
    b.plug("c23", { id: "pbz1", type: "passivebuzzer", pin: "P" });
    b.wire("uno.D8", "bb.e23", YEL);
    b.wire("bb.e24", "bb.B-22", BLK);
    b.wire("uno.GND2", "bb.B-1", BLK);
  },
  sim: { runMs: 4000, sampleMs: 20, events: [
    { t: 500, set: { btn1: { pressed: true } } }, { t: 900, set: { btn1: { pressed: false } } },
    { t: 1000, set: { btn2: { pressed: true } } }, { t: 1400, set: { btn2: { pressed: false } } },
    { t: 1500, set: { btn3: { pressed: true } } }, { t: 1900, set: { btn3: { pressed: false } } },
    { t: 2000, set: { btn4: { pressed: true } } }, { t: 2400, set: { btn4: { pressed: false } } } ] },
  shoot: { actions: [{ down: "btn3" }, { wait: 500 }], settleMs: 100 },
};
export default p;
