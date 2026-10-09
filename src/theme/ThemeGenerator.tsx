import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Button, Desktop, Icon, Panel, PanelSection, Toggle } from "../ui";
import { wallpapers } from "../wallpapers/wallpapers";
import { ConfigFile } from "./ConfigFile";
import { DOTFILES } from "./exports";
import { usePropState } from "../usePropState";
import { MOCHA, type Theme, type Vibrancy } from "./palette";
import { PaletteView, SwatchStrip } from "./PaletteView";
import { resolveWallpaper, ThemeProvider, useWallpaperTheme } from "./ThemeProvider";
import "./theme.css";

/** Scale a fixed-size child (e.g. the 1920×1080 Desktop) to the width of its box. */
export function ScaleToFit({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => e && setScale(e.contentRect.width / width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={box} className="rx-fit" style={{ aspectRatio: `${width} / ${height}` }}>
      <div style={{ width, height, transform: `scale(${scale})` }}>{children}</div>
    </div>
  );
}

export interface ThemeGeneratorProps {
  /** Starting wallpaper: an id from the bundled set, or an image URL. */
  wallpaper?: string;
  vibrancy?: Vibrancy;
  /** Start with the theme applied to the whole page (every component, not just the preview). */
  applyGlobally?: boolean;
  /** Called with each newly derived theme. */
  onTheme?: (theme: Theme) => void;
  /** Show the live desktop preview. */
  preview?: boolean;
  width?: number;
}

const VIBRANCIES: Vibrancy[] = ["muted", "balanced", "vivid"];

/**
 * Pick or drop a wallpaper; the extractor derives a full palette from it and the whole UI
 * rethemes to match. Exports the result as CSS and as dotfiles for Hyprland, Waybar, rofi,
 * swaync, hyprlock and five terminal emulators.
 */
export function ThemeGenerator({
  wallpaper = "nebula",
  vibrancy: initialVibrancy = "balanced",
  applyGlobally = false,
  onTheme,
  preview = true,
  width = 1120,
}: ThemeGeneratorProps) {
  const [src, setSrc] = usePropState(wallpaper);
  const [vibrancy, setVibrancy] = usePropState(initialVibrancy);
  const [global, setGlobal] = usePropState(applyGlobally);
  const [target, setTarget] = useState("css");
  const [dragging, setDragging] = useState(false);
  const { theme, error, loading } = useWallpaperTheme(src, vibrancy);
  const palette = theme?.palette ?? MOCHA;
  const uploads = useRef<string[]>([]);

  useEffect(() => {
    if (theme) onTheme?.(theme);
  }, [theme, onTheme]);
  useEffect(() => () => uploads.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const pickFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    uploads.current.push(url);
    setSrc(url);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const current = wallpapers().find((w) => w.id === src);
  const seeds = theme ? [theme.seeds.primary.hex, theme.seeds.secondary.hex, theme.seeds.tertiary.hex] : [];
  const dotfile = DOTFILES[target]!;

  return (
    <ThemeProvider palette={palette} wallpaper={src} scope={global ? "global" : "local"}>
      <Panel
        icon="palette"
        accent="mauve"
        title="Wallpaper theme"
        subtitle={
          error
            ? `couldn't read image: ${error.message}`
            : loading
              ? "extracting palette…"
              : `${current?.name ?? "custom image"} · ${theme?.swatches.length ?? 0} colour clusters${theme?.monochrome ? " · monochrome" : ""}`
        }
        width={width}
        headerAside={
          <div className="rx-seg" role="radiogroup" aria-label="vibrancy">
            {VIBRANCIES.map((v) => (
              <Button key={v} size="sm" variant={v === vibrancy ? "primary" : "ghost"} onClick={() => setVibrancy(v)}>
                {v}
              </Button>
            ))}
          </div>
        }
        actions={
          <>
            <Toggle checked={global} onChange={setGlobal} label="Apply to everything" description="write the palette to <html>, not just this panel" />
            <span className="hx-spacer" />
            <Button variant="ghost" icon="reboot" onClick={() => setSrc(wallpaper)}>
              Reset
            </Button>
          </>
        }
      >
        <div className="rx-gen">
          <div className="rx-gen-col">
            <PanelSection label="wallpaper" aside={<span className="hx-faint">drop an image or pick one</span>}>
              <div
                className={`rx-gen-image${dragging ? " is-drag" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <img src={resolveWallpaper(src)} alt="" />
                {dragging && (
                  <div className="rx-gen-drop">
                    <Icon name="image" size={28} /> drop to extract
                  </div>
                )}
              </div>
              <div className="rx-gal">
                {wallpapers().map((w) => (
                  <button key={w.id} type="button" className={w.id === src ? "is-active" : undefined} onClick={() => setSrc(w.id)} title={w.description}>
                    <img src={w.url} alt="" />
                    <span>{w.name}</span>
                  </button>
                ))}
                <label className="rx-gal-upload">
                  <Icon name="plus" size={20} />
                  <span>your image</span>
                  <input type="file" accept="image/*" onChange={(e) => pickFile(e.target.files?.[0])} />
                </label>
              </div>
            </PanelSection>
            <PanelSection label="image colours" aside={<span className="hx-faint">ringed: picked seeds</span>}>
              {theme && <SwatchStrip swatches={theme.swatches} seeds={seeds} />}
            </PanelSection>
          </div>
          <div className="rx-gen-col">
            <PanelSection label="seeds" aside={<span className="hx-faint">image colour → theme colour</span>}>
              <div className="rx-seeds">
                {theme &&
                  ([
                    ["primary", theme.seeds.primary.hex, palette.mauve, "mauve · lavender · borders"],
                    ["secondary", theme.seeds.secondary.hex, palette.pink, "pink · gradients"],
                    ["tertiary", theme.seeds.tertiary.hex, null, "pulls the nearest accent"],
                  ] as const).map(([role, from, to, use]) => (
                    <div key={role}>
                      <i style={{ background: from }} />
                      {to && <i style={{ background: to }} />}
                      <span>
                        <b>{role}</b>
                        <span className="hx-faint">{use}</span>
                      </span>
                    </div>
                  ))}
              </div>
            </PanelSection>
            <PanelSection label="palette" aside={<span className="hx-faint">contrast vs base</span>}>
              <PaletteView palette={palette} />
            </PanelSection>
          </div>
        </div>
        {preview && (
          <PanelSection label="live preview" aside={<span className="hx-faint">click the bar, press / for the launcher</span>}>
            <ScaleToFit width={1920} height={1080}>
              <Desktop wallpaper="image" />
            </ScaleToFit>
          </PanelSection>
        )}
        <PanelSection label="export">
          <div className="rx-seg rx-seg--wrap">
            {Object.keys(DOTFILES).map((k) => (
              <Button key={k} size="sm" variant={k === target ? "primary" : "ghost"} onClick={() => setTarget(k)}>
                {k}
              </Button>
            ))}
          </div>
          <ConfigFile file={dotfile.file} text={dotfile.make(palette)} maxHeight={320} />
        </PanelSection>
      </Panel>
    </ThemeProvider>
  );
}
