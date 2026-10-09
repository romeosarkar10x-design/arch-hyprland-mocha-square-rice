import { useState } from "react";
import { Icon, Shortcut } from "../ds";
import { BINDS, SUGGESTED_BINDS, type HyprBindGroup } from "./config";
import "./hypr.css";

export interface HyprKeybindsProps {
  groups?: HyprBindGroup[];
  /** Also list binds the rest of the rice would want (screenshot, clipboard, lock…). */
  suggestions?: boolean;
  query?: string;
}

/** Every bind in hyprland.lua with the Lua dispatcher it calls and its flags. */
export function HyprKeybinds({ groups = BINDS, suggestions = true, query: initial = "" }: HyprKeybindsProps) {
  const [query, setQuery] = useState(initial);
  const q = query.toLowerCase();
  const all = suggestions ? [...groups, SUGGESTED_BINDS] : groups;
  const shown = all
    .map((g) => ({ ...g, binds: g.binds.filter((b) => !q || `${b.keys.join(" ")} ${b.action} ${b.dispatch}`.toLowerCase().includes(q)) }))
    .filter((g) => g.binds.length);
  return (
    <div className="rx-hkeys">
      <label className="rx-hkeys-search">
        <Icon name="search" size={14} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="filter binds…" aria-label="filter binds" />
        <span className="hx-faint">~/.config/hypr/hyprland.lua</span>
      </label>
      {shown.map((g) => (
        <section key={g.title} className={g === SUGGESTED_BINDS ? "is-suggested" : undefined}>
          <h3 className="hx-caps">{g.title}</h3>
          <table>
            <tbody>
              {g.binds.map((b) => (
                <tr key={b.keys.join("+")}>
                  <td>
                    <Shortcut keys={b.keys} />
                  </td>
                  <td>{b.action}</td>
                  <td>
                    <code>{b.dispatch}</code>
                  </td>
                  <td>
                    {b.flags?.map((f) => (
                      <span key={f} className={`rx-hkeys-flag rx-hkeys-flag--${f}`}>
                        {f}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
      {shown.length === 0 && <p className="hx-faint">no bind matches “{query}”</p>}
    </div>
  );
}
