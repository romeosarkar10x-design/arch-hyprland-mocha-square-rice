import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/Launcher.md?raw";
import { guide } from "../storybook";
import { Launcher } from "./Launcher";

const meta = {
  title: "Shell/Launchers/Launcher",
  component: Launcher,
  args: { autoFocus: false },
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof Launcher>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Default: Story = {
  ...fixed,
  render: () => <Launcher autoFocus={false} />,
};

export const Searching: Story = {
  ...fixed,
  render: () => <Launcher query="co" autoFocus={false} />,
};

export const NoMatch: Story = {
  ...fixed,
  render: () => <Launcher query="blender" autoFocus={false} />,
};
