export interface Hex { q: number; r: number }
export const COLS = 11;
export const ROWS = 7;
export const DIRECTIONS: readonly Hex[] = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
];
export const key = (h: Hex) => `${h.q},${h.r}`;
export const equal = (a: Hex, b: Hex) => a.q === b.q && a.r === b.r;
export const add = (a: Hex, b: Hex): Hex => ({ q: a.q + b.q, r: a.r + b.r });
export const scale = (a: Hex, n: number): Hex => ({ q: a.q * n, r: a.r * n });
export const offset = (col: number, row: number): Hex => ({ q: col - Math.floor(row / 2), r: row });
export const column = (h: Hex) => h.q + Math.floor(h.r / 2);
export const inside = (h: Hex) => h.r >= 0 && h.r < ROWS && column(h) >= 0 && column(h) < COLS;
export const distance = (a: Hex, b: Hex) => Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.q + a.r - b.q - b.r));
export const neighbors = (h: Hex) => DIRECTIONS.map(d => add(h, d)).filter(inside);
export const cells = (): Hex[] => Array.from({ length: ROWS * COLS }, (_, i) => offset(i % COLS, Math.floor(i / COLS)));

export function roundHex(q: number, r: number): Hex {
  const s = -q - r;
  let rq = Math.round(q), rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return { q: rq || 0, r: rr || 0 };
}

export function line(a: Hex, b: Hex): Hex[] {
  const n = distance(a, b);
  if (!n) return [a];
  return Array.from({ length: n + 1 }, (_, i) => roundHex(
    a.q + (b.q - a.q) * i / n + 1e-6,
    a.r + (b.r - a.r) * i / n + 1e-6,
  ));
}

export function visible(a: Hex, b: Hex, obstacles: Set<string>): boolean {
  return line(a, b).slice(1).every(h => !obstacles.has(key(h)));
}

export function blast(center: Hex): Hex[] { return [center, ...neighbors(center)]; }

/** Aim snaps to one of the six hex axes; a ray stops at the first obstacle. */
export function ray(from: Hex, aim: Hex, length: number, obstacles: Set<string>): Hex[] {
  if (equal(from, aim)) return [];
  const dq = aim.q - from.q, dr = aim.r - from.r;
  const direction = [...DIRECTIONS].sort((a, b) =>
    (dq * b.q + dr * b.r + (dq + dr) * (b.q + b.r)) -
    (dq * a.q + dr * a.r + (dq + dr) * (a.q + a.r)),
  )[0];
  const result: Hex[] = [];
  for (let n = 1; n <= length; n++) {
    const h = add(from, scale(direction, n));
    if (!inside(h) || obstacles.has(key(h))) break;
    result.push(h);
  }
  return result;
}

export interface Reach { hex: Hex; path: Hex[] }
export function reachable(start: Hex, movement: number, blocked: Set<string>): Map<string, Reach> {
  const result = new Map<string, Reach>([[key(start), { hex: start, path: [] }]]);
  const queue: Reach[] = [{ hex: start, path: [] }];
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (current.path.length >= movement) continue;
    for (const h of neighbors(current.hex)) {
      if (blocked.has(key(h)) || result.has(key(h))) continue;
      const visit = { hex: h, path: [...current.path, h] };
      result.set(key(h), visit);
      queue.push(visit);
    }
  }
  return result;
}

export const HEX_SIZE = 35;
export const ORIGIN = { x: 160, y: 128 };
export function toPixel(h: Hex): { x: number; y: number } {
  return { x: ORIGIN.x + Math.sqrt(3) * HEX_SIZE * (h.q + h.r / 2), y: ORIGIN.y + HEX_SIZE * 1.5 * h.r };
}
export function fromPixel(x: number, y: number): Hex {
  x -= ORIGIN.x; y -= ORIGIN.y;
  return roundHex((Math.sqrt(3) / 3 * x - y / 3) / HEX_SIZE, (2 / 3 * y) / HEX_SIZE);
}
