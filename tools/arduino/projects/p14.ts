import { Builder, Project, RED, BLU, BLK } from "../lib";
// 14 - Ortam Sıcaklık ve Nem Ölçer: DHT11 c10(VCC) c11(DATA) c12(GND)
const p: Project = {
  id: "ortam-sicaklik-ve-nem-olcer",
  sketch: "dht11",
  build(b: Builder) {
    b.plug("c10", { id: "dht1", type: "dht11", pin: "VCC", props: { tempC: 24, humidity: 45 } });
    b.wire("uno.5V", "bb.e10", RED);
    b.wire("uno.D2", "bb.e11", BLU);
    b.wire("bb.e12", "uno.GND2", BLK);
  },
  sim: { runMs: 9000, sampleMs: 500, events: [{ t: 4500, set: { dht1: { tempC: 31, humidity: 70 } } }] },
};
export default p;
