import { Builder, Project, RED, BLK, YEL, GRN, BLU, ORG, WHT } from "../lib";
// 66 - Dört Ayaklı Yürüyen Robot: 8 servo a2..a25 (servo k: SIG a(2+3k), VCC a(3+3k), GND a(4+3k)); sinyal D2..D9, hepsi 5V/GND raylarında
const COL = [YEL, GRN, BLU, ORG, WHT];
const p: Project = {
  id: "dort-ayakli-yuruyen-robot",
  sketch: "dort_ayakli",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    for (let k = 0; k < 8; k++) {
      const c = 2 + 3 * k;
      b.plug(`a${c}`, { id: `sv${k}`, type: "servo", pin: "SIG" });
      b.wire(`uno.D${k + 2}`, `bb.e${c}`, COL[k % 5]);
      b.wire(`bb.e${c + 1}`, `bb.B+${c}`, RED);
      b.wire(`bb.e${c + 2}`, `bb.B-${c + 1}`, BLK);
    }
  },
  sim: { runMs: 9000, sampleMs: 20 },
  shoot: { actions: [{ wait: 4500 }], settleMs: 200 },
};
export default p;
