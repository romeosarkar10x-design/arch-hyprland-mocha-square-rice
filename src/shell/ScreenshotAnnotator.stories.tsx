import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenshotAnnotator } from "./ScreenshotAnnotator";

const meta = {
  title: "Shell/Screenshot/Annotate",
  component: ScreenshotAnnotator,
  args: { tool: "arrow", colour: "red", size: 2, fill: false, width: 1100 },
  argTypes: {
    tool: { control: "select", options: ["pointer", "arrow", "line", "rect", "ellipse", "marker", "brush", "text", "number", "blur"] },
    colour: { control: "select", options: ["red", "peach", "yellow", "green", "blue", "mauve", "text", "crust"] },
    size: { control: "inline-radio", options: [1, 2, 3] },
    shapes: { control: "object" },
    region: { control: "object" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "satty, the editor `hyprshot … | satty -f -` opens after a capture: arrows, lines, boxes, ellipses, highlighter, brush, text, numbered markers and blur for redacting, in theme colours. Draw on it with the mouse; keys V A L R E M D T N B pick tools, 1 2 3 size, F fill, Ctrl+Z undo, Ctrl+C copy, Ctrl+S save.",
      },
    },
  },
} satisfies Meta<typeof ScreenshotAnnotator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Annotated: Story = {};
export const Blank: Story = { args: { shapes: [] } };
export const Redact: Story = { args: { tool: "blur", shapes: [] } };
