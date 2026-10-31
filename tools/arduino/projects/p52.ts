import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 52 - Kablosuz Sensör Ağı: NRF24 #1 (sensör düğümü) a2..a8, NRF24 #2 (merkez) a12..a18; SPI ve 3,3 V ortak (d satırı atlama kabloları); DHT11 c21(VCC) c22(DATA -> D2) c23(GND)
const p: Project = {
  id: "kablosuz-sensor-agi",
  sketch: "nrf_sensor",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
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
    b.plug("c21", { id: "dht1", type: "dht11", pin: "VCC", props: { tempC: 27, humidity: 55 } });
    b.wire("bb.e21", "bb.B+19", RED);
    b.wire("uno.D2", "bb.e22", YEL);
    b.wire("bb.e23", "bb.B-21", BLK);
  },
  sim: { runMs: 12000, sampleMs: 50, events: [
    { t: 3000, set: { dht1: { tempC: 31, humidity: 70 } } }, { t: 7000, set: { dht1: { tempC: 18, humidity: 35 } } } ] },
  shoot: { actions: [{ waitText: "Dugum 1" }, { wait: 300 }], settleMs: 100, startWaitMs: 300 },
};
export default p;
