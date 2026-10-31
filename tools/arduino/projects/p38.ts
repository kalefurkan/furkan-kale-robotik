import { Builder, Project, lcdBlock, RED, BLK, BLU, GRN, YEL } from "../lib";
// 38 - Akıllı Park Yeri Göstergesi: LCD bloğu + 3 IR sensör (breadboard dışı, park yerlerinde; VCC -> B+, GND -> B-, OUT -> D6/D7/D8)
// + 3 yeşil LED (boş = yanar): LED c{n}, 220 Ω dikey e{n+1}->h{n+1}, j{n+1} -> B-; anot e{n} -> D9/D10/D13. n = 19, 22, 25
const p: Project = {
  id: "akilli-park-yeri-gostergesi",
  sketch: "park_yeri",
  build(b: Builder) {
    lcdBlock(b);
    const ns = [19, 22, 25], leds = ["D9", "D10", "D13"], outs = ["D6", "D7", "D8"];
    ns.forEach((n, i) => {
      b.plug(`c${n}`, { id: `led${i + 1}`, type: "led", pin: "A", props: { color: "green" } });
      b.plug(`e${n + 1}`, { id: `r${i + 2}`, type: "resistor", pin: "A", props: { ohms: 220 }, rotation: 90 });
      b.wire(`uno.${leds[i]}`, `bb.e${n}`, GRN);
      b.wire(`bb.j${n + 1}`, `bb.B-${n - 2}`, BLK);
      const x = 380 + i * 110;
      b.free(`ir${i + 1}`, "irsensor", x, 340, { detected: i === 1 });
      b.wire(`ir${i + 1}.VCC`, `bb.B+${8 + i * 2}`, RED);
      b.wire(`ir${i + 1}.GND`, `bb.B-${8 + i * 2}`, BLK);
      b.wire(`ir${i + 1}.OUT`, `uno.${outs[i]}`, i === 0 ? BLU : i === 1 ? YEL : GRN);
    });
  },
  sim: { runMs: 8000, sampleMs: 20, events: [
    { t: 2000, set: { ir1: { detected: true } } }, { t: 4000, set: { ir2: { detected: false } } }, { t: 5000, set: { ir3: { detected: true } } }, { t: 6500, set: { ir1: { detected: true }, ir2: { detected: true } } } ] },
  shoot: { actions: [{ wait: 800 }], settleMs: 100 },
};
export default p;
