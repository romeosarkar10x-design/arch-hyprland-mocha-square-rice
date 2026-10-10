// Shared bits for the kit's stories.
import { icons, type IconName } from "./icons";
import type { Accent } from "./lib";

/** Every icon name, for `icon` select controls. */
export const iconNames = Object.keys(icons).sort() as IconName[];

export const accents: Accent[] = ["mauve", "pink", "yellow", "peach", "red", "green", "sky", "sapphire", "teal", "blue", "lavender", "text"];
