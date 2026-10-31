import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 93 - Kablosuz Hava Kalitesi Ağı düğümü (ESP32 DevKit USB ile beslenir): MQ-135 a8(VCC) a9(GND) a10(AO) a11(DO); MQ-2 a22(VCC) a23(GND) a24(AO) a25(DO)
// her AO/DO için 10 kΩ + 20 kΩ gerilim bölücü: r1 (10 kΩ) satırdan sütun c-4 -> c, r2 (20 kΩ) dikey e -> h, j -> eksi ray; orta nokta -> ESP32
const p: Project = {
  id: "kablosuz-hava-kalitesi-agi",
  sketch: "hava_agi_esp32",
  esp32: true,
  builder: { noUno: true },
  build(b: Builder) {
    b.free("esp1", "esp32", 330, 600, { usbPower: true });
    b.wire("esp1.GND", "bb.B-1", BLK);
    b.wire("esp1.VIN", "bb.B+1", RED);
    const nodes: [string, string, number, number, string, string, string][] = [["mq1", "mq135", 8, 6, "IO34", "IO32", "r"], ["mq2", "mq2", 22, 20, "IO35", "IO33", "s"]];
    nodes.forEach(([id, type, s, c, aoIo, doIo, pre], k) => {
      b.plug(`a${s}`, { id, type, pin: "VCC", props: { gasPpm: 400 } });
      b.wire(`bb.e${s}`, `bb.B+${s}`, RED);
      b.wire(`bb.e${s + 1}`, `bb.B-${s}`, BLK);
      // AO bölücüsü: r1 d(c) -> d(c+4) (B ucu AO sütununda), r2 e(c) -> h(c)
      b.plug(`d${c}`, { id: `${pre}1`, type: "resistor", pin: "A", props: { ohms: 10000 } });
      b.plug(`e${c}`, { id: `${pre}2`, type: "resistor", pin: "A", props: { ohms: 20000 }, rotation: 90 });
      b.wire(`bb.j${c}`, `bb.B-${c}`, BLK);
      b.wire(`esp1.${aoIo}`, `bb.a${c}`, k ? BLU : GRN);
      // DO bölücüsü
      b.plug(`c${c + 1}`, { id: `${pre}3`, type: "resistor", pin: "A", props: { ohms: 10000 } });
      b.plug(`e${c + 1}`, { id: `${pre}4`, type: "resistor", pin: "A", props: { ohms: 20000 }, rotation: 90 });
      b.wire(`bb.j${c + 1}`, `bb.B-${c + 1}`, BLK);
      b.wire(`esp1.${doIo}`, `bb.a${c + 1}`, k ? ORG : YEL);
    });
  },
  sim: { runMs: 1000 },
  shoot: { actions: [{ wait: 800 }], settleMs: 5000, startWaitMs: 500 },
};
export default p;
