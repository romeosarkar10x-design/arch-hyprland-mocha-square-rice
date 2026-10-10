import type { Meta, StoryObj } from "@storybook/react-vite";
import { Greeter } from "./greeter";

const meta = {
  title: "Session/Greeter",
  component: Greeter,
  args: { hostname: "archlinux", now: new Date(2026, 9, 10, 9, 41) },
  argTypes: { now: { control: "date" }, users: { control: "object" }, sessions: { control: "object" }, onLogin: { control: false }, onPower: { control: false } },
  parameters: { docs: { description: { component: "Login screen (greetd / SDDM theme): pick user and session (click to cycle Hyprland / uwsm / Plasma / TTY), password, power actions." } } },
} satisfies Meta<typeof Greeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const SingleUser: Story = { name: "Single user", args: { users: [{ name: "romeo", full: "Romeo Sarkar" }] } };
