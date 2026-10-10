import { useState } from "react";
import { Button } from "../controls/button";
import { Toggle } from "../controls/toggle";
import { KeyValueList } from "../data/key-value-list";
import { Icon } from "../foundations/icon";
import { cx } from "../lib";
import { NetList, NetRowLabel, Scanning, SignalBars, netRow } from "./net-list";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";

export interface WifiNetwork {
  ssid: string;
  signal: number; // 0-4
  secure?: boolean;
  band?: "2.4 GHz" | "5 GHz" | "6 GHz";
  known?: boolean;
}

export const demoNetworks: WifiNetwork[] = [
  { ssid: "home-5G", signal: 4, secure: true, band: "5 GHz", known: true },
  { ssid: "home", signal: 3, secure: true, band: "2.4 GHz", known: true },
  { ssid: "Pixel_9431", signal: 3, secure: true, band: "5 GHz" },
  { ssid: "neighbour-wifi", signal: 2, secure: true, band: "2.4 GHz" },
  { ssid: "CafeGuest", signal: 1, secure: false, band: "2.4 GHz" },
];

export interface WifiMenuProps {
  networks?: WifiNetwork[];
  connected?: string | null;
  enabled?: boolean;
  onConnect?: (ssid: string, password?: string) => void;
  className?: string;
}

/** NetworkManager Wi-Fi picker: current connection details and nearby networks, inline password. */
export function WifiMenu({ networks = demoNetworks, connected: initial = "home-5G", enabled: initialOn = true, onConnect, className }: WifiMenuProps) {
  const [on, setOn] = useState(initialOn);
  const [connected, setConnected] = useState(initial);
  const current = networks.find((n) => n.ssid === connected);
  return (
    <Panel
      data-component="WifiMenu"
      className={className}
      icon="wifi"
      accent="sapphire"
      title="Wi-Fi"
      subtitle={on ? (current ? `connected · ${current.ssid}` : "not connected") : "radio off"}
      headerAside={<Toggle checked={on} onChange={setOn} accent="sapphire" />}
      width={380}
      actions={
        <>
          <Button size="sm" variant="ghost" icon="plus">
            Hidden network
          </Button>
          <span className="flex-1" />
          <Button size="sm" variant="ghost" icon="settings" accent="sapphire">
            nmtui
          </Button>
        </>
      }
    >
      {on && (
        <WifiNetworks
          networks={networks}
          connected={connected}
          onConnect={(ssid, pw) => {
            setConnected(ssid);
            onConnect?.(ssid, pw);
          }}
          onDisconnect={() => setConnected(null)}
        />
      )}
    </Panel>
  );
}

export interface WifiNetworksProps {
  networks?: WifiNetwork[];
  connected?: string | null;
  onConnect?: (ssid: string, password?: string) => void;
  onDisconnect?: () => void;
}

/** The body of the Wi-Fi picker (connection details + nearby networks), as PanelSections for any Panel. */
export function WifiNetworks({ networks = demoNetworks, connected, onConnect, onDisconnect }: WifiNetworksProps) {
  const [asking, setAsking] = useState<string | null>(null);
  const current = networks.find((n) => n.ssid === connected);
  const connect = (n: WifiNetwork, password?: string) => {
    setAsking(null);
    onConnect?.(n.ssid, password);
  };
  return (
    <>
      {current && (
        <PanelSection
          label="connection"
          aside={
            onDisconnect && (
              <Button size="sm" variant="ghost" accent="sapphire" onClick={onDisconnect}>
                Disconnect
              </Button>
            )
          }
        >
          <KeyValueList>
            <dt>ip</dt>
            <dd>192.168.1.42/24</dd>
            <dt>gateway</dt>
            <dd>192.168.1.1</dd>
            <dt>band</dt>
            <dd>{current.band} · ch 36</dd>
            <dt>rate</dt>
            <dd>1201 Mb/s · WPA3</dd>
          </KeyValueList>
        </PanelSection>
      )}
      <PanelSection label="networks" aside={<Scanning />} flush>
        <NetList>
          {networks.map((n) => (
            <WifiRow
              key={n.ssid}
              network={n}
              connected={n.ssid === connected}
              asking={asking === n.ssid}
              onClick={() => (n.ssid === connected ? null : n.secure && !n.known ? setAsking(n.ssid) : connect(n))}
              onPassword={(pw) => connect(n, pw)}
            />
          ))}
        </NetList>
      </PanelSection>
    </>
  );
}

interface WifiRowProps {
  network: WifiNetwork;
  connected: boolean;
  /** Show the inline password form. */
  asking: boolean;
  onClick: () => void;
  onPassword: (password: string) => void;
}

function WifiRow({ network: n, connected, asking, onClick, onPassword }: WifiRowProps) {
  const [pw, setPw] = useState("");
  return (
    <li data-component="WifiRow" className="px-2">
      <button type="button" className={cx(netRow(connected), "cursor-pointer hover:bg-surface0")} onClick={onClick}>
        <SignalBars level={n.signal} />
        <NetRowLabel name={n.ssid} status={`${connected ? "connected" : n.known ? "saved" : n.secure ? "secured" : "open"} · ${n.band}`} />
        {n.secure && <Icon name="lock" size={13} className="text-overlay1" />}
        {connected && <Icon name="check" size={15} className="text-sapphire" />}
      </button>
      {asking && (
        <form
          className="flex gap-1.5 pr-2 pb-2.5 pl-[38px]"
          onSubmit={(e) => {
            e.preventDefault();
            onPassword(pw);
            setPw("");
          }}
        >
          <input
            type="password"
            placeholder="password"
            className="uninput h-[26px] flex-1 bg-crust px-2 text-[12px] inset-ring inset-ring-sapphire"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <Button size="sm" variant="primary" accent="sapphire">
            Connect
          </Button>
        </form>
      )}
    </li>
  );
}
