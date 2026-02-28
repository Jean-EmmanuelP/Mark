import * as AppleAuthentication from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "mark_user";

export type User = {
  id: string;
  email: string | null;
  fullName: string | null;
};

export async function signInWithApple(): Promise<User> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const user: User = {
    id: credential.user,
    email: credential.email ?? null,
    fullName: credential.fullName
      ? [credential.fullName.givenName, credential.fullName.familyName]
          .filter(Boolean)
          .join(" ") || null
      : null,
  };

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function getUser(): Promise<User | null> {
  const json = await AsyncStorage.getItem(USER_KEY);
  if (!json) return null;
  return JSON.parse(json) as User;
}

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}
