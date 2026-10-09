import * as React from 'react';

/**
 * Calendar — from hyprland-ui@0.1.0.
 */
export interface CalendarProps {
  /** "Today". Defaults to the real date. */
  today?: Date;
  /** Month shown first (defaults to today's month). */
  month?: Date;
  /** Days with a dot marker. */
  events?: CalendarEvent[];
  /** Show ISO week numbers in a left column. */
  weekNumbers?: boolean;
  onSelect?: (date: Date) => void;
  className?: string;
}

export declare const Calendar: React.ComponentType<CalendarProps>;
