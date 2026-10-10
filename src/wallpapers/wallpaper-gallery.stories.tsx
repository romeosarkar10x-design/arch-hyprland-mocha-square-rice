import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ScaleToFit } from "../theme/theme-generator";
import { WallpaperGallery } from "./wallpaper-gallery";
import { wallpaper, WALLPAPER_IDS } from "./wallpapers";

const meta = {
  title: "Theme/Wallpapers",
  component: WallpaperGallery,
  args: { size: "large" },
  argTypes: {
    size: { control: "inline-radio", options: ["large", "compact"] },
    selected: { control: "select", options: WALLPAPER_IDS },
    onSelect: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Ten Arch Linux wallpapers, generated as 1920×1080 SVG in code (no bitmaps or third-party art), so they are sharp on any monitor and a few KB each. Each has its own colours on purpose: pick one in **Theme → Dynamic Theme** or the **Theme** toolbar and the UI rethemes to it. Export one with `wallpaper(id).svg`.",
      },
    },
  },
} satisfies Meta<typeof WallpaperGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(args.selected ?? "nebula");
    return <WallpaperGallery {...args} selected={selected} onSelect={setSelected} />;
  },
};

export const Compact: Story = { args: { size: "compact" } };

const full = (id: string): Story => ({
  name: wallpaper(id).name,
  parameters: { controls: { disable: true }, docs: { description: { story: wallpaper(id).description } } },
  render: () => (
    <ScaleToFit width={1920} height={1080}>
      <img src={wallpaper(id).url} alt={wallpaper(id).name} width={1920} height={1080} style={{ display: "block" }} />
    </ScaleToFit>
  ),
});

export const Nebula = full("nebula");
export const Outrun = full("outrun");
export const Contour = full("contour");
export const Glacier = full("glacier");
export const Ember = full("ember");
export const Terminal = full("terminal");
export const Bauhaus = full("bauhaus");
export const Aurora = full("aurora");
export const ArchBlue = full("arch-blue");
export const Dune = full("dune");
