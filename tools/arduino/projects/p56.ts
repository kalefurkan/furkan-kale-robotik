import { Builder, Project, lcdBlock, RED, BLK, BLU, GRN } from "../lib";
// 56 - Elektronik Terazi: LCD bloğu (a2..a13) + HX711 a21(VCC) a22(GND) a23(DT -> A1) a24(SCK -> A0)
const p: Project = {
  id: "elektronik-terazi",
  sketch: "terazi",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a21", { id: "hx1", type: "hx711", pin: "VCC", props: { weightG: 0 } });
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("bb.e22", "bb.B-20", BLK);
    b.wire("uno.A1", "bb.e23", BLU);
    b.wire("uno.A0", "bb.e24", GRN);
  },
  sim: { runMs: 16000, sampleMs: 50, events: [
    { t: 4000, set: { hx1: { weightG: 250 } } }, { t: 7000, set: { hx1: { weightG: 1200.5 } } }, { t: 10000, set: { hx1: { weightG: 0 } } }, { t: 12500, set: { hx1: { weightG: 75 } } } ] },
  shoot: { actions: [{ wait: 1800 }, { select: "hx1" }, { slider: { value: 250 } }, { wait: 1500 }], settleMs: 100, startWaitMs: 500 },
};
export default p;
