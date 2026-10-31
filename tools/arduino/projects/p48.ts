import { Builder, Project, lcdBlock, RED, BLK, BLU, GRN } from "../lib";
// 48 - Gerçek Zamanlı Saat: LCD bloğu (a2..a13) + DS3231 a21(VCC) a22(GND) a23(SCL -> A5) a24(SDA -> A4)
const p: Project = {
  id: "gercek-zamanli-saat",
  sketch: "saat_ds3231",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a21", { id: "rtc1", type: "ds3231", pin: "VCC", props: { rtcTime: "2025-12-31T23:59:50", tempC: 25 } });
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("bb.e22", "bb.B-20", BLK);
    b.wire("uno.A5", "bb.e23", GRN);
    b.wire("uno.A4", "bb.e24", BLU);
  },
  sim: { runMs: 16000, sampleMs: 50, events: [{ t: 6000, set: { rtc1: { tempC: 28.5 } } }] },
  shoot: { actions: [{ wait: 1500 }], settleMs: 100, startWaitMs: 400 },
};
export default p;
