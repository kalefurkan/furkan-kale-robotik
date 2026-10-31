import { Builder, Project, RED, BLK, BLU, YEL, GRN } from "../lib";
// 22 - Otomatik Fan Sistemi: DHT11 a2-a4; fan (DC motor) a11(A) a12(B); NPN a16(C) a17(B) a18(E); taban direnci 1 kΩ d17->d21;
// ters diyot dikey: A c12 (motor B şeridi) -> K f12; K h12 -> +5V rayı. Motor +5V rayından beslenir; transistör GND'ye anahtarlar.
const p: Project = {
  id: "otomatik-fan-sistemi",
  sketch: "fan",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a2", { id: "dht1", type: "dht11", pin: "VCC", props: { tempC: 31, humidity: 50 } });
    b.wire("bb.e2", "bb.B+2", RED);
    b.wire("uno.D8", "bb.e3", BLU);
    b.wire("bb.e4", "bb.B-4", BLK);
    b.plug("a11", { id: "fan1", type: "dcmotor", pin: "A" });
    b.wire("bb.e11", "bb.B+11", RED);               // fan + ucu -> 5V
    b.plug("c12", { id: "d1", type: "diode", pin: "A", rotation: 90 }); // A c12 -> K f12
    b.wire("bb.h12", "bb.B+12", RED);               // diyot katodu -> 5V
    b.plug("a16", { id: "q1", type: "npn", pin: "C" });
    b.wire("bb.b12", "bb.d16", YEL);                // fan - ucu (motor B şeridi) -> transistör kolektörü
    b.wire("bb.e18", "bb.B-18", BLK);               // emitör -> GND
    b.plug("d17", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.wire("uno.D9", "bb.e21", GRN);                // direncin diğer ucu <- D9
  },
  sim: { runMs: 12000, sampleMs: 50, events: [
    { t: 3000, set: { dht1: { tempC: 24 } } }, { t: 6000, set: { dht1: { tempC: 28 } } }, { t: 8000, set: { dht1: { tempC: 26 } } }, { t: 10000, set: { dht1: { tempC: 31 } } } ] },
  shoot: { actions: [{ wait: 2500 }], settleMs: 300, hideFlybackFrame: true },
};
export default p;
