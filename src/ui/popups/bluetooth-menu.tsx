import { useState } from "react";
import { Button } from "../controls/button";
import { IconButton } from "../controls/icon-button";
import { Toggle } from "../controls/toggle";
import { Meter } from "../data/meter";
import { Icon } from "../foundations/icon";
import { type IconName } from "../icons";
import { NetList, NetRowLabel, Scanning, netRow } from "./net-list";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";

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

/** Connect / disconnect / pair `name`; pairing happens on first connect. */
export const toggleDevice = (list: BluetoothDevice[], name: string) =>
  list.map((d) => (d.name === name ? { ...d, connected: !d.connected, paired: true } : d));

export interface BluetoothMenuProps {
  devices?: BluetoothDevice[];
  enabled?: boolean;
  className?: string;
}

/** bluetoothctl / blueman panel: paired devices with battery, nearby devices to pair. */
export function BluetoothMenu({ devices = demoDevices, enabled: initialOn = true, className }: BluetoothMenuProps) {
  const [on, setOn] = useState(initialOn);
  const [list, setList] = useState(devices);
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
      {on && <BluetoothDevices devices={list} onToggle={(name) => setList((xs) => toggleDevice(xs, name))} />}
    </Panel>
  );
}

export interface BluetoothDevicesProps {
  devices?: BluetoothDevice[];
  /** Connect, disconnect or pair the named device. */
  onToggle?: (name: string) => void;
}

/** The body of the Bluetooth panel (paired + nearby lists), as PanelSections for any Panel. */
export function BluetoothDevices({ devices = demoDevices, onToggle }: BluetoothDevicesProps) {
  const paired = devices.filter((d) => d.paired);
  const nearby = devices.filter((d) => !d.paired);
  return (
    <>
      <PanelSection label="paired" flush>
        <NetList>
          {paired.map((d) => (
            <DeviceRow key={d.name} device={d} onToggle={() => onToggle?.(d.name)} />
          ))}
        </NetList>
      </PanelSection>
      <PanelSection label="nearby" aside={<Scanning />} flush>
        <NetList>
          {nearby.map((d) => (
            <DeviceRow key={d.name} device={d} onToggle={() => onToggle?.(d.name)} />
          ))}
        </NetList>
      </PanelSection>
    </>
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
