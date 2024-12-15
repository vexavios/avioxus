import { Client, IntentsBitField } from "discord.js";
import dotenv from "dotenv";
import express from "express";
import { sendDailyPost } from "./helpers.js";
import routes from "./endpoints.js";

// Setup
dotenv.config();
const app = express();
// Middleware to parse JSON
// app.use(express.json());
// Server routes
app.use("/", routes);

// Bot client config
export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Bot Ready Flag
export let isBotReady = false;

// Ready function
client.on("ready", async () => {
  console.log("✅ avioxus is online!");
  isBotReady = true;

  // LOCAL TESTING ONLY: Send daily post in channel if property is true
  // if (process.env.TRIGGER_DAILY_POST === "true") await sendDailyPost();
});

// Login bot to Discord
client.login(process.env.DISCORD_TOKEN);

// Setup server to listen on port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));
