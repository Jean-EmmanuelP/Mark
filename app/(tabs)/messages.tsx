import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import { getMessages, Message } from "../../lib/api";

const SOURCE_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  Gmail: { icon: "mail-outline", color: "#EA4335" },
  Slack: { icon: "logo-slack", color: "#4A154B" },
  WhatsApp: { icon: "logo-whatsapp", color: "#25D366" },
  Messenger: { icon: "chatbubble-outline", color: "#0084FF" },
  Telegram: { icon: "paper-plane-outline", color: "#0088CC" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Travail: "#3b82f6",
  Perso: "#22c55e",
  Finance: "#f59e0b",
  Shopping: "#8b5cf6",
};

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch {
      // server may not be running
    } finally {
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  }, [fetchMessages]);

  if (initialLoad) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Tous vos messages</Text>
      <Text style={styles.subtitle}>
        Regroupés et classifiés automatiquement
      </Text>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            Aucun message pour le moment.{"\n"}Connectez vos comptes pour
            commencer.
          </Text>
        </View>
      ) : (
        <View style={styles.messageList}>
          {messages.map((msg) => {
            const meta = SOURCE_META[msg.source] ?? {
              icon: "ellipse-outline" as const,
              color: "#999",
            };
            const catColor = CATEGORY_COLORS[msg.category] ?? "#999";

            return (
              <View key={msg.id} style={styles.messageCard}>
                <View style={styles.messageTop}>
                  <View style={styles.sourceRow}>
                    <Ionicons
                      name={meta.icon}
                      size={16}
                      color={meta.color}
                    />
                    <Text style={[styles.sourceName, { color: meta.color }]}>
                      {msg.source}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: catColor + "18" },
                    ]}
                  >
                    <Text style={[styles.categoryText, { color: catColor }]}>
                      {msg.category}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sender}>{msg.sender}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {msg.preview}
                </Text>

                <View style={styles.messageBottom}>
                  <Text style={styles.time}>{msg.time}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
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
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  messageList: {
    gap: 12,
    paddingBottom: 40,
  },
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sourceName: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
  },
  sender: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  messageBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
});
