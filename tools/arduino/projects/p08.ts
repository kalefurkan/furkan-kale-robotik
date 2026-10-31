import { Builder, Project, YEL, BLK } from "../lib";
// 8 - Buzzer ile Melodi Çalma: pasif buzzer c10(+)/c11(-); D8 -> e10, e11 -> GND2
const p: Project = {
  id: "buzzer-ile-melodi-calma",
  sketch: "melodi",
  build(b: Builder) {
    b.plug("c10", { id: "pbz1", type: "passivebuzzer", pin: "P" });
    b.wire("uno.D8", "bb.e10", YEL);
    b.wire("bb.e11", "uno.GND2", BLK);
  },
  sim: { runMs: 9000, sampleMs: 10 },
  shoot: { actions: [{ waitText: "Çalan nota: 392", timeout: 15000 }], settleMs: 60 },
};
export default p;
