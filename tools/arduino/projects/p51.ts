import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 51 - Kablosuz Kumandalı LED: NRF24 #1 (kumanda) a2..a8 (GND VCC CE CSN SCK MOSI MISO), NRF24 #2 (alıcı) a12..a18; SPI ve 3,3 V ortak: d satırı atlama kabloları
// buton c21/c23 (D2, GND); LED c25/c26 + 220 Ω d26->d30 (D6)
const p: Project = {
  id: "kablosuz-kumandali-led",
  sketch: "nrf_led",
  build(b: Builder) {
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a2", { id: "nrf1", type: "nrf24", pin: "GND" });
    b.plug("a12", { id: "nrf2", type: "nrf24", pin: "GND" });
    b.wire("bb.e2", "bb.B-2", BLK);
    b.wire("uno.3V3", "bb.e3", ORG);
    b.wire("uno.D7", "bb.e4", YEL);
    b.wire("uno.D8", "bb.e5", GRN);
    b.wire("uno.D13", "bb.e6", WHT);
    b.wire("uno.D11", "bb.e7", BLU);
    b.wire("uno.D12", "bb.e8", RED);
    b.wire("bb.e12", "bb.B-12", BLK);
    b.wire("bb.d3", "bb.d13", ORG);
    b.wire("uno.D9", "bb.e14", YEL);
    b.wire("uno.D10", "bb.e15", GRN);
    b.wire("bb.d6", "bb.d16", WHT);
    b.wire("bb.d7", "bb.d17", BLU);
    b.wire("bb.d8", "bb.d18", RED);
    b.plug("c21", { id: "btn1", type: "button", pin: "A" });
    b.wire("uno.D2", "bb.e21", YEL);
    b.wire("bb.e23", "bb.B-21", BLK);
    b.ledRes("led1", 25, "red", 220, "r1");
    b.wire("uno.D6", "bb.e25", GRN);
    b.wire("bb.e30", "bb.B-25", BLK);
  },
  sim: { runMs: 9000, sampleMs: 20, events: [
    { t: 2000, set: { btn1: { pressed: true } } }, { t: 3500, set: { btn1: { pressed: false } } },
    { t: 5000, set: { btn1: { pressed: true } } }, { t: 5400, set: { btn1: { pressed: false } } } ] },
  shoot: { actions: [{ down: "btn1" }, { waitText: "Alindi: 1" }, { wait: 300 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
