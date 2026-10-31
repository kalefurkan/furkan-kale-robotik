import { Builder, Project, RED, BLU, YEL, BLK } from "../lib";
// 16 - Dokunmatik LED Kontrolü: TTP223 c10(VCC) c11(OUT) c12(GND); LED c18/c19, 220 Ω d19->d23
const p: Project = {
  id: "dokunmatik-led-kontrolu",
  sketch: "dokunmatik_led",
  build(b: Builder) {
    b.plug("c10", { id: "tp1", type: "ttp223", pin: "VCC", props: { touched: true } });
    b.ledRes("led1", 18, "green", 220, "r1");
    b.wire("uno.5V", "bb.e10", RED);
    b.wire("uno.D2", "bb.e11", BLU);
    b.wire("bb.e12", "uno.GND3", BLK);
    b.wire("uno.D8", "bb.e18", YEL);
    b.wire("bb.e23", "uno.GND2", BLK);
  },
  sim: { runMs: 3000, sampleMs: 50, events: [{ t: 500, set: { tp1: { touched: false } } }, { t: 1500, set: { tp1: { touched: true } } }, { t: 2300, set: { tp1: { touched: false } } }] },
};
export default p;
