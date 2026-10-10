import { Button } from "../controls/button";
import { CoreGrid } from "../data/core-grid";
import { Gauge } from "../data/gauge";
import { Graph } from "../data/graph";
import { Meter } from "../data/meter";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";
import { useSystemStats, type CpuStats } from "../stats";

export interface CpuPanelProps {
  /** Live stats. Omit to run on the built-in simulation. */
  data?: CpuStats;
  /** Freeze the simulation (ignored when `data` is passed). */
  paused?: boolean;
  onOpenMonitor?: () => void;
  className?: string;
}

/** CPU popup: load/temp/power gauges, 60 s history, per-thread heatmap, clock meter. Live-simulated unless `data` is passed. */
export function CpuPanel({ data, paused, onOpenMonitor, className }: CpuPanelProps) {
  const sim = useSystemStats(paused || !!data);
  const c = data ?? sim.cpu;
  return (
    <Panel
      data-component="CpuPanel"
      className={className}
      icon="cpu"
      accent="sky"
      title="Processor"
      subtitle={`${c.model} · ${c.cores.length} threads`}
      live={!paused}
      actions={
        <>
          <Button icon="chart" accent="sky" onClick={onOpenMonitor} kbd="B">
            btop
          </Button>
          <span className="flex-1" />
          <span className="text-overlay1 text-sm">
            {"governor "}
            <span className="text-subtext0">schedutil</span>
          </span>
        </>
      }
    >
      <PanelSection>
        <div className="grid grid-cols-3 justify-items-center">
          <Gauge value={c.usage} label="load" accent="sky" />
          <Gauge value={c.temp} max={100} unit="°" label="temp" accent="teal" warn={75} crit={85} sub="k10temp" />
          {c.watts == null ? (
            <Gauge value={0} label="power" unit="W" accent="peach" sub="RAPL locked" />
          ) : (
            <Gauge value={c.watts} max={170} unit="W" label="power" accent="peach" warn={70} crit={90} sub="of 170 W" />
          )}
        </div>
      </PanelSection>
      <PanelSection
        label="load · 60 s"
        aside={
          <span className="text-subtext0">
            {"avg "}
            {Math.round(avg(c.history))}%
          </span>
        }
      >
        <Graph series={[{ label: "cpu", data: c.history, accent: "sky" }]} max={100} />
      </PanelSection>
      <PanelSection
        label="threads"
        aside={
          <span className="text-subtext0">
            {"peak "}
            {Math.round(Math.max(...c.cores))}%
          </span>
        }
      >
        <CoreGrid cores={c.cores} columns={6} />
      </PanelSection>
      <PanelSection>
        <Meter
          label="clock"
          readout={
            <>
              <b>{(c.mhz / 1000).toFixed(2)}</b>{" "}
              <span className="text-overlay1">
                {"/ "}
                {(c.maxMhz / 1000).toFixed(2)}
                {" GHz"}
              </span>
            </>
          }
          value={(c.mhz / c.maxMhz) * 100}
          accent="sky"
          levels={false}
        />
      </PanelSection>
    </Panel>
  );
}

function avg(a: number[]) {
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
}
