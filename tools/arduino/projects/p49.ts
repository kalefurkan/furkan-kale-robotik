import { Builder, Project, lcdBlock, RED, BLK, BLU, GRN, YEL } from "../lib";
// 49 - Alarm Saat: LCD bloğu (a2..a13) + DS3231 a21(VCC) a22(GND) a23(SCL -> A5) a24(SDA -> A4) + aktif buzzer c27(+) c28(-)
const p: Project = {
  id: "alarm-saat",
  sketch: "alarm_saat",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a21", { id: "rtc1", type: "ds3231", pin: "VCC", props: { rtcTime: "2025-06-02T07:59:50", tempC: 25 } });
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("bb.e22", "bb.B-20", BLK);
    b.wire("uno.A5", "bb.e23", GRN);
    b.wire("uno.A4", "bb.e24", BLU);
    b.plug("c27", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D8", "bb.e27", YEL);
    b.wire("bb.e28", "bb.B-25", BLK);
  },
  sim: { runMs: 24000, sampleMs: 20 },
  shoot: { actions: [{ waitText: "ALARM!" }, { wait: 300 }], settleMs: 50, startWaitMs: 200 },
};
export default p;
