import assert from "node:assert/strict";
import { test } from "node:test";
import { initTM, isRoot, reducer, HISTORY } from "./store.ts";

test("starts with a minute of history", () => {
  const s = initTM();
  assert.equal(s.hist.cpu.length, HISTORY);
  assert.equal(s.ph[2200]!.cpu.length, HISTORY);
});

test("signalling a root process asks polkit, then replays as root", () => {
  let s = initTM();
  s = reducer(s, { type: "signal", pids: [602], sig: 15 });
  assert.ok(s.auth);
  assert.ok(s.procs.some((p) => p.pid === 602));
  s = reducer(s, { type: "authorize", password: "" });
  assert.equal(s.auth!.failed, true);
  s = reducer(s, { type: "authorize", password: "hunter2" });
  assert.equal(s.auth, null);
  assert.ok(isRoot(s));
  assert.ok(!s.procs.some((p) => p.pid === 602));
  // Cached: the next privileged action goes straight through.
  s = reducer(s, { type: "unit", name: "sshd.service", op: "start" });
  assert.equal(s.auth, null);
  assert.ok(s.procs.some((p) => p.name === "sshd"));
});

test("an ignored SIGTERM suggests SIGKILL", () => {
  const s = reducer(initTM(), { type: "signal", pids: [4412], sig: 15 });
  assert.deepEqual(s.log[0]!.retry, { label: "Send SIGKILL", pids: [4412], sig: 9 });
});

test("user units need no auth; failed units stay failed", () => {
  let s = reducer(initTM(), { type: "unit", name: "pipewire.service", op: "restart" });
  assert.equal(s.auth, null);
  const pw = s.procs.filter((p) => p.name === "pipewire");
  assert.equal(pw.length, 1);
  assert.ok(pw[0]!.pid >= 10000);
  s = reducer({ ...s, rootUntil: s.uptime + 100 }, { type: "unit", name: "cups.service", op: "start" });
  assert.equal(s.unitResult["cups.service"], "failed");
});

test("startup entries respawn under Hyprland", () => {
  let s = reducer(initTM(), { type: "signal", pids: [1141], sig: 15 });
  assert.ok(!s.procs.some((p) => p.name === "waybar"));
  s = reducer(s, { type: "startup", name: "Waybar", op: "run" });
  assert.equal(s.procs.find((p) => p.name === "waybar")!.ppid, 1102);
});
