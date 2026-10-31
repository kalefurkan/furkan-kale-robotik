import { Builder, Project, l298Block, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 81 - GPS Destekli Otonom Araç: L298N bloğu (a4..a16) + NEO-6M a20(VCC) a21(GND) a22(TX -> D2) a23(RX <- D3) + HMC5883L a26(VCC) a27(GND) a28(SCL -> A5) a29(SDA -> A4)
const p: Project = {
  id: "gps-destekli-otonom-arac",
  sketch: "gps_arac",
  build(b: Builder) {
    l298Block(b);
    b.plug("a20", { id: "gps1", type: "neo6m", pin: "VCC", props: { lat: 41.0082, lon: 28.9784, speedKmh: 0, sats: 8, fix: true } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("uno.D2", "bb.e22", YEL);
    b.wire("uno.D3", "bb.e23", GRN);
    b.plug("a26", { id: "hmc1", type: "hmc5883l", pin: "VCC", props: { heading: 30 } });
    b.wire("bb.e26", "bb.B+24", RED);
    b.wire("bb.e27", "bb.B-25", BLK);
    b.wire("uno.A5", "bb.e28", BLU);
    b.wire("uno.A4", "bb.e29", ORG);
  },
  sim: { runMs: 20000, sampleMs: 20, events: [
    { t: 0, set: { hmc1: { heading: 0 } } },
    { t: 6000, set: { hmc1: { heading: 30 } } },
    { t: 10000, set: { gps1: { lat: 41.00885, lon: 28.97885 } } },
    { t: 12500, set: { hmc1: { heading: 110 } } },
    { t: 14000, set: { gps1: { lat: 41.00899, lon: 28.97899 } } },
    { t: 17000, set: { hmc1: { heading: 345 } } } ] },
  shoot: { actions: [{ waitText: "ileri" }, { wait: 400 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
