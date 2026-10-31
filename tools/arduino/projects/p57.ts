import { Builder, Project, lcdBlock, RED, BLK, BLU, YEL } from "../lib";
// 57 - Hava Kalitesi Ölçer: LCD bloğu (a2..a13) + MQ-135 a21(VCC) a22(GND) a23(AO -> A0) a24(DO -> D7)
const p: Project = {
  id: "hava-kalitesi-olcer",
  sketch: "hava_kalitesi",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a21", { id: "mq1", type: "mq135", pin: "VCC", props: { gasPpm: 100 } });
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("bb.e22", "bb.B-20", BLK);
    b.wire("uno.A0", "bb.e23", BLU);
    b.wire("uno.D7", "bb.e24", YEL);
  },
  sim: { runMs: 22000, sampleMs: 50, events: [
    { t: 0, set: { mq1: { gasPpm: 20 } } }, { t: 5000, set: { mq1: { gasPpm: 100 } } }, { t: 8000, set: { mq1: { gasPpm: 400 } } },
    { t: 12000, set: { mq1: { gasPpm: 900 } } }, { t: 16000, set: { mq1: { gasPpm: 20 } } } ] },
  shoot: { actions: [{ wait: 3500 }], settleMs: 100, startWaitMs: 500 },
};
export default p;
