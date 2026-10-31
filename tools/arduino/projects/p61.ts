import { Builder, Project, l298Block, RED, BLK, YEL, GRN, BLU, ORG, WHT } from "../lib";
// 61 - Çizgi İzleyen Robot: L298N bloğu (a4..a16) + 5 kanallı IR dizisi a20(VCC) a21(GND) a22..a26(OUT1..OUT5)
const p: Project = {
  id: "cizgi-izleyen-robot",
  sketch: "cizgi_izleyen",
  build(b: Builder) {
    l298Block(b);
    b.plug("a20", { id: "ir1", type: "irarray", pin: "VCC", props: { lineBits: 2 } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("uno.D2", "bb.e22", YEL);
    b.wire("uno.D3", "bb.e23", GRN);
    b.wire("uno.D4", "bb.e24", BLU);
    b.wire("uno.D11", "bb.e25", ORG);
    b.wire("uno.D12", "bb.e26", WHT);
  },
  sim: { runMs: 11000, sampleMs: 20, events: [
    { t: 1500, set: { ir1: { lineBits: 4 } } },
    { t: 3000, set: { ir1: { lineBits: 1 } } },
    { t: 4500, set: { ir1: { lineBits: 8 } } },
    { t: 6000, set: { ir1: { lineBits: 16 } } },
    { t: 7500, set: { ir1: { lineBits: 0 } } },
    { t: 9000, set: { ir1: { lineBits: 6 } } } ] },
  shoot: { actions: [{ wait: 1200 }], settleMs: 200 },
};
export default p;
