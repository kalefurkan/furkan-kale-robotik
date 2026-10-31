import { Builder, Project, RED, BLK, BLU, YEL, GRN, WHT } from "../lib";
// 47 - SD Karta Veri Kaydedici: SD modülü a4(GND) a5(VCC) a6(MISO) a7(MOSI) a8(SCK) a9(CS -> D4) + DHT11 c14(VCC) c15(DATA -> D2) c16(GND)
const p: Project = {
  id: "sd-karta-veri-kaydedici",
  sketch: "sd_kayit",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.plug("a4", { id: "sd1", type: "sdcard", pin: "GND" });
    b.wire("bb.e4", "bb.B-3", BLK);
    b.wire("bb.e5", "bb.B+4", RED);
    b.wire("uno.D12", "bb.e6", GRN);
    b.wire("uno.D11", "bb.e7", BLU);
    b.wire("uno.D13", "bb.e8", WHT);
    b.wire("uno.D4", "bb.e9", YEL);
    b.plug("c14", { id: "dht1", type: "dht11", pin: "VCC", props: { tempC: 27, humidity: 55 } });
    b.wire("bb.e14", "bb.B+12", RED);
    b.wire("uno.D2", "bb.e15", YEL);
    b.wire("bb.e16", "bb.B-14", BLK);
  },
  sim: { runMs: 16000, sampleMs: 50, events: [
    { t: 3000, set: { dht1: { tempC: 29, humidity: 58 } } }, { t: 5000, set: { dht1: { tempC: 31, humidity: 62 } } },
    { t: 7000, set: { dht1: { tempC: 33, humidity: 66 } } } ] },
  shoot: { actions: [{ waitText: "VERI.CSV icerigi" }, { wait: 300 }], settleMs: 100, startWaitMs: 200 },
};
export default p;
