import { useEffect, useState } from "react";
import { IconButton } from "../controls/IconButton";
import { Icon } from "../foundations/Icon";
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
  const pct = (pos / track.length) * 100;
  return (
    <div className={cx("hx-media", `hx-media--${variant}`, !isPlaying && "is-paused", className)}>
      <Cover track={track} spinning={isPlaying} />
      <div className="hx-media-main">
        <div className="hx-media-player">
          <Icon name={playerIcon} /> {player}
          {!isPlaying && <span className="hx-faint">{" · paused"}</span>}
        </div>
        <div className="hx-media-title" title={track.title}>
          {track.title}
        </div>
        <div className="hx-media-artist">
          {track.artist}
          {track.album && (
            <span className="hx-faint">
              {" — "}
              {track.album}
            </span>
          )}
        </div>
        {variant === "full" && (
          <>
            <div
              className="hx-scrub"
              role="slider"
              aria-label="Position"
              aria-valuenow={Math.round(pos)}
              aria-valuemin={0}
              aria-valuemax={track.length}
              tabIndex={0}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setPos(Math.round(((e.clientX - r.left) / r.width) * track.length));
              }}
            >
              <i className="hx-scrub-rail" />
              <i className="hx-scrub-fill" style={{ width: `${pct}%` }} />
              <i className="hx-scrub-thumb" style={{ left: `${pct}%` }} />
            </div>
            <div className="hx-media-times">
              <span>{fmt(pos)}</span>
              <span>-{fmt(track.length - pos)}</span>
            </div>
          </>
        )}
      </div>
      <div className="hx-transport">
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

function Cover({ track, spinning }: { track: Track; spinning: boolean }) {
  if (track.artUrl) return <img className="hx-cover" src={track.artUrl} alt="" />;
  const [a, b] = track.art ?? ["mauve", "peach"];
  return (
    <div
      className={cx("hx-cover", "hx-cover--gen", spinning && "is-spinning")}
      style={{ ["--hx-a" as string]: accentVar(a), ["--hx-b" as string]: accentVar(b) }}
      aria-hidden
    >
      <i />
      <i />
      <i />
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
