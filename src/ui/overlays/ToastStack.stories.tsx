import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/ToastStack.md?raw";
import { guide } from "../storybook";
import { Toast } from "..";
import { ToastStack } from "./ToastStack";

const meta = {
  title: "Shell/Overlays/ToastStack",
  component: ToastStack,
  args: { children: <Toast app="Spotify" appIcon="spotify" accent="green" title="Midnight City" body="M83" /> },
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof ToastStack>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Stacked: Story = {
  ...fixed,
  render: () => (
    <ToastStack>
      <Toast app="Discord" appIcon="chat" accent="lavender" title="#hyprland" body="vaxry: 0.57 is out with lua hot-reload" />
      <Toast app="Spotify" appIcon="spotify" accent="green" title="Midnight City" body="M83" time="1m" />
      <Toast app="udiskie" appIcon="disk" accent="peach" title="USB mounted" body="/run/media/romeo/VENTOY" time="4m" />
    </ToastStack>
  ),
};
