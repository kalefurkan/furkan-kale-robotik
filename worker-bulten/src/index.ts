// Bülten aboneliği: POST /abone {email, website} -> KV'ye yazar.
// Kayıtları görmek için: npx wrangler kv key list --binding ABONELER
export interface Env { ABONELER: KVNamespace }

const IZINLI_KAYNAK = new Set(["https://kalefurkan.github.io", "http://localhost:8099", "http://127.0.0.1:8099"]);
const EPOSTA = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const SAATLIK_SINIR = 10;   // aynı IP için saatte en fazla istek

function cors(origin: string | null): Record<string, string> {
  const o = origin && IZINLI_KAYNAK.has(origin) ? origin : "";
  return { "access-control-allow-origin": o, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "vary": "origin" };
}
const json = (b: unknown, status: number, h: Record<string, string>) => new Response(JSON.stringify(b), { status, headers: { ...h, "content-type": "application/json; charset=utf-8" } });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url), h = cors(req.headers.get("origin"));
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (url.pathname !== "/abone" || req.method !== "POST") return json({ hata: "bulunamadi" }, 404, h);
    if (!h["access-control-allow-origin"]) return json({ hata: "izin yok" }, 403, h);

    let body: { email?: unknown; website?: unknown };
    try { body = await req.json(); } catch { return json({ hata: "gecersiz istek" }, 400, h); }
    if (typeof body.website === "string" && body.website) return json({ ok: true }, 200, h);   // bot tuzağı (gizli alan)
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email.length > 254 || !EPOSTA.test(email)) return json({ hata: "gecersiz e-posta" }, 400, h);

    const ip = req.headers.get("cf-connecting-ip") || "?", saat = Math.floor(Date.now() / 3600000);
    const rk = `rl:${ip}:${saat}`, n = parseInt((await env.ABONELER.get(rk)) || "0", 10);
    if (n >= SAATLIK_SINIR) return json({ hata: "cok fazla deneme" }, 429, h);
    await env.ABONELER.put(rk, String(n + 1), { expirationTtl: 3700 });

    const key = `abone:${email}`;
    if (await env.ABONELER.get(key)) return json({ ok: true, zaten: true }, 200, h);
    await env.ABONELER.put(key, JSON.stringify({ tarih: new Date().toISOString(), kaynak: req.headers.get("origin") }));
    return json({ ok: true }, 200, h);
  },
};
