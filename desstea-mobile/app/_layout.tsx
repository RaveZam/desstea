import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import * as Network from "expo-network";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDatabase } from "@/lib/database";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { syncCatalog } from "@/lib/sync";
import { SyncProvider, useBumpSync, useSetSyncing } from "@/lib/sync-context";
import { useOutboxSync } from "@/features/outbox/hooks/use-outbox-sync";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function AuthGate() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const bumpSync = useBumpSync();
  const setSyncing = useSetSyncing();
  useOutboxSync();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isLoading, segments]);

  useEffect(() => {
    if (!session) return;
    const branchId = session.user.user_metadata?.branch_id;
    if (!branchId) {
      console.warn("[sync] no branch_id on user metadata — skipping sync");
      setSyncing(false);
      return;
    }
    setSyncing(true);
    Network.getNetworkStateAsync()
      .then((state) => {
        if (!state.isConnected) {
          console.warn("[sync] offline — using cached catalog");
          return;
        }
        return syncCatalog(branchId).then(() => bumpSync());
      })
      .catch((err) => console.error("[sync] startup sync failed", err))
      .finally(() => setSyncing(false));
  }, [session?.user.id]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold: require("@expo-google-fonts/cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf"),
  });

  useEffect(() => {
    initDatabase();
    console.log("Db Initialized");
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SyncProvider>
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthGate />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </SyncProvider>
  );
}
