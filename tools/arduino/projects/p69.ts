import { Builder, Project, l298Block, RED, BLK, YEL, GRN } from "../lib";
// 69 - Denge Robotu: L298N bloğu (a4..a16) + MPU6050 a20(VCC) a21(GND) a22(SCL -> A5) a23(SDA -> A4); AD0 boş (adres 0x68)
const p: Project = {
  id: "denge-robotu",
  sketch: "denge_robotu",
  build(b: Builder) {
    l298Block(b);
    b.plug("a20", { id: "mpu1", type: "mpu6050", pin: "VCC", props: { roll: 0 } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("uno.A5", "bb.e22", YEL);
    b.wire("uno.A4", "bb.e23", GRN);
  },
  sim: { runMs: 9000, sampleMs: 20, events: [
    { t: 1500, set: { mpu1: { roll: 5 } } }, { t: 3000, set: { mpu1: { roll: -8 } } },
    { t: 4500, set: { mpu1: { roll: 2, gyroX: 20 } } }, { t: 5500, set: { mpu1: { roll: 0, gyroX: 0 } } },
    { t: 7000, set: { mpu1: { roll: 50 } } } ] },
  shoot: { actions: [{ wait: 800 }, { select: "mpu1" }, { slider: { value: 5, index: 0 } }, { wait: 1500 }], settleMs: 200 },
};
export default p;
