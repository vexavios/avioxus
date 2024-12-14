import { Client, IntentsBitField } from "discord.js";
import dotenv from "dotenv";
import { sendDailyPost } from "./helpers.js";
import { Commands } from "./constants.js";

dotenv.config();

// Bot client config
export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Ready function
client.on("ready", () => {
  console.log("✅ avioxus is online!");

  // Send daily post in channel if property is true
  if (process.env.TRIGGER_DAILY_POST === "true") {
    sendDailyPost().then(() => process.exit(0));
  }
});

// Slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

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

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
