import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClipboardManager } from "./clipboard-manager";
import { Stage } from "./stage";

const meta = {
  title: "Shell/Clipboard/cliphist Picker",
  component: ClipboardManager,
  args: { query: "", width: 560 },
  argTypes: { entries: { control: "object" }, onPaste: { control: false } },
  parameters: { docs: { description: { component: "cliphist picker (suggested on SUPER + C, since SUPER + V toggles floating in your hyprland.lua): pinned entries first, colour swatches, command / URL / path / image entries. Arrows move, Enter pastes, Delete removes." } } },
} satisfies Meta<typeof ClipboardManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Searching: Story = { args: { query: "hypr" } };
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage scrim><ClipboardManager {...args} /></Stage> };
