import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarSegment, Icon, Unit, Workspaces, type Workspace } from "..";
import { Bar } from "./bar";

const meta = {
  title: "Shell/Bar/Bar",
  component: Bar,
  args: {},
} satisfies Meta<typeof Bar>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

const ws: Workspace[] = [
  { id: 1, apps: ["code", "ghostty"] },
  { id: 2, apps: ["chrome"] },
  { id: 3, apps: ["spotify"] },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 },
];

export const Full: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 1920 }}>
      <Bar
        left={
          <>
            <BarSegment variant="launcher" icon="arch" label="Launcher" />
            <Workspaces workspaces={ws} active={1} />
            <BarSegment variant="title">nvim ~/dotfiles/hyprland/.config/hypr/hyprland.lua</BarSegment>
          </>
        }
        center={
          <>
            <BarSegment variant="media" icon="spotify" accent="green">
              M83 — Midnight City
            </BarSegment>
            <BarSegment variant="clock" icon="clock">
              {"Sat 03 Oct  09:41 "}
              <Unit>PM</Unit>
            </BarSegment>
          </>
        }
        right={
          <>
            <BarSegment icon="ethernet" accent="sapphire">
              <Icon name="down" />
              {" 2.4 MiB "}
              <Icon name="up" />
              {" 312 KiB"}
            </BarSegment>
            <BarSegment icon="cpu" accent="sky" divider spark={[12, 18, 30, 22, 41, 37, 25, 19]}>
              19%
            </BarSegment>
            <BarSegment icon="gpu" accent="green" divider spark={[30, 42, 38, 51, 47, 44, 40, 36]}>
              36%
            </BarSegment>
            <BarSegment icon="memory" accent="mauve" divider>
              31%
            </BarSegment>
            <BarSegment icon="coffeeOff" divider dim label="Caffeine" />
            <BarSegment icon="settings" divider label="Quick settings" />
            <BarSegment variant="power" icon="power" label="Power" />
          </>
        }
      />
    </div>
  ),
};

export const UnderLoad: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 1920 }}>
      <Bar
        left={
          <>
            <BarSegment variant="launcher" icon="arch" />
            <Workspaces workspaces={ws} active={3} />
          </>
        }
        center={
          <BarSegment variant="clock" icon="clock">
            {"Sat 03 Oct  11:58 "}
            <Unit>PM</Unit>
          </BarSegment>
        }
        right={
          <>
            <BarSegment icon="cpu" accent="sky" divider level="crit" spark={[70, 82, 88, 91, 94, 97, 95, 98]}>
              97%
            </BarSegment>
            <BarSegment icon="gpu" accent="green" divider level="warn" open spark={[60, 72, 81, 77, 90, 85, 70, 88]}>
              88%
            </BarSegment>
            <BarSegment icon="memory" accent="mauve" divider level="warn">
              81%
            </BarSegment>
            <BarSegment icon="coffee" divider className="is-caffeine" label="Caffeine" />
            <BarSegment icon="settings" divider label="Quick settings" />
            <BarSegment variant="power" icon="power" />
          </>
        }
      />
    </div>
  ),
};
