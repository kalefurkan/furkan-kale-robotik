import { Builder, Project, l298Block, RED, BLK, YEL, GRN } from "../lib";
// 62 - Engelden Kaçan Robot: L298N bloğu (a4..a16) + HC-SR04 a20(VCC) a21(TRIG) a22(ECHO) a23(GND)
const p: Project = {
  id: "engelden-kacan-robot",
  sketch: "engelden_kacan",
  build(b: Builder) {
    l298Block(b);
    b.plug("a20", { id: "us1", type: "hcsr04", pin: "VCC", props: { distanceCm: 100 } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("uno.D2", "bb.e21", YEL);
    b.wire("uno.D3", "bb.e22", GRN);
    b.wire("bb.e23", "bb.B-20", BLK);
  },
  sim: { runMs: 12000, sampleMs: 20, events: [
    { t: 2000, set: { us1: { distanceCm: 15 } } }, { t: 2500, set: { us1: { distanceCm: 90 } } },
    { t: 4500, set: { us1: { distanceCm: 10 } } }, { t: 5200, set: { us1: { distanceCm: 120 } } },
    { t: 7500, set: { us1: { distanceCm: 25 } } }, { t: 9000, set: { us1: { distanceCm: 19 } } }, { t: 9700, set: { us1: { distanceCm: 150 } } } ] },
  shoot: { actions: [{ wait: 1200 }], settleMs: 200 },
};
export default p;
