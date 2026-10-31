import { Builder, Project, lcdBlock, RED, BLK, BLU } from "../lib";
// 60 - Enerji Tüketim Ölçer: LCD bloğu (a2..a13) + ACS712 a21(VCC) a22(OUT -> A0) a23(GND)
const p: Project = {
  id: "enerji-tuketim-olcer",
  sketch: "enerji_olcer",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a21", { id: "acs1", type: "acs712", pin: "VCC", props: { amps: 0 } });
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("uno.A0", "bb.e22", BLU);
    b.wire("bb.e23", "bb.B-21", BLK);
  },
  sim: { runMs: 18000, sampleMs: 50, events: [
    { t: 3000, set: { acs1: { amps: 0.5 } } }, { t: 6000, set: { acs1: { amps: 1.5 } } },
    { t: 10000, set: { acs1: { amps: 3 } } }, { t: 14000, set: { acs1: { amps: -1 } } } ] },
  shoot: { actions: [{ wait: 1500 }, { select: "acs1" }, { slider: { value: 1.5 } }, { wait: 3500 }], settleMs: 100, startWaitMs: 500 },
};
export default p;
