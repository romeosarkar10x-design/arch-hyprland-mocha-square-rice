import type { Meta, StoryObj } from "@storybook/react-vite";
import { accents, iconNames } from "../storybook";
import { Toast } from "./Toast";

const meta = {
  title: "Shell/Overlays/Toast",
  component: Toast,
  args: { app: "pacman", appIcon: "package", accent: "sapphire", title: "14 updates available", body: "linux · mesa · hyprland-git" },
  argTypes: { appIcon: { control: "select", options: iconNames }, accent: { control: "select", options: accents } },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const WithActions: Story = {
  ...fixed,
  render: () => (
    <Toast
      app="pacman"
      appIcon="package"
      accent="sapphire"
      title="14 updates available"
      body="linux 7.2.3 · mesa · hyprland-git · waybar-git …"
      actions={[{ label: "Update" }, { label: "Later" }]}
    />
  ),
};

export const NowPlaying: Story = {
  ...fixed,
  render: () => <Toast app="Spotify" appIcon="spotify" accent="green" title="Midnight City" body="M83 — Hurry Up, We're Dreaming" time="2m" />,
};

export const Critical: Story = {
  ...fixed,
  render: () => (
    <Toast
      app="nvidia"
      appIcon="temp"
      urgency="critical"
      title="GPU at 88 °C"
      body="Fan 100% · power limited to 380 W"
      actions={[{ label: "Open nvidia-smi" }]}
    />
  ),
};

export const Countdown: Story = {
  ...fixed,
  render: () => <Toast app="grim" appIcon="screenshot" accent="pink" title="Screenshot saved" body="~/Pictures/2026-10-03_21-41.png" timeout={6e5} />,
};
