import { Builder, Project, lcdBlock, RED, BLK, BLU } from "../lib";
// 21 - Dijital Termometre: LCD bloğu (a2..a13) + DHT11 c20(VCC) c21(DATA) c22(GND); DATA -> D8
const p: Project = {
  id: "dijital-termometre",
  sketch: "termometre",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("c20", { id: "dht1", type: "dht11", pin: "VCC", props: { tempC: 27, humidity: 55 } });
    b.wire("bb.e20", "bb.B+20", RED);
    b.wire("uno.D8", "bb.e21", BLU);
    b.wire("bb.e22", "bb.B-22", BLK);
  },
  sim: { runMs: 7000, sampleMs: 50, events: [{ t: 3000, set: { dht1: { tempC: 31, humidity: 70 } } }, { t: 5000, set: { dht1: { tempC: 18, humidity: 35 } } }] },
  shoot: { actions: [{ wait: 1500 }], settleMs: 300 },
};
export default p;
