import { Client, IntentsBitField } from "discord.js";
import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import { sendDailyPost } from "./helpers.js";
import routes from "./endpoints.js";
import { APIs, Commands } from "./constants.js";

// Setup
dotenv.config();
const app = express();
// Handle JSON data for appropriate endpoints
app.use(express.json());
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

// Slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  // Attempt to wake up bot via GET endpoint
  try {
    await axios.get(APIs.CLOUD_RUN);
  } catch (error) {
    console.error("Error waking up bot:", error.message);
  }

  // Format current timestamp
  const now = new Date();
  const nowIsoDate = now.toISOString();

  // Handle all commands
  switch (commandName) {
    // Standard ping command
    case Commands.PING:
      await interaction.reply("Pong!");
      break;
    // Get featured levels from LSS
    case Commands.FEATURED.NAME:
      const game = options.get(Commands.FEATURED.subCommands.GAME)?.value;
      await interaction.reply("Under construction!");
      break;
    default:
  }

  // Log usage of command
  console.log(`"/${commandName}" command used at ${nowIsoDate}.`);
});

// Login bot to Discord
client.login(process.env.DISCORD_TOKEN);

// Setup server to listen on port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));
