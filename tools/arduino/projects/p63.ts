import { Builder, Project, l298Block, RED, BLK, BLU, YEL, GRN } from "../lib";
// 63 - Bluetooth Kontrollü Akıllı Robot: L298N bloğu (a4..a16); HC-05 a17(VCC) a18(GND) a19(TXD) a20(RXD) + bölücü 1 kΩ d20->d24, 2 kΩ dikey e20->h20; HC-SR04 a26(VCC) a27(TRIG) a28(ECHO) a29(GND)
const p: Project = {
  id: "bluetooth-kontrollu-akilli-robot",
  sketch: "bt_akilli_robot",
  build(b: Builder) {
    l298Block(b);
    b.plug("a17", { id: "bt1", type: "hc05", pin: "VCC", props: { btText: "F" } });
    b.wire("bb.e17", "bb.B+16", RED);
    b.wire("bb.e18", "bb.B-17", BLK);
    b.wire("bb.e19", "uno.D2", BLU);
    b.plug("d20", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("e20", { id: "r2", type: "resistor", pin: "A", props: { ohms: 2000 }, rotation: 90 });
    b.wire("bb.e24", "uno.D3", GRN);
    b.wire("bb.j20", "bb.B-20", BLK);
    b.plug("a26", { id: "us1", type: "hcsr04", pin: "VCC", props: { distanceCm: 100 } });
    b.wire("bb.e26", "bb.B+24", RED);
    b.wire("uno.D4", "bb.e27", YEL);
    b.wire("uno.D11", "bb.e28", GRN);
    b.wire("bb.e29", "bb.B-25", BLK);
  },
  sim: { runMs: 11000, sampleMs: 20, events: [
    { t: 1500, set: { bt1: { btText: "F", btSeq: 1 } } },
    { t: 3000, set: { us1: { distanceCm: 10 } } },
    { t: 4500, set: { bt1: { btText: "B", btSeq: 2 } } },
    { t: 5500, set: { us1: { distanceCm: 100 } } },
    { t: 6000, set: { bt1: { btText: "F", btSeq: 3 } } },
    { t: 7500, set: { bt1: { btText: "D", btSeq: 4 } } },
    { t: 9000, set: { bt1: { btText: "S", btSeq: 5 } } } ] },
  shoot: { actions: [{ select: "bt1" }, { fill: { placeholder: "örn. 1 ya da LED_ON", text: "F" } }, { clickText: "Telefondan gönder" }, { waitText: "Komut: F" }, { wait: 500 }], settleMs: 200 },
};
export default p;
