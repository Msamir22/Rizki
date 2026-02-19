/**
 * DrilldownBreadcrumbs
 * Navigation breadcrumbs for category hierarchy traversal.
 */

import type { BreadcrumbItem } from "./types";
import { palette } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

// =============================================================================
// Types
// =============================================================================

interface DrilldownBreadcrumbsProps {
  readonly items: readonly BreadcrumbItem[];
  readonly onNavigate: (item: BreadcrumbItem) => void;
}

// =============================================================================
// Component
// =============================================================================

export function DrilldownBreadcrumbs({
  items,
  onNavigate,
}: DrilldownBreadcrumbsProps): React.JSX.Element {
  const { isDark } = useTheme();

  return (
    <View className="flex-row items-center flex-wrap mb-3">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <View key={item.id ?? "root"} className="flex-row items-center">
            <TouchableOpacity
              onPress={() => !isLast && onNavigate(item)}
              disabled={isLast}
            >
              <Text
                className={`text-sm ${
                  isLast
                    ? "text-slate-800 dark:text-white font-semibold"
                    : "text-nileGreen-500"
                }`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
            {!isLast && (
              <Ionicons
                name="chevron-forward"
                size={14}
                color={isDark ? palette.slate[500] : palette.slate[400]}
                style={{ marginHorizontal: 4 }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
