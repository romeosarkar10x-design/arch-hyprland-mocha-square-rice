import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // src/ui is the hyprland-ui kit; the rest of src/ builds the rice on top of it.
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
