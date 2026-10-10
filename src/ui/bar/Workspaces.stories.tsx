import type { Meta, StoryObj } from "@storybook/react-vite";
import { Workspaces } from "./Workspaces";

const meta = {
  title: "Shell/Bar/Workspaces",
  component: Workspaces,
  args: { active: 1, workspaces: [{ id: 1, apps: ["code", "ghostty"] }, { id: 2, apps: ["chrome"] }, { id: 3 }, { id: 4 }, { id: 5 }] },
} satisfies Meta<typeof Workspaces>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

const row = { display: "flex", height: 36, background: "var(--hx-bar-ground)", borderBottom: "2px solid var(--hx-surface0)", width: "fit-content" };

export const WithApps: Story = {
  ...fixed,
  render: () => (
    <div style={row}>
      <Workspaces
        active={1}
        workspaces={[
          { id: 1, apps: ["code", "ghostty", "ghostty"] },
          { id: 2, apps: ["chrome"] },
          { id: 3, apps: ["spotify", "chat"] },
          { id: 4 },
          { id: 5, apps: ["steam"] },
          { id: 6 },
          { id: 7 },
          { id: 8 },
          { id: 9 },
          { id: 10 },
        ]}
      />
    </div>
  ),
};

export const Urgent: Story = {
  ...fixed,
  render: () => (
    <div style={row}>
      <Workspaces
        active={2}
        workspaces={[{ id: 1, apps: ["code"] }, { id: 2, apps: ["chrome"] }, { id: 3 }, { id: 4, urgent: true, apps: ["chat"] }, { id: 5 }]}
      />
    </div>
  ),
};

export const NumbersOnly: Story = {
  ...fixed,
  render: () => (
    <div style={row}>
      <Workspaces
        active={3}
        showApps={false}
        workspaces={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => ({ id, apps: id < 4 ? ["ghostty"] : undefined }))}
      />
    </div>
  ),
};
