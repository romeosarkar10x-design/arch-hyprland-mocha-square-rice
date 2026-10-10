import type { Meta, StoryObj } from "@storybook/react-vite";
import { Rice, RICE_OVERLAYS } from "./rice";

const meta = {
  title: "Desktop/Rice",
  component: Rice,
  args: { overlay: "none", workspace: 1 },
  argTypes: {
    overlay: { control: "select", options: RICE_OVERLAYS },
    workspace: { control: { type: "range", min: 1, max: 5 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The complete desktop: the kit's live `<Desktop>` (bar, tiled windows, popups, launcher, power menu, toasts) with every extension layered where it appears in the real session. Only one popup is ever open: with one open, hovering another bar segment morphs it over to that one; click outside or Esc closes. The bell before the power button opens the notification centre; the Wi-Fi / Bluetooth layers open those quick-settings pages. Empty workspaces are hidden unless focused. Pick a layer with `overlay`; combine with the **Theme** toolbar to see the whole rice follow a wallpaper.",
      },
    },
  },
} satisfies Meta<typeof Rice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Terminal: Story = { args: { overlay: "terminal" } };
export const TaskManager: Story = { name: "Task manager", args: { overlay: "taskmanager" } };
export const Dmenu: Story = { args: { overlay: "dmenu" } };
export const Keybinds: Story = { args: { overlay: "keybinds" } };
export const Overview: Story = { args: { overlay: "overview" } };
export const Notifications: Story = { args: { overlay: "notifications" } };
export const Wifi: Story = { name: "Wi-Fi", args: { overlay: "wifi" } };
export const Polkit: Story = { args: { overlay: "polkit" } };
export const Lock: Story = { args: { overlay: "lock" } };
