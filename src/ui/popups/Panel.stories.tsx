import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents, iconNames } from "../storybook";
import { Button, Meter, PanelSection, Stat, Toggle } from "..";
import { Panel } from "./Panel";

const meta = {
  title: "Shell/Popups/Panel",
  component: Panel,
  args: { icon: "cpu", accent: "sky", title: "Panel", subtitle: "subtitle", children: "Panel body" },
  argTypes: { icon: { control: "select", options: iconNames }, accent: { control: "select", options: accents } },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Composed: Story = {
  ...fixed,
  render: () => (
    <Panel
      icon="disk"
      accent="blue"
      title="Storage"
      subtitle="Samsung 990 PRO · 2 TB · btrfs"
      actions={
        <>
          <Button icon="folder" accent="blue">
            Open /
          </Button>
          <span className="hx-spacer" />
          <span className="hx-faint hx-small">last scrub 2d ago</span>
        </>
      }
    >
      <PanelSection>
        <div className="hx-stats">
          <Stat label="used" value="1.34" hint="TiB" accent="blue" />
          <Stat label="free" value="0.52" hint="TiB" />
        </div>
      </PanelSection>
      <PanelSection label="subvolumes">
        <Meter label="@" value={22} readout="412 GiB" accent="blue" />
        <Meter label="@home" value={46} readout="858 GiB" accent="blue" />
        <Meter label="@snapshots" value={4} readout="71 GiB" accent="blue" />
      </PanelSection>
    </Panel>
  ),
};

export const Settings: Story = {
  ...fixed,
  render: () => (
    <Panel icon="palette" accent="pink" title="Appearance" subtitle="hyprland.lua · decoration" live={false}>
      <PanelSection>
        <Toggle label="Blur" description="size 6 · passes 3" defaultChecked accent="pink" />
        <Toggle label="Dim inactive" description="strength 0.08" defaultChecked accent="pink" />
        <Toggle label="Rotating border" description="mauve → pink → yellow" defaultChecked accent="pink" />
      </PanelSection>
    </Panel>
  ),
};
