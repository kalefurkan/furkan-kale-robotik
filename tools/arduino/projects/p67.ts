import { Builder, Project, RED, BLK, YEL, GRN, BLU, ORG, WHT } from "../lib";
// 67 - Robot Kol: joystick a4(GND) a5(VCC) a6(VRx) a7(VRy) a8(SW); servolar a12.. a15.. a18.. a21.. (SIG VCC GND)
const p: Project = {
  id: "robot-kol",
  sketch: "robot_kol",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "joy1", type: "joystick", pin: "GND", props: { joyX: 0.5, joyY: 0.5 } });
    b.wire("bb.e4", "bb.B-2", BLK);
    b.wire("bb.e5", "bb.B+3", RED);
    b.wire("bb.e6", "uno.A0", BLU);
    b.wire("bb.e7", "uno.A1", GRN);
    b.wire("bb.e8", "uno.D2", YEL);
    [3, 4, 5, 6].forEach((d, k) => {
      const c = 12 + 3 * k;
      b.plug(`a${c}`, { id: `sv${k}`, type: "servo", pin: "SIG" });
      b.wire(`uno.D${d}`, `bb.e${c}`, [YEL, GRN, ORG, WHT][k]);
      b.wire(`bb.e${c + 1}`, `bb.B+${c + 1}`, RED);
      b.wire(`bb.e${c + 2}`, `bb.B-${c + 2}`, BLK);
    });
  },
  sim: { runMs: 12000, sampleMs: 20, events: [
    { t: 1000, set: { joy1: { joyX: 1 } } }, { t: 2000, set: { joy1: { joyX: 0.5 } } },
    { t: 2500, set: { joy1: { joyY: 0 } } }, { t: 3500, set: { joy1: { joyY: 0.5 } } },
    { t: 4500, set: { joy1: { joyPressed: true } } }, { t: 4800, set: { joy1: { joyPressed: false } } },
    { t: 5500, set: { joy1: { joyY: 1 } } }, { t: 6500, set: { joy1: { joyY: 0.5 } } },
    { t: 7000, set: { joy1: { joyX: 0 } } }, { t: 8500, set: { joy1: { joyX: 0.5 } } },
    { t: 9500, set: { joy1: { joyPressed: true } } }, { t: 9800, set: { joy1: { joyPressed: false } } },
    { t: 10200, set: { joy1: { joyX: 1 } } }, { t: 11000, set: { joy1: { joyX: 0.5 } } } ] },
  shoot: { actions: [{ select: "joy1" }, { slider: { value: 1, index: 0 } }, { wait: 1500 }], settleMs: 200 },
};
export default p;
