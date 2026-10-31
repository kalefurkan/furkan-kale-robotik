import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 77 - Otomatik Akvaryum Kontrolü: röle a2(C1) a3(C2) a4(COM) a5(NO) a6(NC); bobin diyodu A c3 -> K c7 (K -> 5V); NPN a12(C) a13(B) a14(E) + 1 kΩ d13->d17 (D7);
// pompa NPN a18(C) a19(B) a20(E) + 1 kΩ d19->d23 (D5), ters diyot A c18 -> K c22 (K -> 6 V +); DS18B20 a26(GND) a27(DQ) a28(VDD) + 4,7 kΩ dikey e27->h27
// ısıtıcı (ampul), pompa (DC motor) ve 6 V kaynak breadboard dışında
const p: Project = {
  id: "otomatik-akvaryum-kontrolu",
  sketch: "akvaryum",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a2", { id: "rl1", type: "relay", pin: "C1" });
    b.wire("bb.e2", "bb.B+2", RED);
    b.plug("c3", { id: "d1", type: "diode", pin: "A" });
    b.wire("bb.e7", "bb.B+7", RED);
    b.plug("a12", { id: "q1", type: "npn", pin: "C" });
    b.wire("bb.e12", "bb.e3", YEL);
    b.wire("bb.e14", "bb.B-14", BLK);
    b.plug("d13", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.wire("uno.D7", "bb.e17", GRN);
    b.free("heat1", "bulb", 560, 330);
    b.wire("bb.e4", "bb.B+4", RED);
    b.wire("bb.e5", "heat1.A", WHT);
    b.wire("heat1.B", "bb.B-5", BLK);
    b.plug("a18", { id: "q2", type: "npn", pin: "C" });
    b.plug("d19", { id: "r2", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("c18", { id: "d2", type: "diode", pin: "A" });
    b.wire("uno.D5", "bb.e23", ORG);
    b.wire("bb.e20", "bb.B-20", BLK);
    b.free("psu1", "psu", 330, 330, { volts: 6 });
    b.free("pump1", "dcmotor", 700, 330);
    b.wire("bb.e18", "pump1.B", YEL);
    b.wire("bb.e22", "pump1.A", ORG);
    b.wire("bb.a22", "psu1.P", ORG);
    b.wire("psu1.N", "bb.B-8", BLK);
    b.plug("a26", { id: "ds1", type: "ds18b20", pin: "GND", props: { tempC: 22 } });
    b.plug("e27", { id: "r3", type: "resistor", pin: "A", props: { ohms: 4700 }, rotation: 90 });
    b.wire("uno.D2", "bb.d27", BLU);
    b.wire("bb.e26", "bb.B-25", BLK);
    b.wire("bb.e28", "bb.B+25", RED);
    b.wire("bb.j27", "bb.B+24", RED);
  },
  sim: { runMs: 32000, sampleMs: 20, events: [
    { t: 6000, set: { ds1: { tempC: 25 } } }, { t: 11000, set: { ds1: { tempC: 26.5 } } },
    { t: 17000, set: { ds1: { tempC: 23.5 } } }, { t: 25000, set: { ds1: { tempC: 25.5 } } } ] },
  shoot: { actions: [{ wait: 2500 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
