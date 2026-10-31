// Kullanım: node build.mjs [proje-id,proje-id,...]
// projects/*.ts dosyalarını paketler; out/docs/<id>.json (devre belgesi) ve out/facts/<id>.json (doğrulama bulguları) üretir.
import { createRequire } from "module";
import { readdirSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
const here = dirname(fileURLToPath(import.meta.url));
const MAKERLAB = process.env.MAKERLAB || "/Users/furkan/Documents/GitHub/MakerLab";
const { build } = createRequire(MAKERLAB + "/package.json")("esbuild");
const only = (process.argv[2] || "").split(",").filter(Boolean);
const files = readdirSync(here + "/projects").filter((f) => f.endsWith(".ts")).sort();
mkdirSync(here + "/out/.tmp", { recursive: true });
const entry = here + "/out/.tmp/entry.ts";
writeFileSync(entry, files.map((f, i) => `import p${i} from "${here}/projects/${f}";`).join("\n") + `\nimport { run } from "${here}/core.ts";\nrun([${files.map((_, i) => "p" + i).join(",")}]);\n`);
const outfile = here + "/out/.tmp/core.mjs";
await build({
  entryPoints: [entry], outfile, bundle: true, platform: "node", format: "esm", logLevel: "error",
  alias: { MAKERLAB: MAKERLAB + "/arduino/src" },
  define: { __ROOT__: JSON.stringify(here), __ONLY__: JSON.stringify(only) },
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
});
await import(pathToFileURL(outfile).href);
