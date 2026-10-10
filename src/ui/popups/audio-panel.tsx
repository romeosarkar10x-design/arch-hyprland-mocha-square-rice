import { useState } from "react";
import { Button } from "../controls/button";
import { Slider } from "../controls/slider";
import { Visualizer } from "../data/visualizer";
import { Icon } from "../foundations/icon";
import { cx } from "../lib";
import { MediaPlayer, demoTrack, type Track } from "./media-player";
import { Panel } from "./panel";
import { PanelSection } from "./panel-section";
import type { IconName } from "../icons";

export const demoOutputs: AudioDevice[] = [
  { id: "hd650", name: "Sennheiser HD 650", detail: "Schiit Modi+ · USB · 48 kHz", icon: "headphones" },
  { id: "monitors", name: "Studio monitors", detail: "GA102 · HDMI · 48 kHz", icon: "speaker" },
  { id: "dp", name: "LG 27GP950", detail: "DisplayPort · 48 kHz", icon: "monitor" },
];

export interface AudioDevice {
  id: string;
  name: string;
  /** Second line, e.g. "USB · 48 kHz". */
  detail?: string;
  icon: IconName;
}

export interface AudioPanelProps {
  outputs?: AudioDevice[];
  /** Selected output id. */
  output?: string;
  volume?: number;
  muted?: boolean;
  micVolume?: number;
  track?: Track;
  onOutputChange?: (id: string) => void;
  onVolumeChange?: (v: number) => void;
  className?: string;
}

/** PipeWire popup: output volume slider with mute, live spectrum, now playing, output device picker, mic level. */
export function AudioPanel({
  outputs = demoOutputs,
  output,
  volume = 64,
  muted = false,
  micVolume = 80,
  track = demoTrack,
  onOutputChange,
  onVolumeChange,
  className,
}: AudioPanelProps) {
  const [sel, setSel] = useState(output ?? outputs[0]?.id);
  const [vol, setVol] = useState(volume);
  const [mute, setMute] = useState(muted);
  const [playing, setPlaying] = useState(true);
  const [mic, setMic] = useState(micVolume);
  const [micMute, setMicMute] = useState(false);
  const current = outputs.find((o) => o.id === sel);
  const volIcon = mute || vol === 0 ? "volumeOff" : vol < 34 ? "volumeLow" : vol < 67 ? "volumeMedium" : "volumeHigh";
  return (
    <Panel
      data-component="AudioPanel"
      className={className}
      icon="volumeHigh"
      accent="yellow"
      title="Audio"
      subtitle={`PipeWire 1.4 · ${current?.name ?? "no output"}`}
      actions={
        <>
          <Button icon="settings" accent="yellow">
            pavucontrol
          </Button>
          <span className="flex-1" />
          <span className="text-overlay1 text-sm">scroll on bar ±2%</span>
        </>
      }
    >
      <PanelSection label="output" aside={<span className={mute ? "text-overlay1" : "text-yellow"}>{mute ? "muted" : `${vol}%`}</span>}>
        <Slider
          label="Output volume"
          icon={volIcon}
          value={vol}
          muted={mute}
          showValue={false}
          onIconClick={() => setMute(!mute)}
          onChange={(v) => {
            setVol(v);
            onVolumeChange?.(v);
          }}
        />
      </PanelSection>
      <PanelSection flush>
        <Visualizer playing={playing && !mute} height={84} from="yellow" to="peach" />
      </PanelSection>
      <PanelSection>
        <MediaPlayer track={track} playing={playing} position={97} onPlayPause={setPlaying} />
      </PanelSection>
      <PanelSection label="devices">
        <AudioDeviceList
          devices={outputs}
          selected={sel}
          onSelect={(id) => {
            setSel(id);
            onOutputChange?.(id);
          }}
        />
      </PanelSection>
      <PanelSection label="microphone">
        <Slider
          label="Mic volume"
          icon={micMute ? "micOff" : "mic"}
          value={mic}
          muted={micMute}
          accent="peach"
          onChange={setMic}
          onIconClick={() => setMicMute(!micMute)}
          ticks={0}
        />
      </PanelSection>
    </Panel>
  );
}

/** Radio list of output devices; the selected row tints with the panel accent. */
export function AudioDeviceList({ devices, selected, onSelect }: { devices: AudioDevice[]; selected?: string; onSelect: (id: string) => void }) {
  return (
    <div data-component="AudioDeviceList" className="-mx-2 flex flex-col gap-0.5" role="radiogroup" aria-label="Output device">
      {devices.map((o) => {
        const on = o.id === selected;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={cx(
              "unbutton flex cursor-pointer items-center gap-2.5 bg-transparent px-2 py-[7px] text-left transition-[background-color] hover:bg-surface0",
              on && "bg-acc/10 hover:bg-acc/10",
            )}
            onClick={() => onSelect(o.id)}
          >
            <span
              className={cx("grid size-3 flex-none place-items-center inset-ring", on ? "inset-ring-acc after:size-1.5 after:bg-acc" : "inset-ring-overlay0")}
            />
            <Icon name={o.icon} className={cx("text-[17px]", on ? "text-acc" : "text-subtext0")} />
            <span className="flex min-w-0 flex-col">
              <span className="text-[12.5px]">{o.name}</span>
              {o.detail && <span className="text-[10.5px] text-overlay1">{o.detail}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
