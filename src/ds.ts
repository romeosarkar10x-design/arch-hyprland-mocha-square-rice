// Typed handles on the hyprland-ui bundle components that the extension components reuse.
import type { BarProps } from "../components/bar/Bar/Bar";
import type { BarSegmentProps } from "../components/bar/BarSegment/BarSegment";
import type { WorkspacesProps } from "../components/bar/Workspaces/Workspaces";
import type { ButtonProps } from "../components/controls/Button/Button";
import type { IconButtonProps } from "../components/controls/IconButton/IconButton";
import type { SliderProps } from "../components/controls/Slider/Slider";
import type { ToggleProps } from "../components/controls/Toggle/Toggle";
import type { CoreGridProps } from "../components/data/CoreGrid/CoreGrid";
import type { GraphProps } from "../components/data/Graph/Graph";
import type { MeterProps } from "../components/data/Meter/Meter";
import type { SparklineProps } from "../components/data/Sparkline/Sparkline";
import type { StackBarProps } from "../components/data/StackBar/StackBar";
import type { DesktopProps } from "../components/desktop/Desktop/Desktop";
import type { WallpaperProps } from "../components/desktop/Wallpaper/Wallpaper";
import type { WindowFrameProps } from "../components/desktop/WindowFrame/WindowFrame";
import type { IconProps } from "../components/foundations/Icon/Icon";
import type { IconTileProps } from "../components/foundations/IconTile/IconTile";
import type { KbdProps } from "../components/foundations/Kbd/Kbd";
import type { ShortcutProps } from "../components/foundations/Shortcut/Shortcut";
import type { SurfaceProps } from "../components/foundations/Surface/Surface";
import type { ToastProps } from "../components/overlays/Toast/Toast";
import type { PanelProps } from "../components/popups/Panel/Panel";
import type { PanelSectionProps } from "../components/popups/PanelSection/PanelSection";
import type { MouseEventHandler } from "react";
import { ui } from "./hyprland-ui";

// The bundle spreads extra props onto the <button>.
type Clickable = { onClick?: MouseEventHandler<HTMLButtonElement>; disabled?: boolean; title?: string; type?: "button" | "submit" };

export const Bar = ui<BarProps>("Bar");
export const BarSegment = ui<BarSegmentProps>("BarSegment");
export const Workspaces = ui<WorkspacesProps>("Workspaces");
export const Button = ui<ButtonProps & Clickable>("Button");
export const IconButton = ui<IconButtonProps & Clickable>("IconButton");
export const Slider = ui<SliderProps>("Slider");
export const Toggle = ui<ToggleProps>("Toggle");
export const Meter = ui<MeterProps>("Meter");
// Graph / StackBar item types aren't exported by the kit; spelled out here.
export type GraphSeries = { label: string; data: number[]; accent?: Accent; mirror?: boolean };
export const Graph = ui<Omit<GraphProps, "series"> & { series: GraphSeries[] }>("Graph");
export const Sparkline = ui<SparklineProps>("Sparkline");
export const StackBar = ui<Omit<StackBarProps, "segments"> & { segments: { label: string; value: number; accent?: Accent }[] }>("StackBar");
export const CoreGrid = ui<CoreGridProps>("CoreGrid");
export const Desktop = ui<DesktopProps>("Desktop");
export const Wallpaper = ui<WallpaperProps>("Wallpaper");
export const WindowFrame = ui<WindowFrameProps>("WindowFrame");
export const Icon = ui<IconProps>("Icon");
export const IconTile = ui<IconTileProps>("IconTile");
export const Kbd = ui<KbdProps>("Kbd");
export const Shortcut = ui<ShortcutProps>("Shortcut");
export const Surface = ui<SurfaceProps>("Surface");
export const Toast = ui<ToastProps>("Toast");
export const Panel = ui<PanelProps>("Panel");
export const PanelSection = ui<PanelSectionProps>("PanelSection");

export type Accent = NonNullable<ButtonProps["accent"]>;
export type IconName = IconProps["name"];
