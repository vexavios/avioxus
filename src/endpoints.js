import dotenv from "dotenv";
import express from "express";
import { InteractionType, InteractionResponseType } from "discord.js";
import { verifyKeyMiddleware } from "discord-interactions";
import {
  getCurrentlyFeaturedLSSLevels,
  sendDailyPost,
  sendSlashCommandResponse,
} from "./helpers.js";
import { isBotReady } from "./index.js";
import { Commands } from "./constants.js";

// Setup
dotenv.config();
const router = express.Router();

// Generic endpoint currently used for the daily post trigger and app pinging
router.get("/", async (req, res) => {
  // Check for custom trigger header from Cloud Scheduler
  const trigger = req.get("X-Daily-Post-Trigger");

  // Triggered by Cloud Scheduler (cron job)
  if (trigger === "true") {
    console.log("Triggered by Cloud Scheduler. Sending daily post...");

    const TIMEOUT = 30000; // 30 seconds timeout
    const startTime = Date.now();

    // Wait for bot readiness
    while (!isBotReady) {
      if (Date.now() - startTime > TIMEOUT) {
        console.error("Timeout: Bot failed to start in time.");
        return res.status(500).send("Error: Bot failed to start in time.");
      }
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
    }

    // Send the daily post
    try {
      await sendDailyPost();
      return res.status(200).send("Daily post sent!");
    } catch (error) {
      console.error("Error sending daily message:", error);
      return res.status(500).send("Failed to send daily message.");
    }
  }
  // Default response for non-cron triggers (e.g. manual or other invocations)
  else {
    res.status(200).send("Service is online. Awaiting further instructions.");
  }
});

// Discord Slash Command Handler
router.post(
  "/interactions",
  verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY),
  async (req, res) => {
    const interaction = req.body;

    // Respond to Discord's ping for verification
    if (interaction.type === InteractionType.Ping)
      return res.json({ type: InteractionResponseType.Pong });
    // Handle Slash Commands
    else if (interaction.type === InteractionType.ApplicationCommand) {
      // Extract command and any subcommand(s)
      const commandName = interaction.data.name;
      const options = interaction.data.options || [];

      // Format current timestamp
      const now = new Date();
      const nowIsoDate = now.toISOString();

      // Log usage of command
      console.log(`"/${commandName}" command used at ${nowIsoDate}.`);

      // Handle all commands
      switch (commandName) {
        // Standard ping command
        case Commands.PING:
          return res.json({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: "Pong!",
            },
          });
        // Get featured levels from LSS
        case Commands.FEATURED.NAME:
          const game = options.find(
            (option) => option.name === Commands.FEATURED.subCommands.GAME
          )?.value;

          // Get all levels
          const responseStr = await getCurrentlyFeaturedLSSLevels(game ?? -1);

          // Send full response
          await sendSlashCommandResponse(req, res, responseStr);
          break;
        default:
      }
    } else return res.status(400).send("Unknown interaction.");
  }
);

export default router;
