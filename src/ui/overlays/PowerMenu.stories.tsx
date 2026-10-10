import type { Meta, StoryObj } from "@storybook/react-vite";
import { defaultPowerActions } from "..";
import { PowerMenu } from "./PowerMenu";

const meta = {
  title: "Session/PowerMenu",
  component: PowerMenu,
  args: {},
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
