import { Builder, Project, typeKeys, RED, BLK, BLU, GRN, YEL, ORG, WHT } from "../lib";
// 27 - Elektronik Kasa: keypad a2..a9 (R1 R2 R3 R4 C1 C2 C3 C4), servo c13(SIG) c14(VCC) c15(GND), aktif buzzer a20/a21. Rayyok: 5V, GND doğrudan.
const p: Project = {
  id: "elektronik-kasa",
  sketch: "kasa",
  build(b: Builder) {
    b.plug("a2", { id: "kp1", type: "keypad4x4", pin: "R1" });
    const cols = ["D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2"];
    const colors = [RED, YEL, GRN, BLU, ORG, WHT, RED, YEL];
    cols.forEach((d, i) => b.wire(`uno.${d}`, `bb.e${2 + i}`, colors[i]));
    b.plug("c13", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("uno.D10", "bb.a13", GRN);
    b.wire("uno.5V", "bb.a14", RED);
    b.wire("uno.GND2", "bb.a15", BLK);
    b.plug("a20", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D11", "bb.e20", BLU);
    b.wire("uno.GND3", "bb.e21", BLK);
  },
  sim: { runMs: 34000, sampleMs: 10, events: [
    ...typeKeys("kp1", "123#", 1000),        // eksik/yanlış şifre
    ...typeKeys("kp1", "1234#", 4000),       // doğru şifre
    ...typeKeys("kp1", "9999#", 13000),      // yanlış
    ...typeKeys("kp1", "1*1234#", 16000),    // '*' siler, sonra doğru
    ...typeKeys("kp1", "1#", 24000), ...typeKeys("kp1", "2#", 26000), ...typeKeys("kp1", "3#", 28000), // art arda 3 yanlış -> uzun alarm
  ] },
  shoot: { actions: [{ keys: { id: "kp1", seq: "1234#", hold: 90, gap: 160 } }, { wait: 700 }], settleMs: 100 },
};
export default p;
