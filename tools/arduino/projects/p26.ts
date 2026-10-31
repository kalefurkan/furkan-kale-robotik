import { Builder, Project, lcdBlock, typeKeys, RED, BLK, BLU, GRN, YEL, ORG, WHT } from "../lib";
// 26 - Şifreli Kapı Kilidi: LCD bloğu (a2..a13) + keypad a19..a26 (R1..R4 -> D10 D9 D8 D7, C1..C4 -> A0..A3) + servo d28 (SIG) d29 (VCC) d30 (GND)
const p: Project = {
  id: "sifreli-kapi-kilidi",
  sketch: "kapi_kilidi",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a19", { id: "kp1", type: "keypad4x4", pin: "R1" });
    const pins = ["D10", "D9", "D8", "D7", "A0", "A1", "A2", "A3"];
    const colors = [RED, YEL, GRN, BLU, ORG, WHT, RED, YEL];
    pins.forEach((d, i) => b.wire(`uno.${d}`, `bb.e${19 + i}`, colors[i]));
    b.plug("d28", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("uno.D6", "bb.b28", GRN);
    b.wire("bb.b29", "bb.B+25", RED);
    b.wire("bb.b30", "bb.B-25", BLK);
  },
  sim: { runMs: 24000, sampleMs: 10, events: [
    ...typeKeys("kp1", "12#", 1500),
    ...typeKeys("kp1", "1234#", 5000),
    ...typeKeys("kp1", "0000#", 13000),
    ...typeKeys("kp1", "99*1234#", 16500),
  ] },
  shoot: { actions: [{ keys: { id: "kp1", seq: "1234#", hold: 90, gap: 160 } }, { wait: 600 }], settleMs: 100 },
};
export default p;
