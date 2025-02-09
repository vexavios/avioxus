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
};

// Configs for APIs
export const Configs = {
  Symbols: {
    STOCK: ["NVDA", "PLTR", "TSLA", "V", "MSTR", "SOFI", "AVGO"],
    CRYPTO: [
      "bitcoin",
      "ethereum",
      "solana",
      "ripple",
      "monero",
      "kaspa",
      "dogecoin",
    ],
  },
  NEWS_PROPERTIES: [
    { category: null, name: "Top Stories" },
    { category: "technology", name: "Technology" },
    { category: "science", name: "Science" },
    { category: "entertainment", name: "Entertainment" },
  ],
  Weather: {
    LATITUDE: 39.5481,
    LONGITUDE: -104.9739,
    CITY: "Highlands Ranch",
  },
};

// Bot slash commands and subcommands
export const Commands = {
  PING: "ping",
  FEATURED: {
    NAME: "featured",
    subCommands: { GAME: "game" },
  },
};

// Various properties to be referenced
export const Properties = {
  DISCORD_CHAR_LIMIT: 2000,
};
