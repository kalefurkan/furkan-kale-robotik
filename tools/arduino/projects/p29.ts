import { Builder, Project, RED, BLK, GRN, BLU, YEL } from "../lib";
// 29 - Yağmur Algılama Sistemi: yağmur modülü a2(VCC) a3(GND) a4(AO) a5(DO); aktif buzzer a10/a11. 5V, GND doğrudan Arduino pinlerinden.
const p: Project = {
  id: "yagmur-algilama-sistemi",
  sketch: "yagmur",
  build(b: Builder) {
    b.plug("a2", { id: "rain1", type: "rainsensor", pin: "VCC", props: { wetness: 0.9 } });
    b.wire("uno.5V", "bb.e2", RED);
    b.wire("uno.GND2", "bb.e3", BLK);
    b.wire("uno.A0", "bb.e4", GRN);
    b.wire("uno.D2", "bb.e5", BLU);
    b.plug("a10", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D8", "bb.e10", YEL);
    b.wire("uno.GND3", "bb.e11", BLK);
  },
  sim: { runMs: 12000, sampleMs: 10, events: [0, 0.2, 0.4, 0.6, 0.9, 0].map((v, i) => ({ t: 500 + i * 2000, set: { rain1: { wetness: v } } })) },
  shoot: { actions: [{ wait: 1500 }], settleMs: 100 },
};
export default p;
