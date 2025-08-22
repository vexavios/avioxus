import dotenv from "dotenv";
import { Client, IntentsBitField } from "discord.js";
import { Commands, Properties } from "./constants";
import {
  sendDailyPost,
  getCurrentlyFeaturedLSSLevels,
  splitMessage,
} from "./helpers";

// Setup
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

// Bot Ready Flag
export let isBotReady = false;

// Ready function
client.on("clientReady", async () => {
  console.log("✅ avioxus is online!");
  isBotReady = true;

  // Set up daily post timer to run at a specific time each day (e.g. 9 AM MT)
  const runDailyPost = async (): Promise<void> => {
    const now = new Date();
    const target = new Date();
    target.setHours(9, 0, 0, 0); // 9 AM
    target.setMinutes(0);
    target.setSeconds(0);

    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const msUntilTarget = target.getTime() - now.getTime();
    setTimeout(async () => {
      await sendDailyPost();
      // Set up next day's post
      setInterval(sendDailyPost, 24 * 60 * 60 * 1000); // Run every 24 hours after first post
    }, msUntilTarget);
  };

  // Start the daily post scheduler
  await runDailyPost();
});

// Handle interactions (slash commands)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;
  const now = new Date();
  const nowIsoDate = now.toISOString();

  // Log usage of command
  console.log(`"/${commandName}" command used at ${nowIsoDate}.`);

  try {
    switch (commandName) {
      case Commands.PING:
        await interaction.reply("Pong!");
        break;

      case Commands.FEATURED.NAME: {
        const game =
          options.getNumber(Commands.FEATURED.subCommands.GAME) ?? -1;
        const responseStr = await getCurrentlyFeaturedLSSLevels(game);

        // Handle response length
        if (responseStr.length <= Properties.DISCORD_CHAR_LIMIT) {
          await interaction.reply(responseStr);
        } else {
          const chunks = splitMessage(responseStr);
          await interaction.reply(chunks[0]);
          for (let i = 1; i < chunks.length; i++) {
            await interaction.followUp(chunks[i]);
          }
        }
        break;
      }

      default:
        await interaction.reply("Unknown command.");
    }
  } catch (error) {
    console.error("Error handling command:", error);
    await interaction.reply({
      content: "There was an error executing this command.",
      ephemeral: true,
    });
  }
});

// Login bot to Discord
client.login(process.env.DISCORD_TOKEN);
