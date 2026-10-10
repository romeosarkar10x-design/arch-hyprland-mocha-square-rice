import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // src/ui is the hyprland-ui kit; the rest of src/ builds the rice on top of it.
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-vite", options: {} },
  async viteFinal(vite) {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    vite.plugins = [...(vite.plugins ?? []), tailwindcss()];
    return vite;
  },
};

export default config;
