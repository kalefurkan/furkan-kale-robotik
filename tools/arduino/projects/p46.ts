import { Builder, Project, lcdBlock, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 46 - RFID Personel Giriş Sistemi: LCD bloğu (a2..a13; RS D2, E D3, D4..D7 -> D4..D7) + RC522 a20(3V3) a21(RST) a22(GND) a23(MISO) a24(MOSI) a25(SCK) a26(SDA) + aktif buzzer c28(+) c29(-)
const p: Project = {
  id: "rfid-personel-giris-sistemi",
  sketch: "rfid_personel",
  build(b: Builder) {
    lcdBlock(b, { rs: "D2", e: "D3", d: ["D4", "D5", "D6", "D7"] });
    b.plug("a20", { id: "rc1", type: "rc522", pin: "3V3", props: { cardUid: "A1B2C3D4", cardPresent: true } });
    b.wire("uno.3V3", "bb.e20", ORG);
    b.wire("uno.D9", "bb.e21", YEL);
    b.wire("bb.e22", "bb.B-20", BLK);
    b.wire("uno.D12", "bb.e23", GRN);
    b.wire("uno.D11", "bb.e24", BLU);
    b.wire("uno.D13", "bb.e25", WHT);
    b.wire("uno.D10", "bb.e26", YEL);
    b.plug("c28", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D8", "bb.e28", GRN);
    b.wire("bb.e29", "bb.B-25", BLK);
  },
  sim: { runMs: 14000, sampleMs: 20, events: [
    { t: 0, set: { rc1: { cardPresent: false } } },
    { t: 1500, set: { rc1: { cardPresent: true } } }, { t: 3500, set: { rc1: { cardPresent: false } } },
    { t: 4500, set: { rc1: { cardUid: "5A6B7C8D", cardPresent: true } } }, { t: 6500, set: { rc1: { cardPresent: false } } },
    { t: 7500, set: { rc1: { cardUid: "99887766", cardPresent: true } } }, { t: 10000, set: { rc1: { cardPresent: false } } } ] },
  shoot: { actions: [{ waitText: "Ahmet" }, { wait: 450 }], settleMs: 100, startWaitMs: 200 },
};
export default p;
