import type { Meta, StoryObj } from "@storybook/react-vite";
import { WALLPAPER_IDS } from "../wallpapers/wallpapers";
import { ThemeGenerator } from "./ThemeGenerator";

const meta = {
  title: "Theme/Dynamic Theme",
  component: ThemeGenerator,
  args: { wallpaper: "nebula", vibrancy: "balanced", applyGlobally: false, preview: true },
  argTypes: {
    wallpaper: { control: "select", options: WALLPAPER_IDS, description: "Bundled wallpaper id, or any image URL" },
    vibrancy: { control: "inline-radio", options: ["muted", "balanced", "vivid"] },
    applyGlobally: { control: "boolean", description: "Write the palette to <html> so everything on the page follows" },
    preview: { control: "boolean", description: "Show the live 1920×1080 desktop preview" },
    width: { control: "number" },
    onTheme: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: `Pick a wallpaper (or drop your own image) and the whole UI rethemes to match.

**How the palette is chosen**

1. The image is sampled and clustered in **OKLab** with k-means++ (perceptual colour space, fixed seed: same image, same theme).
2. Clusters are scored by population, chroma and usable lightness; the best becomes **primary** (mauve, lavender, window borders), the best one ≥30° of hue away becomes **secondary** (pink), then a **tertiary**.
3. **Neutrals** keep Catppuccin Mocha's exact lightness ladder and take only a capped tint of the image's colour cast, with a tighter cap for warm/green casts that would turn muddy. Text stays near-white.
4. **Accents** keep Mocha's pastel lightness/chroma. Each slot snaps toward an image colour near its own hue; semantic slots (red = critical, yellow = warning, green = ok) only move inside narrow windows and are rotated away if they collide with the primary.
5. Every accent is then lifted until it has **≥ 4.5:1 WCAG contrast** on \`base\`.

Use the **Theme** toolbar button to apply any wallpaper theme to every story in this Storybook.`,
      },
    },
  },
} satisfies Meta<typeof ThemeGenerator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Outrun: Story = { args: { wallpaper: "outrun" } };
export const Glacier: Story = { args: { wallpaper: "glacier" } };
export const Ember: Story = { args: { wallpaper: "ember" } };
export const Bauhaus: Story = { args: { wallpaper: "bauhaus" } };
export const Terminal: Story = { args: { wallpaper: "terminal" } };
export const Muted: Story = { args: { wallpaper: "aurora", vibrancy: "muted" } };
export const Vivid: Story = { args: { wallpaper: "aurora", vibrancy: "vivid" } };
export const ApplyToEverything: Story = { name: "Apply to everything", args: { wallpaper: "dune", applyGlobally: true, preview: false } };
