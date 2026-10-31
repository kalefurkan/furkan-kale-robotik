import { Builder, Project, RED, BLK, BLU, GRN, YEL } from "../lib";
// 32 - Akıllı Çöp Kutusu: HC-SR04 c2..c5 (a satırından), servo (kapak) c10(SIG) c11(VCC) c12(GND); 5V -> B+, GND -> B- rayları.
const p: Project = {
  id: "akilli-cop-kutusu",
  sketch: "cop_kutusu",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("c2", { id: "us1", type: "hcsr04", pin: "VCC", props: { distanceCm: 15 } });
    b.wire("bb.a2", "bb.B+2", RED);
    b.wire("uno.D7", "bb.a3", BLU);
    b.wire("uno.D6", "bb.a4", GRN);
    b.wire("bb.a5", "bb.B-5", BLK);
    b.plug("c10", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("uno.D9", "bb.a10", YEL);
    b.wire("bb.a11", "bb.B+11", RED);
    b.wire("bb.a12", "bb.B-12", BLK);
  },
  sim: { runMs: 14000, sampleMs: 20, events: [
    { t: 4000, set: { us1: { distanceCm: 150 } } }, { t: 8000, set: { us1: { distanceCm: 20 } } }, { t: 8200, set: { us1: { distanceCm: 150 } } }, { t: 10000, set: { us1: { distanceCm: 20 } } } ] },
  shoot: { actions: [{ wait: 2500 }], settleMs: 200 },
};
export default p;
