import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 45 - RFID Kartlı Kapı Sistemi: RC522 a4(3V3) a5(RST) a6(GND) a7(MISO) a8(MOSI) a9(SCK) a10(SDA); servo d14(SIG) d15(VCC) d16(GND)
// 3,3 V doğrudan Uno 3V3 -> e4 (RC522 yalnızca 3,3 V ile beslenir)
const p: Project = {
  id: "rfid-kartli-kapi-sistemi",
  sketch: "rfid_kapi",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "rc1", type: "rc522", pin: "3V3", props: { cardUid: "A1B2C3D4", cardPresent: true } });
    b.wire("uno.3V3", "bb.e4", ORG);
    b.wire("uno.D9", "bb.e5", YEL);
    b.wire("bb.e6", "bb.B-5", BLK);
    b.wire("uno.D12", "bb.e7", GRN);
    b.wire("uno.D11", "bb.e8", BLU);
    b.wire("uno.D13", "bb.e9", WHT);
    b.wire("uno.D10", "bb.e10", YEL);
    b.plug("d14", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("bb.b14", "uno.D6", GRN);
    b.wire("bb.b15", "bb.B+13", RED);
    b.wire("bb.b16", "bb.B-14", BLK);
  },
  sim: { runMs: 16000, sampleMs: 20, events: [
    { t: 0, set: { rc1: { cardPresent: false } } },
    { t: 1500, set: { rc1: { cardPresent: true } } }, { t: 5000, set: { rc1: { cardPresent: false } } },
    { t: 6000, set: { rc1: { cardUid: "11223344", cardPresent: true } } }, { t: 8000, set: { rc1: { cardPresent: false } } },
    { t: 9500, set: { rc1: { cardUid: "A1B2C3D4", cardPresent: true } } }, { t: 13500, set: { rc1: { cardPresent: false } } } ] },
  shoot: { actions: [{ waitText: "kapi acik" }, { wait: 500 }], settleMs: 100, startWaitMs: 200 },
};
export default p;
