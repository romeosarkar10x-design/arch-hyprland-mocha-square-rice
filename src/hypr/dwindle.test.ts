import assert from "node:assert/strict";
import { test } from "node:test";
import { insert, layout, leaves, neighbour, remove, resize, swap, type Tree } from "./dwindle.ts";

const AREA = { x: 0, y: 0, w: 1000, h: 600 };
const build = (...ids: string[]) => ids.reduce<Tree | null>((t, id, i) => insert(t, ids[i - 1] ?? null, id, AREA, 0), null)!;

test("dwindle splits the longer side", () => {
  const t = build("a", "b", "c");
  const r = layout(t, AREA, 0);
  assert.deepEqual(r.get("a"), { x: 0, y: 0, w: 500, h: 600 });
  assert.deepEqual(r.get("b"), { x: 500, y: 0, w: 500, h: 300 });
  assert.deepEqual(r.get("c"), { x: 500, y: 300, w: 500, h: 300 });
});

test("preselect overrides the split direction", () => {
  const t = insert({ t: "leaf", id: "a" }, "a", "b", AREA, 0, "d");
  assert.equal(layout(t, AREA, 0).get("b")!.y, 300);
});

test("close gives the space to the sibling", () => {
  const t = remove(build("a", "b", "c"), "b");
  assert.deepEqual(leaves(t), ["a", "c"]);
  assert.deepEqual(layout(t, AREA, 0).get("c"), { x: 500, y: 0, w: 500, h: 600 });
});

test("focus and swap by direction", () => {
  const t = build("a", "b", "c");
  const r = layout(t, AREA, 0);
  assert.equal(neighbour(r, "a", "right"), "b");
  assert.equal(neighbour(r, "c", "up"), "b");
  assert.equal(neighbour(r, "c", "left"), "a");
  assert.equal(neighbour(r, "a", "left"), null);
  assert.deepEqual(leaves(swap(t, "a", "c")), ["c", "b", "a"]);
});

test("resize moves the nearest split on each axis", () => {
  const t = build("a", "b", "c");
  const r = layout(resize(t, "c", -100, 60, AREA, 0), AREA, 0);
  assert.equal(r.get("a")!.w, 600);
  assert.equal(r.get("c")!.h, 360);
});
