import { Builder, Project, l298Block, RED, BLK, YEL, GRN, BLU } from "../lib";
// 65 - Mini Sumo Robot: L298N bloğu (a4..a16); IR sensörler ir1 a18(VCC) a19(GND) a20(OUT -> D2), ir2 a23 a24 a25(OUT -> D3); HC-SR04 a26(VCC) a27(TRIG) a28(ECHO) a29(GND)
const p: Project = {
  id: "mini-sumo-robot",
  sketch: "mini_sumo",
  build(b: Builder) {
    l298Block(b);
    b.plug("a18", { id: "irl", type: "irsensor", pin: "VCC", props: { detected: false } });
    b.wire("bb.e18", "bb.B+17", RED);
    b.wire("bb.e19", "bb.B-18", BLK);
    b.wire("uno.D2", "bb.e20", YEL);
    b.plug("a23", { id: "irr", type: "irsensor", pin: "VCC", props: { detected: false } });
    b.wire("bb.e23", "bb.B+22", RED);
    b.wire("bb.e24", "bb.B-23", BLK);
    b.wire("uno.D3", "bb.e25", GRN);
    b.plug("a26", { id: "us1", type: "hcsr04", pin: "VCC", props: { distanceCm: 100 } });
    b.wire("bb.e26", "bb.B+24", RED);
    b.wire("uno.D4", "bb.e27", BLU);
    b.wire("uno.D11", "bb.e28", GRN);
    b.wire("bb.e29", "bb.B-25", BLK);
  },
  sim: { runMs: 14000, sampleMs: 20, events: [
    { t: 6500, set: { us1: { distanceCm: 25 } } },
    { t: 8000, set: { irl: { detected: true } } }, { t: 8200, set: { irl: { detected: false } } },
    { t: 10000, set: { irr: { detected: true } } }, { t: 10200, set: { irr: { detected: false } } },
    { t: 11500, set: { us1: { distanceCm: 120 } } } ] },
  shoot: { actions: [{ wait: 6000 }, { select: "us1" }, { slider: { value: 25 } }, { wait: 1000 }], settleMs: 200 },
};
export default p;
