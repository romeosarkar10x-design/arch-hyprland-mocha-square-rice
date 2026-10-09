import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/PowerMenu.md?raw";
import { guide } from "../storybook";
import { defaultPowerActions } from "..";
import { PowerMenu } from "./PowerMenu";

const meta = {
  title: "Session/PowerMenu",
  component: PowerMenu,
  args: {},
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof PowerMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Default: Story = {
  ...fixed,
  render: () => <PowerMenu />,
};

export const SafeOnly: Story = {
  ...fixed,
  render: () => <PowerMenu actions={defaultPowerActions.slice(0, 3)} />,
};
