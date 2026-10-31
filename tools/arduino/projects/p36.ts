import { Builder, Project, lcdBlock, BLU, GRN, BLK } from "../lib";
// 36 - Elektronik Kronometre: LCD bloğu + başlat/durdur butonu c20/c22 (D7) + sıfırla butonu c25/c27 (D6); butonların diğer ucu GND rayına
const p: Project = {
  id: "elektronik-kronometre",
  sketch: "kronometre",
  build(b: Builder) {
    lcdBlock(b);
    b.plug("c20", { id: "btn1", type: "button", pin: "A" });
    b.plug("c25", { id: "btn2", type: "button", pin: "A" });
    b.wire("uno.D7", "bb.e20", BLU);
    b.wire("bb.e22", "bb.B-22", BLK);
    b.wire("uno.D6", "bb.e25", GRN);
    b.wire("bb.e27", "bb.B-25", BLK);
  },
  sim: { runMs: 14000, sampleMs: 20, events: [
    { t: 1000, set: { btn1: { pressed: true } } }, { t: 1150, set: { btn1: { pressed: false } } },
    { t: 4300, set: { btn1: { pressed: true } } }, { t: 4450, set: { btn1: { pressed: false } } },
    { t: 6000, set: { btn1: { pressed: true } } }, { t: 6150, set: { btn1: { pressed: false } } },
    { t: 8000, set: { btn1: { pressed: true } } }, { t: 8150, set: { btn1: { pressed: false } } },
    { t: 10000, set: { btn2: { pressed: true } } }, { t: 10150, set: { btn2: { pressed: false } } } ] },
  shoot: { actions: [{ press: "btn1", hold: 120 }, { wait: 3300 }], settleMs: 50 },
};
export default p;
