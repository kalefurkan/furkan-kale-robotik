import { Builder, Project, RED, BLK, YEL, GRN, ORG, BLU, WHT } from "../lib";
// 73 - Web Tabanlı Akıllı Sulama: ESP-01 a2..a6 (+ bölücü, 3,3 V kaynak breadboard dışında); toprak nemi a12(VCC) a13(OUT -> A0) a14(GND);
// NPN a18(C) a19(B) a20(E) + 1 kΩ d19->d23 (D5); ters diyot A c18 -> K c22 (K -> 6 V +); pompa (DC motor) ve 6 V kaynak breadboard dışında
const p: Project = {
  id: "web-tabanli-akilli-sulama",
  sketch: "web_sulama",
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
    b.plug("a12", { id: "soil1", type: "soil", pin: "VCC", props: { moisture: 0.5 } });
    b.wire("bb.e12", "bb.B+11", RED);
    b.wire("uno.A0", "bb.e13", BLU);
    b.wire("bb.e14", "bb.B-13", BLK);
    b.plug("a18", { id: "q1", type: "npn", pin: "C" });
    b.plug("d19", { id: "r3", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.wire("uno.D5", "bb.e23", WHT);
    b.wire("bb.e20", "bb.B-19", BLK);
    b.free("psu2", "psu", 480, 330, { volts: 6 });
    b.free("pump1", "dcmotor", 700, 330);
    b.plug("c18", { id: "d1", type: "diode", pin: "A" });
    b.wire("bb.e18", "pump1.B", YEL);
    b.wire("bb.e22", "pump1.A", ORG);
    b.wire("bb.a22", "psu2.P", ORG);
    b.wire("psu2.N", "bb.B-8", BLK);
  },
  sim: { runMs: 23000, sampleMs: 20, events: [
    { t: 10000, set: { soil1: { moisture: 0.15 } } },
    { t: 13000, set: { soil1: { moisture: 0.75 } } },
    { t: 16000, set: { soil1: { moisture: 0.1 } } } ] },
  shoot: { actions: [{ wait: 9000 }, { select: "soil1" }, { slider: { value: 0.1, index: 0 } }, { wait: 2500 }], settleMs: 100, startWaitMs: 500 },
};
export default p;
