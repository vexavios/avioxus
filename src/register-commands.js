import dotenv from "dotenv";
import { REST, Routes, ApplicationCommandOptionType } from "discord.js";
import { Commands } from "./constants.js";

dotenv.config();

/* ----------- RUN THIS FILE SEPARATELY TO RE-REGISTER SLASH COMMANDS WHEN CHANGED ----------- */

// Config for all slash commands
const commands = [
  {
    name: Commands.PING,
    description: "Ping the bot to ensure that it's working correctly.",
  },
  {
    name: Commands.FEATURED.NAME,
    description: "Gets all current featured levels from LSS.",
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

// Initialize REST client
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Register all slash commands globally
(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
