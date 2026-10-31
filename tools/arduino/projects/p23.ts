import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 23 - Akıllı Gece Lambası: RGB LED a2(R) a3(K) a4(G) a5(B), kanal dirençleri 220 Ω: R dikey e2->h2, G dikey e4->h4, B yatay e5->e9;
// LDR a14(A, 5V) a15(B, A0); 10 kΩ d15->d19 (GND). Tüm bağlantılar Arduino pinlerine doğrudan (ray yok).
const p: Project = {
  id: "akilli-gece-lambasi",
  sketch: "gece_lambasi",
  build(b: Builder) {
    b.plug("a2", { id: "rgb1", type: "rgbled", pin: "R" });
    b.plug("e2", { id: "r1", type: "resistor", pin: "A", props: { ohms: 220 }, rotation: 90 });
    b.plug("e4", { id: "r2", type: "resistor", pin: "A", props: { ohms: 220 }, rotation: 90 });
    b.plug("e5", { id: "r3", type: "resistor", pin: "A", props: { ohms: 220 } });
    b.wire("uno.D9", "bb.j2", RED);
    b.wire("uno.D10", "bb.j4", GRN);
    b.wire("uno.D11", "bb.a9", BLU);
    b.wire("uno.GND2", "bb.e3", BLK);
    b.plug("a14", { id: "ldr1", type: "ldr", pin: "A", props: { light: 0.2 } });
    b.plug("d15", { id: "r4", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.wire("uno.5V", "bb.e14", ORG);
    b.wire("uno.A0", "bb.b15", YEL);
    b.wire("uno.GND3", "bb.e19", BLK);
  },
  sim: { runMs: 8000, sampleMs: 50, events: [0.9, 0.7, 0.5, 0.3, 0.1, 0].map((v, i) => ({ t: 500 + i * 1200, set: { ldr1: { light: v } } })) },
  shoot: { actions: [{ wait: 1500 }], settleMs: 300 },
};
export default p;
