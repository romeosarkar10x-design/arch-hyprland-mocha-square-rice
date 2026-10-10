import { Graph } from "../data/graph";
import { KeyValueList } from "../data/key-value-list";
import { Stat, StatGrid } from "../data/stat";
import { Icon } from "../foundations/icon";
import { bytes, rate } from "../lib";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";
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
    <Panel
      data-component="NetworkPanel"
      className={className}
      icon="ethernet"
      accent="sapphire"
      title="Ethernet"
      subtitle={`${n.iface} · 2.5 Gb/s full duplex`}
      live={!paused}
    >
      <PanelSection>
        <StatGrid>
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
        </StatGrid>
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
        <KeyValueList>
          <dt>address</dt>
          <dd>{n.ip}</dd>
          <dt>gateway</dt>
          <dd>{n.gateway}</dd>
          <dt>dns</dt>
          <dd>{n.dns}</dd>
          <dt>session</dt>
          <dd>
            <span className="text-sapphire">
              {"↓ "}
              {bytes(n.rxTotal)}
            </span>
            {"  "}
            <span className="text-pink">
              {"↑ "}
              {bytes(n.txTotal)}
            </span>
          </dd>
        </KeyValueList>
      </PanelSection>
    </Panel>
  );
}
