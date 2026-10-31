import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 42 - Bluetooth Kontrollü Robot Araba: L298N a4..a16 (12V GND 5V ENA IN1 IN2 IN3 IN4 ENB OUT1..OUT4); HC-05 a20..a23 + gerilim bölücü (1 kΩ d23->d27, 2 kΩ dikey e23->h23)
// 6 V güç kaynağı (L298N kartındaki 5V jumper'ı çıkarılmış; mantık 5V'u Arduino'dan: e6 -> artı rayı) ve iki DC motor breadboard dışında; GND ortak: e5 <- PSU -, d5 -> eksi rayı
const p: Project = {
  id: "bluetooth-kontrollu-robot-araba",
  sketch: "bt_araba",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "drv1", type: "l298n", pin: "V12" });
    b.free("psu1", "psu", 330, 330, { volts: 6 });
    b.free("m1", "dcmotor", 560, 330);
    b.free("m2", "dcmotor", 700, 330);
    b.wire("bb.e4", "psu1.P", ORG);
    b.wire("bb.e5", "psu1.N", BLK);
    b.wire("bb.d5", "bb.B-5", BLK);
    b.wire("bb.e6", "bb.B+4", RED);
    b.wire("uno.D5", "bb.e7", GRN);
    b.wire("uno.D7", "bb.e8", YEL);
    b.wire("uno.D8", "bb.e9", BLU);
    b.wire("uno.D9", "bb.e10", WHT);
    b.wire("uno.D10", "bb.e11", ORG);
    b.wire("uno.D6", "bb.e12", GRN);
    b.wire("bb.e13", "m1.A", YEL);
    b.wire("bb.e14", "m1.B", BLK);
    b.wire("bb.e15", "m2.A", YEL);
    b.wire("bb.e16", "m2.B", BLK);
    b.plug("a20", { id: "bt1", type: "hc05", pin: "VCC", props: { btText: "F" } });
    b.wire("bb.e20", "bb.B+19", RED);
    b.wire("bb.e21", "bb.B-20", BLK);
    b.wire("bb.e22", "uno.D2", BLU);
    b.plug("d23", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.plug("e23", { id: "r2", type: "resistor", pin: "A", props: { ohms: 2000 }, rotation: 90 });
    b.wire("bb.e27", "uno.D3", GRN);
    b.wire("bb.j23", "bb.B-23", BLK);
  },
  sim: { runMs: 12000, sampleMs: 20, events: [
    { t: 1500, set: { bt1: { btText: "F", btSeq: 1 } } },
    { t: 3000, set: { bt1: { btText: "L", btSeq: 2 } } },
    { t: 4500, set: { bt1: { btText: "R", btSeq: 3 } } },
    { t: 6000, set: { bt1: { btText: "B", btSeq: 4 } } },
    { t: 7500, set: { bt1: { btText: "S", btSeq: 5 } } },
    { t: 8500, set: { bt1: { btText: "5", btSeq: 6 } } },
    { t: 9500, set: { bt1: { btText: "F", btSeq: 7 } } },
    { t: 11000, set: { bt1: { btText: "S", btSeq: 8 } } } ] },
  shoot: { actions: [{ select: "bt1" }, { fill: { placeholder: "örn. 1 ya da LED_ON", text: "F" } }, { clickText: "Telefondan gönder" }, { waitText: "ILERI" }, { wait: 500 }], settleMs: 200 },
};
export default p;
