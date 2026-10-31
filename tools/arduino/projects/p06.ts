import { Builder, Project, RED, BLK, YEL, GRN, BLU, ORG } from "../lib";

// 6 - LED ile Işık Şiddeti Göstergesi
// LED'ler c{n}/c{n+1}; her LED'in 220 Ω direnci dikey (e{n+1} -> h{n+1}), katot şeridinden alt şeride geçer; alt şerit B- rayına kablolanır.
const LEDS: [number, string][] = [[2, "green"], [5, "green"], [8, "yellow"], [11, "yellow"], [14, "red"]];
const p: Project = {
  id: "led-ile-isik-siddeti-gostergesi",
  sketch: "isik_gostergesi",
  build(b: Builder) {
    LEDS.forEach(([n, color], i) => {
      b.plug(`c${n}`, { id: `led${i + 1}`, type: "led", pin: "A", props: { color } });
      b.plug(`e${n + 1}`, { id: `r${i + 1}`, type: "resistor", pin: "A", props: { ohms: 220 }, rotation: 90 });
      b.wire(`uno.D${i + 2}`, `bb.a${n}`, YEL);
      b.wire(`bb.j${n + 1}`, `bb.B-${n}`, BLK);
    });
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("c20", { id: "ldr1", type: "ldr", pin: "A", props: { light: 0.7 } });
    b.plug("d21", { id: "r6", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.wire("uno.5V", "bb.e20", RED);
    b.wire("uno.A0", "bb.e21", GRN);
    b.wire("uno.GND3", "bb.e25", BLK);
  },
  sim: { runMs: 6000, events: [{ t: 1000, set: { ldr1: { light: 0 } } }, { t: 2000, set: { ldr1: { light: 0.3 } } }, { t: 3000, set: { ldr1: { light: 0.5 } } }, { t: 4000, set: { ldr1: { light: 0.7 } } }, { t: 5000, set: { ldr1: { light: 1 } } }], sampleMs: 100 },
};
export default p;
