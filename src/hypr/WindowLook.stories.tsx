import type { Meta, StoryObj } from "@storybook/react-vite";
import { ACCENTS, NEUTRALS } from "../theme/palette";
import { WindowLook } from "./WindowLook";

const meta = {
  title: "Hyprland/Window Look",
  component: WindowLook,
  args: {
    gapsIn: 3, gapsOut: 6, borderSize: 2, borderColours: ["mauve", "pink", "yellow"], borderAngle: 45, rotateBorder: true,
    inactiveBorder: "surface0", inactiveAlpha: 0.8, rounding: 0, inactiveOpacity: 0.94, dimInactive: true, dimStrength: 0.08,
    shadow: true, shadowRange: 14, blur: true, blurSize: 6, blurPasses: 3, showConfig: true,
  },
  argTypes: {
    gapsIn: { control: { type: "range", min: 0, max: 30 }, table: { category: "general" } },
    gapsOut: { control: { type: "range", min: 0, max: 60 }, table: { category: "general" } },
    borderSize: { control: { type: "range", min: 0, max: 10 }, table: { category: "border" } },
    borderColours: { control: "check", options: ACCENTS, description: "col.active_border gradient stops (in palette order)", table: { category: "border" } },
    borderAngle: { control: { type: "range", min: 0, max: 360, step: 5 }, table: { category: "border" } },
    rotateBorder: { control: "boolean", description: "borderangle animation, style loop", table: { category: "border" } },
    inactiveBorder: { control: "select", options: [...NEUTRALS, ...ACCENTS], table: { category: "border" } },
    inactiveAlpha: { control: { type: "range", min: 0, max: 1, step: 0.05 }, table: { category: "border" } },
    rounding: { control: { type: "range", min: 0, max: 24 }, table: { category: "decoration" } },
    inactiveOpacity: { control: { type: "range", min: 0.5, max: 1, step: 0.01 }, table: { category: "decoration" } },
    dimInactive: { control: "boolean", table: { category: "decoration" } },
    dimStrength: { control: { type: "range", min: 0, max: 0.6, step: 0.01 }, table: { category: "decoration" } },
    shadow: { control: "boolean", table: { category: "shadow" } },
    shadowRange: { control: { type: "range", min: 0, max: 60 }, table: { category: "shadow" } },
    blur: { control: "boolean", table: { category: "blur" } },
    blurSize: { control: { type: "range", min: 1, max: 16 }, table: { category: "blur" } },
    blurPasses: { control: { type: "range", min: 1, max: 6 }, table: { category: "blur" } },
    windows: { control: "object" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Tune how Hyprland draws windows (gaps, gradient border and its spin, inactive border, rounding, opacity, dimming, shadow, blur) on a live session, starting from your hyprland.lua values. The Lua on the right updates as you go and uses the colours of the theme in effect (try the **Theme** toolbar). Click the preview and press `h`/`l` to watch the border and dim move with focus.",
      },
    },
  },
} satisfies Meta<typeof WindowLook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const YourConfig: Story = { name: "Your config" };
export const ThickGradient: Story = { name: "Thick gradient", args: { borderSize: 5, gapsIn: 8, gapsOut: 18, borderColours: ["blue", "mauve", "pink", "peach"], borderAngle: 90 } };
export const RoundedGlass: Story = { name: "Rounded glass", args: { rounding: 12, gapsIn: 6, gapsOut: 14, borderColours: ["lavender", "sky"], inactiveOpacity: 0.82, blurSize: 10, shadowRange: 30 } };
export const Gapless: Story = { name: "Gapless (no gaps, 1px border)", args: { gapsIn: 0, gapsOut: 0, borderSize: 1, borderColours: ["mauve"], rotateBorder: false, shadow: false } };
export const Neon: Story = { args: { borderSize: 3, borderColours: ["teal", "green"], rotateBorder: true, dimStrength: 0.35, inactiveBorder: "crust", shadowRange: 40 } };
export const Solid: Story = { name: "Solid (no blur, no transparency)", args: { blur: false, inactiveOpacity: 1, dimInactive: false, shadow: false, borderColours: ["peach"] } };
