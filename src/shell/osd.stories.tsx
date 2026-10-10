import type { Meta, StoryObj } from "@storybook/react-vite";
import { Osd } from "../ui";
import { Stage } from "./stage";

const meta = {
  title: "Shell/Overlays/OSD",
  component: Osd,
  args: { kind: "volume", value: 64, muted: false, cells: 20 },
  argTypes: {
    kind: { control: "inline-radio", options: ["volume", "brightness", "mic", "keyboard-light", "capslock", "layout"] },
    value: { control: { type: "range", min: 0, max: 100 } },
    cells: { control: { type: "range", min: 8, max: 40 } },
  },
  parameters: { docs: { description: { component: "swayosd-style on-screen display, shown bottom-centre for a second when a media key is pressed." } } },
} satisfies Meta<typeof Osd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Kinds: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <Osd kind="volume" value={64} />
      <Osd kind="volume" value={64} muted />
      <Osd kind="brightness" value={30} />
      <Osd kind="mic" value={80} />
      <Osd kind="keyboard-light" value={50} cells={4} />
      <Osd kind="capslock" label="on" />
      <Osd kind="layout" label="de · German" />
    </div>
  ),
};
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage place="bottom"><Osd {...args} /></Stage> };
