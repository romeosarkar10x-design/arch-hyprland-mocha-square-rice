import type { Meta, StoryObj } from "@storybook/react-vite";
import { BatteryPanel } from "./battery-panel";

const meta = {
  title: "Shell/Popups/Battery",
  component: BatteryPanel,
  args: { level: 82, charging: true, profile: "balanced", rate: 34.6, minutes: 38, health: 94, cycles: 212 },
  argTypes: {
    level: { control: { type: "range", min: 0, max: 100 } },
    profile: { control: "inline-radio", options: ["power-saver", "balanced", "performance"] },
    history: { control: "object" },
  },
  parameters: { docs: { description: { component: "upower + power-profiles-daemon popup: charge, time left, power profile, health and an 80% charge limit. Accent follows the level (green, yellow ≤30, red ≤15)." } } },
} satisfies Meta<typeof BatteryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Discharging: Story = { args: { charging: false, level: 46, rate: 11.2, minutes: 214 } };
export const Low: Story = { args: { charging: false, level: 12, rate: 14.8, minutes: 21, profile: "power-saver", history: [60, 52, 44, 38, 31, 26, 21, 17, 12] } };
