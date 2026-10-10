import type { Meta, StoryObj } from "@storybook/react-vite";
import { WALLPAPER_IDS } from "../wallpapers/wallpapers";
import { MOCHA } from "./palette";
import { PaletteView, SwatchStrip } from "./palette-view";
import { ThemeProvider, useWallpaperTheme } from "./theme-provider";

const meta = {
  title: "Theme/Palette",
  component: PaletteView,
  args: { contrast: true },
  argTypes: { palette: { control: "object" }, contrast: { control: "boolean" } },
  parameters: {
    docs: {
      description: {
        component:
          "The 21 theme colours behind every `--hx-*` variable: ten neutrals (crust → text) and eleven accents, each with its contrast ratio against `base`. Without a `palette` prop it shows whatever theme is in effect, so it follows the **Theme** toolbar.",
      },
    },
  },
} satisfies Meta<typeof PaletteView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = {};
export const Mocha: Story = { args: { palette: MOCHA } };

function FromWallpaper({ wallpaper }: { wallpaper: string }) {
  const { theme } = useWallpaperTheme(wallpaper);
  if (!theme) return <span className="text-overlay1">extracting…</span>;
  return (
    <ThemeProvider palette={theme.palette}>
      <div style={{ display: "grid", gap: 14, maxWidth: 900 }}>
        <SwatchStrip swatches={theme.swatches} seeds={[theme.seeds.primary.hex, theme.seeds.secondary.hex, theme.seeds.tertiary.hex]} />
        <PaletteView palette={theme.palette} />
      </div>
    </ThemeProvider>
  );
}

export const FromWallpapers: Story = {
  name: "From each wallpaper",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gap: 32 }}>
      {WALLPAPER_IDS.map((id) => (
        <section key={id}>
          <h3 className="caps" style={{ margin: "0 0 10px" }}>
            {id}
          </h3>
          <FromWallpaper wallpaper={id} />
        </section>
      ))}
    </div>
  ),
};
