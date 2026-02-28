import express from "express";
import cors from "cors";
import { Composio } from "composio-core";

const app = express();
app.use(cors());
app.use(express.json());

const COMPOSIO_API_KEY = "ak_d6Rx-ntGAE7juSycMlVI";
const EXTERNAL_USER_ID = "pg-test-885d19af-dcdf-4559-8981-873a15456605";

const composio = new Composio({ apiKey: COMPOSIO_API_KEY });

const PLUGIN_MAP: Record<string, string> = {
  gmail: "GMAIL",
  slack: "SLACK",
  whatsapp: "WHATSAPP",
  messenger: "FACEBOOK",
  telegram: "TELEGRAM",
};

// POST /api/connect — initiate OAuth for a plugin
app.post("/api/connect", async (req, res) => {
  try {
    const { pluginId } = req.body;
    const appName = PLUGIN_MAP[pluginId];
    if (!appName) {
      res.status(400).json({ error: `Unknown plugin: ${pluginId}` });
      return;
    }

    const connectionRequest = await composio.connectedAccounts.initiate({
      appName,
      authMode: "OAUTH2",
      authConfig: {},
      integrationId: appName.toLowerCase(),
      entityId: EXTERNAL_USER_ID,
      redirectUri: "mark://oauth-callback",
    });

    res.json({ redirectUrl: connectionRequest.redirectUrl });
  } catch (error: any) {
    console.error("Connect error:", error?.message ?? error);
    res.status(500).json({ error: error?.message ?? "Connection failed" });
  }
});

// GET /api/connections — list active connections
app.get("/api/connections", async (_req, res) => {
  try {
    const connections = await composio.connectedAccounts.list({
      user_uuid: EXTERNAL_USER_ID,
    });

    const result = (connections.items ?? []).map((c: any) => ({
      pluginId:
        Object.entries(PLUGIN_MAP).find(
          ([, v]) => v === c.appName?.toUpperCase()
        )?.[0] ?? c.appName,
      status: c.status === "ACTIVE" ? "active" : "pending",
    }));

    res.json(result);
  } catch (error: any) {
    console.error("Connections error:", error?.message ?? error);
    res.status(500).json({ error: error?.message ?? "Failed to list" });
  }
});

// GET /api/messages — fetch messages from all connected plugins
app.get("/api/messages", async (_req, res) => {
  try {
    const connections = await composio.connectedAccounts.list({
      user_uuid: EXTERNAL_USER_ID,
    });

    const activeConnections = (connections.items ?? []).filter(
      (c: any) => c.status === "ACTIVE"
    );

    const messages: any[] = [];

    for (const conn of activeConnections) {
      const appName = conn.appName?.toUpperCase() ?? "";
      const pluginId =
        Object.entries(PLUGIN_MAP).find(
          ([, v]) => v === appName
        )?.[0] ?? appName.toLowerCase();

      try {
        if (appName === "GMAIL") {
          const toolset = await composio.getEntity(EXTERNAL_USER_ID);
          const result = await toolset.execute("GMAIL_FETCH_EMAILS", {
            max_results: 10,
          });

          const emails = result?.data?.emails ?? result?.data ?? [];
          if (Array.isArray(emails)) {
            for (const email of emails.slice(0, 10)) {
              messages.push({
                id: `gmail-${email.id ?? Math.random()}`,
                source: "Gmail",
                sender: email.from ?? email.sender ?? "Inconnu",
                preview: email.subject ?? email.snippet ?? "",
                time: email.date ?? "",
                category: categorize(email.from ?? "", email.subject ?? ""),
              });
            }
          }
        }
        // Other plugins can be added here following the same pattern
      } catch (err: any) {
        console.error(`Error fetching from ${pluginId}:`, err?.message ?? err);
      }
    }

    // If no real messages, return empty array (client shows placeholder)
    res.json(messages);
  } catch (error: any) {
    console.error("Messages error:", error?.message ?? error);
    res.status(500).json({ error: error?.message ?? "Failed to fetch" });
  }
});

function categorize(sender: string, subject: string): string {
  const text = `${sender} ${subject}`.toLowerCase();
  if (
    text.includes("invoice") ||
    text.includes("facture") ||
    text.includes("bank") ||
    text.includes("crypto") ||
    text.includes("payment")
  )
    return "Finance";
  if (
    text.includes("amazon") ||
    text.includes("order") ||
    text.includes("livraison") ||
    text.includes("colis") ||
    text.includes("shipping")
  )
    return "Shopping";
  if (
    text.includes("standup") ||
    text.includes("meeting") ||
    text.includes("sprint") ||
    text.includes("jira") ||
    text.includes("slack") ||
    text.includes("deploy")
  )
    return "Travail";
  return "Perso";
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mark server running on http://localhost:${PORT}`);
});
