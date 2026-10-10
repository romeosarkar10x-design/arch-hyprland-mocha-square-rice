import type { Decorator, Preview } from "@storybook/react-vite";
import { Surface } from "../src/ui";
import "../src/rice.css";
import { ThemeProvider } from "../src/theme/theme-provider";
import type { Vibrancy } from "../src/theme/palette";
import { wallpapers } from "../src/wallpapers/wallpapers";

// Toolbar: retheme every story from a wallpaper. "mocha" is the design system's own palette.
const withTheme: Decorator = (Story, { globals, parameters }) => {
  const wallpaper = globals.theme && globals.theme !== "mocha" ? (globals.theme as string) : undefined;
  const story = parameters.bare ? (
    <Story />
  ) : (
    // Same framing as the design system's preview cards: every story inside <Surface padding={24}>.
    <Surface padding={24}>
      <Story />
    </Surface>
  );
  return (
    <ThemeProvider wallpaper={wallpaper} vibrancy={globals.vibrancy as Vibrancy}>
      {story}
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Derive the palette from a wallpaper",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [{ value: "mocha", title: "Mocha (default)" }, ...wallpapers().map((w) => ({ value: w.id, title: `${w.name} wallpaper` }))],
        dynamicTitle: true,
      },
    },
    vibrancy: {
      description: "Accent saturation of wallpaper themes",
      toolbar: {
        title: "Vibrancy",
        icon: "contrast",
        items: ["muted", "balanced", "vivid"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "mocha", vibrancy: "balanced" },
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    controls: { expanded: true, sort: "requiredFirst" },
    options: {
      storySort: {
        order: [
          "Overview", ["Introduction", "Table of Contents"],
          "Theme", ["Dynamic Theme", "Palette", "Wallpapers", "Dotfiles"],
          "Hyprland", ["Live Session", "Window Look", "Animations", "Keybinds"],
          "Foundations",
          "Controls",
          "Data",
          "Shell", ["Bar", "Popups", "Launchers", "Clipboard", "Screenshot", ["Capture", "Annotate"], "Overlays"],
          "Session",
          "Apps",
          "Desktop",
        ],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
