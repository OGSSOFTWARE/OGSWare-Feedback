import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import { Client, GatewayIntentBits } from "discord.js";
import { renderFeedbackEmbed } from "./renderEmbed.js";
import vouchCommand from "./vouch.js";
import { handleSellAuthWebhook } from "./webhook.js";

dotenv.config();

// Express App (NUR EINMAL!)
const app = express();
app.use(express.json());

// Load persistent counter
const counterData = JSON.parse(fs.readFileSync("./counter.json", "utf8"));

// Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Attach config
client.config = {
  vouchChannel: process.env.VOUCH_CHANNEL_ID,
  apiKey: process.env.SELLAUTH_API_KEY
};

// Attach embed renderer
client.renderFeedbackEmbed = renderFeedbackEmbed;

// Attach persistent counter
client.vouchCounter = counterData.vouchCounter;

// Save counter function
client.saveCounter = () => {
  fs.writeFileSync("./counter.json", JSON.stringify({ vouchCounter: client.vouchCounter }, null, 2));
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{
      name: "⭐ ogsware.com",
      type: 3 // WATCHING
    }],
    status: "online"
  });
});

// Slash command handler
client.commands = new Map();
client.commands.set("createvouch", vouchCommand);

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
    client.saveCounter();
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "Error executing command.", ephemeral: true });
  }
});

// Webhook route (NUR HIER!)
app.post("/sellauth/webhook", (req, res) => {
  console.log("Webhook Body:", req.body);
  handleSellAuthWebhook(req, res, client);
  client.saveCounter();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook running on port ${PORT}`));

// Login bot
client.login(process.env.DISCORD_TOKEN);
