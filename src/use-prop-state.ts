import { useState } from "react";

/**
 * Local state seeded from a prop that resets whenever the prop changes (so Storybook
 * controls still drive an interactive component). Adjusts during render, not in an effect.
 */
export function usePropState<T>(prop: T) {
  const [state, setState] = useState(prop);
  const [prev, setPrev] = useState(prop);
  if (prop !== prev) {
    setPrev(prop);
    setState(prop);
  }
  return [state, setState] as const;
}
