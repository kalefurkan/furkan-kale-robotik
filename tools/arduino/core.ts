/** build.mjs tarafından paketlenir: belgeleri ve doğrulama bulgularını (facts) üretir. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { buildNetlist } from "MAKERLAB/circuit/netlist";
import { validateCircuit } from "MAKERLAB/circuit/validator";
import { pinWorld, pinsOf } from "MAKERLAB/circuit/catalog";
import { SimulationSession } from "MAKERLAB/sim/session";
import type { Project } from "./lib";
import { Builder } from "./lib";

declare const __ROOT__: string;
declare const __ONLY__: string[];

const OUT = `${__ROOT__}/out`;
mkdirSync(`${OUT}/docs`, { recursive: true });
mkdirSync(`${OUT}/facts`, { recursive: true });

function holeKey(w: number[]) { return `${Math.round(w[0])},${Math.round(w[1])}`; }

export function run(__PROJECTS__: Project[]) {
const shootPath = `${OUT}/shoot.json`;
const shootAll: Record<string, unknown> = existsSync(shootPath) ? JSON.parse(readFileSync(shootPath, "utf8")) : {};
for (const p of __PROJECTS__) {
  if (__ONLY__.length && !__ONLY__.includes(p.id)) continue;
  const b = new Builder(p.builder ?? {});
  p.build(b);
  const sketch = readFileSync(`${__ROOT__}/sketches/${p.sketch}.ino`, "utf8");
  const doc = b.doc(sketch);
  writeFileSync(`${OUT}/docs/${p.id}.json`, JSON.stringify(doc));
  shootAll[p.id] = p.shoot ?? {};
  writeFileSync(shootPath, JSON.stringify(shootAll));
  const circuit = doc.circuit as any;

  // ---- sayımlar ----
  const counts: Record<string, number> = {};
  const resistors: Record<string, number> = {};
  for (const c of circuit.components) {
    if (c.type === "uno" || c.type === "breadboard") continue;
    counts[c.type] = (counts[c.type] ?? 0) + 1;
    if (c.type === "resistor") resistors[c.props.ohms] = (resistors[c.props.ohms] ?? 0) + 1;
  }
  // ---- Uno pinleri / çift kullanım ----
  const ends = new Map<string, number>();
  const unoPins = new Set<string>();
  for (const w of circuit.wires) for (const e of [w.from, w.to]) {
    const k = `${e.componentId}.${e.pinId}`;
    ends.set(k, (ends.get(k) ?? 0) + 1);
    if (e.componentId === "uno") unoPins.add(e.pinId.replace(/^GND\d$/, "GND"));
  }
  const endpointDup = [...ends].filter(([, n]) => n > 1).map(([k]) => k);
  // delik çakışması: aynı deliğe kablo ucu + bileşen bacağı ya da iki bacak
  const holeUse = new Map<string, string[]>();
  const bbc = circuit.components.find((c: any) => c.type === "breadboard");
  const holeAt = new Map<string, string>();
  for (const pd of pinsOf("breadboard")) holeAt.set(holeKey(pinWorld(bbc, pd.id)!), pd.id);
  for (const c of circuit.components) {
    if (c.type === "uno" || c.type === "breadboard") continue;
    for (const pd of pinsOf(c.type)) {
      const h = holeAt.get(holeKey(pinWorld(c, pd.id)!));
      if (h) holeUse.set(h, [...(holeUse.get(h) ?? []), `${c.id}.${pd.id}`]);
    }
  }
  for (const w of circuit.wires) for (const e of [w.from, w.to]) if (e.componentId === "bb") holeUse.set(e.pinId, [...(holeUse.get(e.pinId) ?? []), `wire:${w.id}`]);
  const holeClash = [...holeUse].filter(([, v]) => v.length > 1).map(([h, v]) => `${h}: ${v.join(", ")}`);

  const nl = buildNetlist(circuit);
  const unplugged: string[] = [];
  for (const c of circuit.components) {
    if (c.type === "uno" || c.type === "breadboard") continue;
    for (const pd of pinsOf(c.type)) if (!nl.plugged.has(`${c.id}.${pd.id}`)) unplugged.push(`${c.id}.${pd.id}`);
  }
  // bileşen uçlarının düğümleri (göz kontrolü için)
  const nets: string[] = [];
  const typeOf = new Map<string, string>(circuit.components.map((c: any) => [c.id, c.type]));
  for (const m of nl.members) {
    const t = m.filter((k) => !["bb"].includes(k.split(".")[0]));
    if (t.length >= 2) nets.push(t.join(" "));
  }
  const v = validateCircuit(circuit);

  // ---- simülasyon ----
  const s = new SimulationSession(sketch, circuit);
  const events = [...(p.sim.events ?? [])].sort((a, b) => a.t - b.t);
  const step = p.sim.sampleMs ?? 20;
  const serialAt: { t: number; text: string }[] = [];
  const toneLog: [number, string, number][] = [];
  const buzLog: [number, string, boolean][] = [];
  const ledLog: [number, string, boolean, number][] = [];
  const lastTone = new Map<string, number>(), lastBuz = new Map<string, boolean>(), lastLed = new Map<string, string>();
  const warnings = new Set<string>();
  let shorted = false, overcurrent = false, lcdProblem: string | null = null, last: any = null, ei = 0;
  for (let t = 0; t <= p.sim.runMs && !s.finished; t += step) {
    while (ei < events.length && events[ei].t <= t) { for (const [id, pr] of Object.entries(events[ei].set)) s.setProps(id, pr); ei++; }
    s.advance(t * 1000);
    const f = s.frame();
    last = f;
    f.warnings.forEach((w) => warnings.add(w));
    if (f.shorted) shorted = true;
    f.leds.forEach((l) => { if (l.overcurrent) overcurrent = true; });
    if (f.overcurrentPins.length) overcurrent = true;
    for (const [id, tn] of f.tones) { const fr = tn.sounding ? tn.freq : 0; if (lastTone.get(id) !== fr) { lastTone.set(id, fr); toneLog.push([t, id, fr]); } }
    for (const [id, bz] of f.buzzers) if (lastBuz.get(id) !== bz.sounding) { lastBuz.set(id, bz.sounding); buzLog.push([t, id, bz.sounding]); }
    for (const [id, l] of f.leds) { const k = `${l.lit}`; if (lastLed.get(id) !== k) { lastLed.set(id, k); ledLog.push([t, id, l.lit, +l.brightness.toFixed(2)]); } }
    f.lcds.forEach((l) => { if (l.problem && (!l.waiting || f.timeUs > 2_000_000)) lcdProblem = l.problem; });
  }
  const lcd: Record<string, string[]> = {};
  last?.lcds.forEach((l: any, id: string) => (lcd[id] = l.rows));
  const facts = {
    id: p.id, counts, resistors, wires: circuit.wires.length, components: circuit.components.length,
    unoPins: [...unoPins].sort(), endpointDup, holeClash, unplugged, nets,
    validator: { errors: v.errors.map((i) => i.message), warnings: v.warnings.map((i) => i.message) },
    runtime: { error: s.error, diagnostics: s.diagnostics.map((d) => `${d.severity}: ${d.message} (${d.line})`), warnings: [...warnings], shorted, overcurrent, lcdProblem },
    serial: s.serial.lines.map((l) => `${(l.t / 1000).toFixed(0)}ms ${l.text}`),
    toneLog: toneLog.slice(0, 80), buzLog: buzLog.slice(0, 40), ledLog: ledLog.slice(0, 60),
    ledEnd: Object.fromEntries([...(last?.leds ?? [])].map(([id, l]: any) => [id, l.lit])),
    lcd, finished: s.finished, timeMs: s.timeUs / 1000,
  };
  writeFileSync(`${OUT}/facts/${p.id}.json`, JSON.stringify(facts, null, 1));
  console.log(`${p.id}: bileşen=${facts.components} kablo=${facts.wires} hata=${v.errors.length} uyarı=${v.warnings.length} çalışma=${s.error ? "HATA " + s.error.message : "ok"}`);
}
}
