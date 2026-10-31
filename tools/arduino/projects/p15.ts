import { Builder, Project, RED, BLU, GRN, BLK } from "../lib";
// 15 - Ultrasonik Mesafe Ölçer: HC-SR04 c10(VCC) c11(TRIG) c12(ECHO) c13(GND); gövdesi c-g satırlarını kapattığı için kablolar a satırından
const p: Project = {
  id: "ultrasonik-mesafe-olcer",
  sketch: "hcsr04",
  build(b: Builder) {
    b.plug("c10", { id: "us1", type: "hcsr04", pin: "VCC", props: { distanceCm: 25 } });
    b.wire("uno.5V", "bb.a10", RED);
    b.wire("uno.D9", "bb.a11", BLU);
    b.wire("uno.D10", "bb.a12", GRN);
    b.wire("bb.a13", "uno.GND2", BLK);
  },
  sim: { runMs: 6000, sampleMs: 100, events: [
    { t: 1100, set: { us1: { distanceCm: 10 } } }, { t: 2100, set: { us1: { distanceCm: 50 } } }, { t: 3100, set: { us1: { distanceCm: 100 } } }, { t: 4100, set: { us1: { distanceCm: 400 } } }, { t: 5100, set: { us1: { distanceCm: 1 } } } ] },
};
export default p;
