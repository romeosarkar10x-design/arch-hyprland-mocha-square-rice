import { useEffect, useState } from "react";
import { IconButton } from "../controls/icon-button";
import { Icon } from "../foundations/icon";
import { type IconName } from "../icons";
import { accentVar, cx, useInterval, type Accent } from "../lib";

export interface Track {
  title: string;
  artist: string;
  album?: string;
  /** Seconds. */
  length: number;
  /** Two accents for the generated cover. */
  art?: [Accent, Accent];
  /** Real cover art; replaces the generated one. */
  artUrl?: string;
}

export interface MediaPlayerProps {
  track: Track;
  /** Player name shown above the title, e.g. "Spotify". */
  player?: string;
  playerIcon?: IconName;
  /** Controlled playback. Omit to let the player run itself. */
  playing?: boolean;
  /** Start position in seconds. */
  position?: number;
  onPlayPause?: (playing: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  /** compact = single row for the bar's centre dropdown. */
  variant?: "full" | "compact";
  className?: string;
}

/** MPRIS now-playing: square generated cover (or artUrl), title, scrubber, transport, shuffle/repeat. */
export function MediaPlayer({
  track,
  player = "Spotify",
  playerIcon = "spotify",
  playing,
  position = 0,
  onPlayPause,
  onNext,
  onPrevious,
  variant = "full",
  className,
}: MediaPlayerProps) {
  const [innerPlay, setInnerPlay] = useState(true);
  const isPlaying = playing ?? innerPlay;
  const [pos, setPos] = useState(position);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(true);
  useEffect(() => setPos(position), [position, track.title]);
  useInterval(() => setPos((p) => (p + 1 > track.length ? 0 : p + 1)), isPlaying ? 1000 : null);
  const toggle = () => {
    setInnerPlay(!isPlaying);
    onPlayPause?.(!isPlaying);
  };
  const full = variant === "full";
  return (
    <div
      data-component="MediaPlayer"
      className={cx(
        "kit-type grid items-center gap-x-3.5 gap-y-3 text-text",
        full ? "grid-cols-[84px_1fr] grid-rows-[auto_auto]" : "grid-cols-[48px_1fr_auto] grid-rows-[auto]",
        className,
      )}
    >
      <MediaCover track={track} spinning={isPlaying} className={full ? undefined : "size-12"} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10.5px] tracking-[.04em] text-green">
          <Icon name={playerIcon} /> {player}
          {!isPlaying && <span className="text-overlay1">{" · paused"}</span>}
        </div>
        <div className={cx("mt-[3px] truncate text-[14px] font-bold", !isPlaying && "text-subtext0")} title={track.title}>
          {track.title}
        </div>
        <div className="truncate text-[12px] text-subtext0">
          {track.artist}
          {track.album && (
            <span className="text-overlay1">
              {" — "}
              {track.album}
            </span>
          )}
        </div>
        {full && <Scrubber pos={pos} length={track.length} onSeek={setPos} />}
      </div>
      <div className={cx("flex items-center justify-center gap-1.5", full ? "col-span-full" : "col-auto")}>
        {variant === "full" && (
          <IconButton icon="shuffle" label="Shuffle" size="sm" active={shuffle} accent="green" onClick={() => setShuffle(!shuffle)} />
        )}
        <IconButton icon="previous" label="Previous" onClick={onPrevious} />
        <IconButton
          icon={isPlaying ? "pause" : "play"}
          label={isPlaying ? "Pause" : "Play"}
          variant="primary"
          accent="green"
          size={variant === "full" ? "lg" : "md"}
          onClick={toggle}
        />
        <IconButton icon="next" label="Next" onClick={onNext} />
        {variant === "full" && (
          <IconButton icon="repeat" label="Repeat" size="sm" active={repeat} accent="green" onClick={() => setRepeat(!repeat)} />
        )}
      </div>
    </div>
  );
}

/** Seek bar plus elapsed / remaining times. */
function Scrubber({ pos, length, onSeek }: { pos: number; length: number; onSeek: (s: number) => void }) {
  const pct = (pos / length) * 100;
  return (
    <div data-component="Scrubber">
      <div
        className="relative mt-2 h-3.5 cursor-pointer"
        role="slider"
        aria-label="Position"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={length}
        tabIndex={0}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onSeek(Math.round(((e.clientX - r.left) / r.width) * length));
        }}
      >
        <i className="absolute inset-x-0 top-1.5 h-0.5 bg-surface1" />
        <i className="absolute top-1.5 left-0 h-0.5 bg-green transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%` }} />
        <i className="absolute top-[3px] -ml-1 size-2 bg-green transition-[left] duration-1000 ease-linear" style={{ left: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10.5px] text-overlay1">
        <span>{fmt(pos)}</span>
        <span>-{fmt(length - pos)}</span>
      </div>
    </div>
  );
}

/** Square album cover: `artUrl`, or a generated one from the track's two accents. */
export function MediaCover({ track, spinning, className }: { track: Track; spinning?: boolean; className?: string }) {
  if (track.artUrl) return <img data-component="MediaCover" className={cx("block size-21 object-cover", className)} src={track.artUrl} alt="" />;
  const [a, b] = track.art ?? ["mauve", "peach"];
  return (
    <div
      data-component="MediaCover"
      className={cx(
        "relative block size-21 overflow-hidden",
        "bg-[linear-gradient(135deg,var(--hx-a),color-mix(in_srgb,var(--hx-a)_30%,var(--hx-crust))_60%,var(--hx-b))]",
        className,
      )}
      style={{ ["--hx-a" as string]: accentVar(a), ["--hx-b" as string]: accentVar(b) }}
      aria-hidden
    >
      <i className={cx("absolute inset-[18%] inset-ring-2 inset-ring-crust/55", spinning && "animate-turn")} />
      <i className="absolute inset-[34%] bg-(--hx-b)/70" />
      <i className="absolute inset-x-0 bottom-0 h-[22%] bg-crust/60" />
    </div>
  );
}

function fmt(s: number) {
  s = Math.max(0, Math.round(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export const demoTrack: Track = {
  title: "Midnight City",
  artist: "M83",
  album: "Hurry Up, We're Dreaming",
  length: 243,
  art: ["mauve", "peach"],
};
