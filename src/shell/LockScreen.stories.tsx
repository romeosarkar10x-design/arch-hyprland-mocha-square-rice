import type { Meta, StoryObj } from "@storybook/react-vite";
import { LockScreen } from "./LockScreen";

const meta = {
  title: "Session/Lock Screen",
  component: LockScreen,
  args: { user: "romeo", password: "arch", state: "idle", battery: 82, now: new Date(2026, 9, 10, 21, 41) },
  argTypes: {
    state: { control: "inline-radio", options: ["idle", "typing", "checking", "failed", "capslock"] },
    now: { control: "date" },
    media: { control: "object" },
    onUnlock: { control: false },
  },
  parameters: {
    docs: { description: { component: "hyprlock: the blurred wallpaper (set by the theme), clock, and a square password field whose outline shows state: mauve focused, yellow checking, red failed (with shake), peach caps lock, green unlocked. Type `arch` + Enter to unlock." } },
  },
} satisfies Meta<typeof LockScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Typing: Story = { args: { state: "typing" } };
export const Failed: Story = { args: { state: "failed" } };
export const CapsLock: Story = { name: "Caps lock", args: { state: "capslock" } };
export const NoMedia: Story = { name: "No media", args: { media: null } };
