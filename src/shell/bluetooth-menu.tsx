import { useState } from "react";
import { Button, Icon, IconButton, Meter, Panel, PanelSection, Toggle, type IconName } from "../ui";
import { NetList, NetRowLabel, Scanning, netRow } from "./net-list";

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
  const toggle = (name: string) => setList((xs) => xs.map((d) => (d.name === name ? { ...d, connected: !d.connected, paired: true } : d)));
  const paired = list.filter((d) => d.paired);
  const nearby = list.filter((d) => !d.paired);
  return (
    <Panel
      data-component="BluetoothMenu"
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
          <span className="flex-1" />
          <Button size="sm" variant="ghost" icon="settings" accent="blue">
            blueman
          </Button>
        </>
      }
    >
      {on && (
        <>
          <PanelSection label="paired" flush>
            <NetList>
              {paired.map((d) => (
                <DeviceRow key={d.name} device={d} onToggle={() => toggle(d.name)} />
              ))}
            </NetList>
          </PanelSection>
          <PanelSection label="nearby" aside={<Scanning />} flush>
            <NetList>
              {nearby.map((d) => (
                <DeviceRow key={d.name} device={d} onToggle={() => toggle(d.name)} />
              ))}
            </NetList>
          </PanelSection>
        </>
      )}
    </Panel>
  );
}

function DeviceRow({ device: d, onToggle }: { device: BluetoothDevice; onToggle: () => void }) {
  return (
    <li data-component="DeviceRow" className="px-2">
      <div className={netRow(!!d.connected)}>
        <Icon name={d.icon} size={18} className="text-blue" />
        <NetRowLabel name={d.name} status={d.connected ? "connected" : d.paired ? "paired" : d.kind} />
        <Button size="sm" variant={d.connected ? "ghost" : "secondary"} accent="blue" onClick={onToggle}>
          {d.connected ? "Disconnect" : d.paired ? "Connect" : "Pair"}
        </Button>
      </div>
      {d.battery !== undefined && d.connected && (
        <Meter
          value={d.battery}
          label="battery"
          readout={`${d.battery}%`}
          accent="green"
          levels={false}
          height={4}
          cells={20}
          className="pr-2 pb-2.5 pl-[38px]"
        />
      )}
    </li>
  );
}
