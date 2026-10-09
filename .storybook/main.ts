import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // stories/ is generated from the synced design system; src/ holds the hand-written
  // extensions (theme engine, wallpapers, terminal emulators, missing desktop pieces).
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)", "../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-vite", options: {} },
  // Components come from a prebuilt bundle, so there is no source for docgen to read.
  typescript: { reactDocgen: false },
};

export default config;
