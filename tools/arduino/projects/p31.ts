import { Builder, Project, RED, BLK, BLU, YEL, GRN, ORG, WHT } from "../lib";
// 31 - Otomatik Bitki Sulama:
//  röle a2(C1) a3(C2) a4(COM) a5(NO) a6(NC); bobin sürücüsü NPN a12(C) a13(B) a14(E) + 1 kΩ d13->d17; bobin diyodu A c3 -> K c7 (K -> 5V)
//  toprak nem a20(VCC) a21(OUT) a22(GND)
//  NC -> yeşil LED + 470 Ω -> PSU-; pompa devresi (ayrı 6 V güç kaynağı, breadboard dışında): PSU+ -> COM, NO -> pompa A, pompa B -> PSU-; pompa diyodu (dönüş) A c19 -> K f19
const p: Project = {
  id: "otomatik-bitki-sulama",
  sketch: "sulama",
  build(b: Builder) {
    b.wire("uno.5V", "bb.B+1", RED);
    b.wire("uno.GND2", "bb.B-1", BLK);
    // röle + bobin sürücüsü
    b.plug("a2", { id: "rl1", type: "relay", pin: "C1" });
    b.wire("bb.e2", "bb.B+2", RED);                       // bobin C1 -> 5V
    b.plug("c3", { id: "d1", type: "diode", pin: "A" });  // bobin diyodu A c3 (C2 şeridi) -> K c7
    b.wire("bb.e7", "bb.B+7", RED);                       // diyot katodu -> 5V
    b.plug("a12", { id: "q1", type: "npn", pin: "C" });
    b.wire("bb.e12", "bb.e3", YEL);                       // kolektör -> röle C2
    b.wire("bb.e14", "bb.B-14", BLK);                     // emitör -> GND
    b.plug("d13", { id: "r1", type: "resistor", pin: "A", props: { ohms: 1000 } });
    b.wire("uno.D7", "bb.e17", GRN);                      // D7 -> 1 kΩ -> taban
    // toprak nem sensörü
    b.plug("a20", { id: "soil1", type: "soil", pin: "VCC", props: { moisture: 0.1 } });
    b.wire("bb.e20", "bb.B+20", RED);
    b.wire("uno.A0", "bb.e21", BLU);
    b.wire("bb.e22", "bb.B-22", BLK);
    // NC kontağı: pompa kapalıyken yanan yeşil "hazır" LED'i (6 V, 470 Ω); ışık PSU- şeridine döner
    b.ledRes("led1", 24, "green", 470, "r2");
    b.wire("bb.e6", "bb.e24", GRN);                      // NC -> LED anodu
    b.wire("bb.e29", "bb.a19", BLK);                     // 470 Ω çıkışı -> PSU - şeridi (sütun 19)
    // pompa devresi: PSU ve pompa breadboard dışında. Ters diyot dikey: A c19 (PSU - şeridi, üst) -> K f19 (NO şeridi, alt)
    b.plug("c19", { id: "d2", type: "diode", pin: "A", rotation: 90 });
    b.free("psu1", "psu", 420, 330, { volts: 6 });
    b.free("pump1", "dcmotor", 600, 330);
    b.wire("bb.e4", "psu1.P", ORG);      // COM <- PSU +
    b.wire("bb.e5", "bb.g19", WHT);      // NO -> alt şerit (diyot katodu)
    b.wire("bb.h19", "pump1.A", WHT);    // NO şeridi -> pompa A
    b.wire("bb.e19", "psu1.N", BLK);     // PSU - şeridi
    b.wire("bb.b19", "pump1.B", BLK);    // pompa B -> PSU -
  },
  sim: { runMs: 30000, sampleMs: 50, events: [
    { t: 6000, set: { soil1: { moisture: 0.8 } } }, { t: 20000, set: { soil1: { moisture: 0.1 } } } ] },
  shoot: { actions: [{ wait: 600 }], settleMs: 200, hideFlybackFrame: true },
};
export default p;
