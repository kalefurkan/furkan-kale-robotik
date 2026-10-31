import { Builder, Project, l298Block, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 83 - Akıllı Tarım Robotu: L298N bloğu (a4..a16) + pompa sürücüsü: NPN a20(C) a21(B) a22(E), 1 kΩ d21->d25 (D11), ters diyot A c20 -> K c24, pompa A -> e24, B -> e20, e24 yanı a24 -> 6 V +;
// toprak nemi a27(VCC) a28(OUT -> A0) a29(GND). Pompa (DC motor) breadboard dışında.
const p: Project = {
  id: "akilli-tarim-robotu",
  sketch: "tarim_robotu",
  build(b: Builder) {
    l298Block(b);
    b.plug("a20", { id: "q1", type: "npn", pin: "C" });
    b.plug("d21", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("c20", { id: "d1", type: "diode", pin: "A" });
    b.wire("uno.D11", "bb.e25", GRN);
    b.wire("bb.e22", "bb.B-21", BLK);
    b.free("pump1", "dcmotor", 840, 330);
    b.wire("bb.e20", "pump1.B", YEL);
    b.wire("bb.e24", "pump1.A", ORG);
    b.wire("bb.a24", "bb.d4", ORG);
    b.plug("a27", { id: "soil1", type: "soil", pin: "VCC", props: { moisture: 0.15 } });
    b.wire("bb.e27", "bb.B+20", RED);
    b.wire("uno.A0", "bb.e28", BLU);
    b.wire("bb.e29", "bb.B-20", BLK);
  },
  sim: { runMs: 16000, sampleMs: 20, events: [
    { t: 6000, set: { soil1: { moisture: 0.75 } } }, { t: 9000, set: { soil1: { moisture: 0.3 } } } ] },
  shoot: { actions: [{ waitText: "pompa acik" }, { wait: 300 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
