import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { getUser, User } from "../lib/auth";

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  useEffect(() => {
    if (user === undefined) return; // still loading

    const inLogin = segments[0] === "login";

    if (!user && !inLogin) {
      router.replace("/login");
    } else if (user && inLogin) {
      router.replace("/(tabs)");
    }
  }, [user, segments]);

  if (user === undefined) return null; // splash / loading

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
