import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GradientBackground({ children, style }: Props) {
  const { theme, isDark } = useTheme();

  if (isDark && theme.backgroundGradient) {
    return (
      <LinearGradient
        colors={theme.backgroundGradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, style]}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          {children}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }, style]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
