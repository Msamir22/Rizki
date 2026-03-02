/**
 * App Entry Point
 *
 * Handles initial app state: authentication, onboarding check,
 * and silent Cash account retry for previously-onboarded users.
 *
 * @module Index
 */

import { palette } from "@/constants/colors";
import { ensureAuthenticated } from "@/services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index(): React.ReactNode {
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    initializeApp().catch(console.error);
  }, []);

  const initializeApp = async (): Promise<void> => {
    try {
      // 1. Ensure user is authenticated (anonymous or real)
      await ensureAuthenticated();

      // 2. Check onboarding status
      const value = await AsyncStorage.getItem("hasOnboarded");
      if (value === "true") {
        setHasOnboarded(true);
      }
    } catch (e) {
      console.error("App initialization error:", e);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color={palette.nileGreen[500]} />
      </View>
    );
  }

  // Redirect based on status
  if (hasOnboarded) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/onboarding" />;
  }
}
