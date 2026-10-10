import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { KeystrokeVisualizer, useKeystrokes, type Stroke } from "./keystroke-visualizer";
import { Stage } from "./stage";

const sample: Stroke[] = [
  { id: 1, keys: ["SUPER", "RETURN"], count: 1, at: 0 },
  { id: 2, keys: ["SUPER", "SHIFT", "L"], count: 1, at: 0 },
  { id: 3, keys: ["SUPER", "ALT", "J"], count: 4, at: 0 },
  { id: 4, keys: ["SUPER", "3"], count: 1, at: 0 },
];

function Live(props: Omit<ComponentProps<typeof KeystrokeVisualizer>, "strokes">) {
  const strokes = useKeystrokes();
  return <KeystrokeVisualizer {...props} strokes={strokes} placeholder="type anywhere on this page…" />;
}

const meta = {
  title: "Shell/Overlays/Keystroke Visualizer",
  component: KeystrokeVisualizer,
  args: { strokes: sample, linger: 2400, titled: true },
  argTypes: { linger: { control: { type: "range", min: 500, max: 6000, step: 100 } } },
  parameters: {
    docs: {
      description: {
        component:
          "A small window showing the keys you press (like wshowkeys / showmethekey), for screencasts and demos: combos run left to right in one row, newest on the right; held repeats count up (×4), older combos fade. Modifiers are named the Hyprland way. **Live** listens to this page; it is also built into **Hyprland → Live Session**.",
      },
    },
  },
} satisfies Meta<typeof KeystrokeVisualizer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sample: Story = {};
export const LiveTyping: Story = { name: "Live (type anything)", render: (args) => <Live linger={args.linger} titled={args.titled} /> };
export const Untitled: Story = { args: { titled: false } };
export const OnScreen: Story = {
  name: "On screen",
  render: (args) => (
    <Stage place="bottom">
      <Live linger={args.linger} titled={args.titled} />
    </Stage>
  ),
};
