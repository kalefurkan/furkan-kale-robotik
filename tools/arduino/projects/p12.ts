import { Builder, Project, YEL, BLK, BLU, GRN } from "../lib";
// 12 - Reaksiyon Hız Testi: LED c4/c5 + 220 Ω d5->d9; buton c14/c16; aktif buzzer c22(+)/c23(-)
const p: Project = {
  id: "reaksiyon-hiz-testi",
  sketch: "reaksiyon",
  build(b: Builder) {
    b.ledRes("led1", 4, "red", 220, "r1");
    b.plug("c14", { id: "btn1", type: "button", pin: "A" });
    b.plug("c22", { id: "bz1", type: "buzzer", pin: "P" });
    b.wire("uno.D8", "bb.e4", YEL);
    b.wire("bb.e9", "uno.GND2", BLK);
    b.wire("uno.D2", "bb.e14", BLU);
    b.wire("bb.e16", "uno.GND3", BLK);
    b.wire("uno.D9", "bb.e22", GRN);
    b.wire("bb.e23", "uno.GND1", BLK);
  },
  sim: { runMs: 22000, sampleMs: 20, events: [
    { t: 6500, set: { btn1: { pressed: true } } }, { t: 7000, set: { btn1: { pressed: false } } },
    { t: 10000, set: { btn1: { pressed: true } } }, { t: 10600, set: { btn1: { pressed: false } } },
    { t: 17500, set: { btn1: { pressed: true } } }, { t: 18000, set: { btn1: { pressed: false } } } ] },
  shoot: { actions: [{ waitText: "BAS!", timeout: 15000 }, { wait: 250 }, { down: "btn1" }, { wait: 120 }], settleMs: 0 },
};
export default p;
