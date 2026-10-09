import type { Meta, StoryObj } from "@storybook/react-vite";
import { PolkitPrompt } from "./PolkitPrompt";
import { Stage } from "./Stage";

const meta = {
  title: "Session/Polkit Prompt",
  component: PolkitPrompt,
  args: { command: "/usr/bin/pacman -Syu", action: "org.archlinux.pkexec.pacman", identity: "romeo", failed: false },
  argTypes: { onAuthenticate: { control: false }, onCancel: { control: false } },
  parameters: { docs: { description: { component: "hyprpolkitagent dialog, shown when a GUI asks for root (pkexec, systemctl, package managers)." } } },
} satisfies Meta<typeof PolkitPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Failed: Story = { args: { failed: true } };
export const Systemctl: Story = { args: { command: "systemctl restart bluetooth.service", action: "org.freedesktop.systemd1.manage-units" } };
export const OnScreen: Story = { name: "On screen", render: (args) => <Stage scrim><PolkitPrompt {...args} /></Stage> };
