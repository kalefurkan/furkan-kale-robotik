import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 86 - Lazer Gravür Makinesi: A4988 X j4..j11 (alt sıra; üst sıra e4..e11), A4988 Y j14..j21; STEP/DIR D2 D3 ve D4 D5; lazer a24 (S) a25 (VCC boş) a26 (GND), S -> D8
// 12 V güç kaynağı (VMOT -> üst artı ray T+, GND -> alt eksi ray) ve iki step motor breadboard dışında
const p: Project = {
  id: "lazer-gravur-makinesi",
  sketch: "lazer_gravur",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.free("psu1", "psu", 330, 330, { volts: 12 });
    b.wire("psu1.P", "bb.T+1", ORG);
    b.wire("psu1.N", "bb.B-3", BLK);
    [["x", 4, "D2", "D3", 560], ["y", 14, "D4", "D5", 700]].forEach(([n, c, st, dr, mx]: any, k) => {
      b.plug(`j${c}`, { id: `drv_${n}`, type: "a4988", pin: "VMOT" });
      b.free(`mot_${n}`, "stepper", mx, 420);
      b.wire(`bb.a${c + 4}`, `bb.a${c + 5}`, WHT);          // RST - SLP
      b.wire(`uno.${st}`, `bb.a${c + 6}`, YEL);              // STEP
      b.wire(`uno.${dr}`, `bb.a${c + 7}`, GRN);              // DIR
      b.wire(`bb.f${c + 6}`, `bb.B+${c + 6}`, RED);          // VDD
      b.wire(`bb.f${c}`, `bb.T+${c}`, ORG);                  // VMOT
      b.wire(`bb.f${c + 1}`, `bb.B-${c + 1}`, BLK);          // GND
      b.wire(`bb.g${c + 4}`, `mot_${n}.A1`, k ? BLU : YEL);  // 1A
      b.wire(`bb.g${c + 5}`, `mot_${n}.A2`, BLK);            // 1B
      b.wire(`bb.g${c + 3}`, `mot_${n}.B1`, k ? ORG : GRN);  // 2A
      b.wire(`bb.g${c + 2}`, `mot_${n}.B2`, WHT);            // 2B
    });
    b.plug("a24", { id: "las1", type: "laser", pin: "S" });
    b.wire("uno.D8", "bb.e24", ORG);
    b.wire("bb.e26", "bb.B-24", BLK);
  },
  sim: { runMs: 25000, sampleMs: 20 },
  shoot: { actions: [{ waitText: "Nokta 2" }, { wait: 200 }], settleMs: 100, startWaitMs: 300, hideFlybackFrame: true },
};
export default p;
