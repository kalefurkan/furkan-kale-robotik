import { Builder, Project, l298Block, RED, BLK, YEL } from "../lib";
// 64 - Uzaktan Kumandalı Robot: L298N bloğu (a4..a16) + IR alıcı a20(OUT) a21(GND) a22(VCC)
const p: Project = {
  id: "uzaktan-kumandali-robot",
  sketch: "ir_robot",
  build(b: Builder) {
    l298Block(b);
    b.plug("a20", { id: "ir1", type: "irreceiver", pin: "OUT", props: { irButton: "2" } });
    b.wire("uno.D2", "bb.e20", YEL);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("bb.e22", "bb.B+20", RED);
  },
  sim: { runMs: 11000, sampleMs: 20, events: [
    { t: 1000, set: { ir1: { irButton: "2", irSeq: 1 } } },
    { t: 2500, set: { ir1: { irButton: "4", irSeq: 2 } } },
    { t: 4000, set: { ir1: { irButton: "6", irSeq: 3 } } },
    { t: 5000, set: { ir1: { irButton: "8", irSeq: 4 } } },
    { t: 6000, set: { ir1: { irButton: "VOL+", irSeq: 5 } } },
    { t: 7000, set: { ir1: { irButton: "2", irSeq: 6 } } },
    { t: 8000, set: { ir1: { irButton: "7", irSeq: 7 } } },
    { t: 9000, set: { ir1: { irButton: "5", irSeq: 8 } } } ] },
  shoot: { actions: [{ select: "ir1" }, { clickText: "Kumandada tuşa bas" }, { waitText: "ILERI" }, { wait: 500 }], settleMs: 200 },
};
export default p;
