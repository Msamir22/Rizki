import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { palette } from "@/constants/colors";

interface RecurringWarningBannerProps {
  readonly recurringId: string;
}

/**
 * Warning banner shown when editing a transaction linked to a recurring payment.
 * Informs the user that changes won't affect the recurring rule (one-off edit).
 * Includes a navigation link to the recurring payment settings and a dismiss button.
 */
export function RecurringWarningBanner({
  recurringId,
}: RecurringWarningBannerProps): React.JSX.Element | null {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <View className="mx-4 mt-3 mb-1 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
      <View className="flex-row items-start gap-2.5">
        <Ionicons
          name="repeat-outline"
          size={18}
          color={isDark ? palette.gold[400] : palette.gold[600]}
          style={{ marginTop: 1 }}
        />
        <View className="flex-1">
          <Text className="text-[13px] font-medium text-amber-800 dark:text-amber-300 leading-[18px]">
            This is a recurring transaction. Editing only changes this
            occurrence — the recurring rule will not be affected.
          </Text>
          <TouchableOpacity
            className="mt-1.5"
            onPress={() => {
              router.push({
                pathname: "/recurring-payments",
                params: { highlightId: recurringId },
              });
            }}
          >
            <Text className="text-[13px] font-semibold text-amber-600 dark:text-amber-400">
              View recurring payment →
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => setDismissed(true)}
          className="p-0.5"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="close"
            size={18}
            color={isDark ? palette.gold[400] : palette.gold[600]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
