import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 97 - Çok Sensörlü Akıllı Güvenlik Sistemi: ESP32-CAM (serbest) 5V/GND <- Uno 5V/GND2 (yalnızca 5 V kaynağı); RC522 a4(3V3) a5(RST -> IO2) a6(GND) a7(MISO -> IO12) a8(MOSI -> IO13) a9(SCK -> IO14) a10(SDA -> IO15);
// PIR a16(VCC 5 V) a17(OUT) a18(GND), OUT bölücüsü 10 kΩ d13->d17 + 20 kΩ dikey e13->h13 (orta nokta a13 -> IO16)
const p: Project = {
  id: "cok-sensorlu-akilli-guvenlik-sistemi",
  sketch: "guvenlik_esp32",
  esp32: true,
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.free("cam1", "esp32cam", 330, 600);
    b.wire("cam1.5V", "bb.B+2", RED);
    b.wire("cam1.GND", "bb.B-2", BLK);
    b.wire("cam1.3V3", "bb.T+1", ORG);
    b.plug("a4", { id: "rc1", type: "rc522", pin: "3V3", props: { cardUid: "A1B2C3D4", cardPresent: false } });
    b.wire("bb.e4", "bb.T+4", ORG);
    b.wire("cam1.IO2", "bb.e5", YEL);
    b.wire("bb.e6", "bb.B-6", BLK);
    b.wire("cam1.IO12", "bb.e7", GRN);
    b.wire("cam1.IO13", "bb.e8", BLU);
    b.wire("cam1.IO14", "bb.e9", WHT);
    b.wire("cam1.IO15", "bb.e10", ORG);
    b.plug("a16", { id: "pir1", type: "pir", pin: "VCC", props: { motion: false } });
    b.wire("bb.e16", "bb.B+16", RED);
    b.wire("bb.e18", "bb.B-18", BLK);
    b.plug("d13", { id: "r1", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.plug("e13", { id: "r2", type: "resistor", pin: "A", props: { ohms: 20000 }, rotation: 90 });
    b.wire("bb.j13", "bb.B-13", BLK);
    b.wire("cam1.IO16", "bb.a13", GRN);
  },
  sim: { runMs: 1000 },
  shoot: { actions: [{ wait: 800 }], settleMs: 1500, startWaitMs: 500 },
};
export default p;
