import type { Meta, StoryObj } from "@storybook/react-vite";
import md from "../../../guidelines/docs/Icon.md?raw";
import { guide, iconNames } from "../storybook";
import { Icon } from "./Icon";

const meta = {
  title: "Foundations/Icon",
  component: Icon,
  args: { name: "arch", size: 24, color: "var(--hx-mauve)" },
  argTypes: { name: { control: "select", options: iconNames } },
  parameters: { docs: { description: { component: guide(md) } } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

const set = [
  ["arch", "mauve"],
  ["cpu", "sky"],
  ["gpu", "green"],
  ["memory", "mauve"],
  ["ethernet", "sapphire"],
  ["volumeHigh", "yellow"],
  ["coffee", "yellow"],
  ["power", "red"],
  ["lock", "lavender"],
  ["suspend", "sky"],
  ["reboot", "peach"],
  ["clock", "text"],
  ["ghostty", "mauve"],
  ["chrome", "blue"],
  ["vscode", "sapphire"],
  ["spotify", "green"],
  ["steam", "sky"],
  ["chat", "lavender"],
] as const;

export const Set: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 72px)", gap: 2 }}>
      {set.map(([n, c]) => (
        <div
          key={n}
          style={{
            height: 64,
            background: "var(--hx-mantle)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Icon name={n} size={22} color={`var(--hx-${c})`} />
          <span style={{ fontSize: 9.5, color: "var(--hx-overlay1)" }}>{n}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  ...fixed,
  render: () => (
    <div style={{ display: "flex", gap: 18, alignItems: "flex-end", color: "var(--hx-mauve)" }}>
      {[14, 18, 24, 32, 48].map((s) => (
        <Icon key={s} name="arch" size={s} />
      ))}
    </div>
  ),
};
