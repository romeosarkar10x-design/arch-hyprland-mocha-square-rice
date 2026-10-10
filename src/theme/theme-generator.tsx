import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Button, Desktop, Icon, Panel, PanelSection, Toggle, cx } from "../ui";
import { galleryTile, WallpaperGallery } from "../wallpapers/wallpaper-gallery";
import { wallpapers } from "../wallpapers/wallpapers";
import { ConfigFile } from "./config-file";
import { DOTFILES } from "./exports";
import { usePropState } from "../use-prop-state";
import { MOCHA, type Theme, type Vibrancy } from "./palette";
import { PaletteView, SwatchStrip } from "./palette-view";
import { resolveWallpaper, ThemeProvider, useWallpaperTheme } from "./theme-provider";

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
    <div ref={box} data-component="ScaleToFit" className="relative w-full overflow-hidden shadow-[0_0_0_1px_var(--hx-surface0)]" style={{ aspectRatio: `${width} / ${height}` }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>
        {children}
      </div>
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

/** A column of panel sections; the last one drops its divider. */
const column = "flex min-w-0 flex-col [&>[data-component~=PanelSection]:last-child]:border-b-0";

/** Last gallery tile: pick your own image. */
function UploadTile({ onFile }: { onFile: (file: File | undefined) => void }) {
  return (
    <label
      data-component="UploadTile"
      className={cx(
        galleryTile,
        "grid place-content-center justify-items-center gap-0.5 bg-transparent text-overlay1 shadow-[inset_0_0_0_1px_var(--hx-surface1)] hover:text-mauve hover:shadow-[inset_0_0_0_1px_var(--hx-mauve)]",
      )}
    >
      <Icon name="plus" size={20} />
      <span>your image</span>
      <input type="file" accept="image/*" className="absolute size-px opacity-0" onChange={(e) => onFile(e.target.files?.[0])} />
    </label>
  );
}

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
        data-component="ThemeGenerator"
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
          <div className="flex gap-1" role="radiogroup" aria-label="vibrancy">
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
            <span className="flex-1" />
            <Button variant="ghost" icon="reboot" onClick={() => setSrc(wallpaper)}>
              Reset
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 border-b border-surface0">
          <div className={column}>
            <PanelSection label="wallpaper" aside={<span className="text-overlay1">drop an image or pick one</span>}>
              <div
                className={cx(
                  "relative aspect-video overflow-hidden bg-crust",
                  dragging ? "shadow-[0_0_0_2px_var(--hx-mauve)]" : "shadow-[0_0_0_1px_var(--hx-surface0)]",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <img src={resolveWallpaper(src)} alt="" className="block size-full object-cover" />
                {dragging && (
                  <div className="absolute inset-0 grid place-content-center justify-items-center gap-2 bg-crust/75 text-mauve">
                    <Icon name="image" size={28} /> drop to extract
                  </div>
                )}
              </div>
              <WallpaperGallery size="compact" selected={src} onSelect={setSrc}>
                <UploadTile onFile={pickFile} />
              </WallpaperGallery>
            </PanelSection>
            <PanelSection label="image colours" aside={<span className="text-overlay1">ringed: picked seeds</span>}>
              {theme && <SwatchStrip swatches={theme.swatches} seeds={seeds} />}
            </PanelSection>
          </div>
          <div className={cx(column, "border-l border-surface0")}>
            <PanelSection label="seeds" aside={<span className="text-overlay1">image colour → theme colour</span>}>
              <div className="grid gap-2">
                {theme &&
                  ([
                    ["primary", theme.seeds.primary.hex, palette.mauve, "mauve · lavender · borders"],
                    ["secondary", theme.seeds.secondary.hex, palette.pink, "pink · gradients"],
                    ["tertiary", theme.seeds.tertiary.hex, null, "pulls the nearest accent"],
                  ] as const).map(([role, from, to, use]) => (
                    <div key={role} className="flex items-center">
                      <i className="size-[30px] flex-none" style={{ background: from }} />
                      {to && <i className="size-[30px] flex-none shadow-[-1px_0_0_var(--hx-mantle)]" style={{ background: to }} />}
                      <span className="ml-3 flex flex-col text-[11px]">
                        <b className="text-[12px]">{role}</b>
                        <span className="text-overlay1">{use}</span>
                      </span>
                    </div>
                  ))}
              </div>
            </PanelSection>
            <PanelSection label="palette" aside={<span className="text-overlay1">contrast vs base</span>}>
              <PaletteView palette={palette} />
            </PanelSection>
          </div>
        </div>
        {preview && (
          <PanelSection label="live preview" aside={<span className="text-overlay1">click the bar, press / for the launcher</span>}>
            <ScaleToFit width={1920} height={1080}>
              <Desktop wallpaper="image" />
            </ScaleToFit>
          </PanelSection>
        )}
        <PanelSection label="export">
          <div className="flex flex-wrap gap-1">
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
