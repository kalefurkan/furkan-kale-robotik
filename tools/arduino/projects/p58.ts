import { Builder, Project, RED, BLK, BLU, YEL, GRN } from "../lib";
// 58 - Gaz Kaçağı Alarmı: MQ-2 a4(VCC) a5(GND) a6(AO -> A0) a7(DO -> D7); aktif buzzer c12(+) c13(-) (D8)
const p: Project = {
  id: "gaz-kacagi-alarmi",
  sketch: "gaz_alarm",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "mq1", type: "mq2", pin: "VCC", props: { gasPpm: 2500 } });
    b.wire("bb.e4", "bb.B+2", RED);
    b.wire("bb.e5", "bb.B-3", BLK);
    b.wire("uno.A0", "bb.e6", BLU);
    b.wire("uno.D7", "bb.e7", YEL);
    b.plug("c12", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D8", "bb.e12", GRN);
    b.wire("bb.e13", "bb.B-11", BLK);
  },
  sim: { runMs: 16000, sampleMs: 20, events: [
    { t: 0, set: { mq1: { gasPpm: 300 } } }, { t: 4000, set: { mq1: { gasPpm: 1000 } } },
    { t: 7000, set: { mq1: { gasPpm: 2500 } } }, { t: 11000, set: { mq1: { gasPpm: 1000 } } }, { t: 13000, set: { mq1: { gasPpm: 300 } } } ] },
  shoot: { actions: [{ waitText: "GAZ ALGILANDI" }, { wait: 20 }], settleMs: 0, startWaitMs: 200 },
};
export default p;
