import { Builder, Project, RED, BLU, YEL, GRN, ORG, BLK, WHT } from "../lib";
// 20 - Mini Elektronik Sayaç: LCD pinleri a2..a13 (VSS..K); wire'lar e satırından. Topraklar B-, 5V B+ rayına. Buton c20/c22.
const p: Project = {
  id: "mini-elektronik-sayac",
  sketch: "sayac",
  build(b: Builder) {
    b.plug("a2", { id: "lcd1", type: "lcd16x2", pin: "VSS" });
    b.plug("d12", { id: "r1", type: "resistor", pin: "A", props: { ohms: 220 } }); // arka ışık direnci (A -> 5V)
    b.plug("c20", { id: "btn1", type: "button", pin: "A" });
    // güç rayları
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.wire("bb.e2", "bb.B-2", BLK);    // VSS -> GND
    b.wire("bb.e3", "bb.B+3", RED);    // VDD -> 5V
    b.wire("bb.e4", "bb.B-4", BLK);    // V0 -> GND (en büyük kontrast)
    b.wire("bb.e6", "bb.B-6", BLK);    // RW -> GND
    b.wire("bb.e13", "bb.B-13", BLK);  // K -> GND
    b.wire("bb.e16", "bb.B+16", RED);  // direnç ucu -> 5V (A üzerinden arka ışık)
    // veri/kontrol
    b.wire("uno.D12", "bb.e5", YEL);   // RS
    b.wire("uno.D11", "bb.e7", GRN);   // E
    b.wire("uno.D5", "bb.e8", BLU);    // D4
    b.wire("uno.D4", "bb.e9", ORG);    // D5
    b.wire("uno.D3", "bb.e10", WHT);   // D6
    b.wire("uno.D2", "bb.e11", YEL);   // D7
    // buton
    b.wire("uno.D7", "bb.e20", BLU);
    b.wire("bb.e22", "bb.B-20", BLK);
  },
  sim: { runMs: 3000, sampleMs: 50, events: [0, 1, 2, 3, 4].flatMap((i) => [{ t: 500 + i * 400, set: { btn1: { pressed: true } } }, { t: 650 + i * 400, set: { btn1: { pressed: false } } }]) },
  shoot: { actions: [{ presses: { id: "btn1", n: 7, hold: 90, gap: 200 } }], settleMs: 400 },
};
export default p;
