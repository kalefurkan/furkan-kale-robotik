import { Builder, Project, lcdBlock, RED, BLK, YEL, GRN } from "../lib";
// 59 - Deprem Algılama ve Uyarı: LCD bloğu (a2..a13) + SW-420 a21(VCC) a22(GND) a23(DO -> D6) + aktif buzzer c27(+) c28(-) (D8)
const p: Project = {
  id: "deprem-algilama-ve-uyari",
  sketch: "deprem",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("a21", { id: "vib1", type: "sw420", pin: "VCC" });
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("bb.e22", "bb.B-20", BLK);
    b.wire("uno.D6", "bb.e23", YEL);
    b.plug("c27", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D8", "bb.e27", GRN);
    b.wire("bb.e28", "bb.B-25", BLK);
  },
  // tek darbe (2 sn), sonra 8 hızlı darbe (5 sn); sonra 0,3 sn aralıkla 2 darbe (11 sn)
  sim: { runMs: 16000, sampleMs: 10, events: [
    { t: 2000, set: { vib1: { vibrating: true } } }, { t: 2150, set: { vib1: { vibrating: false } } },
    ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap((i) => [{ t: 5000 + i * 160, set: { vib1: { vibrating: true } } }, { t: 5080 + i * 160, set: { vib1: { vibrating: false } } }]),
    { t: 11000, set: { vib1: { vibrating: true } } }, { t: 11100, set: { vib1: { vibrating: false } } },
    { t: 11400, set: { vib1: { vibrating: true } } }, { t: 11500, set: { vib1: { vibrating: false } } } ] },
  shoot: { actions: [{ wait: 600 }, { select: "vib1" }, ...Array.from({ length: 12 }, () => [{ clickCss: 'button:has-text("Titreşim")' }, { wait: 90 }]).flat(), { waitText: "DEPREM UYARISI" }, { wait: 300 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
