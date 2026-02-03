import { palette } from "@/constants/colors";
import { ensureAuthenticated } from "@/services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: palette.slate[900],
        }}
      >
        <ActivityIndicator size="large" color={palette.nileGreen[500]} />
      </View>
    );
  }

  // Redirect based on status
  if (hasOnboarded) {
    return <Redirect href="/(drawer)/(tabs)" />;
  } else {
    return <Redirect href="/onboarding" />;
  }
}
