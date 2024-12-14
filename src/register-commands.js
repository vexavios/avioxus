import dotenv from "dotenv";
import { REST, Routes, ApplicationCommandOptionType } from "discord.js";

dotenv.config();

/* ----------- RUN THIS FILE SEPARATELY TO RE-REGISTER SLASH COMMANDS WHEN CHANGED ----------- */

// Config for all slash commands
const commands = [
  {
    name: "ping",
    description: "Ping the bot to ensure that it's working correctly.",
  },
  {
    name: "featured",
    description: "Gets all current featured levels from LSS.",
    options: [
      {
        name: "game",
        description: "An optional game to filter by.",
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "SMC",
            value: "SMC",
          },
          {
            name: "YFS",
            value: "YFS",
          },
          {
            name: "SM127",
            value: "SM127",
          },
          {
            name: "MB64",
            value: "MB64",
          },
        ],
        required: false,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Register all slash commands
(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.PERSONAL_HUB_GUILD_ID
      ),
      { body: commands }
    );

    console.log("Slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
