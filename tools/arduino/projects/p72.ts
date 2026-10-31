import { Builder, Project, RED, BLK, YEL, GRN, ORG } from "../lib";
// 72 - İnternet Üzerinden Sensör İzleme: ESP-01 a2(VCC) a3(GND) a4(TX -> D2) a5(RX <- D3 bölücüyle) a6(CH_PD); 1 kΩ d5->d9, 2 kΩ dikey e5->h5; 3,3 V güç kaynağı breadboard dışında; DHT22 a12(VCC) a13(DATA -> D4) a14(GND)
const p: Project = {
  id: "internet-uzerinden-sensor-izleme",
  sketch: "internet_sensor",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a2", { id: "esp1", type: "esp8266", pin: "VCC", props: { wifiUp: true, wifiSsid: "MakersHub" } });
    b.free("psu1", "psu", 330, 330, { volts: 3.3 });
    b.wire("bb.e2", "psu1.P", ORG);
    b.wire("psu1.N", "bb.B-2", BLK);
    b.wire("bb.e3", "bb.B-3", BLK);
    b.wire("uno.D2", "bb.e4", GRN);
    b.plug("d5", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("e5", { id: "r2", type: "resistor", pin: "A", props: { ohms: 2000 }, rotation: 90 });
    b.wire("uno.D3", "bb.e9", YEL);
    b.wire("bb.j5", "bb.B-5", BLK);
    b.wire("uno.3V3", "bb.e6", ORG);
    b.plug("a12", { id: "dht1", type: "dht22", pin: "VCC", props: { tempC: 24.5, humidity: 55 } });
    b.wire("bb.e12", "bb.B+11", RED);
    b.wire("uno.D4", "bb.e13", YEL);
    b.wire("bb.e14", "bb.B-13", BLK);
  },
  sim: { runMs: 27000, sampleMs: 20, events: [
    { t: 16000, set: { dht1: { tempC: 31.2, humidity: 48 } } },
    { t: 22000, set: { dht1: { tempC: -5.5, humidity: 90.5 } } } ] },
  shoot: { actions: [{ wait: 9000 }, { select: "dht1" }, { slider: { value: 31.2, index: 0 } }, { wait: 800 }], settleMs: 100, startWaitMs: 500 },
};
export default p;
