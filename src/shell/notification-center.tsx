import { useState } from "react";
import { Button, Icon, IconButton, Slider, Toast, Toggle, cx, type ToastProps } from "../ui";

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
  const groups = new Map<string, Notification[]>();
  for (const n of items) groups.set(n.app, [...(groups.get(n.app) ?? []), n]);

  return (
    <aside
      data-component="NotificationCenter"
      className={cx("kit-type flex flex-col border-t-2 border-mauve bg-mantle text-text shadow-popup ring ring-surface0", className)}
      style={{ width, height }}
    >
      <header className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex flex-1 flex-col">
          <b className="text-[14px]">Notifications</b>
          <span className="text-[11px] text-overlay1">{items.length ? `${items.length} unread` : "all caught up"}</span>
        </div>
        <Button size="sm" variant="ghost" icon="close" onClick={() => setItems(() => [])} disabled={!items.length}>
          Clear all
        </Button>
      </header>
      <div className="border-t border-surface0 px-4 py-3">
        <Toggle checked={dnd} onChange={setDnd} accent="red" label="Do not disturb" description={dnd ? "toasts are held here silently" : "toasts pop up"} />
      </div>
      {sliders && (
        <div className="grid gap-2.5 border-t border-surface0 px-4 py-3">
          <Slider label="Volume" icon="volumeMedium" defaultValue={64} accent="yellow" />
          <Slider label="Brightness" icon="sun" defaultValue={80} accent="peach" />
        </div>
      )}
      <div className="flex-1 overflow-auto border-t border-surface0 bg-crust px-3 pt-1 pb-3.5">
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 py-[70px] text-overlay0">
            <Icon name="bellOff" size={34} />
            <span>No notifications</span>
          </div>
        )}
        {[...groups].map(([app, list]) => (
          <NotificationGroup
            key={app}
            app={app}
            items={list}
            onDismiss={(id) => setItems((xs) => xs.filter((x) => x.id !== id))}
            onClear={() => setItems((xs) => xs.filter((x) => x.app !== app))}
          />
        ))}
      </div>
    </aside>
  );
}

interface NotificationGroupProps {
  app: string;
  items: Notification[];
  onDismiss: (id: number) => void;
  onClear: () => void;
}

/** One app's notifications; a group of several can collapse to its newest card over a stacked edge. */
function NotificationGroup({ app, items, onDismiss, onClear }: NotificationGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section data-component="NotificationGroup">
      <header className="flex items-center gap-0.5 px-0.5 pt-2.5 pb-1.5">
        <span className="caps">
          {app} · {items.length}
        </span>
        <span className="flex-1" />
        {items.length > 1 && (
          <IconButton size="sm" icon={collapsed ? "chevronRight" : "down"} label={collapsed ? "expand" : "collapse"} onClick={() => setCollapsed(!collapsed)} />
        )}
        <IconButton size="sm" icon="close" label={`clear ${app}`} onClick={onClear} />
      </header>
      <div
        className={
          collapsed
            ? "relative pb-2 after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-1.5 after:bg-surface0"
            : "flex flex-col gap-1.5"
        }
      >
        {(collapsed ? items.slice(0, 1) : items).map(({ id, ...n }) => (
          <Toast key={id} {...n} className="w-auto animate-none" onClose={() => onDismiss(id)} />
        ))}
      </div>
    </section>
  );
}
