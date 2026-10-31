import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 98 - IoT Kontrollü Akıllı Laboratuvar (ESP32 DevKit USB ile beslenir): DHT22 a4(VCC 3,3 V) a5(DATA -> IO4) a6(GND); LDR c10/c11 (3,3 V -> LDR -> orta nokta), 10 kΩ dikey e11->h11 (orta nokta -> IO34);
// PIR a16(VCC 5 V) a17(OUT) a18(GND), OUT bölücüsü 10 kΩ d13->d17 + 20 kΩ dikey e13->h13 (orta nokta a13 -> IO13); 4 kanallı röle (serbest) IN1..IN4 = IO26 IO27 IO32 IO33; COM -> 5 V ray, NO -> ampul
const p: Project = {
  id: "iot-kontrollu-akilli-laboratuvar",
  sketch: "lab_esp32",
  esp32: true,
  builder: { noUno: true },
  build(b: Builder) {
    b.free("esp1", "esp32", 330, 600, { usbPower: true });
    b.wire("esp1.GND", "bb.B-1", BLK);
    b.wire("esp1.VIN", "bb.B+1", RED);
    b.wire("esp1.3V3", "bb.T+1", ORG);
    b.plug("a4", { id: "dht1", type: "dht22", pin: "VCC", props: { tempC: 24, humidity: 50 } });
    b.wire("bb.e4", "bb.T+4", ORG);
    b.wire("esp1.IO4", "bb.e5", YEL);
    b.wire("bb.e6", "bb.B-4", BLK);
    b.plug("c10", { id: "ldr1", type: "ldr", pin: "A", props: { light: 0.6 } });
    b.wire("bb.e10", "bb.T+10", ORG);
    b.plug("e11", { id: "r1", type: "resistor", pin: "A", props: { ohms: 10000 }, rotation: 90 });
    b.wire("bb.j11", "bb.B-11", BLK);
    b.wire("esp1.IO34", "bb.a11", GRN);
    b.plug("a16", { id: "pir1", type: "pir", pin: "VCC", props: { motion: false } });
    b.wire("bb.e16", "bb.B+16", RED);
    b.plug("d13", { id: "r2", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.plug("e13", { id: "r3", type: "resistor", pin: "A", props: { ohms: 20000 }, rotation: 90 });
    b.wire("bb.j13", "bb.B-13", BLK);
    b.wire("esp1.IO13", "bb.a13", BLU);
    b.wire("bb.e18", "bb.B-18", BLK);
    b.free("rl1", "relay4", 560, 640);
    [0, 1, 2, 3].forEach((k) => b.free(`bulb${k + 1}`, "bulb", 700 + k * 90, 560));
    b.wire("rl1.VCC", "bb.B+5", RED);
    b.wire("rl1.GND", "bb.B-5", BLK);
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
