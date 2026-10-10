import { Kbd } from "../foundations/kbd";
import { place, type Win } from "./desktop-layouts";
import { WindowFrame } from "./window-frame";

export interface DesktopStageProps {
  layouts: Record<number, Win[]>;
  /** Visible workspace; the others slide off to the sides. */
  workspace: number;
  /** Focused window id per workspace. */
  focus: Record<number, string>;
  onFocus: (workspace: number, id: string) => void;
}

/** Everything under the bar: one sliding view per workspace, or a hint on an empty one. */
export function DesktopStage({ layouts, workspace, focus, onFocus }: DesktopStageProps) {
  return (
    <div data-component="DesktopStage" className="absolute inset-x-0 top-[calc(var(--hx-bar-height)+var(--hx-border-bar))] bottom-0 overflow-hidden">
      {Object.entries(layouts).map(([k, wins]) => {
        const id = Number(k);
        return (
          <div
            key={k}
            className="absolute inset-0 transition-transform duration-500 ease-hx"
            style={{ transform: `translateX(${(id - workspace) * 100}%)` }}
            aria-hidden={id !== workspace}
          >
            {wins.map((w) => (
              <WindowFrame key={w.id} focused={focus[id] === w.id} tag={w.tag} onFocus={() => onFocus(id, w.id)} style={place(w.box)}>
                {w.body}
              </WindowFrame>
            ))}
          </div>
        );
      })}
      {!layouts[workspace] && <EmptyWorkspace workspace={workspace} />}
    </div>
  );
}

function EmptyWorkspace({ workspace }: { workspace: number }) {
  return (
    <div data-component="EmptyWorkspace" className="absolute inset-0 flex animate-fade flex-col items-center justify-center gap-2.5 text-[12px]">
      <span className="caps">
        {"workspace "}
        {workspace}
      </span>
      <span className="text-overlay1">
        {"empty · press "}
        <Kbd>/</Kbd>
        {" to launch something"}
      </span>
    </div>
  );
}
