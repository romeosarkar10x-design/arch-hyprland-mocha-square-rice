import type { Meta, StoryObj } from "@storybook/react-vite";
import { CoreGrid, Panel, Visualizer } from "..";
import { PanelSection } from "./panel-section";

const meta = {
  title: "Shell/Popups/PanelSection",
  component: PanelSection,
  args: { label: "section", children: "Section body" },
} satisfies Meta<typeof PanelSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const LabelledAndFlush: Story = {
  ...fixed,
  render: () => (
    <Panel icon="cpu" accent="sky" title="Sections" subtitle="label row · aside · flush">
      <PanelSection label="threads" aside={<span className="hx-dim">peak 95%</span>}>
        <CoreGrid cores={[12, 40, 8, 95, 33, 61, 20, 18, 5, 72, 44, 10]} columns={6} />
      </PanelSection>
      <PanelSection flush>
        <Visualizer height={70} />
      </PanelSection>
    </Panel>
  ),
};
