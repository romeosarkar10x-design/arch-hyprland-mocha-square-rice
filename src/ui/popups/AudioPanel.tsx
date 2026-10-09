import { useState } from "react";
import { Button } from "../controls/Button";
import { Slider } from "../controls/Slider";
import { Visualizer } from "../data/Visualizer";
import { Icon } from "../foundations/Icon";
import { cx } from "../lib";
import { MediaPlayer, demoTrack, type Track } from "./MediaPlayer";
import { Panel } from "./Panel";
import { PanelSection } from "./PanelSection";
import type { IconName } from "../icons";

const DEFAULT_OUTPUTS: AudioDevice[] = [
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
  outputs = DEFAULT_OUTPUTS,
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
          <span className="hx-spacer" />
          <span className="hx-faint hx-small">scroll on bar ±2%</span>
        </>
      }
    >
      <PanelSection label="output" aside={<span className={mute ? "hx-faint" : "hx-yellow"}>{mute ? "muted" : `${vol}%`}</span>}>
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
        <div className="hx-list" role="radiogroup" aria-label="Output device">
          {outputs.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={o.id === sel}
              className={cx("hx-li", o.id === sel && "is-selected")}
              onClick={() => {
                setSel(o.id);
                onOutputChange?.(o.id);
              }}
            >
              <span className="hx-radio" />
              <Icon name={o.icon} className="hx-li-icon" />
              <span className="hx-li-main">
                <span className="hx-li-title">{o.name}</span>
                {o.detail && <span className="hx-li-detail">{o.detail}</span>}
              </span>
            </button>
          ))}
        </div>
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
