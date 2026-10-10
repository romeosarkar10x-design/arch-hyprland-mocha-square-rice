import { useState } from "react";
import { Icon, Shortcut, cx } from "../ui";
import { BINDS, SUGGESTED_BINDS, type HyprBind, type HyprBindGroup } from "./config";

// --hx-subtext1 isn't a theme token, so flags inherit the row colour unless their kind tints them.
const FLAG: Record<string, string> = { locked: "text-yellow", repeating: "text-teal", mouse: "text-blue", gesture: "text-blue" };

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
    <div data-component="HyprKeybinds" className="grid max-w-[1100px] gap-[18px] font-hx text-[12.5px] text-text">
      <label className="flex h-10 items-center gap-2.5 bg-mantle px-3 text-mauve ring ring-surface0">
        <Icon name="search" size={14} />
        <input
          className="uninput h-full flex-1 text-text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="filter binds…"
          aria-label="filter binds"
        />
        <span className="text-overlay1">~/.config/hypr/hyprland.lua</span>
      </label>
      {shown.map((g) => (
        <BindSection key={g.title} title={g.title} binds={g.binds} suggested={g === SUGGESTED_BINDS} />
      ))}
      {shown.length === 0 && <p className="text-overlay1">no bind matches “{query}”</p>}
    </div>
  );
}

function BindSection({ title, binds, suggested }: { title: string; binds: HyprBind[]; suggested: boolean }) {
  return (
    <section data-component="BindSection">
      <h3 className={cx("caps mt-0 mb-1.5", suggested ? "text-peach" : "text-subtext0")}>{title}</h3>
      <table className="w-full border-collapse">
        <tbody>
          {binds.map((b) => (
            <tr key={b.keys.join("+")} className={cx("*:border-b *:border-surface0 *:px-2.5 *:py-1.5 *:align-middle", suggested && "text-subtext0")}>
              <td className="w-[280px]">
                <Shortcut keys={b.keys} />
              </td>
              <td className="w-[260px]">{b.action}</td>
              <td>
                <code className="text-[11.5px]">{b.dispatch}</code>
              </td>
              <td>
                {b.flags?.map((f) => (
                  <span key={f} className={cx("mr-1 inline-block bg-surface0 px-1.5 py-px text-[10.5px]", FLAG[f])}>
                    {f}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
