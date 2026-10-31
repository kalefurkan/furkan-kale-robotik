import { Builder, Project, l298Block, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 94 - Akıllı Yangın Söndürme Robotu: L298N bloğu (a4..a16) + pompa sürücüsü: NPN a20(C) a21(B) a22(E), 1 kΩ d21->d25 (D11), ters diyot A c20 -> K c24, pompa A -> e24, B -> e20, e24 yanı a24 -> 6 V +;
// 3 alev sensörü serbest (VCC/GND rayda, DO D2 D3 D4, AO A0 A1 A2). Pompa (DC motor) breadboard dışında.
const p: Project = {
  id: "akilli-yangin-sondurme-robotu",
  sketch: "yangin_robotu",
  build(b: Builder) {
    l298Block(b);
    b.plug("a20", { id: "q1", type: "npn", pin: "C" });
    b.plug("d21", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("c20", { id: "d1", type: "diode", pin: "A" });
    b.wire("uno.D11", "bb.e25", GRN);
    b.wire("bb.e22", "bb.B-21", BLK);
    b.free("pump1", "dcmotor", 840, 330);
    b.wire("bb.e20", "pump1.B", YEL);
    b.wire("bb.e24", "pump1.A", ORG);
    b.wire("bb.a24", "bb.d4", ORG);
    ["fl1", "fl2", "fl3"].forEach((id, k) => {
      b.free(id, "flame", 940 + k * 110, 330, { flame: k === 1 ? 0.95 : 0 });
      b.wire(`${id}.VCC`, `bb.B+${12 + 2 * k}`, RED);
      b.wire(`${id}.GND`, `bb.B-${12 + 2 * k}`, BLK);
      b.wire(`uno.D${2 + k}`, `${id}.DO`, [YEL, GRN, BLU][k]);
      b.wire(`uno.A${k}`, `${id}.AO`, [ORG, WHT, YEL][k]);
    });
  },
  sim: { runMs: 16000, sampleMs: 20, events: [
    { t: 0, set: { fl2: { flame: 0 } } },
    { t: 1000, set: { fl1: { flame: 0.6 } } }, { t: 3000, set: { fl1: { flame: 0 }, fl2: { flame: 0.6 } } },
    { t: 5000, set: { fl2: { flame: 0.95 } } }, { t: 9500, set: { fl2: { flame: 0 } } },
    { t: 11000, set: { fl3: { flame: 0.7 } } }, { t: 13000, set: { fl3: { flame: 0 } } } ] },
  shoot: { actions: [{ waitText: "pompa acik" }, { wait: 300 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
