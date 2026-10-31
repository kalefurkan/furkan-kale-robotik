import { Builder, Project, RED, BLK, BLU, GRN } from "../lib";
// 35 - Hareket Algılayan Gece Lambası (pir-hareket): PIR a2(VCC) a3(OUT) a4(GND); LED c10/c11 + 220 Ω d11->d15. Doğrudan Arduino pinlerine.
const p: Project = {
  id: "pir-hareket",
  sketch: "pir_lamba",
  build(b: Builder) {
    b.plug("a2", { id: "pir1", type: "pir", pin: "VCC", props: { motion: true } });
    b.wire("uno.5V", "bb.e2", RED);
    b.wire("uno.D2", "bb.e3", BLU);
    b.wire("uno.GND2", "bb.e4", BLK);
    b.ledRes("led1", 10, "yellow", 220, "r1");
    b.wire("uno.D8", "bb.e10", GRN);
    b.wire("uno.GND3", "bb.e15", BLK);
  },
  sim: { runMs: 14000, sampleMs: 20, events: [
    { t: 2000, set: { pir1: { motion: false } } }, { t: 8000, set: { pir1: { motion: true } } }, { t: 8300, set: { pir1: { motion: false } } } ] },
  shoot: { actions: [{ wait: 800 }], settleMs: 100 },
};
export default p;
