import { useState } from "react";
import { Button, Icon, IconButton, Slider, Toast, Toggle, type ToastProps } from "../ui";
import "./shell.css";

export type Notification = Omit<ToastProps, "onClose" | "timeout"> & { id: number };

export const demoNotifications: Notification[] = [
  { id: 1, app: "pacman", appIcon: "package", accent: "sapphire", title: "14 updates available", body: "linux 7.2.10 · mesa · hyprland · waybar …", time: "2m", actions: [{ label: "Update" }, { label: "Later" }] },
  { id: 2, app: "Discord", appIcon: "chat", accent: "lavender", title: "#hyprland", body: "vaxry: 0.52 is out, check the changelog", time: "6m" },
  { id: 3, app: "Discord", appIcon: "chat", accent: "lavender", title: "#rice-showcase", body: "your square theme is clean ngl", time: "9m" },
  { id: 4, app: "Spotify", appIcon: "spotify", accent: "green", title: "Midnight City", body: "M83 — Hurry Up, We're Dreaming", time: "12m" },
  { id: 5, app: "battery", appIcon: "flash", accent: "red", urgency: "critical", title: "Battery low", body: "12% remaining · plug in soon", time: "20m" },
  { id: 6, app: "hyprshot", appIcon: "screenshot", accent: "peach", title: "Screenshot saved", body: "~/Pictures/Screenshots/2026-10-10_09-41.png", time: "1h" },
];

export interface NotificationCenterProps {
  notifications?: Notification[];
  /** Do-not-disturb: incoming toasts are held here instead of popping up. */
  dnd?: boolean;
  /** Show the volume / brightness sliders. */
  sliders?: boolean;
  width?: number;
  height?: number | string;
  /** Called with the remaining notifications after a dismiss / clear. */
  onItemsChange?: (items: Notification[]) => void;
  onDndChange?: (dnd: boolean) => void;
  className?: string;
}

/** swaync-style notification centre: DND, quick sliders and notifications grouped by app. */
export function NotificationCenter({
  notifications = demoNotifications,
  dnd: initialDnd = false,
  sliders = true,
  width = 400,
  height = 720,
  onItemsChange,
  onDndChange,
  className,
}: NotificationCenterProps) {
  const [items, setItemsState] = useState(notifications);
  const [dnd, setDndState] = useState(initialDnd);
  const setItems = (update: (xs: Notification[]) => Notification[]) => {
    const next = update(items);
    setItemsState(next);
    onItemsChange?.(next);
  };
  const setDnd = (on: boolean) => {
    setDndState(on);
    onDndChange?.(on);
  };
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const groups = new Map<string, Notification[]>();
  for (const n of items) groups.set(n.app, [...(groups.get(n.app) ?? []), n]);
  const dismiss = (id: number) => setItems((xs) => xs.filter((x) => x.id !== id));

  return (
    <aside className={["rx-nc", className].filter(Boolean).join(" ")} style={{ width, height }}>
      <header className="rx-nc-head">
        <div>
          <b>Notifications</b>
          <span className="hx-faint">{items.length ? `${items.length} unread` : "all caught up"}</span>
        </div>
        <Button size="sm" variant="ghost" icon="close" onClick={() => setItems(() => [])} disabled={!items.length}>
          Clear all
        </Button>
      </header>
      <div className="rx-nc-dnd">
        <Toggle checked={dnd} onChange={setDnd} accent="red" label="Do not disturb" description={dnd ? "toasts are held here silently" : "toasts pop up"} />
      </div>
      {sliders && (
        <div className="rx-nc-sliders">
          <Slider label="Volume" icon="volumeMedium" defaultValue={64} accent="yellow" />
          <Slider label="Brightness" icon="sun" defaultValue={80} accent="peach" />
        </div>
      )}
      <div className="rx-nc-list">
        {items.length === 0 && (
          <div className="rx-nc-empty">
            <Icon name="bellOff" size={34} />
            <span>No notifications</span>
          </div>
        )}
        {[...groups].map(([app, list]) => (
          <section key={app} className="rx-nc-group">
            <header>
              <span className="hx-caps">
                {app} · {list.length}
              </span>
              <span className="hx-spacer" />
              {list.length > 1 && (
                <IconButton
                  size="sm"
                  icon={collapsed[app] ? "chevronRight" : "down"}
                  label={collapsed[app] ? "expand" : "collapse"}
                  onClick={() => setCollapsed((c) => ({ ...c, [app]: !c[app] }))}
                />
              )}
              <IconButton size="sm" icon="close" label={`clear ${app}`} onClick={() => setItems((xs) => xs.filter((x) => x.app !== app))} />
            </header>
            <div className={collapsed[app] ? "rx-nc-stack" : "rx-nc-items"}>
              {(collapsed[app] ? list.slice(0, 1) : list).map(({ id, ...n }) => (
                <Toast key={id} {...n} onClose={() => dismiss(id)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
