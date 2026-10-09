import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClipboardDemo } from "./ClipboardDemo";
import { ClipboardHistory } from "./ClipboardHistory";
import { Stage } from "./Stage";

const meta = {
  title: "Shell/Clipboard/History",
  component: ClipboardHistory,
  args: { tab: "clipboard", width: 380 },
  argTypes: { tab: { control: "inline-radio", options: ["clipboard", "emoji", "kaomoji", "symbols"] }, items: { control: "object" }, onPaste: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Clipboard manager in the style of Windows' Win + V: everything you copy as a stack of cards (text, code, links, paths, colours, images), pin the ones to keep, delete, clear all (pins stay), paste as plain text, plus emoji / kaomoji / symbol pickers. On the desktop it's cliphist + wl-clipboard underneath. **Working demo** copies and pastes for real on this page.",
      },
    },
  },
} satisfies Meta<typeof ClipboardHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Panel: Story = {};
export const WorkingDemo: Story = { name: "Working demo", parameters: { controls: { disable: true } }, render: () => <ClipboardDemo /> };
export const Emoji: Story = { args: { tab: "emoji" } };
export const Kaomoji: Story = { args: { tab: "kaomoji" } };
export const Empty: Story = { args: { items: [] } };
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage place="bottom" height={720}><ClipboardHistory {...args} /></Stage> };
