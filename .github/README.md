<div align="center">

# arch-hyprland-mocha-square-rice

**hyprland-ui** — a Hyprland / Waybar desktop UI kit in React.
Catppuccin Mocha, square corners everywhere, asiLonoM monospace.

[![Deploy Storybook](https://github.com/romeosarkar10x-design/arch-hyprland-mocha-square-rice/actions/workflows/storybook-pages.yml/badge.svg)](https://github.com/romeosarkar10x-design/arch-hyprland-mocha-square-rice/actions/workflows/storybook-pages.yml)
[![Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://romeosarkar10x-design.github.io/arch-hyprland-mocha-square-rice/)
[![Catppuccin Mocha](https://img.shields.io/badge/Catppuccin-Mocha-cba6f7?logo=catppuccin&logoColor=white&labelColor=1e1e2e)](https://catppuccin.com/palette)
[![Hyprland](https://img.shields.io/badge/Hyprland-rice-89b4fa?logo=hyprland&logoColor=white&labelColor=1e1e2e)](https://hyprland.org)

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Storybook](https://img.shields.io/badge/Storybook-10-ff4785?logo=storybook&logoColor=white)](https://storybook.js.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![pnpm](https://img.shields.io/badge/pnpm-11-f69220?logo=pnpm&logoColor=white)](https://pnpm.io)

</div>

---

## About

43 components for mocking up a Hyprland desktop: the Waybar bar and its segments, rich popups (CPU, GPU, memory, network, audio, clock), overlays (launcher, power menu, toasts), desktop windows (terminal, editor, browser) and a fully interactive `<Desktop />`.

Browse them all in the **[live Storybook](https://romeosarkar10x-design.github.io/arch-hyprland-mocha-square-rice/)**.

## Develop

```sh
pnpm install
pnpm storybook        # dev server on http://localhost:6006
pnpm build-storybook  # static build in storybook-static/
pnpm check            # typecheck + lint
```

## Docs

- [`README.md`](../README.md) — design-system conventions (surfaces, accents, levels, tokens, composition)
- [`guidelines/`](../guidelines/) — per-component usage guidance
- [`src/ui/`](../src/ui/) — the components, one `.tsx` and `.stories.tsx` per component
