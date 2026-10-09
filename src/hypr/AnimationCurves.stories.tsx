import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimationCurves } from "./AnimationCurves";

const meta = {
  title: "Hyprland/Animations",
  component: AnimationCurves,
  args: { timeScale: 1 },
  argTypes: { timeScale: { control: { type: "range", min: 0.5, max: 5, step: 0.5 } }, animations: { control: "object" }, curves: { control: "object" } },
  parameters: {
    docs: {
      description: {
        component:
          "The `hl.curve` beziers and `hl.animation` leaves from your hyprland.lua. Speed is in 100 ms units; a leaf without its own line inherits from its parent (windowsIn → windows → global). Each track replays the timing; `borderangle` loops. See them on real windows in **Hyprland → Live Session**.",
      },
    },
  },
} satisfies Meta<typeof AnimationCurves>;

export default meta;
type Story = StoryObj<typeof meta>;

export const YourAnimations: Story = { name: "Your animations" };
export const SlowMotion: Story = { name: "Slow motion (3×)", args: { timeScale: 3 } };
