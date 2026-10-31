import { Builder, Project, RED, BLK, BLU, YEL, GRN } from "../lib";
// 33 - Otomatik El Dezenfektanı: IR engel sensörü a2(VCC) a3(GND) a4(OUT); pompa (DC motor) a11(A) a12(B); NPN a16(C) a17(B) a18(E);
// 1 kΩ d17->d21; ters diyot dikey A c12 -> K f12, K h12 -> +5V rayı (fan projesiyle aynı güç düzeni).
const p: Project = {
  id: "otomatik-el-dezenfektani",
  sketch: "dezenfektan",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a2", { id: "ir1", type: "irsensor", pin: "VCC", props: { detected: true } });
    b.wire("bb.e2", "bb.B+2", RED);
    b.wire("bb.e3", "bb.B-3", BLK);
    b.wire("uno.D2", "bb.e4", BLU);
    b.plug("a11", { id: "pump1", type: "dcmotor", pin: "A" });
    b.wire("bb.e11", "bb.B+11", RED);
    b.plug("c12", { id: "d1", type: "diode", pin: "A", rotation: 90 });
    b.wire("bb.h12", "bb.B+12", RED);
    b.plug("a16", { id: "q1", type: "npn", pin: "C" });
    b.wire("bb.b12", "bb.d16", YEL);
    b.wire("bb.e18", "bb.B-18", BLK);
    b.plug("d17", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.wire("uno.D9", "bb.e21", GRN);
  },
  sim: { runMs: 12000, sampleMs: 20, events: [
    { t: 2500, set: { ir1: { detected: false } } }, { t: 4000, set: { ir1: { detected: true } } }, { t: 4300, set: { ir1: { detected: false } } },
    { t: 6000, set: { ir1: { detected: true } } }, { t: 9000, set: { ir1: { detected: false } } }, { t: 10000, set: { ir1: { detected: true } } } ] },
  shoot: { actions: [{ wait: 400 }], settleMs: 100, hideFlybackFrame: true, startWaitMs: 300 },
};
export default p;
