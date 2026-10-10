import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents } from "../storybook";
import { Toggle } from "./toggle";

const meta = {
  title: "Controls/Toggle",
  component: Toggle,
  args: { label: "Blur", description: "layer blur under bar and popups", defaultChecked: true },
  argTypes: { accent: { control: "select", options: accents } },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const SettingsRows: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 360, display: "flex", flexDirection: "column" }}>
      <Toggle label="Blur" description="layer blur under bar and popups" defaultChecked />
      <Toggle label="Dim inactive" description="dim_strength 0.08" defaultChecked accent="pink" />
      <Toggle label="Animations" description="slide workspaces, rotate borders" defaultChecked accent="yellow" />
      <Toggle label="VRR" description="needs a supported monitor" disabled />
    </div>
  ),
};

export const Bare: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Toggle defaultChecked />
      <Toggle />
      <Toggle defaultChecked accent="green" />
    </div>
  ),
};
