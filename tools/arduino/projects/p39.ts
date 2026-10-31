import { Builder, Project, RED, BLK, BLU } from "../lib";
// 39 - Mini Rüzgâr Hız Ölçer: Hall sensörü a2(VCC) a3(GND) a4(DO); doğrudan Arduino pinlerine. Dönen mıknatıs = rpm özelliği.
const p: Project = {
  id: "mini-ruzgar-hiz-olcer",
  sketch: "ruzgar",
  build(b: Builder) {
    b.plug("a2", { id: "hall1", type: "hallsensor", pin: "VCC", props: { rpm: 120 } });
    b.wire("uno.5V", "bb.e2", RED);
    b.wire("uno.GND2", "bb.e3", BLK);
    b.wire("uno.D2", "bb.e4", BLU);
  },
  sim: { runMs: 16000, sampleMs: 50, events: [
    { t: 4100, set: { hall1: { rpm: 60 } } }, { t: 8100, set: { hall1: { rpm: 300 } } }, { t: 12100, set: { hall1: { rpm: 600 } } } ] },
  shoot: { actions: [{ wait: 1500 }], settleMs: 100 },
};
export default p;
