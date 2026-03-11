/**
 * ResetSentView — Password Reset Confirmation State
 *
 * Displayed after a password reset email has been sent.
 * Shows confirmation message and a back-to-sign-in link.
 *
 * Architecture & Design Rationale:
 * - Pattern: Presentational Component
 * - Why: Extracted from auth.tsx to enforce SRP — auth.tsx orchestrates
 *   screen state, this component handles the reset confirmation UI.
 *
 * @module ResetSentView
 */

import { palette } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

// =============================================================================
// Types
// =============================================================================

export interface ResetSentViewProps {
  readonly email: string;
  readonly isDark: boolean;
  readonly onBack: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function ResetSentView({
  email,
  isDark,
  onBack,
}: ResetSentViewProps): React.JSX.Element {
  return (
    <>
      <View className="flex-1 items-center justify-center gap-6 px-4">
        {/* Key Icon */}
        <View className="w-24 h-24 rounded-full bg-nileGreen-500/15 items-center justify-center">
          <Ionicons
            name="key-outline"
            size={48}
            color={isDark ? palette.nileGreen[400] : palette.nileGreen[600]}
          />
        </View>

        <Text className="text-2xl font-bold text-center text-text-primary dark:text-text-primary-dark">
          Reset Link Sent
        </Text>

        <Text className="text-base text-center text-text-secondary dark:text-text-secondary-dark max-w-[300px] leading-6">
          We sent a password reset link to{" "}
          <Text className="font-semibold text-text-primary dark:text-text-primary-dark">
            {email}
          </Text>
          . Check your inbox and follow the link to reset your password.
        </Text>
      </View>

      {/* Back to Sign In */}
      <TouchableOpacity
        onPress={onBack}
        className="py-3 items-center"
        activeOpacity={0.6}
        accessibilityLabel="Back to sign in"
        accessibilityRole="button"
      >
        <View className="flex-row items-center gap-1">
          <Ionicons
            name="arrow-back"
            size={14}
            color={isDark ? palette.slate[400] : palette.slate[500]}
          />
          <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Back to Sign In
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
}
