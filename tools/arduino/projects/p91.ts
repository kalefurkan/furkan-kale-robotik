import { Builder, Project, l298Block, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 91 - Sesle Kontrol Edilen Robot: L298N bloğu (a4..a16) + ses tanıma modülü a20(VCC) a21(GND) a22(TX -> D2) a23(RX <- D3)
const cmd = (t: number, c: number, s: number) => ({ t, set: { vr1: { voiceCmd: c, voiceSeq: s } } });
const p: Project = {
  id: "sesle-kontrol-edilen-robot",
  sketch: "ses_robot",
  build(b: Builder) {
    l298Block(b);
    b.plug("a20", { id: "vr1", type: "voicerec", pin: "VCC", props: { voiceCmd: 1 } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("uno.D2", "bb.e22", YEL);
    b.wire("uno.D3", "bb.e23", GRN);
  },
  sim: { runMs: 16000, sampleMs: 20, events: [cmd(1000, 1, 1), cmd(2500, 3, 2), cmd(4000, 4, 3), cmd(5500, 2, 4), cmd(7000, 5, 5), cmd(8000, 1, 6), cmd(13000, 8, 7)] },
  shoot: { actions: [{ wait: 1500 }, { select: "vr1" }, { clickText: "Söyle" }, { waitText: "Komut" }, { wait: 300 }], settleMs: 100, startWaitMs: 400 },
};
export default p;
