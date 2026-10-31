import { Builder, Project, lcdBlock, RED, BLK, GRN, BLU } from "../lib";
// 40 - Elektronik Pusula: LCD bloğu + HMC5883L a20(VCC) a21(GND) a22(SCL -> A5) a23(SDA -> A4)
const p: Project = {
  id: "elektronik-pusula",
  sketch: "pusula",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a20", { id: "mag1", type: "hmc5883l", pin: "VCC", props: { heading: 135 } });
    b.wire("bb.e20", "bb.B+18", RED);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("uno.A5", "bb.e22", GRN);
    b.wire("uno.A4", "bb.e23", BLU);
  },
  sim: { runMs: 12000, sampleMs: 50, events: [0, 45, 90, 180, 270, 315].map((v, i) => ({ t: 1500 + i * 1500, set: { mag1: { heading: v } } })) },
  shoot: { actions: [{ wait: 1000 }], settleMs: 100 },
};
export default p;
