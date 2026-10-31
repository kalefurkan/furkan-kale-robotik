import { Builder, Project, RED, BLK, YEL, GRN, ORG } from "../lib";
// 68 - Otomatik Engel Algılayan Robot Kol: HC-SR04 a4(VCC) a5(TRIG) a6(ECHO) a7(GND); taban servosu a10(SIG) a11 a12; kavrama servosu a14(SIG) a15 a16
const p: Project = {
  id: "otomatik-engel-algilayan-robot-kol",
  sketch: "algilayan_kol",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "us1", type: "hcsr04", pin: "VCC", props: { distanceCm: 100 } });
    b.wire("bb.e4", "bb.B+2", RED);
    b.wire("uno.D2", "bb.e5", YEL);
    b.wire("uno.D3", "bb.e6", GRN);
    b.wire("bb.e7", "bb.B-3", BLK);
    b.plug("a10", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("uno.D9", "bb.e10", ORG);
    b.wire("bb.e11", "bb.B+9", RED);
    b.wire("bb.e12", "bb.B-10", BLK);
    b.plug("a14", { id: "sv2", type: "servo", pin: "SIG" });
    b.wire("uno.D10", "bb.e14", YEL);
    b.wire("bb.e15", "bb.B+13", RED);
    b.wire("bb.e16", "bb.B-14", BLK);
  },
  sim: { runMs: 14000, sampleMs: 20, events: [
    { t: 3000, set: { us1: { distanceCm: 15 } } }, { t: 3200, set: { us1: { distanceCm: 100 } } },
    { t: 7000, set: { us1: { distanceCm: 12 } } }, { t: 7200, set: { us1: { distanceCm: 100 } } },
    { t: 9500, set: { us1: { distanceCm: 18 } } }, { t: 9700, set: { us1: { distanceCm: 100 } } } ] },
  shoot: { actions: [{ wait: 1500 }], settleMs: 200 },
};
export default p;
