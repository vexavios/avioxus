import dotenv from "dotenv";

dotenv.config();

// Type definitions
export interface GameMap {
  [key: number]: string;
}

export interface NewsProperty {
  category: string | null;
  name: string;
}

export interface WeatherConfig {
  LATITUDE: string | undefined;
  LONGITUDE: string | undefined;
  CITY: string | undefined;
}

// API links
export const APIs = {
  STOCK: "https://api.twelvedata.com",
  CRYPTO: "https://api.coingecko.com/api/v3/simple/price",
  NEWS: "https://newsapi.org/v2/top-headlines",
  WEATHER: "https://api.openweathermap.org/data/2.5/weather",
  FUN_FACT: "https://uselessfacts.jsph.pl/api/v2/facts/today",
  WORD: "https://api.wordnik.com/v4/words.json/wordOfTheDay",
  LSS: "https://levelsharesquare.com/api",
  DISCORD: "https://discord.com/api",
} as const;

// Configs for APIs
export const Configs = {
  Symbols: {
    STOCK: ["PLTR", "NVDA", "TSLA", "MSTR", "V"], // Max 7
    CRYPTO: [
      "bitcoin",
      "kaspa",
      "ethereum",
      "solana",
      "ripple",
      "cardano",
      "monero",
    ], // Max 7
  },
  NEWS_PROPERTIES: [
    { category: null, name: "Top Stories" },
    { category: "technology", name: "Technology" },
    { category: "science", name: "Science" },
    { category: "entertainment", name: "Entertainment" },
  ] as NewsProperty[],
  Weather: {
    LATITUDE: process.env.WEATHER_LATITUDE,
    LONGITUDE: process.env.WEATHER_LONGITUDE,
    CITY: process.env.WEATHER_CITY,
  } as WeatherConfig,
} as const;

// Bot slash commands and subcommands
export const Commands = {
  PING: "ping",
  FEATURED: {
    NAME: "featured",
    subCommands: { GAME: "game" },
  },
} as const;

// Various properties to be referenced
export const Properties = {
  DISCORD_CHAR_LIMIT: 2000,
} as const;
