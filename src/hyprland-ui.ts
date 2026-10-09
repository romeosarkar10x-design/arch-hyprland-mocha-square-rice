import { createElement, type ComponentType, type FC } from "react";
import "./react-global";
import "../_ds_bundle.js";
import "../styles.css";
import "./rice.css";

declare global {
  interface Window {
    React: typeof import("react");
    HyprlandUI: Record<string, unknown>;
  }
}

/** A component from the hyprland-ui bundle, typed with the props from its .d.ts. */
export function ui<P = Record<string, unknown>>(name: string): ComponentType<P> {
  const component = window.HyprlandUI[name];
  if (typeof component !== "function" && typeof component !== "object") {
    throw new Error(`hyprland-ui has no export named ${name}`);
  }
  return component as ComponentType<P>;
}

/** Every icon name the bundle ships, for the `icon` / `name` select controls. */
export const iconNames = Object.keys(window.HyprlandUI.icons as Record<string, unknown>).sort();

// The design system's own compiled preview variants (_preview/<Name>.js). Each one is a
// classic script defining `var __dsPreview`, so it is evaluated rather than imported.
const previewSources = import.meta.glob<string>("../_preview/*.js", {
  query: "?raw",
  import: "default",
  eager: true,
});

const previewCache = new Map<string, Record<string, FC>>();

function loadPreview(name: string): Record<string, FC> {
  let exports = previewCache.get(name);
  if (!exports) {
    const src = previewSources[`../_preview/${name}.js`];
    if (src === undefined) throw new Error(`no _preview/${name}.js`);
    exports = new Function(`${src}\nreturn __dsPreview;`)() as Record<string, FC>;
    previewCache.set(name, exports);
  }
  return exports;
}

/** A story that renders one exported variant of _preview/<name>.js. */
export function variant(name: string, key: string) {
  return {
    name: key.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
    render: () => createElement(loadPreview(name)[key]!),
    parameters: { controls: { disable: true } },
  };
}
