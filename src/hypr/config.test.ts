import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BINDS, SUGGESTED_BINDS, resolveAnim } from "./config.ts";

const combo = (keys: string[]) => keys.map((k) => k.toUpperCase()).join("+");
const bound = new Set(BINDS.flatMap((g) => g.binds.map((b) => combo(b.keys))));

test("every literal bind in hyprland.lua is listed", () => {
  const lua = readFileSync(new URL("./hyprland.lua", import.meta.url), "utf8");
  const lines = lua.split("\n").filter((l) => /^hl\.bind\(/.test(l.trim()));
  // Loop-generated binds (`" + " .. key`) are checked by hand; only literal combos here.
  const keys = lines.filter((l) => !/" \.\. key/.test(l)).map((l) => {
    const m = /^hl\.bind\((?:mainMod \.\. )?"([^"]+)"/.exec(l.trim())!;
    const rest = m[1]!.replace(/^ \+ /, "");
    return (l.includes("mainMod ..") ? `SUPER+${rest}` : rest).replace(/\s*\+\s*/g, "+").toUpperCase();
  });
  const alias: Record<string, string> = { "SUPER+MOUSE:272": "SUPER+LMB", "SUPER+MOUSE:273": "SUPER+RMB", "SUPER+MOUSE_DOWN": "SUPER+SCROLL ↓", "SUPER+MOUSE_UP": "SUPER+SCROLL ↑" };
  for (const k of keys) assert.ok(bound.has(alias[k] ?? k), `${k} from hyprland.lua missing in BINDS`);
});

test("suggested binds are free in hyprland.lua", () => {
  for (const b of SUGGESTED_BINDS.binds) assert.ok(!bound.has(combo(b.keys)), `${combo(b.keys)} is already bound`);
});

test("animation leaves inherit and convert speed to ms", () => {
  assert.equal(resolveAnim("windowsIn").ms, 410);
  assert.equal(resolveAnim("workspacesIn").ms, 300); // inherits workspaces
  assert.match(resolveAnim("windowsIn").easing, /cubic-bezier\(0.05, 0.9, 0.1, 1.05\)/);
  assert.equal(resolveAnim("windows", undefined, undefined, 2).ms, 958);
});
