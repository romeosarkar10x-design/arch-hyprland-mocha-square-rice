import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stage } from "../shell/Stage";
import { TaskManager } from "./TaskManager";

const meta = {
  title: "Apps/Task Manager",
  component: TaskManager,
  args: { page: "processes", interval: 1000, height: 760 },
  argTypes: {
    page: { control: "inline-radio", options: ["processes", "performance", "users", "services", "startup"] },
    interval: { control: "select", options: [0, 500, 1000, 2000, 5000], description: "Refresh period in ms; 0 pauses" },
    view: { control: "object" },
    selected: { control: "number" },
    details: { control: "boolean" },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "A complete Linux task manager over a simulated, realistic process table of this machine (kernel threads → systemd → greetd → Hyprland → Ghostty → zsh → nvim → language servers; Firefox content processes; Electron helpers; a Postgres container; a runaway script that ignores SIGTERM; a zombie; a stopped job).",
          "",
          "- **Processes**: tree / flat list / grouped (by app, name, user or systemd unit). **Σ Club children** sums every row with its descendants. Memory as **PSS** (sums correctly), **USS** (what ending it frees) or **RSS**; CPU as % of the machine or of one core. Sort any column, pick columns, search (ancestors stay as dimmed context), heat-tinted cells.",
          "- **Signals with real semantics**: SIGTERM / SIGKILL / SIGHUP / SIGINT / SIGQUIT / SIGSTOP / SIGCONT / SIGUSR1… Handlers can survive a signal (shells ignore SIGTERM; waybar reloads on SIGUSR2; the scraper shrugs off SIGTERM and you're offered SIGKILL), helpers die with their parent, orphans are reparented to the nearest subreaper (`systemd --user`) or PID 1, zombies can only be reaped through their parent, PID 1 and kernel threads are protected. Kill whole trees, suspend / resume, tag several rows (Space) and act on all.",
          "- **Privileges**: other users' processes, raising priority (lower nice) and system units ask **polkit**; authorisation is cached for five minutes like `auth_admin_keep`.",
          "- **Properties** panel: live CPU / memory graphs, USS / PSS / RSS breakdown, ancestry, children with subtree totals, the process's signal handlers.",
          "- **Performance** (CPU per thread, memory composition, zram swap, NVMe, Wi-Fi, GPU), **Users**, **Services** (start / stop / restart / reload / enable, `systemctl status` with the cgroup tree), **Startup** (hyprland.lua autostart lines + user units, with the Lua it writes).",
          "",
          "Keyboard: ↑↓ PgUp PgDn Home End · ←→ fold / parent · Space tag · Del end · ⇧Del kill · K signals (type a number) · N or [ ] nice · ⏎ properties · T / F5 tree · G group · C club · / search · ⇧F10 menu · Esc. Nothing real is signalled.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof TaskManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProcessTree: Story = { name: "Process tree (clubbed)" };
export const GroupedByApp: Story = { name: "Grouped by app", args: { view: { mode: "group", groupBy: "app", sort: "mem", desc: true } } };
export const ByMemory: Story = { name: "Flat list by memory", args: { view: { mode: "list", club: false, sort: "mem", desc: true, metric: "uss" } } };
export const Runaway: Story = { name: "Runaway script (details)", args: { selected: 4412, details: true, view: { sort: "cpu", desc: true } } };
export const Everything: Story = {
  name: "Kernel threads, every column",
  args: { view: { hideKernel: false, columns: ["pid", "ppid", "user", "state", "cpu", "mem", "shared", "swap", "vsz", "threads", "disk", "nice", "start", "time", "tty", "unit", "cmd"] } },
};
export const Performance: Story = { args: { page: "performance" } };
export const Users: Story = { args: { page: "users" } };
export const Services: Story = { args: { page: "services" } };
export const Startup: Story = { args: { page: "startup" } };
export const OnTheDesktop: Story = {
  name: "On the desktop",
  args: { width: 1240, height: 720 },
  render: (args) => (
    <Stage height={860}>
      <TaskManager {...args} />
    </Stage>
  ),
};
