import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 82 - Otonom Depo Robotu: L298N a4..a16 (ENA D5, IN1 D7, IN2 D8, IN3 D9, IN4 D4, ENB D6); RC522 a17(3V3) a18(RST -> D3) a19(GND) a20(MISO) a21(MOSI) a22(SCK) a23(SDA -> D10);
// 5 kanallı IR dizisi (serbest, breadboard dışında): VCC/GND rayda, OUT1 D2, OUT2..OUT5 A0..A3. 6 V güç kaynağı + 2 motor breadboard dışında.
const p: Project = {
  id: "otonom-depo-robotu",
  sketch: "depo_robotu",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "drv1", type: "l298n", pin: "V12" });
    b.free("psu1", "psu", 330, 330, { volts: 6 });
    b.free("m1", "dcmotor", 560, 330);
    b.free("m2", "dcmotor", 700, 330);
    b.wire("bb.e4", "psu1.P", ORG);
    b.wire("bb.e5", "psu1.N", BLK);
    b.wire("bb.d5", "bb.B-5", BLK);
    b.wire("bb.e6", "bb.B+4", RED);
    b.wire("uno.D5", "bb.e7", GRN);
    b.wire("uno.D7", "bb.e8", YEL);
    b.wire("uno.D8", "bb.e9", BLU);
    b.wire("uno.D9", "bb.e10", WHT);
    b.wire("uno.D4", "bb.e11", ORG);
    b.wire("uno.D6", "bb.e12", GRN);
    b.wire("bb.e13", "m1.A", YEL);
    b.wire("bb.e14", "m1.B", BLK);
    b.wire("bb.e15", "m2.A", YEL);
    b.wire("bb.e16", "m2.B", BLK);
    b.plug("a17", { id: "rc1", type: "rc522", pin: "3V3", props: { cardUid: "A1B2C3D4", cardPresent: true } });
    b.wire("uno.3V3", "bb.e17", ORG);
    b.wire("uno.D3", "bb.e18", YEL);
    b.wire("bb.e19", "bb.B-17", BLK);
    b.wire("uno.D12", "bb.e20", GRN);
    b.wire("uno.D11", "bb.e21", BLU);
    b.wire("uno.D13", "bb.e22", WHT);
    b.wire("uno.D10", "bb.e23", YEL);
    b.free("ir1", "irarray", 420, 470, { lineBits: 4 });
    b.wire("ir1.VCC", "bb.B+10", RED);
    b.wire("ir1.GND", "bb.B-10", BLK);
    b.wire("uno.D2", "ir1.OUT1", YEL);
    b.wire("uno.A0", "ir1.OUT2", GRN);
    b.wire("uno.A1", "ir1.OUT3", BLU);
    b.wire("uno.A2", "ir1.OUT4", ORG);
    b.wire("uno.A3", "ir1.OUT5", WHT);
  },
  sim: { runMs: 22000, sampleMs: 20, events: [
    { t: 0, set: { rc1: { cardPresent: false } } },
    { t: 3000, set: { ir1: { lineBits: 2 } } }, { t: 4500, set: { ir1: { lineBits: 4 } } },
    { t: 6000, set: { rc1: { cardUid: "A1B2C3D4", cardPresent: true } } }, { t: 7500, set: { rc1: { cardPresent: false } } },
    { t: 9000, set: { rc1: { cardUid: "5A6B7C8D", cardPresent: true } } }, { t: 10500, set: { rc1: { cardPresent: false } } },
    { t: 15000, set: { ir1: { lineBits: 0 } } }, { t: 16000, set: { ir1: { lineBits: 8 } } },
    { t: 17500, set: { rc1: { cardUid: "11223344", cardPresent: true } } }, { t: 18500, set: { rc1: { cardPresent: false } } },
    { t: 19000, set: { rc1: { cardUid: "99887766", cardPresent: true } } }, { t: 20500, set: { rc1: { cardPresent: false } } } ] },
  shoot: { actions: [{ waitText: "Raf 1" }, { wait: 400 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
