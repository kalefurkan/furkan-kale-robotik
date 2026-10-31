import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 100 - Otonom Akıllı Robot Platformu: ESP32 DevKit (USB ile beslenir, ana denetleyici) + ESP32-CAM (kamera kartı, UART ile bağlı) + TFmini + MPU6050 + L298N
// MPU6050 a4(VCC 3,3 V) a5(GND) a6(SCL -> IO22) a7(SDA -> IO21); TFmini a10(VCC 5 V) a11(GND) a12(TX bölücüyle -> IO16) a13(RX <- IO17); TX bölücüsü 10 kΩ d8->d12 + 20 kΩ dikey e8->h8
// L298N a16..a28 (IN1 IO27, IN2 IO14, IN3 IO32, IN4 IO33), 6 V kaynak + 2 motor serbest; ESP32-CAM serbest (5V/GND rayda, U0T -> IO25, U0R <- IO26)
const p: Project = {
  id: "otonom-akilli-robot-platformu",
  sketch: "robot_platformu_esp32",
  esp32: true,
  builder: { noUno: true },
  build(b: Builder) {
    b.free("esp1", "esp32", 330, 640, { usbPower: true });
    b.wire("esp1.GND", "bb.B-1", BLK);
    b.wire("esp1.VIN", "bb.B+1", RED);
    b.wire("esp1.3V3", "bb.T+1", ORG);
    b.plug("a4", { id: "mpu1", type: "mpu6050", pin: "VCC", props: { roll: 0 } });
    b.wire("bb.e4", "bb.T+4", ORG);
    b.wire("bb.e5", "bb.B-5", BLK);
    b.wire("esp1.IO22", "bb.e6", BLU);
    b.wire("esp1.IO21", "bb.e7", GRN);
    b.plug("a12", { id: "lid1", type: "tfmini", pin: "VCC", props: { distanceCm: 150, lidarBaud: 115200 } });
    b.wire("bb.e12", "bb.B+12", RED);
    b.wire("bb.e13", "bb.B-13", BLK);
    b.plug("d10", { id: "r1", type: "resistor", pin: "A", props: { ohms: 10000 } });
    b.plug("e10", { id: "r2", type: "resistor", pin: "A", props: { ohms: 20000 }, rotation: 90 });
    b.wire("bb.j10", "bb.B-10", BLK);
    b.wire("esp1.IO16", "bb.a10", GRN);
    b.wire("esp1.IO17", "bb.e15", YEL);
    b.plug("a18", { id: "drv1", type: "l298n", pin: "V12" });
    b.free("psu1", "psu", 620, 700, { volts: 6 });
    b.free("m1", "dcmotor", 820, 700);
    b.free("m2", "dcmotor", 940, 700);
    b.wire("bb.e18", "psu1.P", ORG);
    b.wire("bb.e19", "psu1.N", BLK);
    b.wire("bb.d19", "bb.B-19", BLK);
    b.wire("bb.e20", "bb.B+20", RED);
    ["IO27", "IO14", "IO32", "IO33"].forEach((io, k) => b.wire(`esp1.${io}`, `bb.e${22 + k}`, [BLU, ORG, GRN, WHT][k]));
    b.wire("bb.e27", "m1.A", YEL);
    b.wire("bb.e28", "m1.B", BLK);
    b.wire("bb.e29", "m2.A", YEL);
    b.wire("bb.e30", "m2.B", BLK);
    b.free("cam1", "esp32cam", 330, 880);
    b.wire("cam1.5V", "bb.B+22", RED);
    b.wire("cam1.GND", "bb.B-22", BLK);
    b.wire("cam1.U0T", "esp1.IO25", YEL);
    b.wire("cam1.U0R", "esp1.IO26", GRN);
  },
  sim: { runMs: 1000 },
  shoot: { actions: [{ wait: 800 }], settleMs: 5000, startWaitMs: 500 },
};
export default p;
