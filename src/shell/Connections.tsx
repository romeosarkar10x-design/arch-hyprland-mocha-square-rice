import { useState } from "react";
import { Button, Icon, IconButton, Meter, Panel, PanelSection, Toggle, type IconName } from "../ds";
import "./shell.css";

/** Four signal bars, `level` 0-4 lit. */
export function SignalBars({ level }: { level: number }) {
  return (
    <span className="rx-bars" aria-label={`signal ${level} of 4`}>
      {[1, 2, 3, 4].map((i) => (
        <i key={i} className={i <= level ? "is-on" : undefined} style={{ height: `${25 * i}%` }} />
      ))}
    </span>
  );
}

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
  const [asking, setAsking] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const current = networks.find((n) => n.ssid === connected);
  const connect = (n: WifiNetwork, password?: string) => {
    setConnected(n.ssid);
    setAsking(null);
    setPw("");
    onConnect?.(n.ssid, password);
  };
  return (
    <Panel
      className={className}
      icon="wifi"
      accent="sapphire"
      title="Wi-Fi"
      subtitle={on ? (current ? `connected · ${current.ssid}` : "not connected") : "radio off"}
      headerAside={<Toggle checked={on} onChange={setOn} accent="sapphire" />}
      width={380}
      actions={
        <>
          <Button size="sm" variant="ghost" icon="plus">Hidden network</Button>
          <span className="hx-spacer" />
          <Button size="sm" variant="ghost" icon="settings" accent="sapphire">nmtui</Button>
        </>
      }
    >
      {on && current && (
        <PanelSection label="connection">
          <dl className="hx-kv">
            <dt>ip</dt><dd>192.168.1.42/24</dd>
            <dt>gateway</dt><dd>192.168.1.1</dd>
            <dt>band</dt><dd>{current.band} · ch 36</dd>
            <dt>rate</dt><dd>1201 Mb/s · WPA3</dd>
          </dl>
        </PanelSection>
      )}
      {on && (
        <PanelSection label="networks" aside={<span className="hx-faint rx-scan">scanning</span>} flush>
          <ul className="rx-netlist">
            {networks.map((n) => (
              <li key={n.ssid} className={n.ssid === connected ? "is-active" : undefined}>
                <button type="button" onClick={() => (n.ssid === connected ? null : n.secure && !n.known ? setAsking(n.ssid) : connect(n))}>
                  <SignalBars level={n.signal} />
                  <span className="rx-netlist-name">
                    {n.ssid}
                    <small className="hx-faint">
                      {n.ssid === connected ? "connected" : n.known ? "saved" : n.secure ? "secured" : "open"} · {n.band}
                    </small>
                  </span>
                  {n.secure && <Icon name="lock" size={13} className="hx-faint" />}
                  {n.ssid === connected && <Icon name="check" size={15} className="hx-sapphire" />}
                </button>
                {asking === n.ssid && (
                  <form
                    className="rx-netlist-pw"
                    onSubmit={(e) => {
                      e.preventDefault();
                      connect(n, pw);
                    }}
                  >
                    <input type="password" placeholder="password" value={pw} onChange={(e) => setPw(e.target.value)} />
                    <Button size="sm" variant="primary" accent="sapphire">Connect</Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </PanelSection>
      )}
    </Panel>
  );
}

export interface BluetoothDevice {
  name: string;
  icon: IconName;
  kind: string;
  battery?: number;
  connected?: boolean;
  paired?: boolean;
}

export const demoDevices: BluetoothDevice[] = [
  { name: "WH-1000XM5", icon: "headphones", kind: "headphones", battery: 72, connected: true, paired: true },
  { name: "MX Keys", icon: "keyboard", kind: "keyboard", battery: 40, connected: true, paired: true },
  { name: "DualSense", icon: "gamepad", kind: "controller", battery: 18, paired: true },
  { name: "Pixel 9", icon: "monitor", kind: "phone" },
  { name: "JBL Flip 6", icon: "speaker", kind: "speaker" },
];

export interface BluetoothMenuProps {
  devices?: BluetoothDevice[];
  enabled?: boolean;
  className?: string;
}

/** bluetoothctl / blueman panel: paired devices with battery, nearby devices to pair. */
export function BluetoothMenu({ devices = demoDevices, enabled: initialOn = true, className }: BluetoothMenuProps) {
  const [on, setOn] = useState(initialOn);
  const [list, setList] = useState(devices);
  const toggle = (name: string) =>
    setList((xs) => xs.map((d) => (d.name === name ? { ...d, connected: !d.connected, paired: true } : d)));
  const paired = list.filter((d) => d.paired);
  const nearby = list.filter((d) => !d.paired);
  const row = (d: BluetoothDevice) => (
    <li key={d.name} className={d.connected ? "is-active" : undefined}>
      <div className="rx-bt-row">
        <Icon name={d.icon} size={18} />
        <span className="rx-netlist-name">
          {d.name}
          <small className="hx-faint">{d.connected ? "connected" : d.paired ? "paired" : d.kind}</small>
        </span>
        <Button size="sm" variant={d.connected ? "ghost" : "secondary"} accent="blue" onClick={() => toggle(d.name)}>
          {d.connected ? "Disconnect" : d.paired ? "Connect" : "Pair"}
        </Button>
      </div>
      {d.battery !== undefined && d.connected && <Meter value={d.battery} label="battery" readout={`${d.battery}%`} accent="green" levels={false} height={4} cells={20} />}
    </li>
  );
  return (
    <Panel
      className={className}
      icon="bluetooth"
      accent="blue"
      title="Bluetooth"
      subtitle={on ? `${list.filter((d) => d.connected).length} connected · discoverable` : "off"}
      headerAside={<Toggle checked={on} onChange={setOn} accent="blue" />}
      width={380}
      actions={
        <>
          <IconButton icon="reboot" label="Rescan" size="sm" />
          <span className="hx-spacer" />
          <Button size="sm" variant="ghost" icon="settings" accent="blue">blueman</Button>
        </>
      }
    >
      {on && (
        <>
          <PanelSection label="paired" flush>
            <ul className="rx-netlist">{paired.map(row)}</ul>
          </PanelSection>
          <PanelSection label="nearby" aside={<span className="hx-faint rx-scan">scanning</span>} flush>
            <ul className="rx-netlist">{nearby.map(row)}</ul>
          </PanelSection>
        </>
      )}
    </Panel>
  );
}
