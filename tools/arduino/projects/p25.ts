import { Builder, Project, RED, BLK, BLU, GRN, YEL, ORG } from "../lib";
// 25 - Otomatik Kapı Sistemi: HC-SR04 c2..c5 (a satırından), servo c10(SIG) c11(VCC) c12(GND); 5V -> B+, GND -> B- rayları.
const p: Project = {
  id: "otomatik-kapi-sistemi",
  sketch: "otomatik_kapi",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("c2", { id: "us1", type: "hcsr04", pin: "VCC", props: { distanceCm: 15 } });
    b.wire("bb.a2", "bb.B+2", RED);
    b.wire("uno.D9", "bb.a3", BLU);
    b.wire("uno.D10", "bb.a4", GRN);
    b.wire("bb.a5", "bb.B-5", BLK);
    b.plug("c10", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("uno.D6", "bb.a10", YEL);
    b.wire("bb.a11", "bb.B+11", RED);
    b.wire("bb.a12", "bb.B-12", BLK);
  },
  sim: { runMs: 12000, sampleMs: 20, events: [
    { t: 3000, set: { us1: { distanceCm: 120 } } }, { t: 7000, set: { us1: { distanceCm: 30 } } }, { t: 9000, set: { us1: { distanceCm: 10 } } } ] },
  shoot: { actions: [{ wait: 3000 }], settleMs: 200 },
};
export default p;
