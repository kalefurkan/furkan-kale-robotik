import { Builder, Project, lcdBlock, RED, BLK, BLU, YEL, GRN } from "../lib";
// 44 - Kablosuz Sıcaklık İstasyonu: LCD bloğu (a2..a13) + HC-05 a21(VCC) a22(GND) a23(TXD -> D10) a24(RXD) + bölücü (1 kΩ d24->d20 [180°], 2 kΩ dikey e24->h24; D9 -> e20) + DHT11 c27(VCC) c28(DATA -> D8) c29(GND)
const p: Project = {
  id: "kablosuz-sicaklik-istasyonu",
  sketch: "kablosuz_istasyon",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a21", { id: "bt1", type: "hc05", pin: "VCC" });
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("bb.e22", "bb.B-20", BLK);
    b.wire("bb.e23", "uno.D10", BLU);
    b.plug("d24", { id: "r2", type: "resistor", pin: "A", props: { ohms: 1000 }, rotation: 180 });
    b.plug("e24", { id: "r3", type: "resistor", pin: "A", props: { ohms: 2000 }, rotation: 90 });
    b.wire("bb.e20", "uno.D9", GRN);
    b.wire("bb.j24", "bb.B-22", BLK);
    b.plug("c27", { id: "dht1", type: "dht11", pin: "VCC", props: { tempC: 27, humidity: 55 } });
    b.wire("bb.e27", "bb.B+25", RED);
    b.wire("uno.D8", "bb.e28", YEL);
    b.wire("bb.e29", "bb.B-25", BLK);
  },
  sim: { runMs: 14000, sampleMs: 50, events: [
    { t: 3000, set: { dht1: { tempC: 31, humidity: 70 } } },
    { t: 5000, set: { bt1: { btText: "F", btSeq: 1 } } },
    { t: 8000, set: { bt1: { btText: "C", btSeq: 2 } } },
    { t: 10000, set: { dht1: { tempC: 18, humidity: 35 } } } ] },
  shoot: { actions: [{ wait: 2500 }], settleMs: 300 },
};
export default p;
