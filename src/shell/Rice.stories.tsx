import type { Meta, StoryObj } from "@storybook/react-vite";
import { Rice, RICE_OVERLAYS } from "./Rice";

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
          "The complete desktop: the kit's live `<Desktop>` (bar, tiled windows, popups, launcher, power menu, toasts) with every extension layered where it appears in the real session. Pick a layer with `overlay`; combine with the **Theme** toolbar to see the whole rice follow a wallpaper.",
      },
    },
  },
} satisfies Meta<typeof Rice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Terminal: Story = { args: { overlay: "terminal" } };
export const Dmenu: Story = { args: { overlay: "dmenu" } };
export const Keybinds: Story = { args: { overlay: "keybinds" } };
export const Overview: Story = { args: { overlay: "overview" } };
export const Notifications: Story = { args: { overlay: "notifications" } };
export const Polkit: Story = { args: { overlay: "polkit" } };
export const Lock: Story = { args: { overlay: "lock" } };
