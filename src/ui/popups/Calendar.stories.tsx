import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "./Calendar";

const meta = {
  title: "Shell/Popups/Calendar",
  component: Calendar,
  args: { today: new Date(2026, 9, 3) },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const WithEvents: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 340 }}>
      <Calendar
        today={new Date(2026, 9, 3)}
        events={[
          { date: "2026-10-05", title: "Design review", accent: "mauve" },
          { date: "2026-10-08", title: "Arch update", accent: "sapphire" },
          { date: "2026-10-20", title: "Diwali", accent: "peach" },
        ]}
      />
    </div>
  ),
};

export const NoWeeks: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 300 }}>
      <Calendar today={new Date(2026, 11, 25)} weekNumbers={false} />
    </div>
  ),
};
