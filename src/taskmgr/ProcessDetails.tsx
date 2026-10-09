import { Button, Graph, Icon, IconButton, StackBar } from "../ds";
import type { Ask } from "./dialogs";
import { MACHINE } from "./demo";
import {
  ancestors,
  appOf,
  childMap,
  descendants,
  fmtCpu,
  fmtDuration,
  fmtKiB,
  fmtRate,
  rss,
  signalByNum,
  STATE_LABEL,
  totals,
  type MemMetric,
  type Proc,
} from "./procs";
import type { TM } from "./store";

export interface ProcessDetailsProps {
  proc: Proc;
  tm: TM;
  metric: MemMetric;
  ask: Ask;
  onSelect: (pid: number) => void;
  onClose: () => void;
}

/** Properties panel: identity, live graphs, memory breakdown, ancestry, children and signal handlers. */
export function ProcessDetails({ proc: p, tm, metric, ask, onSelect, onClose }: ProcessDetailsProps) {
  const h = tm.ph[p.pid] ?? { cpu: [], mem: [] };
  const byPid = new Map(tm.procs.map((x) => [x.pid, x]));
  const chain = ancestors(tm.procs, p.pid);
  const kids = childMap(tm.procs).get(p.pid) ?? [];
  const all = descendants(tm.procs, p.pid);
  const tree = totals([p, ...all], metric);
  const handlers = Object.entries(p.handlers ?? {});
  const stopped = p.state === "T";
  return (
    <aside className="rx-tm-details" aria-label={`${p.name} properties`}>
      <header>
        <Icon name={p.icon ?? (p.kernel ? "cpu" : "terminal")} size={22} />
        <div>
          <b>{p.name}</b>
          <span className="hx-faint">
            PID {p.pid} · {appOf(byPid, p)}
          </span>
        </div>
        <span className="hx-spacer" />
        <IconButton icon="close" label="Close (Esc)" size="sm" onClick={onClose} />
      </header>

      <div className="rx-tm-details-actions">
        <Button size="sm" variant="danger" icon="close" onClick={() => ask.send([p.pid], 15)}>
          End
        </Button>
        <Button size="sm" variant="secondary" icon="flash" onClick={() => ask.send([p.pid], 9)}>
          Kill
        </Button>
        <Button size="sm" variant="secondary" icon={stopped ? "play" : "pause"} onClick={() => ask.send([p.pid], stopped ? 18 : 19)}>
          {stopped ? "Resume" : "Suspend"}
        </Button>
        <Button size="sm" variant="ghost" icon="more" onClick={() => ask.signal([p.pid])}>
          Signal…
        </Button>
        <Button size="sm" variant="ghost" icon="gauge" onClick={() => ask.renice(p.pid)}>
          Nice {p.nice}
        </Button>
      </div>

      <section>
        <h4 className="hx-caps">Live</h4>
        <div className="rx-tm-details-graphs">
          <div>
            <span className="hx-faint">CPU {fmtCpu(p.cpu / MACHINE.threads)}% of total</span>
            <Graph series={[{ label: "cpu", data: h.cpu, accent: "sky" }]} height={64} gridLines={2} format={(x) => `${fmtCpu(x)}%`} />
          </div>
          <div>
            <span className="hx-faint">Memory (PSS) {fmtKiB(p.pss)}</span>
            <Graph series={[{ label: "pss", data: h.mem, accent: "mauve" }]} height={64} gridLines={2} format={fmtKiB} />
          </div>
        </div>
      </section>

      <section>
        <h4 className="hx-caps">Process</h4>
        <dl className="rx-tm-kv">
          <dt>State</dt>
          <dd>
            <span className={`rx-tm-state rx-tm-state--${p.state}`}>{p.state}</span> {STATE_LABEL[p.state]}
          </dd>
          <dt>User</dt>
          <dd>{p.user}</dd>
          <dt>Parent</dt>
          <dd>{byPid.get(p.ppid) ? <button type="button" className="rx-tm-link" onClick={() => onSelect(p.ppid)}>{byPid.get(p.ppid)!.name} ({p.ppid})</button> : p.ppid}</dd>
          <dt>Started</dt>
          <dd>{fmtDuration(tm.uptime - p.start)} ago</dd>
          <dt>CPU time</dt>
          <dd>{fmtDuration(p.cputime)}</dd>
          <dt>Threads</dt>
          <dd>{p.threads}</dd>
          <dt>Priority</dt>
          <dd>
            nice {p.nice} · prio {20 + p.nice}
          </dd>
          <dt>Disk</dt>
          <dd>
            ↓ {fmtRate(p.read)} · ↑ {fmtRate(p.write)}
          </dd>
          <dt>TTY</dt>
          <dd>{p.tty ?? "none"}</dd>
          {p.cwd && (
            <>
              <dt>cwd</dt>
              <dd className="rx-tm-mono">{p.cwd}</dd>
            </>
          )}
          <dt>cgroup</dt>
          <dd className="rx-tm-mono">/{p.unit}</dd>
        </dl>
        <pre className="rx-tm-cmdline">{p.state === "Z" ? "(zombie: no command line)" : p.cmd}</pre>
      </section>

      {!p.kernel && p.state !== "Z" && (
        <section>
          <h4 className="hx-caps">Memory</h4>
          <StackBar
            total={rss(p) + p.swap}
            format={fmtKiB}
            segments={[
              { label: "private (USS)", value: p.uss, accent: "mauve" },
              { label: "shared", value: p.shared, accent: "blue" },
              ...(p.swap ? [{ label: "swap", value: p.swap, accent: "peach" as const }] : []),
            ]}
          />
          <dl className="rx-tm-kv rx-tm-kv--3">
            <dt>USS</dt>
            <dd>{fmtKiB(p.uss)}</dd>
            <dt>PSS</dt>
            <dd>{fmtKiB(p.pss)}</dd>
            <dt>RSS</dt>
            <dd>{fmtKiB(rss(p))}</dd>
            <dt>Virtual</dt>
            <dd>{fmtKiB(p.vsz)}</dd>
          </dl>
          <p className="hx-faint">Ending it frees about {fmtKiB(p.uss)} (its private pages); shared libraries stay loaded for other processes.</p>
        </section>
      )}

      <section>
        <h4 className="hx-caps">Ancestry</h4>
        <ol className="rx-tm-chain">
          {chain.map((a) => (
            <li key={a.pid}>
              <button type="button" className="rx-tm-link" onClick={() => onSelect(a.pid)}>
                {a.name} <span className="hx-faint">{a.pid}</span>
              </button>
            </li>
          ))}
          <li>
            <b>
              {p.name} <span className="hx-faint">{p.pid}</span>
            </b>
          </li>
        </ol>
      </section>

      {kids.length > 0 && (
        <section>
          <h4 className="hx-caps">
            Children · {kids.length} direct, {all.length} total
          </h4>
          <p className="hx-faint">
            Whole tree: {fmtCpu(tree.cpu / MACHINE.threads)}% CPU · {fmtKiB(tree.mem)} {metric.toUpperCase()} · {tree.threads} threads
          </p>
          <ul className="rx-tm-kids">
            {kids.map((c) => {
              const t = totals([c, ...descendants(tm.procs, c.pid)], metric);
              return (
                <li key={c.pid}>
                  <button type="button" className="rx-tm-link" onClick={() => onSelect(c.pid)}>{c.name}</button>
                  <span className="hx-faint">{c.pid}</span>
                  <span className="hx-spacer" />
                  <span>{fmtCpu(t.cpu / MACHINE.threads)}%</span>
                  <span>{fmtKiB(t.mem)}</span>
                  {t.count > 1 && <span className="rx-tm-count">Σ {t.count}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h4 className="hx-caps">Signal handling</h4>
        <ul className="rx-tm-handlers">
          {handlers.map(([num, hd]) => (
            <li key={num}>
              <b>{signalByNum(Number(num))?.name ?? `signal ${num}`}</b>
              <span>{hd!.note}</span>
              {!hd!.exit && <span className="rx-tm-tag">survives</span>}
            </li>
          ))}
          {p.withParent && (
            <li>
              <b>parent exits</b>
              <span>Exits too (IPC pipe / Wayland display / terminal hangup).</span>
            </li>
          )}
          {p.subreaper && (
            <li>
              <b>subreaper</b>
              <span>Adopts orphaned descendants instead of PID 1.</span>
            </li>
          )}
          {!handlers.length && !p.withParent && !p.subreaper && <li className="hx-faint">Default dispositions: SIGTERM / SIGINT / SIGHUP end it.</li>}
        </ul>
      </section>
    </aside>
  );
}
