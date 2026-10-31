import { Builder, Project, RED, GRN, BLK } from "../lib";
// 13 - Sıcaklık Ölçer: LM35 c10(+Vs) c11(OUT) c12(GND)
const p: Project = {
  id: "sicaklik-olcer",
  sketch: "lm35",
  build(b: Builder) {
    b.plug("c10", { id: "lm1", type: "lm35", pin: "VCC", props: { tempC: 27 } });
    b.wire("uno.5V", "bb.e10", RED);
    b.wire("uno.A0", "bb.e11", GRN);
    b.wire("bb.e12", "uno.GND2", BLK);
  },
  sim: { runMs: 7000, sampleMs: 250, events: [
    { t: 1000, set: { lm1: { tempC: 0 } } }, { t: 2000, set: { lm1: { tempC: 10 } } }, { t: 3000, set: { lm1: { tempC: 25 } } },
    { t: 4000, set: { lm1: { tempC: 37 } } }, { t: 5000, set: { lm1: { tempC: 50 } } }, { t: 6000, set: { lm1: { tempC: 100 } } } ] },
};
export default p;
