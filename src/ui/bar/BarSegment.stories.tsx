import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/BarSegment.md?raw";
import { accents, guide, iconNames } from "../storybook";
import { Unit } from "..";
import { BarSegment } from "./BarSegment";

const meta = {
  title: "Shell/Bar/BarSegment",
  component: BarSegment,
  args: { icon: "cpu", accent: "sky", children: "19%" },
  argTypes: { icon: { control: "select", options: iconNames }, accent: { control: "select", options: accents } },
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof BarSegment>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

const row = { display: "flex", height: 36, background: "var(--hx-bar-ground)", borderBottom: "2px solid var(--hx-surface0)" };

export const Modules: Story = {
  ...fixed,
  render: () => (
    <div style={row}>
      <BarSegment icon="ethernet" accent="sapphire">
        2.4 MiB
      </BarSegment>
      <BarSegment icon="cpu" accent="sky" divider spark={[12, 18, 30, 22, 41, 37, 25, 19]}>
        19% 52° 61
        <Unit>W</Unit>
      </BarSegment>
      <BarSegment icon="memory" accent="mauve" divider>
        31%
      </BarSegment>
      <BarSegment icon="volumeMedium" accent="yellow" divider>
        64%
      </BarSegment>
    </div>
  ),
};

export const States: Story = {
  ...fixed,
  render: () => (
    <div style={row}>
      <BarSegment icon="cpu" accent="sky">
        ok 24%
      </BarSegment>
      <BarSegment icon="cpu" accent="sky" divider level="warn">
        warn 71%
      </BarSegment>
      <BarSegment icon="cpu" accent="sky" divider level="crit">
        crit 96%
      </BarSegment>
      <BarSegment icon="gpu" accent="green" divider open>
        open
      </BarSegment>
      <BarSegment icon="volumeOff" accent="yellow" divider dim>
        muted
      </BarSegment>
    </div>
  ),
};

export const Ends: Story = {
  ...fixed,
  render: () => (
    <div style={row}>
      <BarSegment variant="launcher" icon="arch" label="Launcher" />
      <BarSegment variant="title">ghostty — ~/dotfiles</BarSegment>
      <BarSegment variant="clock" icon="clock">
        {"09:41 "}
        <Unit>PM</Unit>
      </BarSegment>
      <BarSegment variant="power" icon="power" label="Power" />
    </div>
  ),
};
