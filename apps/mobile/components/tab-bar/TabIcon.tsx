import { palette } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export type IconLibrary = "ionicons" | "material" | "material-community";

export interface IconConfig {
  library: IconLibrary;
  name: string;
  outlineName?: string;
}

// interface TabIconProps {
//   config: IconConfig;
//   focused: boolean;
//   color: string;
//   size: number;
//   label: string;
// }

const ICON_COMPONENTS = {
  ionicons: Ionicons,
  material: MaterialIcons,
  "material-community": MaterialCommunityIcons,
};

function TabIconComponent({
  config,
  focused,
  size,
  label,
}: {
  config: IconConfig;
  focused: boolean;
  size: number;
  label: string;
}): React.ReactElement {
  const { isDark } = useTheme();
  const { library, name, outlineName } = config;
  const IconComponent = (ICON_COMPONENTS[library] ||
    Ionicons) as React.ComponentType<{
    name: string;
    size: number;
    color: string;
  }>;
  const iconName = focused ? name : (outlineName ?? name);

  return (
    <View
      className="items-center justify-center gap-1"
      accessibilityElementsHidden
    >
      <IconComponent
        name={iconName}
        size={size}
        color={
          focused
            ? palette.nileGreen[500]
            : isDark
              ? palette.slate[400]
              : palette.slate[500]
        }
      />

      <Text
        className={`text-[10px] ${focused ? "font-bold text-nileGreen-500" : "font-medium text-slate-500 dark:text-slate-400"}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export const TabIcon = React.memo(TabIconComponent);
