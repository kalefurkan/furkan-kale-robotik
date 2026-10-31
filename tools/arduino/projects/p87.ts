import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 87 - 3 Eksenli Robot Kol: A4988 taban j4..j11 (alt sıra; üst sıra e4..e11), A4988 omuz j14..j21; STEP/DIR D2 D3 ve D4 D5; joystick a23(GND) a24(VCC) a25(VRX A0) a26(VRY A1) a27(SW D7); servo a28 a29 a30 (D9)
// 12 V güç kaynağı (VMOT -> üst artı ray T+, GND -> alt eksi ray) ve iki step motor breadboard dışında
const p: Project = {
  id: "3-eksenli-robot-kol",
  sketch: "robot_kol3",
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
    b.plug("a23", { id: "joy1", type: "joystick", pin: "GND", props: { joyX: 1, joyY: 0.5 } });
    b.wire("bb.e24", "bb.B+24", RED);
    b.wire("bb.e23", "bb.B-23", BLK);
    b.wire("uno.A0", "bb.e25", BLU);
    b.wire("uno.A1", "bb.e26", GRN);
    b.wire("uno.D7", "bb.e27", YEL);
    b.plug("a28", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("uno.D9", "bb.e28", ORG);
    b.wire("bb.e29", "bb.B+22", RED);
    b.wire("bb.e30", "bb.B-22", BLK);
  },
  sim: { runMs: 12000, sampleMs: 20, events: [
    { t: 0, set: { joy1: { joyX: 0.5 } } },
    { t: 1500, set: { joy1: { joyX: 1 } } }, { t: 3000, set: { joy1: { joyX: 0.5, joyY: 0 } } }, { t: 4500, set: { joy1: { joyY: 0.5 } } },
    { t: 5500, set: { joy1: { joyPressed: true } } }, { t: 5700, set: { joy1: { joyPressed: false } } },
    { t: 7000, set: { joy1: { joyX: 0 } } }, { t: 8500, set: { joy1: { joyX: 0.5 } } },
    { t: 9500, set: { joy1: { joyPressed: true } } }, { t: 9700, set: { joy1: { joyPressed: false } } } ] },
  shoot: { actions: [{ waitText: "taban=" }, { wait: 200 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
