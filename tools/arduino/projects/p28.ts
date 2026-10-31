import { Builder, Project, lcdBlock, GRN } from "../lib";
// 28 - Su Seviye Ölçer: LCD bloğu + su seviye sensörü a20(S) a21(+) a22(-); S -> A0
const p: Project = {
  id: "su-seviye-olcer",
  sketch: "su_seviye",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a20", { id: "wl1", type: "waterlevel", pin: "S", props: { level: 0.5 } });
    b.wire("uno.A0", "bb.e20", GRN);
    b.wire("bb.e21", "bb.B+19", "#ff4d4d");
    b.wire("bb.e22", "bb.B-20", "#3d3d3d");
  },
  sim: { runMs: 9000, sampleMs: 50, events: [0, 0.25, 0.5, 0.75, 1].map((v, i) => ({ t: 1500 + i * 1500, set: { wl1: { level: v } } })) },
  shoot: { actions: [{ wait: 1200 }], settleMs: 200 },
};
export default p;
