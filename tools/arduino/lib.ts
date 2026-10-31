/**
 * Devre belgesi üretici yardımcıları (MakersHub Studio simülatörü için).
 * Bu dosya esbuild ile paketlenip node'da çalışır (bkz. build.mjs); MakerLab kaynağını yalnızca OKUR.
 */
import { CATALOG, pinWorld, rotatePoint, pinDef } from "MAKERLAB/circuit/catalog";

export const RED = "#ff4d4d", BLK = "#3d3d3d", BLU = "#4da3ff", YEL = "#ffd23f", GRN = "#5ecb8f", ORG = "#ff8a30", WHT = "#e8e8e8";

export interface PlugSpec { id: string; type: string; pin: string; props?: Record<string, any>; rotation?: 0 | 90 | 180 | 270 }

/** Referans biçimi: "uno.D13", "bb.a10", "led1.A" */
export class Builder {
  comps: any[] = [];
  wires: any[] = [];
  private wn = 0;
  readonly bbc: any;
  constructor(opts: { bbX?: number } = {}) {
    this.comps.push(this.raw("uno", "uno", 24, 24));
    this.bbc = this.raw("bb", "breadboard", opts.bbX ?? 360, 24);
    this.comps.push(this.bbc);
  }
  raw(id: string, type: string, x: number, y: number, props: any = {}, rotation = 0) {
    return { id, type, x, y, rotation, props: { ...(CATALOG as any)[type].defaultProps, ...props } };
  }
  /** Bileşeni serbest (breadboard dışı) bir konuma koyar */
  free(id: string, type: string, x: number, y: number, props: any = {}, rotation = 0) {
    this.comps.push(this.raw(id, type, x, y, props, rotation));
  }
  /** Bileşenin `pin` ucunu breadboard deliğine (örn. "c10") oturtur. */
  plug(hole: string, c: PlugSpec) {
    const h = pinWorld(this.bbc, hole);
    if (!h) throw new Error(`delik yok: ${hole}`);
    const rotation = c.rotation ?? 0;
    const d = pinDef(c.type as any, c.pin);
    if (!d) throw new Error(`pin yok: ${c.type}.${c.pin}`);
    const [rx, ry] = rotatePoint(d.dx, d.dy, rotation);
    this.comps.push({ id: c.id, type: c.type, x: h[0] - rx, y: h[1] - ry, rotation, props: { ...(CATALOG as any)[c.type].defaultProps, ...c.props } });
  }
  wire(a: string, b: string, color = YEL) {
    const r = (s: string) => { const i = s.indexOf("."); return { componentId: s.slice(0, i), pinId: s.slice(i + 1) }; };
    this.wires.push({ id: `w${++this.wn}`, from: r(a), to: r(b), color });
  }
  /** LED + 220 Ω: LED c{col}/c{col+1}, direnç d{col+1}→d{col+5} (yatay). Anot deliği: a{col}, direnç çıkışı: a{col+5} */
  ledRes(id: string, col: number, color: string, ohms = 220, rid = "r" + id.replace(/\D/g, "")) {
    this.plug(`c${col}`, { id, type: "led", pin: "A", props: { color } });
    this.plug(`d${col + 1}`, { id: rid, type: "resistor", pin: "A", props: { ohms } });
  }
  doc(sketch: string) {
    return { schemaVersion: 1, circuit: { schemaVersion: 1, components: this.comps, wires: this.wires }, sketch };
  }
}

export type Action =
  | { wait: number }
  | { press: string; hold?: number }
  | { down: string }
  | { up: string }
  | { presses: { id: string; n: number; hold?: number; gap?: number } }
  | { waitText: string; timeout?: number }
  | { keys: { id: string; seq: string; hold?: number; gap?: number } }
  | { waitLcd: number }
  | { select: string }
  | { slider: { value: number; index?: number } }
  | { fill: { placeholder: string; text: string } }
  | { clickText: string }
  | { clickCss: string }
  | { clickLabel: string; exact?: boolean };

export interface Project {
  /** index.json'daki kimlik */
  id: string;
  /** sketches/ altındaki .ino dosyası (uzantısız ad) */
  sketch: string;
  /** Builder seçenekleri (örn. breadboard x konumu) */
  builder?: { bbX?: number };
  build(b: Builder): void;
  /** node tarafı doğrulama: sanal süre ve zamanlı girdi değişiklikleri */
  sim: { runMs: number; events?: { t: number; set: Record<string, Record<string, any>> }[]; sampleMs?: number };
  /** tarayıcı tarafı: ekran görüntüsünden önce yapılacak etkileşimler */
  shoot?: { actions: Action[]; settleMs?: number; hideFlybackFrame?: boolean; startWaitMs?: number };
}

/**
 * 16x2 LCD bloğu (p20 ile aynı yerleşim): LCD a2..a13, arka ışık direnci d12->d16 (A -> 220 Ω -> 5V),
 * 5V -> B+1, GND2 -> B-1 rayları; VSS/V0/RW/K -> GND, VDD/direnç ucu -> 5V; RS/E/D4..D7 Arduino'ya.
 * Uno'nun 5V ve GND2 pinleri bu blokla kullanılmış olur (14 kablo).
 */
export function lcdBlock(b: Builder, pins: { rs: string; e: string; d: [string, string, string, string] } = { rs: "D12", e: "D11", d: ["D5", "D4", "D3", "D2"] }, id = "lcd1") {
  b.plug("a2", { id, type: "lcd16x2", pin: "VSS" });
  b.plug("d12", { id: "rlcd", type: "resistor", pin: "A", props: { ohms: 220 } });
  b.wire("uno.5V", "bb.B+1", RED);
  b.wire("uno.GND2", "bb.B-1", BLK);
  b.wire("bb.e2", "bb.B-2", BLK);    // VSS -> GND
  b.wire("bb.e3", "bb.B+3", RED);    // VDD -> 5V
  b.wire("bb.e4", "bb.B-4", BLK);    // V0 -> GND
  b.wire("bb.e6", "bb.B-6", BLK);    // RW -> GND
  b.wire("bb.e13", "bb.B-13", BLK);  // K -> GND
  b.wire("bb.e16", "bb.B+16", RED);  // direnç ucu -> 5V
  b.wire(`uno.${pins.rs}`, "bb.e5", YEL);
  b.wire(`uno.${pins.e}`, "bb.e7", GRN);
  b.wire(`uno.${pins.d[0]}`, "bb.e8", BLU);
  b.wire(`uno.${pins.d[1]}`, "bb.e9", ORG);
  b.wire(`uno.${pins.d[2]}`, "bb.e10", WHT);
  b.wire(`uno.${pins.d[3]}`, "bb.e11", YEL);
}

/** Tuş takımına zamanlı tuş basışları: her tuş `hold` ms basılı kalır, aralarında `gap` ms olur. */
export function typeKeys(id: string, seq: string, start: number, hold = 100, gap = 300) {
  return [...seq].flatMap((k, i) => [
    { t: start + i * (hold + gap), set: { [id]: { key: k } } },
    { t: start + i * (hold + gap) + hold, set: { [id]: { key: "" } } },
  ]);
}

/**
 * L298N robot sürücü bloğu (p42 ile aynı yerleşim): L298N a4..a16 (12V GND 5V ENA IN1 IN2 IN3 IN4 ENB OUT1..OUT4),
 * 6 V güç kaynağı + iki DC motor breadboard dışında, GND ortak (e5 <- PSU -, d5 -> eksi ray), mantık 5V: e6 -> artı ray.
 * Arduino: ENA D5, IN1 D7, IN2 D8, IN3 D9, IN4 D10, ENB D6. 16 kablo.
 */
export function l298Block(b: Builder, volts = 6, motor: "dcmotor" | "encmotor" = "dcmotor") {
  b.wire("uno.5V", "bb.B+1", RED);
  b.wire("uno.GND2", "bb.B-1", BLK);
  b.plug("a4", { id: "drv1", type: "l298n", pin: "V12" });
  b.free("psu1", "psu", 330, 330, { volts });
  b.free("m1", motor, 560, 330);
  b.free("m2", motor, 700, 330);
  b.wire("bb.e4", "psu1.P", ORG);
  b.wire("bb.e5", "psu1.N", BLK);
  b.wire("bb.d5", "bb.B-5", BLK);
  b.wire("bb.e6", "bb.B+4", RED);
  b.wire("uno.D5", "bb.e7", GRN);
  b.wire("uno.D7", "bb.e8", YEL);
  b.wire("uno.D8", "bb.e9", BLU);
  b.wire("uno.D9", "bb.e10", WHT);
  b.wire("uno.D10", "bb.e11", ORG);
  b.wire("uno.D6", "bb.e12", GRN);
  const [pa, pb] = motor === "encmotor" ? ["M1", "M2"] : ["A", "B"];
  b.wire("bb.e13", `m1.${pa}`, YEL);
  b.wire("bb.e14", `m1.${pb}`, BLK);
  b.wire("bb.e15", `m2.${pa}`, YEL);
  b.wire("bb.e16", `m2.${pb}`, BLK);
}
