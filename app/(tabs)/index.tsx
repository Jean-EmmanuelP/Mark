import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
import { connectPlugin, getConnections, Connection } from "../../lib/api";

type Plugin = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  status: "disconnected" | "active" | "pending";
};

const PLUGINS: Plugin[] = [
  { id: "gmail", name: "Gmail", icon: "mail-outline", color: "#EA4335", status: "disconnected" },
  { id: "slack", name: "Slack", icon: "logo-slack", color: "#4A154B", status: "disconnected" },
  { id: "whatsapp", name: "WhatsApp", icon: "logo-whatsapp", color: "#25D366", status: "disconnected" },
  { id: "messenger", name: "Messenger", icon: "chatbubble-outline", color: "#0084FF", status: "disconnected" },
  { id: "telegram", name: "Telegram", icon: "paper-plane-outline", color: "#0088CC", status: "disconnected" },
];

export default function ConnectionsScreen() {
  const [plugins, setPlugins] = useState<Plugin[]>(PLUGINS);
  const [loading, setLoading] = useState<string | null>(null);

  const refreshConnections = useCallback(async () => {
    try {
      const connections = await getConnections();
      setPlugins((prev) =>
        prev.map((p) => {
          const conn = connections.find((c: Connection) => c.pluginId === p.id);
          return { ...p, status: conn?.status ?? "disconnected" };
        })
      );
    } catch {
      // server may not be running yet — keep current state
    }
  }, []);

  useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  const handleConnect = async (pluginId: string) => {
    if (loading) return;
    setLoading(pluginId);
    try {
      const { redirectUrl } = await connectPlugin(pluginId);
      await WebBrowser.openBrowserAsync(redirectUrl);

      // Poll for connection status after browser closes
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        await refreshConnections();
        if (attempts >= 10) clearInterval(poll);
      }, 2000);
    } catch (e: any) {
      console.error("Connect error:", e?.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Connectez vos comptes</Text>
      <Text style={styles.subtitle}>
        Mark regroupera et classifiera vos messages automatiquement.
      </Text>

      <View style={styles.pluginList}>
        {plugins.map((plugin) => (
          <TouchableOpacity
            key={plugin.id}
            style={styles.pluginCard}
            onPress={() =>
              plugin.status !== "active" && handleConnect(plugin.id)
            }
            activeOpacity={plugin.status === "active" ? 1 : 0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: plugin.color + "15" },
              ]}
            >
              <Ionicons name={plugin.icon} size={28} color={plugin.color} />
            </View>
            <Text style={styles.pluginName}>{plugin.name}</Text>

            {loading === plugin.id ? (
              <ActivityIndicator size="small" color={plugin.color} />
            ) : (
              <View
                style={[
                  styles.statusBadge,
                  plugin.status === "active"
                    ? styles.connected
                    : styles.disconnected,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    plugin.status === "active"
                      ? styles.connectedText
                      : styles.disconnectedText,
                  ]}
                >
                  {plugin.status === "active" ? "Connecté" : "Connecter"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 21,
  },
  pluginList: {
    gap: 12,
    paddingBottom: 40,
  },
  pluginCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pluginName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginLeft: 14,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  connected: {
    backgroundColor: "#e6f9ee",
  },
  disconnected: {
    backgroundColor: "#f0f0f0",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  connectedText: {
    color: "#22c55e",
  },
  disconnectedText: {
    color: "#666",
  },
});
