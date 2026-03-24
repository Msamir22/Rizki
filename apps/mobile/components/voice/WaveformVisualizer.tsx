/**
 * WaveformVisualizer Component
 *
 * Animated waveform bars reflecting real-time audio levels during recording.
 * Uses react-native-reanimated for smooth 60fps animations.
 *
 * Architecture & Design Rationale:
 * - Pattern: Presentational Component
 * - Why: Pure visual output driven by props (isActive), no internal state
 *   management. Easily testable and reusable.
 * - SOLID: SRP — only renders waveform visualization.
 *
 * @module WaveformVisualizer
 */

import React, { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { palette } from "@/constants/colors";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of waveform bars to display. */
const _BAR_COUNT = 30;

/** Fixed heights for bars to create a natural waveform pattern. */
const BAR_PATTERN = [
  0.3, 0.5, 0.4, 0.7, 0.6, 0.8, 0.5, 0.9, 0.7, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9,
  0.6, 0.8, 0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.8, 0.7, 0.5, 0.4, 0.6, 0.8, 0.3,
];

/** Maximum bar height in pixels. */
const MAX_BAR_HEIGHT = 40;

/** Minimum bar height in pixels. */
const MIN_BAR_HEIGHT = 4;

/** Bar width in pixels. */
const BAR_WIDTH = 3;

/** Gap between bars in pixels. */
const BAR_GAP = 2;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WaveformVisualizerProps {
  /** Whether the waveform should be actively animating. */
  readonly isActive: boolean;
  /** Whether the recording is paused (frozen waveform). */
  readonly isPaused?: boolean;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface WaveformBarProps {
  readonly index: number;
  readonly baseHeight: number;
  readonly isActive: boolean;
  readonly isPaused: boolean;
}

function WaveformBar({
  index,
  baseHeight,
  isActive,
  isPaused,
}: WaveformBarProps): React.ReactElement {
  const height = useSharedValue(MIN_BAR_HEIGHT);

  useEffect(() => {
    if (isActive && !isPaused) {
      // Animate with slight randomness for organic feel
      const targetHeight = baseHeight * MAX_BAR_HEIGHT;
      const duration = 300 + (index % 5) * 80; // Stagger timing

      height.value = withRepeat(
        withSequence(
          withTiming(targetHeight, {
            duration,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(MIN_BAR_HEIGHT + Math.random() * 8, {
            duration: duration * 0.8,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    } else if (isPaused) {
      // Freeze at current position — do nothing
      cancelAnimation(height);
    } else {
      // Reset to minimum
      cancelAnimation(height);
      height.value = withTiming(MIN_BAR_HEIGHT, { duration: 200 });
    }
  }, [isActive, isPaused, baseHeight, height, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: BAR_WIDTH,
          borderRadius: BAR_WIDTH / 2,
          backgroundColor: palette.nileGreen[500],
          marginHorizontal: BAR_GAP / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

const MemoizedWaveformBar = memo(WaveformBar);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

function WaveformVisualizerComponent({
  isActive,
  isPaused = false,
}: WaveformVisualizerProps): React.ReactElement {
  return (
    <View className="flex-row items-center justify-center h-12">
      {BAR_PATTERN.map((baseHeight, index) => (
        <MemoizedWaveformBar
          key={index}
          index={index}
          baseHeight={baseHeight}
          isActive={isActive}
          isPaused={isPaused}
        />
      ))}
    </View>
  );
}

export const WaveformVisualizer = memo(WaveformVisualizerComponent);
