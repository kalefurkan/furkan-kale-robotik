import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG } from "../lib";
// 41 - Bluetooth Kontrollü LED: HC-05 a14(VCC) a15(GND) a16(TXD) a17(RXD); gerilim bölücü: 1 kΩ d17->d21, 2 kΩ dikey e17->h17; LED c4/c5 + 220 Ω d5->d9
const p: Project = {
  id: "bluetooth-kontrollu-led",
  sketch: "bt_led",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.ledRes("led1", 4, "green", 220, "r1");
    b.wire("uno.D8", "bb.e4", YEL);
    b.wire("bb.e9", "bb.B-7", BLK);
    b.plug("a14", { id: "bt1", type: "hc05", pin: "VCC", props: { btText: "1" } });
    b.wire("bb.e14", "bb.B+12", RED);
    b.wire("bb.e15", "bb.B-13", BLK);
    b.wire("bb.e16", "uno.D10", BLU);
    b.plug("d17", { id: "r2", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("e17", { id: "r3", type: "resistor", pin: "A", props: { ohms: 2000 }, rotation: 90 });
    b.wire("bb.e21", "uno.D11", GRN);
    b.wire("bb.j17", "bb.B-15", BLK);
  },
  sim: { runMs: 6000, sampleMs: 20, events: [
    { t: 1500, set: { bt1: { btText: "1", btSeq: 1 } } },
    { t: 3000, set: { bt1: { btText: "0", btSeq: 2 } } },
    { t: 4200, set: { bt1: { btText: "7", btSeq: 3 } } },
    { t: 5000, set: { bt1: { btText: "1", btSeq: 4 } } } ] },
  shoot: { actions: [{ select: "bt1" }, { fill: { placeholder: "örn. 1 ya da LED_ON", text: "1" } }, { clickText: "Telefondan gönder" }, { waitText: "LED ACIK" }, { wait: 400 }], settleMs: 200 },
};
export default p;
