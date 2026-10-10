import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuickSettings } from "./quick-settings";

const meta = {
  title: "Shell/Popups/QuickSettings",
  component: QuickSettings,
  args: { page: "main" },
  argTypes: { page: { control: "inline-radio", options: ["main", "wifi", "bluetooth", "night", "audio"] } },
} satisfies Meta<typeof QuickSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Panel: Story = {
  ...fixed,
  render: () => <QuickSettings />,
};

export const WifiPage: Story = { ...fixed, name: "Wi-Fi page", render: () => <QuickSettings page="wifi" /> };
export const BluetoothPage: Story = { ...fixed, name: "Bluetooth page", render: () => <QuickSettings page="bluetooth" /> };
export const NightLightPage: Story = {
  ...fixed,
  name: "Night light page",
  render: () => <QuickSettings page="night" />,
};
export const SoundPage: Story = { ...fixed, name: "Sound page", render: () => <QuickSettings page="audio" /> };

export const Grid: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 380 }}>
      <QuickSettings bare />
    </div>
  ),
};
