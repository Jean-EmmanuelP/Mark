import Constants from "expo-constants";
import { Platform } from "react-native";

const DEV_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

const BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ?? `http://${DEV_HOST}:3001`;

export type Connection = {
  pluginId: string;
  status: "active" | "pending" | "disconnected";
};

export type Message = {
  id: string;
  source: string;
  sender: string;
  preview: string;
  time: string;
  category: string;
};

export async function connectPlugin(
  pluginId: string
): Promise<{ redirectUrl: string }> {
  const res = await fetch(`${BASE_URL}/api/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pluginId }),
  });
  if (!res.ok) throw new Error(`Connect failed: ${res.status}`);
  return res.json();
}

export async function getConnections(): Promise<Connection[]> {
  const res = await fetch(`${BASE_URL}/api/connections`);
  if (!res.ok) throw new Error(`Connections failed: ${res.status}`);
  return res.json();
}

export async function getMessages(): Promise<Message[]> {
  const res = await fetch(`${BASE_URL}/api/messages`);
  if (!res.ok) throw new Error(`Messages failed: ${res.status}`);
  return res.json();
}
