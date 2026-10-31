import { Builder, Project, lcdBlock, RED, BLK, GRN, BLU } from "../lib";
// 50 - GPS Konum Takip Sistemi: LCD bloğu (a2..a13) + NEO-6M a21(VCC) a22(GND) a23(TX -> D8) a24(RX <- D9)
const p: Project = {
  id: "gps-konum-takip-sistemi",
  sketch: "gps_takip",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a21", { id: "gps1", type: "neo6m", pin: "VCC", props: { lat: 41.0082, lon: 28.9784, altM: 40, speedKmh: 0, sats: 7, fix: true } });
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("bb.e22", "bb.B-20", BLK);
    b.wire("bb.e23", "uno.D8", GRN);
    b.wire("bb.e24", "uno.D9", BLU);
  },
  sim: { runMs: 18000, sampleMs: 50, events: [
    { t: 5000, set: { gps1: { lat: 39.9208, lon: 32.8541, altM: 938, speedKmh: 36, sats: 9 } } },
    { t: 9000, set: { gps1: { fix: false } } }, { t: 13000, set: { gps1: { fix: true, lat: 38.4237, lon: 27.1428, altM: 25, speedKmh: 12, sats: 8 } } } ] },
  shoot: { actions: [{ waitText: "uydu=7" }, { wait: 300 }], settleMs: 100, startWaitMs: 200 },
};
export default p;
