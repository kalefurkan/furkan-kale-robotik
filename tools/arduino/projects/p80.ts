import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 80 - Otomatik Atık Ayrıştırma Sistemi: TCS3200 a2(VCC) a3(GND) a4(S0) a5(S1) a6(S2) a7(S3) a8(OUT) a9(OE -> GND); IR sensör a14(VCC) a15(GND) a16(OUT -> D2); servo a20(SIG D9) a21 a22
const p: Project = {
  id: "otomatik-atik-ayristirma-sistemi",
  sketch: "atik_ayirma",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a2", { id: "tcs1", type: "tcs3200", pin: "VCC", props: { colorR: 200, colorG: 200, colorB: 200 } });
    b.wire("bb.e2", "bb.B+2", RED);
    b.wire("bb.e3", "bb.B-2", BLK);
    b.wire("uno.D4", "bb.e4", YEL);
    b.wire("uno.D5", "bb.e5", GRN);
    b.wire("uno.D6", "bb.e6", BLU);
    b.wire("uno.D7", "bb.e7", ORG);
    b.wire("uno.D8", "bb.e8", WHT);
    b.wire("bb.e9", "bb.B-3", BLK);
    b.plug("a14", { id: "ir1", type: "irsensor", pin: "VCC", props: { detected: false } });
    b.wire("bb.e14", "bb.B+13", RED);
    b.wire("bb.e15", "bb.B-14", BLK);
    b.wire("uno.D2", "bb.e16", YEL);
    b.plug("a20", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("uno.D9", "bb.e20", GRN);
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("bb.e22", "bb.B-20", BLK);
  },
  sim: { runMs: 18000, sampleMs: 20, events: [
    { t: 3000, set: { tcs1: { colorR: 30, colorG: 40, colorB: 220 }, ir1: { detected: true } } }, { t: 6000, set: { ir1: { detected: false } } },
    { t: 8000, set: { tcs1: { colorR: 30, colorG: 200, colorB: 40 }, ir1: { detected: true } } }, { t: 11000, set: { ir1: { detected: false } } },
    { t: 12000, set: { tcs1: { colorR: 220, colorG: 40, colorB: 40 }, ir1: { detected: true } } }, { t: 15000, set: { ir1: { detected: false } } },
    { t: 15500, set: { tcs1: { colorR: 120, colorG: 120, colorB: 120 }, ir1: { detected: true } } }, { t: 17500, set: { ir1: { detected: false } } } ] },
  shoot: { actions: [{ wait: 1000 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
