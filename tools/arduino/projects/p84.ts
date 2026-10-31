import { Builder, Project, lcdBlock, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 84 - Çok Katlı Akıllı Otopark: LCD bloğu (a2..a13; RS D12, E D11, D4..D7 -> D5 D4 D3 D2) + 3 × HC-SR04 a17.. (VCC TRIG ECHO GND): kat1 D6/D7, kat2 D8/D10, kat3 A1/A0;
// buton g26 .. g28 (D13); servo bariyer (serbest, breadboard dışında) SIG D9
const p: Project = {
  id: "cok-katli-akilli-otopark",
  sketch: "otopark",
  build(b: Builder) {
    lcdBlock(b);
    const S: [string, string, string, string, number][] = [["hc1", "D6", "D7", "a17", 17], ["hc2", "D8", "D10", "a21", 19], ["hc3", "A1", "A0", "a25", 21]];
    S.forEach(([id, trig, echo, hole, rail], k) => {
      const col = 17 + 4 * k;
      b.plug(hole, { id, type: "hcsr04", pin: "VCC", props: { distanceCm: k === 1 ? 10 : 100 } });
      b.wire(`bb.e${col}`, `bb.B+${rail}`, RED);
      b.wire(`bb.e${col + 3}`, `bb.B-${rail}`, BLK);
      b.wire(`uno.${trig}`, `bb.e${col + 1}`, k === 0 ? YEL : k === 1 ? GRN : BLU);
      b.wire(`uno.${echo}`, `bb.e${col + 2}`, k === 0 ? ORG : k === 1 ? WHT : YEL);
    });
    b.plug("g26", { id: "btn1", type: "button", pin: "A", props: { pressed: true } });
    b.wire("uno.D13", "bb.j26", GRN);
    b.wire("bb.j28", "bb.B-24", BLK);
    b.free("sv1", "servo", 700, 330);
    b.wire("sv1.VCC", "bb.B+23", RED);
    b.wire("sv1.GND", "bb.B-23", BLK);
    b.wire("uno.D9", "sv1.SIG", ORG);
  },
  sim: { runMs: 20000, sampleMs: 20, events: [
    { t: 0, set: { btn1: { pressed: false } } },
    { t: 3000, set: { btn1: { pressed: true } } }, { t: 3200, set: { btn1: { pressed: false } } },
    { t: 8000, set: { hc1: { distanceCm: 8 }, hc3: { distanceCm: 9 } } },
    { t: 10000, set: { btn1: { pressed: true } } }, { t: 10200, set: { btn1: { pressed: false } } },
    { t: 13000, set: { hc2: { distanceCm: 100 } } },
    { t: 15000, set: { btn1: { pressed: true } } }, { t: 15200, set: { btn1: { pressed: false } } } ] },
  shoot: { actions: [{ waitText: "Giris serbest" }, { wait: 500 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
