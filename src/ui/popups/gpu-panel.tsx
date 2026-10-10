import { Button } from "../controls/button";
import { Gauge } from "../data/gauge";
import { Graph } from "../data/graph";
import { Meter } from "../data/meter";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";
import { useSystemStats, type GpuStats } from "../stats";

export interface GpuPanelProps {
  data?: GpuStats;
  paused?: boolean;
  onOpenMonitor?: () => void;
  className?: string;
}

/** NVIDIA popup: load/temp/power gauges, power-draw bars, VRAM/clock/fan meters. */
export function GpuPanel({ data, paused, onOpenMonitor, className }: GpuPanelProps) {
  const sim = useSystemStats(paused || !!data);
  const g = data ?? sim.gpu;
  return (
    <Panel
      data-component="GpuPanel"
      className={className}
      icon="gpu"
      accent="green"
      title="Graphics"
      subtitle={`${g.name} · driver 580.82`}
      live={!paused}
      actions={
        <>
          <Button icon="chart" accent="green" onClick={onOpenMonitor}>
            nvidia-smi
          </Button>
          <span className="flex-1" />
          <span className="text-overlay1 text-sm">PCIe 4.0 x16</span>
        </>
      }
    >
      <PanelSection>
        <div className="grid grid-cols-3 justify-items-center">
          <Gauge value={g.usage} label="load" accent="green" />
          <Gauge value={g.temp} max={100} unit="°" label="temp" accent="teal" warn={75} crit={85} sub={`fan ${g.fan}%`} />
          <Gauge value={g.power} max={g.powerLimit} unit="W" label="power" accent="peach" warn={70} crit={90} sub={`of ${g.powerLimit} W`} />
        </div>
      </PanelSection>
      <PanelSection
        label="power draw · 60 s"
        aside={
          <span className="text-subtext0">
            {"peak "}
            {Math.round(Math.max(...g.powerHistory))}
            {" W"}
          </span>
        }
      >
        <Graph
          series={[{ label: "power", data: g.powerHistory, accent: "peach" }]}
          max={g.powerLimit}
          format={(v) => `${Math.round(v)} W`}
          kind="bars"
        />
      </PanelSection>
      <PanelSection>
        <Meter
          label="vram"
          accent="green"
          value={(g.vramUsed / g.vramTotal) * 100}
          readout={
            <>
              <b>{(g.vramUsed / 1024).toFixed(1)}</b>{" "}
              <span className="text-overlay1">
                {"/ "}
                {(g.vramTotal / 1024).toFixed(0)}
                {" GiB"}
              </span>
            </>
          }
        />
        <Meter
          label="core clock"
          accent="green"
          levels={false}
          value={(g.clock / g.maxClock) * 100}
          readout={
            <>
              <b>{g.clock}</b>{" "}
              <span className="text-overlay1">
                {"/ "}
                {g.maxClock}
                {" MHz"}
              </span>
            </>
          }
        />
        <Meter label="fan" accent="teal" levels={false} value={g.fan} readout={`${g.fan}%`} />
      </PanelSection>
    </Panel>
  );
}
