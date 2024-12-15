import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from "discord-interactions";
import { sendDailyPost } from "./helpers.js";
import { isBotReady } from "./index.js";

const router = express.Router();

// Generic endpoint used for daily post trigger and bot pinging
router.get("/", async (req, res) => {
  // Check for custom trigger header from Cloud Scheduler
  const trigger = req.get("X-Daily-Post-Trigger");

  // Triggered by Cloud Scheduler (cron job)
  if (trigger === "true") {
    console.log("Triggered by Cloud Scheduler. Sending daily post...");

    const TIMEOUT = 10000; // 10 seconds timeout
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
  // Default response for non-cron triggers (e.g., from slash command, manual, or other invocations)
  else {
    console.log("Received a GET request. Waking up the bot...");
    res.status(200).send("Service is online. Awaiting further instructions.");
  }
});

// Discord Slash Command Handler
router.post(
  "/interactions",
  verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY),
  (req, res) => {
    const interaction = req.body;

    // Handle Slash Command
    if (
      interaction.type === InteractionType.APPLICATION_COMMAND ||
      interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE
    ) {
      console.log("Received slash command:", interaction.data.name);

      // Respond to the slash command
      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Hello! The bot is online and ready to respond.",
        },
      });
    }

    res.status(400).send("Unhandled interaction type");
  }
);

export default router;
