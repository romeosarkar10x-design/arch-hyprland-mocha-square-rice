import type { Meta, StoryObj } from "@storybook/react-vite";
import { WifiMenu } from "./connections";

const meta = {
  title: "Shell/Popups/Wi-Fi",
  component: WifiMenu,
  args: { connected: "home-5G", enabled: true },
  argTypes: { networks: { control: "object" }, onConnect: { control: false } },
  parameters: { docs: { description: { component: "NetworkManager Wi-Fi popup from the bar's network segment: connection details, nearby networks with signal bars, inline password for new secured networks." } } },
} satisfies Meta<typeof WifiMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Disconnected: Story = { args: { connected: null } };
export const Off: Story = { args: { enabled: false } };
