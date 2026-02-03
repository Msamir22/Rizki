import { Drawer } from "expo-router/drawer";
import { useTheme } from "../../context/ThemeContext";
import { darkTheme, lightTheme } from "@/constants/colors";
import React from "react";

export default function DrawerLayout() {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.background,
          width: 280,
        },
        drawerLabelStyle: {
          color: theme.text,
        },
        drawerActiveTintColor: theme.primary,
        drawerInactiveTintColor: theme.textSecondary,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Home",
          title: "Home",
        }}
      />
      {/* Add other global screens here later if needed */}
    </Drawer>
  );
}