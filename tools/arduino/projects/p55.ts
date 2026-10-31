import { Builder, Project, RED, BLK, BLU, YEL, GRN } from "../lib";
// 55 - Parmak İziyle Kapı Kilidi: AS608 a4(VCC) a5(GND) a6(TX -> D2) a7(RX <- D3); servo d12(SIG) d13(VCC) d14(GND)
const p: Project = {
  id: "parmak-iziyle-kapi-kilidi",
  sketch: "parmak_kapi",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "fp1", type: "as608", pin: "VCC", props: { templates: "1,2", fingerId: 2, fingerOn: true } });
    b.wire("bb.e4", "bb.B+2", RED);
    b.wire("bb.e5", "bb.B-3", BLK);
    b.wire("uno.D2", "bb.e6", BLU);
    b.wire("uno.D3", "bb.e7", GRN);
    b.plug("d12", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("bb.b12", "uno.D9", YEL);
    b.wire("bb.b13", "bb.B+11", RED);
    b.wire("bb.b14", "bb.B-12", BLK);
  },
  sim: { runMs: 18000, sampleMs: 20, events: [
    { t: 0, set: { fp1: { fingerOn: false } } },
    { t: 2000, set: { fp1: { fingerOn: true, fingerId: 2 } } }, { t: 3500, set: { fp1: { fingerOn: false } } },
    { t: 7000, set: { fp1: { fingerOn: true, fingerId: 9 } } }, { t: 8500, set: { fp1: { fingerOn: false } } },
    { t: 10000, set: { fp1: { fingerOn: true, fingerId: 1 } } }, { t: 11500, set: { fp1: { fingerOn: false } } } ] },
  shoot: { actions: [{ waitText: "Kapi acik" }, { wait: 500 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
