import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG } from "../lib";
// 92 doğrulama devresi (yalnızca facts; siteye girmez): Uno + ACS712 a4(VCC) a5(OUT -> A0) a6(GND) + 4 kanallı röle IN1..IN4 = D4..D7
const p: Project = {
  id: "akilli-ev-enerji-yonetimi--uno",
  sketch: "enerji_uno",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "acs1", type: "acs712", pin: "VCC", props: { amps: 0 } });
    b.wire("bb.e4", "bb.B+4", RED);
    b.wire("uno.A0", "bb.e5", BLU);
    b.wire("bb.e6", "bb.B-3", BLK);
    b.free("rl1", "relay4", 560, 400);
    [0, 1, 2, 3].forEach((k) => b.free(`bulb${k + 1}`, "bulb", 700 + k * 90, 330));
    b.wire("rl1.VCC", "bb.B+5", RED);
    b.wire("rl1.GND", "bb.B-4", BLK);
    ["D4", "D5", "D6", "D7"].forEach((d, k) => b.wire(`uno.${d}`, `rl1.IN${k + 1}`, [BLU, ORG, GRN, YEL][k]));
    [1, 2, 3, 4].forEach((k) => { b.wire(`rl1.COM${k}`, `bb.B+${5 + k}`, RED); b.wire(`rl1.NO${k}`, `bulb${k}.A`, ORG); b.wire(`bulb${k}.B`, `bb.B-${5 + k}`, BLK); });
  },
  sim: { runMs: 12000, sampleMs: 20, events: [ { t: 2200, set: { acs1: { amps: 0.6 } } }, { t: 3500, set: { acs1: { amps: 2.0 } } }, { t: 5500, set: { acs1: { amps: 1.0 } } } ] },
};
export default p;
