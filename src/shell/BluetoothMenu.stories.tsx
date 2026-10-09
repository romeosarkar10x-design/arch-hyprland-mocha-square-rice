import type { Meta, StoryObj } from "@storybook/react-vite";
import { BluetoothMenu } from "./Connections";

const meta = {
  title: "Shell/Popups/Bluetooth",
  component: BluetoothMenu,
  args: { enabled: true },
  argTypes: { devices: { control: "object" } },
  parameters: { docs: { description: { component: "bluetoothctl / blueman popup: paired devices with battery, nearby devices to pair." } } },
} satisfies Meta<typeof BluetoothMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Off: Story = { args: { enabled: false } };
