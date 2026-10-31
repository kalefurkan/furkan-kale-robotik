import { Builder, Project, YEL, BLK, RED, GRN } from "../lib";
// 11 - LED Bar Grafik: 10 LED (A d{n}, K d{n+1}), dikey 220 Ω dirençler; pot c24/c25/c26.
const NS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
const COLORS = ["green", "green", "green", "green", "yellow", "yellow", "yellow", "red", "red", "red"];
const p: Project = {
  id: "led-bar-grafik",
  sketch: "led_bar",
  builder: { bbX: 312 },
  build(b: Builder) {
    NS.forEach((n, i) => {
      b.plug(`d${n}`, { id: `led${i + 1}`, type: "led", pin: "A", props: { color: COLORS[i] } });
      b.plug(`e${n + 1}`, { id: `r${i + 1}`, type: "resistor", pin: "A", props: { ohms: 220 }, rotation: 90 });
      b.wire(`bb.j${n + 1}`, `bb.B-${n}`, BLK);
    });
    NS.forEach((n, i) => b.wire(`uno.D${i + 2}`, `bb.a${n}`, YEL));
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("c24", { id: "pot1", type: "pot", pin: "A", props: { position: 0.3 } });
    b.wire("uno.5V", "bb.e24", RED);
    b.wire("uno.A0", "bb.e25", GRN);
    b.wire("bb.e26", "uno.GND3", BLK);
  },
  sim: { runMs: 3000, sampleMs: 100, events: [
    { t: 500, set: { pot1: { position: 0 } } }, { t: 1000, set: { pot1: { position: 0.3 } } }, { t: 1500, set: { pot1: { position: 0.3 } } }, { t: 2000, set: { pot1: { position: 0.9 } } }, { t: 2500, set: { pot1: { position: 1 } } } ] },
};
export default p;
