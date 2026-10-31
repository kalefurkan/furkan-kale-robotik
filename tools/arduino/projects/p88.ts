import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 88 - Nesne Takip Eden Robot (ESP32 + OV7670 + L298N): ESP32 serbest (USB ile beslenir); OV7670 i4..i12 (alt sıra) / e4..e12 (üst sıra); L298N a17..a29; 6 V kaynak + 2 motor serbest
const p: Project = {
  id: "nesne-takip-eden-robot",
  sketch: "nesne_takip",
  esp32: true,
  builder: { noUno: true },
  build(b: Builder) {
    b.free("esp1", "esp32", 330, 600, { usbPower: true });
    b.wire("esp1.GND", "bb.B-1", BLK);
    b.wire("esp1.VIN", "bb.B+1", RED);
    b.wire("esp1.3V3", "bb.T+1", ORG);
    b.plug("i4", { id: "cam1", type: "ov7670", pin: "GND" });
    // alt sıra (i satırı; f..h deliklerinden): GND SDA HS XCLK D6 D4 D2 D0 PWDN -> sütun 4..12
    b.wire("bb.h4", "bb.B-4", BLK);
    b.wire("esp1.IO21", "bb.h5", GRN);   // SDA
    b.wire("esp1.IO26", "bb.h6", YEL);   // HS = HREF
    b.wire("esp1.IO27", "bb.h7", BLU);   // XCLK
    b.wire("esp1.IO19", "bb.h8", WHT);   // D6
    b.wire("esp1.IO32", "bb.h9", ORG);   // D4
    b.wire("esp1.IO34", "bb.h10", GRN);  // D2
    b.wire("esp1.IO36", "bb.h11", YEL);  // D0
    b.wire("bb.h12", "bb.B-12", BLK);    // PWDN -> GND
    // üst sıra (e satırı; a..c deliklerinden): 3V3 SCL VS PCLK D7 D5 D3 D1 RST -> sütun 4..12
    b.wire("bb.c4", "bb.T+4", ORG);
    b.wire("esp1.IO22", "bb.c5", BLU);   // SCL
    b.wire("esp1.IO25", "bb.c6", WHT);   // VS = VSYNC
    b.wire("esp1.IO14", "bb.c7", GRN);   // PCLK
    b.wire("esp1.IO18", "bb.c8", YEL);   // D7
    b.wire("esp1.IO33", "bb.c9", BLU);   // D5
    b.wire("esp1.IO35", "bb.c10", WHT);  // D3
    b.wire("esp1.IO39", "bb.c11", ORG);  // D1
    b.wire("bb.c12", "bb.T+12", ORG);    // RST -> 3V3
    b.plug("a17", { id: "drv1", type: "l298n", pin: "V12" });
    b.free("psu1", "psu", 560, 520, { volts: 6 });
    b.free("m1", "dcmotor", 760, 520);
    b.free("m2", "dcmotor", 880, 520);
    b.wire("bb.e17", "psu1.P", ORG);
    b.wire("bb.e18", "psu1.N", BLK);
    b.wire("bb.d18", "bb.B-18", BLK);
    b.wire("bb.e19", "bb.B+19", RED);
    b.wire("esp1.IO16", "bb.e21", YEL);
    b.wire("esp1.IO17", "bb.e22", GRN);
    b.wire("esp1.IO4", "bb.e23", BLU);
    b.wire("esp1.IO23", "bb.e24", WHT);
    b.wire("bb.e26", "m1.A", YEL);
    b.wire("bb.e27", "m1.B", BLK);
    b.wire("bb.e28", "m2.A", YEL);
    b.wire("bb.e29", "m2.B", BLK);
  },
  sim: { runMs: 1000 },
  shoot: { actions: [{ wait: 800 }], settleMs: 5000, startWaitMs: 500 },
};
export default p;
