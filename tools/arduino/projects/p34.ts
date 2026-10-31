import { Builder, Project, RED, BLK, BLU, GRN, YEL } from "../lib";
// 34 - Hırsız Alarm Sistemi: PIR a2(VCC) a3(OUT) a4(GND); pasif buzzer a10(+) a11(-); LED c16/c17 + 220 Ω d17->d21. Hepsi doğrudan Arduino pinlerine.
const p: Project = {
  id: "hirsiz-alarm-sistemi",
  sketch: "hirsiz_alarm",
  build(b: Builder) {
    b.plug("a2", { id: "pir1", type: "pir", pin: "VCC", props: { motion: true } });
    b.wire("uno.5V", "bb.e2", RED);
    b.wire("uno.D2", "bb.e3", BLU);
    b.wire("uno.GND2", "bb.e4", BLK);
    b.plug("a10", { id: "bz1", type: "passivebuzzer", pin: "P" });
    b.wire("uno.D8", "bb.e10", YEL);
    b.wire("uno.GND3", "bb.e11", BLK);
    b.ledRes("led1", 16, "red", 220, "r1");
    b.wire("uno.D4", "bb.e16", GRN);
    b.wire("uno.GND1", "bb.e21", BLK);
  },
  sim: { runMs: 20000, sampleMs: 20, events: [
    { t: 8000, set: { pir1: { motion: false } } }, { t: 12000, set: { pir1: { motion: true } } }, { t: 12500, set: { pir1: { motion: false } } } ] },
  shoot: { actions: [{ wait: 1300 }], settleMs: 50, startWaitMs: 3600 },
};
export default p;
