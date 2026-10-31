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
  // ---- güç yolu denetimi (elle kontrol edilen tutarsızlıkları otomatikleştirir) ----
  const powerIssues: string[] = [];
  {
    const netOf = new Map<string, string[]>();
    for (const m of nl.members) for (const k of m) netOf.set(k, m);
    const has = (k: string, re: RegExp | ((k: string) => boolean)) => (netOf.get(k) ?? [k]).some((x) => (typeof re === "function" ? re(x) : re.test(x)));
    const typeById = new Map<string, string>(circuit.components.map((c: any) => [c.id, c.type]));
    const isMcuPin = (k: string) => /^uno\.(D\d+|A\d)$/.test(k);
    const isPlus = (k: string) => { const [id, pn] = k.split("."); const t = typeById.get(id); return k === "uno.5V" || ((t === "psu" || t === "battery9v") && pn === "P") || (t === "relay" && ["NO", "NC", "COM"].includes(pn)); };
    const isGnd = (k: string) => { const [id, pn] = k.split("."); const t = typeById.get(id); return /^uno\.GND\d?$/.test(k) || ((t === "psu" || t === "battery9v") && pn === "N"); };
    for (const c of circuit.components) {
      if (c.type === "servo") {
        if (!has(`${c.id}.VCC`, (k) => k === "uno.5V")) powerIssues.push(`${c.id}: VCC 5V'a bağlı değil`);
        if (!has(`${c.id}.GND`, /^uno\.GND\d?$/)) powerIssues.push(`${c.id}: GND Arduino GND'ye bağlı değil`);
        if (has(`${c.id}.VCC`, isMcuPin) || has(`${c.id}.GND`, isMcuPin)) powerIssues.push(`${c.id}: besleme ucu bir veri pinine bağlı`);
      }
      if (c.type === "dcmotor" || c.type === "bulb") for (const pn of ["A", "B"]) if (has(`${c.id}.${pn}`, isMcuPin)) powerIssues.push(`${c.id}.${pn}: motor ucu doğrudan Arduino veri pinine bağlı`);
      if (c.type === "relay") for (const pn of ["C1", "C2"]) if (has(`${c.id}.${pn}`, isMcuPin)) powerIssues.push(`${c.id}.${pn}: röle bobini doğrudan Arduino veri pinine bağlı (sürücü transistör gerekir)`);
      if (c.type === "npn" && has(`${c.id}.B`, isMcuPin)) powerIssues.push(`${c.id}: taban doğrudan Arduino pinine bağlı (direnç gerekir)`);
      if (c.type === "npn" && !has(`${c.id}.E`, isGnd)) powerIssues.push(`${c.id}: emitör GND'ye bağlı değil`);
      if (c.type === "dcmotor") {
        const diodes = circuit.components.filter((d: any) => d.type === "diode");
        const ok = diodes.some((d: any) => (has(`${c.id}.A`, new RegExp(`^${d.id}\\.K$`)) && has(`${c.id}.B`, new RegExp(`^${d.id}\\.A$`)) && has(`${c.id}.A`, isPlus)) || (has(`${c.id}.B`, new RegExp(`^${d.id}\\.K$`)) && has(`${c.id}.A`, new RegExp(`^${d.id}\\.A$`)) && has(`${c.id}.B`, isPlus)));
        if (!ok) powerIssues.push(`${c.id}: ters diyot yok ya da yönü yanlış (katot + tarafa bakmalı)`);
      }
      if (c.type === "relay") {
        const diodes = circuit.components.filter((d: any) => d.type === "diode");
        const ok = diodes.some((d: any) => has(`${c.id}.C1`, new RegExp(`^${d.id}\\.K$`)) && has(`${c.id}.C2`, new RegExp(`^${d.id}\\.A$`)));
        if (!ok) powerIssues.push(`${c.id}: röle bobininde ters diyot yok ya da yönü yanlış (katot C1/+ tarafa)`);
        if (!has(`${c.id}.C1`, /^uno\.5V$/)) powerIssues.push(`${c.id}: bobin C1 5V'a bağlı değil`);
      }
    }
  }

  // ---- simülasyon ----
  const s = new SimulationSession(sketch, circuit);
  const events = [...(p.sim.events ?? [])].sort((a, b) => a.t - b.t);
  const step = p.sim.sampleMs ?? 20;
  const serialAt: { t: number; text: string }[] = [];
  const toneLog: [number, string, number][] = [];
  const buzLog: [number, string, boolean][] = [];
  const ledLog: [number, string, boolean, number][] = [];
  const servoLog: [number, string, number | null, boolean][] = [];
  const motorLog: [number, string, number, number][] = [];
  const relayLog: [number, string, boolean][] = [];
  const lcdLog: [number, string][] = []; let lastLcd = "";
  const lastServo = new Map<string, string>(), lastMotor = new Map<string, string>(), lastRelay = new Map<string, boolean>();
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
    for (const [id, sv] of f.servos) { const k = `${sv.angle}/${sv.powered}`; if (lastServo.get(id) !== k) { lastServo.set(id, k); servoLog.push([t, id, sv.angle, sv.powered]); } }
    for (const [id, m] of f.motors) { const k = `${m.speed.toFixed(2)}/${m.currentMa.toFixed(0)}`; if (lastMotor.get(id) !== k) { lastMotor.set(id, k); motorLog.push([t, id, +m.speed.toFixed(2), +m.currentMa.toFixed(1)]); } }
    for (const [id, r] of f.relays) if (lastRelay.get(id) !== r.on) { lastRelay.set(id, r.on); relayLog.push([t, id, r.on]); }
    { const cur = [...f.lcds.values()].map((l: any) => l.rows.join("|")).join("#"); if (cur !== lastLcd) { lastLcd = cur; lcdLog.push([t, cur]); } }
    f.lcds.forEach((l) => { if (l.problem && (!l.waiting || f.timeUs > 2_000_000)) lcdProblem = l.problem; });
  }
  const lcd: Record<string, string[]> = {};
  last?.lcds.forEach((l: any, id: string) => (lcd[id] = l.rows));
  const facts = {
    id: p.id, counts, resistors, wires: circuit.wires.length, components: circuit.components.length,
    unoPins: [...unoPins].sort(), powerIssues, endpointDup, holeClash, unplugged, nets,
    validator: { errors: v.errors.map((i) => i.message), warnings: v.warnings.map((i) => i.message) },
    runtime: { error: s.error, diagnostics: s.diagnostics.map((d) => `${d.severity}: ${d.message} (${d.line})`), warnings: [...warnings], shorted, overcurrent, lcdProblem },
    serial: s.serial.lines.map((l) => `${(l.t / 1000).toFixed(0)}ms ${l.text}`),
    toneLog: toneLog.slice(0, 80), buzLog: buzLog.slice(0, 200), ledLog: ledLog.slice(0, 60),
    lcdLog: lcdLog.slice(0, 120), servoLog: servoLog.slice(0, 60), motorLog: motorLog.slice(0, 60), relayLog: relayLog.slice(0, 40),
    ledEnd: Object.fromEntries([...(last?.leds ?? [])].map(([id, l]: any) => [id, l.lit])),
    lcd, finished: s.finished, timeMs: s.timeUs / 1000,
  };
  writeFileSync(`${OUT}/facts/${p.id}.json`, JSON.stringify(facts, null, 1));
  console.log(`${p.id}: bileşen=${facts.components} kablo=${facts.wires} hata=${v.errors.length} uyarı=${v.warnings.length} çalışma=${s.error ? "HATA " + s.error.message : "ok"}`);
}
}
