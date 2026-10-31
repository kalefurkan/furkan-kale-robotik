import { Builder, Project, BLU, YEL, BLK } from "../lib";
// 19 - Eğilme Algılayıcı Alarm: tilt c10/c12; aktif buzzer c20(+)/c21(-)
const p: Project = {
  id: "egilme-algilayici-alarm",
  sketch: "egilme_alarm",
  build(b: Builder) {
    b.plug("c10", { id: "tilt1", type: "tilt", pin: "A", props: { tilted: true } });
    b.plug("c20", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D2", "bb.e10", BLU);
    b.wire("bb.e12", "uno.GND3", BLK);
    b.wire("uno.D8", "bb.e20", YEL);
    b.wire("bb.e21", "uno.GND2", BLK);
  },
  sim: { runMs: 3000, sampleMs: 50, events: [{ t: 500, set: { tilt1: { tilted: false } } }, { t: 1500, set: { tilt1: { tilted: true } } }, { t: 2300, set: { tilt1: { tilted: false } } }] },
  shoot: { actions: [{ wait: 400 }] },
};
export default p;
