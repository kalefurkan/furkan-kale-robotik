import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 79 - Güneş Takip Sistemi: LDR sol c4/c5 + 10 kΩ d5->d9 (A0); LDR sağ c12/c13 + 10 kΩ d13->d17 (A1); servo a20(SIG) a21(VCC) a22(GND) (D9);
// panel bölücüsü: 10 kΩ d25->d29 + 10 kΩ dikey e25->h25, orta nokta a25 -> A2; güneş paneli breadboard dışında (P -> e29, N -> eksi ray)
const p: Project = {
  id: "gunes-takip-sistemi",
  sketch: "gunes_takip",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("c4", { id: "ldr1", type: "ldr", pin: "A", props: { light: 0.7 } });
    b.plug("d5", { id: "r1", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.wire("bb.e4", "bb.B+3", RED);
    b.wire("uno.A0", "bb.e5", BLU);
    b.wire("bb.e9", "bb.B-3", BLK);
    b.plug("c12", { id: "ldr2", type: "ldr", pin: "A", props: { light: 0.7 } });
    b.plug("d13", { id: "r2", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.wire("bb.e12", "bb.B+11", RED);
    b.wire("uno.A1", "bb.e13", GRN);
    b.wire("bb.e17", "bb.B-11", BLK);
    b.plug("a20", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("uno.D9", "bb.e20", YEL);
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("bb.e22", "bb.B-19", BLK);
    b.plug("d25", { id: "r3", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.plug("e25", { id: "r4", type: "resistor", pin: "A", props: { ohms: 10000 }, rotation: 90 });
    b.wire("uno.A2", "bb.a25", ORG);
    b.wire("bb.j25", "bb.B-23", BLK);
    b.free("sp1", "solarpanel", 460, 330, { light: 0.7 });
    b.wire("sp1.P", "bb.e29", WHT);
    b.wire("sp1.N", "bb.B-25", BLK);
  },
  sim: { runMs: 14000, sampleMs: 20, events: [
    { t: 3000, set: { ldr1: { light: 0.3 }, ldr2: { light: 0.9 }, sp1: { light: 0.5 } } },
    { t: 4500, set: { ldr1: { light: 0.7 }, ldr2: { light: 0.7 }, sp1: { light: 0.9 } } },
    { t: 7000, set: { ldr1: { light: 0.9 }, ldr2: { light: 0.3 }, sp1: { light: 0.5 } } },
    { t: 9500, set: { ldr1: { light: 0.7 }, ldr2: { light: 0.7 }, sp1: { light: 0.9 } } },
    { t: 11000, set: { ldr1: { light: 0.1 }, ldr2: { light: 0.1 }, sp1: { light: 0.05 } } } ] },
  shoot: { actions: [{ wait: 3800 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
