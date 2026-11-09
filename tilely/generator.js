/* A catalog of hand drawn sprites and geometric puzzles, with a shared shape
   registry. Recoloring, turning, reflecting or padding cannot create a new shape. */
(function (root) {
  'use strict';

  const GROUPS = ['oo', 's1', 's2'];
  const SIZES = { oo: 4, s1: 6, s2: 8 };
  const PALETTES = [
    ['R', 'O', 'Y', 'Gün batımı'], ['B', 'L', 'P', 'Gece mavisi'],
    ['O', 'Y', 'B', 'Bal rengi'], ['K', 'P', 'L', 'Menekşe'],
    ['G', 'Y', 'N', 'Orman yeşili'], ['P', 'K', 'R', 'Böğürtlen'],
    ['L', 'B', 'D', 'Buz mavisi'], ['Y', 'G', 'L', 'Bahar']
  ];

  function canonical(rows, silhouette = true) {
    const matrix = rows.split('/');
    const points = matrix.flatMap((row, y) => [...row].flatMap((c, x) => c === '.' ? [] : [[x, y, c]]));
    if (!points.length) return '';
    const keys = [];
    for (const swap of [false, true]) for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
      const mapped = points.map(([x, y, c]) => [(swap ? y : x) * dx, (swap ? x : y) * dy, c]);
      const left = Math.min(...mapped.map(p => p[0])), top = Math.min(...mapped.map(p => p[1]));
      const colors = new Map();
      keys.push(mapped.sort((a, b) => a[1] - b[1] || a[0] - b[0]).map(([x, y, c]) => {
        if (!colors.has(c)) colors.set(c, colors.size);
        return `${x-left}${y-top}${silhouette ? '' : colors.get(c)}`;
      }).join(':'));
    }
    return keys.sort()[0];
  }

  const mirror = rows => rows.split('/').map(row => row.slice(0, row.length / 2) + [...row.slice(0, row.length / 2)].reverse().join('')).join('/');
  const symmetric = rows => rows === mirror(rows);

  function random(seed) {
    let state = seed >>> 0;
    return max => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return Math.floor(state / 4294967296 * max);
    };
  }

  // Each family draws a different structure; color follows the structure.
  function geometry(n, attempt, mode) {
    const pick = random(Math.imul(attempt + 1, 2654435761) ^ n);
    const family = pick(5);
    const palette = PALETTES[pick(PALETTES.length)];
    const grid = Array.from({ length: n }, () => Array(n).fill('.'));
    const put = (x, y, ink) => { grid[y][x] = palette[ink]; };
    const offset = pick(n);
    if (family === 0) {
      // Adjacent horizontal bands share at least one column.
      let anchor = offset;
      for (let y = 0; y < n; y++) {
        const a = pick(n), b = pick(n);
        const from = Math.min(anchor, a), to = Math.max(anchor, b);
        for (let x = from; x <= to; x++) put(x, y, y % 3);
        anchor = from + pick(to - from + 1);
      }
    } else if (family === 1) {
      // Stepped diagonal, with small offsets on either side of its spine.
      for (let y = 0; y < n; y++) {
        const from = Math.max(0, y - pick(3)), to = Math.min(n - 1, y + pick(3));
        for (let x = from; x <= to; x++) {
          put(x, y, x === y ? 0 : x < y ? 1 : 2);
        }
      }
    } else if (family === 2) {
      // Outer border segments and a colored inset.
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const edge = Math.min(x, y, n - 1 - x, n - 1 - y);
        if (edge === 0 ? pick(5) < 3 : pick(5) < 2) put(x, y, edge === 0 ? 0 : 1 + (x + y) % 2);
      }
    } else if (family === 3) {
      // Four clusters grow inward from separate anchors.
      for (let i = 0; i < 4; i++) {
        const x0 = i % 2 ? n - 1 : 0, y0 = i > 1 ? n - 1 : 0;
        const dx = x0 ? -1 : 1, dy = y0 ? -1 : 1;
        const width = 1 + pick(n / 2 + 1), height = 1 + pick(n / 2 + 1);
        const bevel = pick(Math.min(width, height));
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
          if (x + y < width + height - 1 - bevel) put(x0 + x * dx, y0 + y * dy, i % 3);
        }
      }
    } else {
      // One winding ribbon, with color marking the direction changes.
      let x = offset, y = pick(n);
      for (let i = 0; i < n * n; i++) {
        put(x, y, Math.floor(i / n) % 3);
        const d = pick(4);
        x = Math.max(0, Math.min(n - 1, x + (d === 0 ? 1 : d === 1 ? -1 : 0)));
        y = Math.max(0, Math.min(n - 1, y + (d === 2 ? 1 : d === 3 ? -1 : 0)));
      }
    }
    let rows = grid.map(row => row.join('')).join('/');
    if (mode === 'm') rows = mirror(rows);
    const count = rows.match(/[A-Z]/g)?.length || 0;
    if (count < n + 1 || count > n * n - 2 || new Set(rows.match(/[A-Z]/g)).size < 2) return null;
    return { rows, count, family, palette: palette[3] };
  }

  const LABELS = ['Renk basamakları', 'Çapraz iz', 'Kenar mozaiği', 'Köşe kümeleri', 'Renk yolu'];
  const REVERSED = s => [...s].reverse().join('');
  function near(a, b) {
    if (!a || a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) if ((a[i] === '.') !== (b[i] === '.')) diff++;
    return diff < 3;
  }

  function buildCatalog(base, sprites = {}, reviewed = {}, curatedReview = {}) {
    const used = new Set();
    const names = new Set();
    const reserved = new Map();
    const result = [];
    function reserve(rows, mode, group, no) {
      const key = canonical(rows);
      if (!key || (mode !== 'm' && used.has(key))) return false;
      if (mode !== 'm') used.add(key);
      reserved.set(`${group}:${no}`, true);
      return true;
    }
    // Reserve explicitly reviewed art first, so generated ornaments never crowd it out.
    for (const group of GROUPS) for (const [no, [name, rows, mode]] of Object.entries(reviewed[group] || {})) {
      if (!reserve(rows, mode, group, no)) throw Error(`Tekrarlanan çizim: ${group} ${no} ${name}`);
    }
    const first = Object.fromEntries(GROUPS.map(group => [group, base.filter(row => row[0] === group).map((row, i) => {
      const change = curatedReview[group]?.[i + 1];
      if (!change) return row;
      const [name, rows] = change;
      return [group, row[1], name || row[2], rows || row[3], row[4]];
    })]));
    for (const group of GROUPS) first[group].forEach((row, i) => reserve(row[3], row[4], group, i + 1));
    for (const group of GROUPS) {
      const n = SIZES[group];
      let attempt = 0;
      const art = [...(sprites[group] || [])];
      const artSlots = Array.from({ length: 250 }, (_, i) => i + 51).filter(no => !reviewed[group]?.[no]);
      const artAt = new Set(art.map((_, i) => artSlots[Math.floor((i + .5) * artSlots.length / art.length)]));
      const previous = [];
      const title = (name, mode, rows) => {
        const plain = name.replace(/^Ayna: /, '');
        let chosen = plain;
        if (names.has(chosen)) {
          const count = rows.match(/[A-Z]/g).length;
          chosen = `${plain} · ${count} kare`;
          let variant = 2;
          while (names.has(chosen)) chosen = `${plain} · ${count} kare (${variant++})`;
        }
        names.add(chosen);
        return mode === 'm' ? `Ayna: ${chosen}` : chosen;
      };
      for (let no = 1; no <= 300; no++) {
        let row = first[group][no - 1];
        const fixed = reviewed[group]?.[no];
        if (fixed) row = [group, `art-${no}`, ...fixed];
        else if (!reserved.has(`${group}:${no}`)) {
          row = null;
          // Space out hand drawn characters and objects between geometric puzzles.
          if (artAt.has(no)) while (art.length && !row) {
            const [name, rows] = art.shift();
            if (reserve(rows, '', group, no)) row = [group, `art-${no}`, name, rows, ''];
          }
          const mode = group === 's2' && no > 50 && no % 4 === 0 ? 'm' : '';
          while (!row && attempt < 50000) {
            const draw = geometry(n, attempt++, mode);
            if (!draw) continue;
            const { rows, count, family, palette } = draw;
            const key = canonical(rows);
            if (used.has(key) || previous.some(old => near(rows, old) || near(rows, REVERSED(old)))) continue;
            const name = `${palette} · ${LABELS[family]} · ${count} kare`;
            if (names.has(name)) continue;
            // Generated mirror levels also get a distinct outline.
            used.add(key);
            row = [group, `art-${no}`, name, rows, mode];
          }
        }
        if (!row) throw Error(`Eksik bölüm: ${group} ${no}`);
        if (!canonical(row[3]) || (row[4] === 'm' && !symmetric(row[3]))) throw Error(`Geçersiz çizim: ${group} ${no}`);
        result.push([group, row[1], title(row[2], row[4], row[3]), row[3], row[4]]);
        previous.push(row[3]);
        if (previous.length > 5) previous.shift();
      }
    }
    return result;
  }
  const api = { buildCatalog, canonical };
  root.TilelyLevelGenerator = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
