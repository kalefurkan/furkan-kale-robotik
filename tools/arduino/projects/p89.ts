import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 89 - Görüntü İşlemeli Akıllı Kapı: ESP32-CAM (serbest) 5V/GND <- Uno 5V/GND2 (yalnızca 5 V kaynağı olarak çizilir); servo a4(SIG <- IO13) a5(VCC) a6(GND)
const p: Project = {
  id: "goruntu-islemeli-akilli-kapi",
  sketch: "akilli_kapi_esp32",
  esp32: true,
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.free("cam1", "esp32cam", 330, 600);
    b.wire("cam1.5V", "bb.B+2", RED);
    b.wire("cam1.GND", "bb.B-2", BLK);
    b.plug("a4", { id: "sv1", type: "servo", pin: "SIG" });
    b.wire("cam1.IO13", "bb.e4", ORG);
    b.wire("bb.e5", "bb.B+3", RED);
    b.wire("bb.e6", "bb.B-3", BLK);
  },
  sim: { runMs: 1000 },
  shoot: { actions: [{ wait: 800 }], settleMs: 1500, startWaitMs: 500 },
};
export default p;
