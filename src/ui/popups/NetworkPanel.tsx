import { Graph } from "../data/Graph";
import { Stat } from "../data/Stat";
import { Icon } from "../foundations/Icon";
import { bytes, rate } from "../lib";
import { Panel } from "./Panel";
import { PanelSection } from "./PanelSection";
import { useSystemStats, type NetStats } from "../stats";

export interface NetworkPanelProps {
  data?: NetStats;
  paused?: boolean;
  className?: string;
}

/** Ethernet popup: mirrored down/up traffic graph, live rates, address/gateway/dns, session totals. */
export function NetworkPanel({ data, paused, className }: NetworkPanelProps) {
  const sim = useSystemStats(paused || !!data);
  const n = data ?? sim.net;
  return (
    <Panel className={className} icon="ethernet" accent="sapphire" title="Ethernet" subtitle={`${n.iface} · 2.5 Gb/s full duplex`} live={!paused}>
      <PanelSection>
        <div className="hx-stats">
          <Stat
            label={
              <>
                <Icon name="down" />
                {" down"}
              </>
            }
            value={rate(n.rx)}
            accent="sapphire"
          />
          <Stat
            label={
              <>
                <Icon name="up" />
                {" up"}
              </>
            }
            value={rate(n.tx)}
            accent="pink"
          />
        </div>
        <Graph
          height={110}
          format={(v) => rate(v)}
          series={[
            { label: "down", data: n.rxHistory, accent: "sapphire" },
            { label: "up", data: n.txHistory, accent: "pink", mirror: true },
          ]}
        />
      </PanelSection>
      <PanelSection>
        <dl className="hx-kv">
          <dt>address</dt>
          <dd>{n.ip}</dd>
          <dt>gateway</dt>
          <dd>{n.gateway}</dd>
          <dt>dns</dt>
          <dd>{n.dns}</dd>
          <dt>session</dt>
          <dd>
            <span className="hx-sapphire">
              {"↓ "}
              {bytes(n.rxTotal)}
            </span>
            {"  "}
            <span className="hx-pink">
              {"↑ "}
              {bytes(n.txTotal)}
            </span>
          </dd>
        </dl>
      </PanelSection>
    </Panel>
  );
}
