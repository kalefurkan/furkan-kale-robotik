import { Builder, Project, l298Block, RED, BLK, YEL, GRN, BLU, ORG } from "../lib";
// 70 - 2 Tekerlekli Otonom Robot: L298N bloğu (a4..a16, 8 V güç kaynağı, enkoderli motorlar breadboard dışında) + MPU6050 a20(VCC) a21(GND) a22(SCL) a23(SDA)
const p: Project = {
  id: "2-tekerlekli-otonom-robot",
  sketch: "otonom_robot",
  build(b: Builder) {
    l298Block(b, 8, "encmotor");
    b.plug("a20", { id: "mpu1", type: "mpu6050", pin: "VCC", props: { roll: 0 } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("uno.A5", "bb.e22", YEL);
    b.wire("uno.A4", "bb.e23", GRN);
    b.wire("bb.B+22", "m1.VCC", RED);
    b.wire("bb.B-22", "m1.GND", BLK);
    b.wire("uno.D2", "m1.ENCA", BLU);
    b.wire("uno.D4", "m1.ENCB", ORG);
    b.wire("bb.B+24", "m2.VCC", RED);
    b.wire("bb.B-24", "m2.GND", BLK);
    b.wire("uno.D3", "m2.ENCA", BLU);
    b.wire("uno.D11", "m2.ENCB", ORG);
  },
  sim: { runMs: 14500, sampleMs: 20, events: [
    { t: 3300, set: { mpu1: { gyroZ: 90 } } },
    { t: 4420, set: { mpu1: { gyroZ: 0 } } },
    { t: 5900, set: { mpu1: { gyroZ: 90 } } },
    { t: 7020, set: { mpu1: { gyroZ: 0 } } },
    { t: 8500, set: { mpu1: { gyroZ: 90 } } },
    { t: 9620, set: { mpu1: { gyroZ: 0 } } },
    { t: 11100, set: { mpu1: { gyroZ: 90 } } },
    { t: 12220, set: { mpu1: { gyroZ: 0 } } } ] },
  shoot: { actions: [{ wait: 4000 }], settleMs: 200 },
};
export default p;
