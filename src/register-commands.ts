import dotenv from "dotenv";
import {
  REST,
  Routes,
  ApplicationCommandOptionType,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import { Commands } from "./constants";

dotenv.config();

/* ----------- RUN THIS FILE SEPARATELY TO RE-REGISTER SLASH COMMANDS WHEN CHANGED ----------- */

// Config for all slash commands - These will be registered when this file is run
const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
  {
    name: Commands.PING,
    description: "Ping the bot to ensure that it's working correctly.",
  },
  {
    name: Commands.FEATURED.NAME,
    description: "Gets all currently featured levels from LSS.",
    options: [
      {
        name: Commands.FEATURED.subCommands.GAME,
        description: "An optional game to filter by.",
        type: ApplicationCommandOptionType.Number,
        choices: [
          { name: "SMC", value: 0 },
          { name: "YFS", value: 1 },
          { name: "SM127", value: 2 },
          { name: "MB64", value: 4 },
        ],
        required: false,
      },
    ],
  },
];

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  throw new Error("Missing required environment variables");
}

// Check environment variables
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  throw new Error(
    "Missing required environment variables DISCORD_TOKEN or CLIENT_ID"
  );
}

// Initialize REST client
const rest = new REST({ version: "10" }).setToken(token);

// Register all slash commands globally
(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
