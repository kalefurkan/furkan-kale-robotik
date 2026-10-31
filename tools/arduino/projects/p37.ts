import { Builder, Project, lcdBlock, typeKeys, RED, BLK, BLU, GRN, YEL, ORG, WHT } from "../lib";
// 37 - Dijital Geri Sayım Sayacı: LCD bloğu + keypad a19..a26 (R1..R4 -> D10 D9 D8 D7, C1..C4 -> A0..A3) + aktif buzzer a29/a30 (D6 / GND3)
const p: Project = {
  id: "dijital-geri-sayim-sayaci",
  sketch: "geri_sayim",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a19", { id: "kp1", type: "keypad4x4", pin: "R1" });
    const pins = ["D10", "D9", "D8", "D7", "A0", "A1", "A2", "A3"];
    const colors = [RED, YEL, GRN, BLU, ORG, WHT, RED, YEL];
    pins.forEach((d, i) => b.wire(`uno.${d}`, `bb.e${19 + i}`, colors[i]));
    b.plug("a29", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D6", "bb.e29", GRN);
    b.wire("uno.GND3", "bb.e30", BLK);
  },
  sim: { runMs: 22000, sampleMs: 20, events: [...typeKeys("kp1", "12*8#", 1000), ] },
  shoot: { actions: [{ keys: { id: "kp1", seq: "15#", hold: 90, gap: 160 } }, { wait: 2400 }], settleMs: 50 },
};
export default p;
