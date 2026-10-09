import { Meter } from "../data/Meter";
import { StackBar } from "../data/StackBar";
import { Stat } from "../data/Stat";
import { Icon } from "../foundations/Icon";
import { bytes } from "../lib";
import { Panel } from "./Panel";
import { PanelSection } from "./PanelSection";
import { useSystemStats, type MemStats } from "../stats";

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
  const topMax = Math.max(...m.top.map((p) => p.pss));
  return (
    <Panel
      className={className}
      icon="memory"
      accent="mauve"
      title="Memory"
      subtitle={`${bytes(m.total)} DDR5 · ${Math.round(pct)}% in use`}
      live={!paused}
    >
      <PanelSection>
        <div className="hx-stats">
          <Stat label="used" value={(m.used / 1024 ** 3).toFixed(1)} hint="GiB" accent="mauve" />
          <Stat label="cached" value={(m.cached / 1024 ** 3).toFixed(1)} hint="GiB" accent="blue" />
          <Stat label="available" value={((m.total - m.used) / 1024 ** 3).toFixed(1)} hint="GiB" />
        </div>
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
              <span className="hx-faint">
                {"/ "}
                {bytes(m.swapTotal, 0)}
              </span>
            </>
          }
        />
      </PanelSection>
      <PanelSection label="top processes" aside={<span className="hx-faint">pss</span>}>
        <div className="hx-procs">
          {m.top.map((p) => (
            <div key={p.name} className="hx-proc">
              <Icon name={p.icon} className="hx-proc-icon" />
              <span className="hx-proc-name">{p.name}</span>
              <span className="hx-proc-bar">
                <i style={{ width: `${(p.pss / topMax) * 100}%` }} />
              </span>
              <span className="hx-proc-val">{bytes(p.pss)}</span>
            </div>
          ))}
        </div>
      </PanelSection>
    </Panel>
  );
}
