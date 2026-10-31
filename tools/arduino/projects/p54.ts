import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 54 - Ses Kontrollü Işık Sistemi: röle a2(C1) a3(C2) a4(COM) a5(NO) a6(NC); bobin diyodu A c3 -> K c7 (K -> 5V); NPN a12(C) a13(B) a14(E) + 1 kΩ d13->d17 (D7); ses sensörü a20(VCC) a21(GND) a22(AO -> A0) a23(DO -> D3)
// ampul (breadboard dışında): 5V -> COM, NO -> ampul A, ampul B -> GND
const p: Project = {
  id: "ses-kontrollu-isik-sistemi",
  sketch: "ses_isik",
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
    b.plug("a20", { id: "snd1", type: "soundsensor", pin: "VCC", props: { sound: 0.9 } });
    b.wire("bb.e20", "bb.B+18", RED);
    b.wire("bb.e21", "bb.B-19", BLK);
    b.wire("uno.A0", "bb.e22", BLU);
    b.wire("uno.D3", "bb.e23", ORG);
    b.free("lamp1", "bulb", 560, 330);
    b.wire("bb.e4", "bb.B+4", RED);
    b.wire("bb.e5", "lamp1.A", WHT);
    b.wire("lamp1.B", "bb.B-5", BLK);
  },
  sim: { runMs: 9000, sampleMs: 20, events: [
    { t: 0, set: { snd1: { sound: 0.1 } } },
    { t: 2000, set: { snd1: { sound: 0.9 } } }, { t: 2300, set: { snd1: { sound: 0.1 } } },
    { t: 3500, set: { snd1: { sound: 0.3 } } },
    { t: 4500, set: { snd1: { sound: 0.9 } } }, { t: 4800, set: { snd1: { sound: 0.1 } } },
    { t: 5200, set: { snd1: { sound: 0.9 } } }, { t: 5400, set: { snd1: { sound: 0.1 } } },
    { t: 7000, set: { snd1: { sound: 0.9 } } }, { t: 7300, set: { snd1: { sound: 0.1 } } } ] },
  shoot: { actions: [{ waitText: "ACIK" }, { wait: 400 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
