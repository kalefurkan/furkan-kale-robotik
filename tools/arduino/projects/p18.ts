import { Builder, Project, RED, GRN, YEL, BLK } from "../lib";
// 18 - Işıkla Kontrol Edilen Buzzer: LDR c10/c11 + 10k d11->d15; pasif buzzer c20(+)/c21(-)
const p: Project = {
  id: "isikla-kontrol-edilen-buzzer",
  sketch: "isikli_buzzer",
  build(b: Builder) {
    b.plug("c10", { id: "ldr1", type: "ldr", pin: "A", props: { light: 0.7 } });
    b.plug("d11", { id: "r1", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.plug("c20", { id: "pbz1", type: "passivebuzzer", pin: "P" });
    b.wire("uno.5V", "bb.e10", RED);
    b.wire("uno.A0", "bb.e11", GRN);
    b.wire("bb.e15", "uno.GND3", BLK);
    b.wire("uno.D8", "bb.e20", YEL);
    b.wire("bb.e21", "uno.GND2", BLK);
  },
  sim: { runMs: 6000, sampleMs: 100, events: [
    { t: 1000, set: { ldr1: { light: 0 } } }, { t: 2000, set: { ldr1: { light: 0.3 } } }, { t: 3000, set: { ldr1: { light: 0.5 } } }, { t: 4000, set: { ldr1: { light: 0.7 } } }, { t: 5000, set: { ldr1: { light: 1 } } } ] },
  shoot: { actions: [{ wait: 600 }] },
};
export default p;
