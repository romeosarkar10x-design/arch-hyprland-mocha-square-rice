import * as React from 'react';

/**
 * ClockPanel — from hyprland-ui@0.1.0.
 */
export interface ClockPanelProps {
  /** Fixed "now" for screenshots. Omit for a live ticking clock. */
  now?: Date;
  events?: CalendarEvent[];
  /** Extra zones shown under the time, e.g. [["Berlin", "Europe/Berlin"]]. */
  zones?: [string, string][];
  className?: string;
}

export declare const ClockPanel: React.ComponentType<ClockPanelProps>;
