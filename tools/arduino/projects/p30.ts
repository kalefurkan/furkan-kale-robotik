import { Builder, Project, lcdBlock, GRN } from "../lib";
// 30 - Toprak Nem Ölçer: LCD bloğu + toprak nem sensörü a20(VCC) a21(OUT) a22(GND); OUT -> A0
const p: Project = {
  id: "toprak-nem-olcer",
  sketch: "toprak_nem",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a20", { id: "soil1", type: "soil", pin: "VCC", props: { moisture: 0.4 } });
    b.wire("bb.e20", "bb.B+18", "#ff4d4d");
    b.wire("uno.A0", "bb.e21", GRN);
    b.wire("bb.e22", "bb.B-20", "#3d3d3d");
  },
  sim: { runMs: 9000, sampleMs: 50, events: [0, 0.2, 0.4, 0.6, 0.8, 1].map((v, i) => ({ t: 1000 + i * 1300, set: { soil1: { moisture: v } } })) },
  shoot: { actions: [{ wait: 1200 }], settleMs: 200 },
};
export default p;
