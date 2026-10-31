import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 92 - Akıllı Ev Enerji Yönetimi (ESP32 DevKit USB ile beslenir): ACS712 a4(VCC) a5(OUT) a6(GND); 10 kΩ d1->d5, 20 kΩ dikey e1->h1 (bölücü) -> IO34;
// 4 kanallı röle (serbest) IN1..IN4 = IO26 IO27 IO32 IO33; COM -> 5 V ray, NO -> ampul, ampul B -> eksi ray
const p: Project = {
  id: "akilli-ev-enerji-yonetimi",
  sketch: "enerji_esp32",
  esp32: true,
  builder: { noUno: true },
  build(b: Builder) {
    b.free("esp1", "esp32", 330, 600, { usbPower: true });
    b.wire("esp1.GND", "bb.B-1", BLK);
    b.wire("esp1.VIN", "bb.B+1", RED);
    b.plug("a4", { id: "acs1", type: "acs712", pin: "VCC", props: { amps: 0.4 } });
    b.wire("bb.e4", "bb.B+4", RED);
    b.wire("bb.e6", "bb.B-3", BLK);
    b.plug("d1", { id: "r1", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.plug("e1", { id: "r2", type: "resistor", pin: "A", props: { ohms: 20000 }, rotation: 90 });
    b.wire("bb.j1", "bb.B-2", BLK);
    b.wire("esp1.IO34", "bb.a1", GRN);
    b.free("rl1", "relay4", 560, 640);
    [0, 1, 2, 3].forEach((k) => b.free(`bulb${k + 1}`, "bulb", 700 + k * 90, 560));
    b.wire("rl1.VCC", "bb.B+5", RED);
    b.wire("rl1.GND", "bb.B-4", BLK);
    ["IO26", "IO27", "IO32", "IO33"].forEach((io, k) => b.wire(`esp1.${io}`, `rl1.IN${k + 1}`, [BLU, ORG, GRN, YEL][k]));
    [1, 2, 3, 4].forEach((k) => {
      b.wire(`rl1.COM${k}`, `bb.B+${5 + k}`, RED);
      b.wire(`rl1.NO${k}`, `bulb${k}.A`, ORG);
      b.wire(`bulb${k}.B`, `bb.B-${5 + k}`, BLK);
    });
  },
  sim: { runMs: 1000 },
  shoot: { actions: [{ wait: 800 }], settleMs: 5000, startWaitMs: 500 },
};
export default p;
