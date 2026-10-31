import { Builder, Project, RED, BLK, BLU, GRN, YEL } from "../lib";
// 24 - Park Sensörü (mesafe-alarmi): HC-SR04 c2..c5; aktif buzzer a10/a11; LED c16/c17 + 220 Ω d17->d21. Hepsi doğrudan Arduino pinlerine/GND'lere.
const p: Project = {
  id: "mesafe-alarmi",
  sketch: "park_sensoru",
  build(b: Builder) {
    b.plug("c2", { id: "us1", type: "hcsr04", pin: "VCC", props: { distanceCm: 6 } });
    b.wire("uno.5V", "bb.a2", RED);
    b.wire("uno.D7", "bb.a3", BLU);
    b.wire("uno.D6", "bb.a4", GRN);
    b.wire("uno.GND2", "bb.a5", BLK);
    b.plug("a10", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D8", "bb.e10", YEL);
    b.wire("uno.GND3", "bb.e11", BLK);
    b.ledRes("led1", 16, "red", 220, "r1");
    b.wire("uno.D9", "bb.e16", GRN);
    b.wire("uno.GND1", "bb.e21", BLK);
  },
  sim: { runMs: 9000, sampleMs: 10, events: [
    { t: 1000, set: { us1: { distanceCm: 25 } } }, { t: 3000, set: { us1: { distanceCm: 15 } } }, { t: 5000, set: { us1: { distanceCm: 8 } } }, { t: 7000, set: { us1: { distanceCm: 6 } } } ] },
  shoot: { actions: [{ wait: 1500 }], settleMs: 100 },
};
export default p;
