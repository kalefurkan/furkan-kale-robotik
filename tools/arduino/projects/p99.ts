import { Builder, Project, l298Block, RED, BLK, YEL, GRN, BLU, ORG, WHT } from "../lib";
// 99 - Robotik Haritalama ve Navigasyon: L298N bloğu (a4..a16, 8 V, enkoderli motorlar serbest) + MPU6050 a20(VCC) a21(GND) a22(SCL) a23(SDA) + TFmini a26(VCC) a27(GND) a28(TX -> D12) a29(RX <- D13)
const p: Project = {
  id: "robotik-haritalama-ve-navigasyon-sistemi",
  sketch: "harita_robot",
  build(b: Builder) {
    l298Block(b, 8, "encmotor");
    b.plug("a20", { id: "mpu1", type: "mpu6050", pin: "VCC", props: { roll: 0 } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("uno.A5", "bb.e22", YEL);
    b.wire("uno.A4", "bb.e23", GRN);
    b.plug("a26", { id: "lid1", type: "tfmini", pin: "VCC", props: { distanceCm: 150, lidarBaud: 9600 } });
    b.wire("bb.e26", "bb.B+24", RED);
    b.wire("bb.e27", "bb.B-24", BLK);
    b.wire("uno.D12", "bb.e28", WHT);
    b.wire("uno.D13", "bb.e29", ORG);
    b.wire("bb.B+22", "m1.VCC", RED);
    b.wire("bb.B-22", "m1.GND", BLK);
    b.wire("uno.D2", "m1.ENCA", BLU);
    b.wire("uno.D4", "m1.ENCB", ORG);
    b.wire("bb.B+23", "m2.VCC", RED);
    b.wire("bb.B-23", "m2.GND", BLK);
    b.wire("uno.D3", "m2.ENCA", BLU);
    b.wire("uno.D11", "m2.ENCB", ORG);
  },
  sim: { runMs: 22000, sampleMs: 20, events: [
    { t: 0, set: { lid1: { distanceCm: 150 } } },
    { t: 3500, set: { lid1: { distanceCm: 35 } } }, { t: 3700, set: { mpu1: { gyroZ: 90 } } }, { t: 4300, set: { lid1: { distanceCm: 120 } } }, { t: 4900, set: { mpu1: { gyroZ: 0 } } },
    { t: 8000, set: { lid1: { distanceCm: 30 } } }, { t: 8200, set: { mpu1: { gyroZ: 90 } } }, { t: 8700, set: { lid1: { distanceCm: 90 } } }, { t: 9400, set: { mpu1: { gyroZ: 0 } } },
    { t: 12000, set: { lid1: { distanceCm: 25 } } } ] },
  shoot: { actions: [{ wait: 3000 }], settleMs: 200 },
};
export default p;
