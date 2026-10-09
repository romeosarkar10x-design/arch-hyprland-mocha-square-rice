import assert from "node:assert/strict";
import { test } from "node:test";
import { demoProcs, demoUnits, ME } from "./demo.ts";
import { buildRows, descendants, renice, sendSignal, spawn, totals, unitProcs, type ViewOptions } from "./procs.ts";

const view = (o: Partial<ViewOptions> = {}): ViewOptions => ({
  mode: "tree", groupBy: "app", club: false, metric: "pss", sort: "pid", desc: false, query: "", hideKernel: false, toggled: new Set(), ...o,
});
const find = (procs: ReturnType<typeof demoProcs>, pid: number) => procs.find((p) => p.pid === pid);

test("demo table is a well-formed tree", () => {
  const procs = demoProcs();
  const pids = new Set(procs.map((p) => p.pid));
  assert.equal(pids.size, procs.length, "duplicate pid");
  for (const p of procs) assert.ok(p.ppid === 0 || pids.has(p.ppid), `${p.pid} has missing parent ${p.ppid}`);
  for (const u of demoUnits()) if (!u.result && u.enabled) assert.ok(u.template.length, `${u.name} has no processes`);
});

test("interactive shells ignore SIGTERM but die (with their jobs) on SIGHUP", () => {
  const procs = demoProcs();
  const term = sendSignal(procs, [2034], 15, { as: ME });
  assert.equal(term.results[0]!.outcome, "handled");
  assert.equal(term.procs.length, procs.length);
  const hup = sendSignal(procs, [2034], 1, { as: ME });
  assert.equal(hup.results[0]!.outcome, "exited");
  assert.deepEqual(hup.results[0]!.alsoExited.map((x) => x.pid), [4412]);
  assert.ok(!find(hup.procs, 4412));
});

test("a runaway ignoring SIGTERM still dies to SIGKILL", () => {
  const procs = demoProcs();
  assert.equal(sendSignal(procs, [4412], 15, { as: ME }).results[0]!.outcome, "handled");
  const kill = sendSignal(procs, [4412], 9, { as: ME });
  assert.equal(kill.results[0]!.outcome, "exited");
  assert.ok(!find(kill.procs, 4412));
});

test("ending firefox takes its content processes with it", () => {
  const procs = demoProcs();
  const kids = descendants(procs, 2200).length;
  const r = sendSignal(procs, [2200], 15, { as: ME });
  assert.equal(r.results[0]!.alsoExited.length, kids);
  assert.equal(r.procs.length, procs.length - kids - 1);
});

test("orphans go to the nearest subreaper, else PID 1", () => {
  const procs = demoProcs();
  const user = sendSignal(procs, [1070], 15, { as: ME });
  assert.deepEqual(user.results[0]!.reparented, [{ pid: 1071, name: "dbus-broker", to: 1050 }]);
  assert.equal(find(user.procs, 1071)!.ppid, 1050);
  const sys = sendSignal(procs, [513], 15, { as: "root" });
  assert.equal(find(sys.procs, 514)!.ppid, 1);
});

test("permissions, PID 1, kernel threads and zombies", () => {
  const procs = demoProcs();
  assert.equal(sendSignal(procs, [602], 15, { as: ME }).results[0]!.outcome, "EPERM");
  assert.equal(sendSignal(procs, [602], 1, { as: "root" }).results[0]!.outcome, "handled");
  assert.equal(sendSignal(procs, [1], 9, { as: "root" }).results[0]!.outcome, "protected");
  assert.equal(sendSignal(procs, [1], 15, { as: "root" }).results[0]!.outcome, "handled");
  assert.equal(sendSignal(procs, [64], 9, { as: "root" }).results[0]!.outcome, "ignored");
  assert.equal(sendSignal(procs, [2750], 9, { as: ME }).results[0]!.outcome, "ignored");
  // Ending the zombie's parent reaps it.
  const steam = sendSignal(procs, [2700], 15, { as: ME });
  assert.ok(!find(steam.procs, 2750));
  assert.equal(sendSignal(procs, [99999], 15, { as: ME }).results[0]!.outcome, "ESRCH");
});

test("postgres shuts down via its handler, and kill tree reaches every descendant", () => {
  const procs = demoProcs();
  const pg = sendSignal(procs, [1441], 15, { as: "root" });
  assert.equal(pg.results[0]!.outcome, "exited");
  assert.match(pg.results[0]!.note, /Smart shutdown/);
  assert.equal(pg.results[0]!.alsoExited.length, 5);
  const tree = sendSignal(procs, [1102], 9, { as: ME, tree: true });
  assert.ok(!tree.procs.some((p) => p.ppid === 1102 || p.unit === "session-2.scope"));
});

test("SIGSTOP / SIGCONT", () => {
  const stopped = sendSignal(demoProcs(), [2140], 19, { as: ME });
  assert.equal(find(stopped.procs, 2140)!.state, "T");
  const cont = sendSignal(stopped.procs, [2140], 18, { as: ME });
  assert.equal(find(cont.procs, 2140)!.state, "S");
});

test("renice: users may only lower priority", () => {
  const procs = demoProcs();
  assert.equal(renice(procs, 2140, 10, ME).ok, true);
  assert.equal(renice(procs, 2140, -5, ME).ok, false);
  assert.equal(renice(procs, 2140, -5, "root").ok, true);
  assert.equal(renice(procs, 602, 5, ME).ok, false);
});

test("clubbed tree rows carry their subtree totals", () => {
  const procs = demoProcs();
  const rows = buildRows(procs, view({ club: true }));
  const ff = rows.find((r) => r.proc?.pid === 2200)!;
  const sub = [find(procs, 2200)!, ...descendants(procs, 2200)];
  assert.equal(ff.count, sub.length);
  assert.equal(ff.shown.pss, totals(sub, "pss").pss);
  const own = buildRows(procs, view()).find((r) => r.proc?.pid === 2200)!;
  assert.equal(own.shown.pss, find(procs, 2200)!.pss);
});

test("collapsing hides children; search keeps ancestors as context", () => {
  const procs = demoProcs();
  const collapsed = buildRows(procs, view({ toggled: new Set(["p:2200"]) }));
  assert.ok(!collapsed.some((r) => r.proc?.ppid === 2200));
  const hit = buildRows(procs, view({ query: "scrape" }));
  assert.deepEqual(hit.filter((r) => r.match).map((r) => r.proc!.pid), [4412]);
  assert.deepEqual(hit.map((r) => r.proc!.pid), [1, 700, 1102, 2010, 2034, 4412]);
});

test("group by app clubs helpers under their app", () => {
  const procs = demoProcs();
  const rows = buildRows(procs, view({ mode: "group", groupBy: "app" }));
  const ff = rows.find((r) => r.label === "Firefox")!;
  assert.equal(ff.count, 1 + descendants(procs, 2200).length);
  const gh = rows.find((r) => r.label === "Ghostty")!;
  assert.equal(gh.count, 1 + descendants(procs, 2010).length);
  const web = buildRows(procs, view({ mode: "group", groupBy: "name" })).find((r) => r.label === "Web Content")!;
  assert.equal(web.count, 6);
});

test("a stopped unit starts again with fresh pids", () => {
  const procs = demoProcs();
  const docker = demoUnits(procs).find((u) => u.name === "docker.service")!;
  const stopped = sendSignal(procs, unitProcs(procs, docker).map((p) => p.pid), 15, { as: "root" });
  assert.equal(unitProcs(stopped.procs, docker).length, 0);
  const started = spawn(stopped.procs, docker.template, 1, 10000, 5000);
  assert.deepEqual(unitProcs(started.procs, docker).map((p) => p.pid), [10000]);
  assert.equal(started.nextPid, 10001);
});
