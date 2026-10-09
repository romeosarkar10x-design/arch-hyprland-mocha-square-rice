import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationCenter } from "./NotificationCenter";
import { Stage } from "./Stage";

const meta = {
  title: "Shell/Overlays/Notification Center",
  component: NotificationCenter,
  args: { dnd: false, sliders: true, width: 400, height: 720 },
  argTypes: { notifications: { control: "object" } },
  parameters: { docs: { description: { component: "swaync-style panel (SUPER + N): do-not-disturb, volume/brightness, notifications grouped by app with collapse, per-group clear and clear all. Notifications are the kit's `Toast`." } } },
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const DoNotDisturb: Story = { name: "Do not disturb", args: { dnd: true } };
export const Empty: Story = { args: { notifications: [] } };
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage place="right" height={760}><NotificationCenter {...args} height="100%" /></Stage> };
