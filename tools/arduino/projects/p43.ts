import { Builder, Project, RED, BLK, BLU, YEL, GRN } from "../lib";
// 43 - Joystick Kontrollü Servo: joystick a4(GND) a5(VCC) a6(VRx) a7(VRy) a8(SW); servo d12(SIG) d13(VCC) d14(GND)
const p: Project = {
  id: "joystick-kontrollu-servo",
  sketch: "joystick_servo",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "joy1", type: "joystick", pin: "GND", props: { joyX: 0.8, joyY: 0.35 } });
    b.wire("bb.e4", "bb.B-2", BLK);
    b.wire("bb.e5", "bb.B+3", RED);
    b.wire("bb.e6", "uno.A0", BLU);
    b.wire("bb.e7", "uno.A1", GRN);
    b.wire("bb.e8", "uno.D2", YEL);
    b.plug("d12", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("bb.b12", "uno.D9", YEL);
    b.wire("bb.b13", "bb.B+11", RED);
    b.wire("bb.b14", "bb.B-12", BLK);
  },
  sim: { runMs: 12000, sampleMs: 20, events: [
    { t: 1000, set: { joy1: { joyX: 1 } } }, { t: 2500, set: { joy1: { joyX: 0 } } }, { t: 4000, set: { joy1: { joyX: 0.25 } } },
    { t: 5500, set: { joy1: { joyX: 0.5 } } }, { t: 6500, set: { joy1: { joyX: 0.9, joyPressed: true } } }, { t: 8000, set: { joy1: { joyPressed: false } } },
    { t: 9500, set: { joy1: { joyY: 1 } } } ] },
  shoot: { actions: [{ wait: 1200 }], settleMs: 200 },
};
export default p;
