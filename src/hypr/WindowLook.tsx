import { ConfigFile } from "../theme/ConfigFile";
import type { Slot } from "../theme/palette";
import { useCssPalette } from "../theme/useCssPalette";
import { Compositor, type Layout } from "./Compositor";
import { ANIMATIONS, hyprlandLua, LOOK, type ColourRef, type HyprLook } from "./config";
import "./hypr.css";

export interface WindowLookProps {
  gapsIn?: number;
  gapsOut?: number;
  borderSize?: number;
  /** Active border gradient stops, as palette slots. */
  borderColours?: Slot[];
  borderAngle?: number;
  /** Spin the gradient (`borderangle` animation, style `loop`). */
  rotateBorder?: boolean;
  /** Inactive border: palette slot. */
  inactiveBorder?: Slot;
  inactiveAlpha?: number;
  rounding?: number;
  inactiveOpacity?: number;
  dimInactive?: boolean;
  dimStrength?: number;
  shadow?: boolean;
  shadowRange?: number;
  blur?: boolean;
  blurSize?: number;
  blurPasses?: number;
  /** Show the generated Lua next to the preview. */
  showConfig?: boolean;
  windows?: Layout;
}

const alphaHex = (a: number) => Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, "0");

/** Build a HyprLook from flat, control-friendly props, on top of the hyprland.lua values. */
export function lookFrom(p: WindowLookProps): HyprLook {
  return {
    ...LOOK,
    gapsIn: p.gapsIn ?? LOOK.gapsIn,
    gapsOut: p.gapsOut ?? LOOK.gapsOut,
    borderSize: p.borderSize ?? LOOK.borderSize,
    activeBorder: { colours: (p.borderColours?.length ? p.borderColours : LOOK.activeBorder.colours) as ColourRef[], angle: p.borderAngle ?? LOOK.activeBorder.angle },
    inactiveBorder: p.inactiveBorder ? (`${p.inactiveBorder}:${alphaHex(p.inactiveAlpha ?? 0.8)}` as ColourRef) : LOOK.inactiveBorder,
    rounding: p.rounding ?? LOOK.rounding,
    inactiveOpacity: p.inactiveOpacity ?? LOOK.inactiveOpacity,
    dimInactive: p.dimInactive ?? LOOK.dimInactive,
    dimStrength: p.dimStrength ?? LOOK.dimStrength,
    shadow: { ...LOOK.shadow, enabled: p.shadow ?? LOOK.shadow.enabled, range: p.shadowRange ?? LOOK.shadow.range },
    blur: { ...LOOK.blur, enabled: p.blur ?? LOOK.blur.enabled, size: p.blurSize ?? LOOK.blur.size, passes: p.blurPasses ?? LOOK.blur.passes },
  };
}

const LOOK_LAYOUT: Layout = { 1: ["fastfetch", "nvim", "btop"] };

/**
 * Tune Hyprland's window decoration (gaps, gradient border, rounding, opacity, dim, shadow,
 * blur) on a live session, and copy the result as Lua for hyprland.lua.
 */
export function WindowLook({ showConfig = true, rotateBorder = true, windows = LOOK_LAYOUT, ...props }: WindowLookProps) {
  const look = lookFrom(props);
  const animations = { ...ANIMATIONS, borderangle: { ...ANIMATIONS.borderangle!, enabled: rotateBorder } };
  const [ref, palette] = useCssPalette();
  return (
    <div ref={ref} className={["rx-look", showConfig && "has-config"].filter(Boolean).join(" ")}>
      <Compositor look={look} animations={animations} windows={windows} showKeys={false} />
      {showConfig && <ConfigFile file="~/.config/hypr/look.lua" text={hyprlandLua(look, palette, animations)} maxHeight={640} />}
    </div>
  );
}
