import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 95 - Otonom Yangın Algılama Aracı: ESP32-CAM (serbest) 5V/GND <- Uno 5V/GND2 (yalnızca 5 V kaynağı); alev sensörü a4(VCC 3,3 V) a5(GND) a6(AO -> IO16) a7(DO -> IO2);
// L298N a10..a22 (IN1 IO13, IN2 IO15, IN3 IO14, IN4 IO12), 6 V kaynak + 2 motor breadboard dışında
const p: Project = {
  id: "otonom-yangin-algilama-araci",
  sketch: "yangin_arac_esp32",
  esp32: true,
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    b.free("cam1", "esp32cam", 330, 600);
    b.wire("cam1.5V", "bb.B+2", RED);
    b.wire("cam1.GND", "bb.B-2", BLK);
    b.wire("cam1.3V3", "bb.T+1", ORG);
    b.plug("a4", { id: "fl1", type: "flame", pin: "VCC", props: { flame: 0 } });
    b.wire("bb.e4", "bb.T+4", ORG);
    b.wire("bb.e5", "bb.B-4", BLK);
    b.wire("cam1.IO16", "bb.e6", GRN);
    b.wire("cam1.IO2", "bb.e7", YEL);
    b.plug("a10", { id: "drv1", type: "l298n", pin: "V12" });
    b.free("psu1", "psu", 560, 700, { volts: 6 });
    b.free("m1", "dcmotor", 760, 700);
    b.free("m2", "dcmotor", 880, 700);
    b.wire("bb.e10", "psu1.P", ORG);
    b.wire("bb.e11", "psu1.N", BLK);
    b.wire("bb.d11", "bb.B-11", BLK);
    b.wire("bb.e12", "bb.B+12", RED);
    b.wire("cam1.IO13", "bb.e14", BLU);
    b.wire("cam1.IO15", "bb.e15", GRN);
    b.wire("cam1.IO14", "bb.e16", WHT);
    b.wire("cam1.IO12", "bb.e17", YEL);
    b.wire("bb.e19", "m1.A", YEL);
    b.wire("bb.e20", "m1.B", BLK);
    b.wire("bb.e21", "m2.A", YEL);
    b.wire("bb.e22", "m2.B", BLK);
  },
  sim: { runMs: 1000 },
  shoot: { actions: [{ wait: 800 }], settleMs: 1500, startWaitMs: 500 },
};
export default p;
