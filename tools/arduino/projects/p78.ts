import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 78 - Akıllı Sera Otomasyonu: DHT22 a2(VCC) a3(DATA -> D4) a4(GND); toprak nemi a8(VCC) a9(OUT -> A0) a10(GND);
// fan NPN a14(C) a15(B) a16(E) + 1 kΩ d15->d19 (D6), ters diyot A c14 -> K c18; pompa NPN a22(C) a23(B) a24(E) + 1 kΩ d23->d27 (D5), ters diyot A c22 -> K c26
// 6 V kaynak üst + rayına (T+), fan ve pompa breadboard dışında
const p: Project = {
  id: "akilli-sera-otomasyonu",
  sketch: "sera",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a2", { id: "dht1", type: "dht22", pin: "VCC", props: { tempC: 30, humidity: 60 } });
    b.wire("bb.e2", "bb.B+2", RED);
    b.wire("uno.D4", "bb.e3", YEL);
    b.wire("bb.e4", "bb.B-2", BLK);
    b.plug("a8", { id: "soil1", type: "soil", pin: "VCC", props: { moisture: 0.5 } });
    b.wire("bb.e8", "bb.B+8", RED);
    b.wire("uno.A0", "bb.e9", BLU);
    b.wire("bb.e10", "bb.B-8", BLK);
    b.free("psu1", "psu", 330, 330, { volts: 6 });
    b.free("fan1", "dcmotor", 560, 330);
    b.free("pump1", "dcmotor", 700, 330);
    b.wire("psu1.P", "bb.T+1", ORG);
    b.wire("psu1.N", "bb.B-12", BLK);
    b.plug("a14", { id: "q1", type: "npn", pin: "C" });
    b.plug("d15", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("c14", { id: "d1", type: "diode", pin: "A" });
    b.wire("uno.D6", "bb.e19", GRN);
    b.wire("bb.e16", "bb.B-16", BLK);
    b.wire("bb.e14", "fan1.B", YEL);
    b.wire("bb.e18", "fan1.A", ORG);
    b.wire("bb.a18", "bb.T+4", ORG);
    b.plug("a22", { id: "q2", type: "npn", pin: "C" });
    b.plug("d23", { id: "r2", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("c22", { id: "d2", type: "diode", pin: "A" });
    b.wire("uno.D5", "bb.e27", WHT);
    b.wire("bb.e24", "bb.B-22", BLK);
    b.wire("bb.e22", "pump1.B", YEL);
    b.wire("bb.e26", "pump1.A", ORG);
    b.wire("bb.a26", "bb.T+8", ORG);
  },
  sim: { runMs: 30000, sampleMs: 20, events: [
    { t: 4000, set: { dht1: { tempC: 24 } } }, { t: 8000, set: { soil1: { moisture: 0.1 } } },
    { t: 13000, set: { soil1: { moisture: 0.7 } } }, { t: 15000, set: { dht1: { humidity: 90 } } },
    { t: 19000, set: { dht1: { humidity: 60 } } }, { t: 22000, set: { soil1: { moisture: 0.1 } } } ] },
  shoot: { actions: [{ wait: 3000 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
