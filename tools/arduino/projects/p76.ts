import { Builder, Project, lcdBlock, RED, BLK, YEL, GRN, BLU, ORG } from "../lib";
// 76 - NFC Kontrollü Erişim Sistemi: LCD bloğu (a2..a13) + PN532 a20(VCC) a21(GND) a22(SDA -> A4) a23(SCL -> A5) a24(IRQ -> D6) a25(RST -> D7)
const p: Project = {
  id: "nfc-kontrollu-erisim-sistemi",
  sketch: "nfc_erisim",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a20", { id: "nfc1", type: "pn532", pin: "VCC", props: { cardUid: "A1B2C3D4", cardPresent: false } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("uno.A4", "bb.e22", GRN);
    b.wire("uno.A5", "bb.e23", YEL);
    b.wire("uno.D6", "bb.e24", BLU);
    b.wire("uno.D7", "bb.e25", ORG);
  },
  sim: { runMs: 13000, sampleMs: 20, events: [
    { t: 3000, set: { nfc1: { cardUid: "A1B2C3D4", cardPresent: true } } }, { t: 4500, set: { nfc1: { cardPresent: false } } },
    { t: 6500, set: { nfc1: { cardUid: "12345678", cardPresent: true } } }, { t: 8000, set: { nfc1: { cardPresent: false } } },
    { t: 9500, set: { nfc1: { cardUid: "DEADBEEF", cardPresent: true } } }, { t: 11000, set: { nfc1: { cardPresent: false } } } ] },
  shoot: { actions: [{ select: "nfc1" }, { clickText: "Kart yok" }, { wait: 800 }], settleMs: 100, startWaitMs: 800 },
};
export default p;
