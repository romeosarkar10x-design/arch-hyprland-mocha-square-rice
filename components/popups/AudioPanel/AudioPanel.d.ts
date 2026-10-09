import * as React from 'react';

/**
 * AudioPanel — from hyprland-ui@0.1.0.
 */
export interface AudioPanelProps {
  outputs?: AudioDevice[];
  /** Selected output id. */
  output?: string;
  volume?: number;
  muted?: boolean;
  micVolume?: number;
  track?: Track;
  onOutputChange?: (id: string) => void;
  onVolumeChange?: (v: number) => void;
  className?: string;
}

export declare const AudioPanel: React.ComponentType<AudioPanelProps>;
