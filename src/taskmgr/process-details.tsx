import type { ReactNode } from "react";
import { Button, Graph, Icon, IconButton, StackBar, cx } from "../ui";
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
import { count, link, state, tag } from "./styles";

const kv = "m-0 grid grid-cols-[76px_1fr] gap-x-2.5 gap-y-1 [&_dd]:m-0 [&_dd]:min-w-0 [&_dd]:[overflow-wrap:anywhere] [&_dt]:text-overlay1";
const list = "m-0 flex list-none flex-col gap-1 p-0";

/** One titled block of the panel. */
function DetailsSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section data-component="DetailsSection" className="flex flex-col gap-2 border-b border-surface0 px-3.5 py-3 [&_p]:m-0 [&_p]:text-[11.5px] [&_p]:leading-normal">
      <h4 className="caps m-0">{title}</h4>
      {children}
    </section>
  );
}

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
    <aside
      data-component="ProcessDetails"
      className="flex min-h-0 animate-[rx-tm-slide_var(--hx-med)_var(--hx-ease)_both] flex-col overflow-auto border-l border-surface0 bg-mantle"
      aria-label={`${p.name} properties`}
    >
      <header className="sticky top-0 z-1 flex items-center gap-2.5 border-b border-surface0 bg-mantle py-2.5 pr-2.5 pl-3.5">
        <Icon name={p.icon ?? (p.kernel ? "cpu" : "terminal")} size={22} />
        <div className="flex min-w-0 flex-col">
          <b className="truncate text-[14px]">{p.name}</b>
          <span className="text-overlay1">
            PID {p.pid} · {appOf(byPid, p)}
          </span>
        </div>
        <span className="flex-1" />
        <IconButton icon="close" label="Close (Esc)" size="sm" onClick={onClose} />
      </header>

      <div className="flex flex-wrap gap-1.5 border-b border-surface0 px-3.5 py-2.5">
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

      <DetailsSection title="Live">
        <div className="grid gap-2.5 *:flex *:flex-col *:gap-1 *:text-[11.5px]">
          <div>
            <span className="text-overlay1">CPU {fmtCpu(p.cpu / MACHINE.threads)}% of total</span>
            <Graph series={[{ label: "cpu", data: h.cpu, accent: "sky" }]} height={64} gridLines={2} format={(x) => `${fmtCpu(x)}%`} />
          </div>
          <div>
            <span className="text-overlay1">Memory (PSS) {fmtKiB(p.pss)}</span>
            <Graph series={[{ label: "pss", data: h.mem, accent: "mauve" }]} height={64} gridLines={2} format={fmtKiB} />
          </div>
        </div>
      </DetailsSection>

      <DetailsSection title="Process">
        <dl className={kv}>
          <dt>State</dt>
          <dd>
            <span className={state(p.state)}>{p.state}</span> {STATE_LABEL[p.state]}
          </dd>
          <dt>User</dt>
          <dd>{p.user}</dd>
          <dt>Parent</dt>
          <dd>{byPid.get(p.ppid) ? <button type="button" className={link} onClick={() => onSelect(p.ppid)}>{byPid.get(p.ppid)!.name} ({p.ppid})</button> : p.ppid}</dd>
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
              <dd className="font-hx">{p.cwd}</dd>
            </>
          )}
          <dt>cgroup</dt>
          <dd className="font-hx">/{p.unit}</dd>
        </dl>
        <pre className="m-0 bg-crust px-2.5 py-2 font-[inherit] text-[11.5px] break-all whitespace-pre-wrap text-green">{p.state === "Z" ? "(zombie: no command line)" : p.cmd}</pre>
      </DetailsSection>

      {!p.kernel && p.state !== "Z" && (
        <DetailsSection title="Memory">
          <StackBar
            total={rss(p) + p.swap}
            format={fmtKiB}
            segments={[
              { label: "private (USS)", value: p.uss, accent: "mauve" },
              { label: "shared", value: p.shared, accent: "blue" },
              ...(p.swap ? [{ label: "swap", value: p.swap, accent: "peach" as const }] : []),
            ]}
          />
          <dl className={cx(kv, "grid-cols-[repeat(4,auto_1fr)]")}>
            <dt>USS</dt>
            <dd>{fmtKiB(p.uss)}</dd>
            <dt>PSS</dt>
            <dd>{fmtKiB(p.pss)}</dd>
            <dt>RSS</dt>
            <dd>{fmtKiB(rss(p))}</dd>
            <dt>Virtual</dt>
            <dd>{fmtKiB(p.vsz)}</dd>
          </dl>
          <p className="text-overlay1">Ending it frees about {fmtKiB(p.uss)} (its private pages); shared libraries stay loaded for other processes.</p>
        </DetailsSection>
      )}

      <DetailsSection title="Ancestry">
        <ol className="m-0 flex list-none flex-col gap-[3px] p-0">
          {chain.map((a, i) => (
            <li key={a.pid} className={chainItem(i)}>
              <button type="button" className={link} onClick={() => onSelect(a.pid)}>
                {a.name} <span className="text-overlay1">{a.pid}</span>
              </button>
            </li>
          ))}
          <li className={chainItem(chain.length)}>
            <b>
              {p.name} <span className="text-overlay1">{p.pid}</span>
            </b>
          </li>
        </ol>
      </DetailsSection>

      {kids.length > 0 && (
        <DetailsSection title={`Children · ${kids.length} direct, ${all.length} total`}>
          <p className="text-overlay1">
            Whole tree: {fmtCpu(tree.cpu / MACHINE.threads)}% CPU · {fmtKiB(tree.mem)} {metric.toUpperCase()} · {tree.threads} threads
          </p>
          <ul className={list}>
            {kids.map((c) => {
              const t = totals([c, ...descendants(tm.procs, c.pid)], metric);
              return (
                <li key={c.pid} className="flex items-center gap-2 tabular-nums">
                  <button type="button" className={link} onClick={() => onSelect(c.pid)}>{c.name}</button>
                  <span className="text-overlay1">{c.pid}</span>
                  <span className="flex-1" />
                  <span>{fmtCpu(t.cpu / MACHINE.threads)}%</span>
                  <span>{fmtKiB(t.mem)}</span>
                  {t.count > 1 && <span className={count}>Σ {t.count}</span>}
                </li>
              );
            })}
          </ul>
        </DetailsSection>
      )}

      <DetailsSection title="Signal handling">
        <ul className={cx(list, "*:grid *:grid-cols-[82px_1fr_auto] *:items-baseline *:gap-2 *:text-[11.5px] [&_b]:text-mauve")}>
          {handlers.map(([num, hd]) => (
            <li key={num}>
              <b>{signalByNum(Number(num))?.name ?? `signal ${num}`}</b>
              <span>{hd!.note}</span>
              {!hd!.exit && <span className={tag()}>survives</span>}
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
          {!handlers.length && !p.withParent && !p.subreaper && <li className="text-overlay1">Default dispositions: SIGTERM / SIGINT / SIGHUP end it.</li>}
        </ul>
      </DetailsSection>
    </aside>
  );
}

/** `•` for the root, then `└` stepping in 10px a level (capped at five). */
function chainItem(i: number) {
  return cx(
    "relative pl-4 before:absolute before:left-0.5 before:text-surface2",
    i === 0 ? "before:content-['•']" : "before:content-['└']",
    ["", "ml-2.5", "ml-5", "ml-[30px]", "ml-10"][i] ?? "ml-[50px]",
  );
}
