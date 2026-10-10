import type { Meta, StoryObj } from "@storybook/react-vite";
import { iconNames } from "../storybook";
import { MediaPlayer } from "./media-player";

const meta = {
  title: "Shell/Popups/MediaPlayer",
  component: MediaPlayer,
  args: { track: { title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", length: 243, art: ["mauve", "peach"] } },
  argTypes: { playerIcon: { control: "select", options: iconNames } },
} satisfies Meta<typeof MediaPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

// The variant stories show fixed compositions, so their controls do nothing.
const fixed = { parameters: { controls: { disable: true } } };

export const Playground: Story = {};

export const Full: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 380 }}>
      <MediaPlayer
        position={97}
        track={{ title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", length: 243, art: ["mauve", "peach"] }}
      />
    </div>
  ),
};

export const Paused: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 380 }}>
      <MediaPlayer
        playing={false}
        position={61}
        track={{ title: "Teardrop", artist: "Massive Attack", album: "Mezzanine", length: 330, art: ["sapphire", "teal"] }}
      />
    </div>
  ),
};

export const Compact: Story = {
  ...fixed,
  render: () => (
    <div style={{ width: 380 }}>
      <MediaPlayer variant="compact" track={{ title: "Windowlicker", artist: "Aphex Twin", length: 366, art: ["pink", "yellow"] }} />
    </div>
  ),
};
