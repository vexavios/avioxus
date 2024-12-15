import express from "express";
import { sendDailyPost } from "./helpers.js";

const router = express.Router();

// Cloud Run HTTP handler
router.get("/", async (req, res) => {
  // Check for custom trigger header from Cloud Scheduler
  const trigger = req.get("X-Daily-Post-Trigger");

  if (trigger === "true") {
    // Triggered by Cloud Scheduler (cron job)
    console.log("Triggered by Cloud Scheduler. Sending daily post...");
    await sendDailyPost();
    return res.status(200).send("Daily post sent!");
  }

  // Default response for non-cron triggers (e.g., manual or other invocations)
  res.status(200).send("Service is online. Awaiting further instructions.");
});

export default router;
