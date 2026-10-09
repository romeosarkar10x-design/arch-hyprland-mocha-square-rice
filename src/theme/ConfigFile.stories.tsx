import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfigFile } from "./ConfigFile";
import { DOTFILES } from "./exports";
import { useCssPalette } from "./useCssPalette";

/** A dotfile generated from the theme in effect (follows the Theme toolbar). */
function Dotfile({ target }: { target: string }) {
  const [ref, palette] = useCssPalette();
  const d = DOTFILES[target]!;
  return (
    <div ref={ref} style={{ maxWidth: 820 }}>
      <ConfigFile file={d.file} text={d.make(palette)} maxHeight={560} />
    </div>
  );
}

const meta = {
  title: "Theme/Dotfiles",
  component: ConfigFile,
  args: { file: "~/.config/hypr/colors.conf", text: "$mauve = rgba(cba6f7ff)\n# comment\ncol.active_border = rgba(cba6f7ee) rgba(f5c2e7ee) 45deg\n" },
  parameters: {
    docs: {
      description: {
        component:
          "The theme exported as config for every program in the rice. Each story is generated from the palette in effect, so switch the **Theme** toolbar to get the matching dotfiles; copy with the button.",
      },
    },
  },
} satisfies Meta<typeof ConfigFile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
const dot = (target: string): Story => ({ parameters: { controls: { disable: true } }, render: () => <Dotfile target={target} /> });
export const Css = { ...dot("css"), name: "CSS variables" };
export const Hyprland = dot("hyprland");
export const Hyprlock = dot("hyprlock");
export const Waybar = dot("waybar");
export const Rofi = dot("rofi");
export const Swaync = dot("swaync");
