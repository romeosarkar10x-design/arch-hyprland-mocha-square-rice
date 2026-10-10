import { useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react";
import { wallpapers } from "../wallpapers/wallpapers";
import { extractTheme, paletteVars, type Palette, type Theme, type Vibrancy } from "./palette";

/** A wallpaper id from the bundled set, or any image URL (http, data:, blob:). */
export function resolveWallpaper(wallpaper: string): string {
  return wallpapers().find((w) => w.id === wallpaper)?.url ?? wallpaper;
}

export interface WallpaperThemeState {
  theme: Theme | null;
  error: Error | null;
  loading: boolean;
}

/** Derive a theme from a wallpaper. Results are cached per image + vibrancy. */
export function useWallpaperTheme(wallpaper: string | undefined, vibrancy: Vibrancy = "balanced"): WallpaperThemeState {
  const key = wallpaper ? `${vibrancy}|${wallpaper}` : "";
  // The last settled result, tagged with the request it answers. Until the current
  // request settles, keep showing the previous theme (no flash back to Mocha).
  const [result, setResult] = useState<{ key: string; theme: Theme | null; error: Error | null }>({ key: "", theme: null, error: null });
  useEffect(() => {
    if (!wallpaper) return;
    let live = true;
    extractTheme(resolveWallpaper(wallpaper), { vibrancy }).then(
      (theme) => live && setResult({ key, theme, error: null }),
      (error: unknown) => live && setResult({ key, theme: null, error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      live = false;
    };
  }, [key, wallpaper, vibrancy]);
  if (!wallpaper) return { theme: null, error: null, loading: false };
  const settled = result.key === key;
  return { theme: result.theme, error: settled ? result.error : null, loading: !settled };
}

export interface ThemeProviderProps {
  /** Wallpaper id (`nebula`, `outrun`, …) or image URL to derive the palette from. */
  wallpaper?: string;
  /** Explicit palette. Wins over `wallpaper` for colours; the wallpaper is still shown. */
  palette?: Palette;
  /** Accent saturation of the derived palette. */
  vibrancy?: Vibrancy;
  /**
   * `local` themes only the children. `global` writes the variables to `<html>`, so every
   * component on the page follows, including ones rendered outside this tree.
   */
  scope?: "local" | "global";
  /** Called whenever a new theme is derived. */
  onTheme?: (theme: Theme) => void;
  children?: ReactNode;
}

/**
 * Rethemes every hyprland-ui component inside it (or the whole page) by overriding the
 * `--hx-*` custom properties. Also exposes the image as `--hx-wallpaper-image`, which
 * `<Wallpaper variant="image">` and `<Desktop wallpaper="image">` pick up.
 */
export function ThemeProvider({ wallpaper, palette, vibrancy = "balanced", scope = "local", onTheme, children }: ThemeProviderProps) {
  const { theme } = useWallpaperTheme(palette ? undefined : wallpaper, vibrancy);
  const colours = palette ?? theme?.palette;
  const vars: Record<string, string> = colours ? { ...paletteVars(colours) } : {};
  if (wallpaper) vars["--hx-wallpaper-image"] = `url("${resolveWallpaper(wallpaper)}")`;

  useEffect(() => {
    if (theme) onTheme?.(theme);
  }, [theme, onTheme]);

  const key = JSON.stringify(vars);
  useLayoutEffect(() => {
    if (scope !== "global") return;
    const root = document.documentElement.style;
    const entries = Object.entries(JSON.parse(key) as Record<string, string>);
    for (const [k, v] of entries) root.setProperty(k, v);
    return () => {
      for (const [k] of entries) root.removeProperty(k);
    };
  }, [scope, key]);

  if (scope === "global") return <>{children}</>;
  return <div style={{ display: "contents", ...(vars as CSSProperties) }}>{children}</div>;
}
