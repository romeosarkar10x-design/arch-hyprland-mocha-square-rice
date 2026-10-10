import { Meter } from "../data/meter";
import { StackBar } from "../data/stack-bar";
import { Stat, StatGrid } from "../data/stat";
import { Icon } from "../foundations/icon";
import { bytes } from "../lib";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";
import { useSystemStats, type MemProcess, type MemStats } from "../stats";

export interface MemoryPanelProps {
  data?: MemStats;
  paused?: boolean;
  className?: string;
}

/** Memory popup: used/cached/free stack, swap meter, heaviest processes by PSS. */
export function MemoryPanel({ data, paused, className }: MemoryPanelProps) {
  const sim = useSystemStats(paused || !!data);
  const m = data ?? sim.mem;
  const pct = (m.used / m.total) * 100;
  return (
    <Panel
      data-component="MemoryPanel"
      className={className}
      icon="memory"
      accent="mauve"
      title="Memory"
      subtitle={`${bytes(m.total)} DDR5 · ${Math.round(pct)}% in use`}
      live={!paused}
    >
      <PanelSection>
        <StatGrid>
          <Stat label="used" value={(m.used / 1024 ** 3).toFixed(1)} hint="GiB" accent="mauve" />
          <Stat label="cached" value={(m.cached / 1024 ** 3).toFixed(1)} hint="GiB" accent="blue" />
          <Stat label="available" value={((m.total - m.used) / 1024 ** 3).toFixed(1)} hint="GiB" />
        </StatGrid>
        <StackBar
          total={m.total}
          format={(v) => bytes(v)}
          segments={[
            { label: "used", value: m.used, accent: "mauve" },
            { label: "cached", value: m.cached, accent: "blue" },
          ]}
        />
      </PanelSection>
      <PanelSection>
        <Meter
          label="swap · zram"
          accent="peach"
          value={(m.swapUsed / m.swapTotal) * 100}
          readout={
            <>
              <b>{bytes(m.swapUsed)}</b>{" "}
              <span className="text-overlay1">
                {"/ "}
                {bytes(m.swapTotal, 0)}
              </span>
            </>
          }
        />
      </PanelSection>
      <PanelSection label="top processes" aside={<span className="text-overlay1">pss</span>}>
        <ProcessList procs={m.top} />
      </PanelSection>
    </Panel>
  );
}

/** Heaviest processes with a bar scaled to the largest. */
function ProcessList({ procs }: { procs: MemProcess[] }) {
  const max = Math.max(...procs.map((p) => p.pss));
  return (
    <div data-component="ProcessList" className="flex flex-col">
      {procs.map((p) => (
        <div
          key={p.name}
          className="grid grid-cols-[18px_1fr_110px_70px] items-center gap-2.5 border-surface0 py-[5px] text-[12px] not-first:border-t not-first:border-dashed"
        >
          <Icon name={p.icon} className="text-[15px] text-subtext0" />
          <span>{p.name}</span>
          <span className="relative h-1 bg-surface0">
            <i className="absolute inset-y-0 left-0 bg-mauve transition-[width] duration-(--hx-slow) ease-hx" style={{ width: `${(p.pss / max) * 100}%` }} />
          </span>
          <span className="text-right text-subtext0">{bytes(p.pss)}</span>
        </div>
      ))}
    </div>
  );
}
