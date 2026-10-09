import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClipboardManager } from "./ClipboardManager";
import { Stage } from "./Stage";

const meta = {
  title: "Shell/Launchers/Clipboard",
  component: ClipboardManager,
  args: { query: "", width: 560 },
  argTypes: { entries: { control: "object" }, onPaste: { control: false } },
  parameters: { docs: { description: { component: "cliphist picker (SUPER + V): pinned entries first, colour swatches, command / URL / path / image entries. Arrows move, Enter pastes, Delete removes." } } },
} satisfies Meta<typeof ClipboardManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Searching: Story = { args: { query: "hypr" } };
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage scrim><ClipboardManager {...args} /></Stage> };
