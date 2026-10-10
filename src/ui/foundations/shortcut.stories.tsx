import { Fragment } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Shortcut } from "./shortcut";

const meta = {
  title: "Foundations/Shortcut",
  component: Shortcut,
  args: { keys: ["SUPER", "R"] },
} satisfies Meta<typeof Shortcut>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

const binds: [string[], string][] = [
  [["SUPER", "R"], "app launcher"],
  [["SUPER", "Q"], "terminal"],
  [["SUPER", "SHIFT", "Q"], "close window"],
  [["SUPER", "1"], "workspace 1"],
  [["SUPER", "S"], "scratchpad"],
  [["SUPER", "SHIFT", "S"], "screenshot region"],
];

export const Cheatsheet: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 18px", alignItems: "center", fontSize: 12.5 }}>
      {binds.map(([k, d]) => (
        <Fragment key={d}>
          <Shortcut keys={k} />
          <span style={{ color: "var(--hx-subtext0)" }}>{d}</span>
        </Fragment>
      ))}
    </div>
  ),
};
