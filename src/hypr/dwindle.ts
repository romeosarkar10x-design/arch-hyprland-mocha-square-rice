// A small dwindle layout: the binary split tree Hyprland's default layout keeps per workspace.

export type Direction = "left" | "right" | "up" | "down";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Tree =
  | { t: "leaf"; id: string }
  /** `vertical`: children stacked top / bottom; otherwise side by side. `ratio` is the first child's share. */
  | { t: "split"; vertical: boolean; ratio: number; a: Tree; b: Tree };

type Split = Extract<Tree, { t: "split" }>;

function splitRects(s: Split, r: Rect, gapsIn: number): [Rect, Rect] {
  const gap = gapsIn * 2;
  if (s.vertical) {
    const h = (r.h - gap) * s.ratio;
    return [{ ...r, h }, { ...r, y: r.y + h + gap, h: r.h - h - gap }];
  }
  const w = (r.w - gap) * s.ratio;
  return [{ ...r, w }, { ...r, x: r.x + w + gap, w: r.w - w - gap }];
}

/** Window rectangles for a tree laid out in `area`, `gapsIn` around each window. */
export function layout(tree: Tree | null, area: Rect, gapsIn: number): Map<string, Rect> {
  const out = new Map<string, Rect>();
  const walk = (n: Tree, r: Rect) => {
    if (n.t === "leaf") {
      out.set(n.id, r);
      return;
    }
    const [ra, rb] = splitRects(n, r, gapsIn);
    walk(n.a, ra);
    walk(n.b, rb);
  };
  if (tree) walk(tree, area);
  return out;
}

export function leaves(tree: Tree | null): string[] {
  if (!tree) return [];
  return tree.t === "leaf" ? [tree.id] : [...leaves(tree.a), ...leaves(tree.b)];
}

/**
 * Open `id` next to `target`: dwindle splits the target along its longer side (or the
 * preselected direction) and puts the new window right / below.
 */
export function insert(tree: Tree | null, target: string | null, id: string, area: Rect, gapsIn: number, preselect?: "d" | "r" | null): Tree {
  const leaf: Tree = { t: "leaf", id };
  if (!tree) return leaf;
  const rects = layout(tree, area, gapsIn);
  const at = target && rects.has(target) ? target : leaves(tree).at(-1)!;
  const r = rects.get(at)!;
  const vertical = preselect ? preselect === "d" : r.h > r.w;
  const replace = (n: Tree): Tree => {
    if (n.t === "leaf") return n.id === at ? { t: "split", vertical, ratio: 0.5, a: n, b: leaf } : n;
    return { ...n, a: replace(n.a), b: replace(n.b) };
  };
  return replace(tree);
}

/** Remove `id`; its sibling takes the parent's place. */
export function remove(tree: Tree | null, id: string): Tree | null {
  if (!tree) return null;
  if (tree.t === "leaf") return tree.id === id ? null : tree;
  const a = remove(tree.a, id), b = remove(tree.b, id);
  if (!a) return b;
  if (!b) return a;
  return { ...tree, a, b };
}

export function swap(tree: Tree | null, x: string, y: string): Tree | null {
  if (!tree) return null;
  if (tree.t === "leaf") return tree.id === x ? { t: "leaf", id: y } : tree.id === y ? { t: "leaf", id: x } : tree;
  return { ...tree, a: swap(tree.a, x, y)!, b: swap(tree.b, x, y)! };
}

/** The window whose edge is nearest in `dir`, preferring ones that overlap on the other axis. */
export function neighbour(rects: Map<string, Rect>, from: string, dir: Direction): string | null {
  const f = rects.get(from);
  if (!f) return null;
  const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
  let best: string | null = null, bestScore = Infinity;
  for (const [id, r] of rects) {
    if (id === from) continue;
    const ahead =
      dir === "left" ? r.x + r.w <= f.x + 1 : dir === "right" ? r.x >= f.x + f.w - 1 : dir === "up" ? r.y + r.h <= f.y + 1 : r.y >= f.y + f.h - 1;
    if (!ahead) continue;
    const horizontal = dir === "left" || dir === "right";
    const overlap = horizontal ? Math.min(r.y + r.h, f.y + f.h) - Math.max(r.y, f.y) : Math.min(r.x + r.w, f.x + f.w) - Math.max(r.x, f.x);
    const gap = dir === "left" ? f.x - (r.x + r.w) : dir === "right" ? r.x - (f.x + f.w) : dir === "up" ? f.y - (r.y + r.h) : r.y - (f.y + f.h);
    const off = horizontal ? Math.abs(r.y + r.h / 2 - cy) : Math.abs(r.x + r.w / 2 - cx);
    const score = gap + off * 0.25 + (overlap > 0 ? 0 : 10_000);
    if (score < bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}

/**
 * `resizeactive dx dy`: move the nearest split on each axis so `id` grows by dx / dy px
 * (negative shrinks). Ratios stay within 10–90%.
 */
export function resize(tree: Tree | null, id: string, dx: number, dy: number, area: Rect, gapsIn: number): Tree | null {
  if (!tree) return null;
  const path: { node: Split; side: "a" | "b"; r: Rect }[] = [];
  const find = (n: Tree, r: Rect): boolean => {
    if (n.t === "leaf") return n.id === id;
    const [ra, rb] = splitRects(n, r, gapsIn);
    for (const [side, child, cr] of [["a", n.a, ra], ["b", n.b, rb]] as const) {
      path.push({ node: n, side, r });
      if (find(child, cr)) return true;
      path.pop();
    }
    return false;
  };
  if (!find(tree, area)) return tree;
  const changes = new Map<Split, number>();
  for (const [delta, vertical] of [[dx, false], [dy, true]] as const) {
    if (!delta) continue;
    const hit = path.findLast((p) => p.node.vertical === vertical);
    if (!hit) continue;
    const size = (vertical ? hit.r.h : hit.r.w) - gapsIn * 2;
    const ratio = hit.node.ratio + (hit.side === "a" ? delta : -delta) / size;
    changes.set(hit.node, Math.min(0.9, Math.max(0.1, ratio)));
  }
  const rebuild = (n: Tree): Tree => (n.t === "leaf" ? n : { ...n, ratio: changes.get(n) ?? n.ratio, a: rebuild(n.a), b: rebuild(n.b) });
  return rebuild(tree);
}
