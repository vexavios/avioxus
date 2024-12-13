const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
require("dotenv").config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// APIs (Replace with actual API keys and sources)
const STOCK_API = "https://api.twelvedata.com/time_series";
const CRYPTO_API = "https://api.coingecko.com/api/v3/simple/price";
const NEWS_API = "https://newsapi.org/v2/top-headlines";
const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";
const FUN_FACT_API = "https://uselessfacts.jsph.pl/random.json";
const WORD_API = "https://api.wordnik.com/v4/words.json/wordOfTheDay";

// Configurations
const CHANNEL_ID = process.env.CHANNEL_ID; // Channel where the bot sends messages
const STOCK_SYMBOLS = ["AAPL", "GOOG", "SPY"]; // Add your preferred stocks/ETFs
const CRYPTO_SYMBOLS = ["bitcoin", "ethereum", "dogecoin"]; // Add your preferred cryptocurrencies
const NEWS_CATEGORIES = [
  { category: "general", name: "Top Stories" },
  { category: "technology", name: "Technology" },
  { category: "science", name: "Science" },
  { category: "space", name: "Astronomy" },
  { category: "entertainment", name: "Movies" },
  { category: "gaming", name: "Games" },
  { category: "anime", name: "Anime" },
];
const CITY = "Denver"; // Replace with your city
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // OpenWeather API key
const NEWS_API_KEY = process.env.NEWS_API_KEY; // NewsAPI API key

// Helper Functions
async function getStockPrices() {
  try {
    const results = await Promise.all(
      STOCK_SYMBOLS.map((symbol) =>
        axios.get(
          `${STOCK_API}?symbol=${symbol}&interval=1day&apikey=${process.env.STOCK_API_KEY}`
        )
      )
    );
    return results.map(
      (res, index) => `${STOCK_SYMBOLS[index]}: ${res.data.values[0].open}`
    );
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return ["Error fetching stock data."];
  }
}

async function getCryptoPrices() {
  try {
    const response = await axios.get(
      `${CRYPTO_API}?ids=${CRYPTO_SYMBOLS.join(",")}&vs_currencies=usd`
    );
    return CRYPTO_SYMBOLS.map(
      (crypto) => `${crypto}: $${response.data[crypto].usd}`
    );
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return ["Error fetching crypto data."];
  }
}

async function getNews() {
  try {
    const results = await Promise.all(
      NEWS_CATEGORIES.map((category) =>
        axios.get(
          `${NEWS_API}?category=${category.category}&apiKey=${NEWS_API_KEY}`
        )
      )
    );
    return results.map((res, index) => {
      const articles = res.data.articles.slice(0, 3);
      return `${NEWS_CATEGORIES[index].name}:\n${articles
        .map((a) => `- [${a.title}](${a.url})`)
        .join("\n")}`;
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return ["Error fetching news."];
  }
}

async function getWeather() {
  try {
    const response = await axios.get(
      `${WEATHER_API}?q=${CITY}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const { main, weather } = response.data;
    return `Weather in ${CITY}: ${main.temp}°C, ${weather[0].description}`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return "Error fetching weather data.";
  }
}

async function getFunFact() {
  try {
    const response = await axios.get(FUN_FACT_API);
    return response.data.text;
  } catch (error) {
    console.error("Error fetching fun fact:", error);
    return "Error fetching fun fact.";
  }
}

async function getWordOfTheDay() {
  try {
    const response = await axios.get(
      `${WORD_API}?api_key=${process.env.WORD_API_KEY}`
    );
    return `Word of the Day: ${response.data.word} - ${response.data.note}`;
  } catch (error) {
    console.error("Error fetching word of the day:", error);
    return "Error fetching word of the day.";
  }
}

// Daily Message Function
async function sendDailyMessage() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) return;

  const [stocks, crypto, news, weather, funFact, word] = await Promise.all([
    getStockPrices(),
    getCryptoPrices(),
    getNews(),
    getWeather(),
    getFunFact(),
    getWordOfTheDay(),
  ]);

  const message = [
    "**Daily Update**\n",
    "**Stock Prices**:\n" + stocks.join("\n"),
    "**Crypto Prices**:\n" + crypto.join("\n"),
    "**News Headlines**:\n" + news.join("\n\n"),
    "**Weather**:\n" + weather,
    "**Fun Fact**:\n" + funFact,
    "**Word of the Day**:\n" + word,
  ].join("\n\n");

  await channel.send(message);
}

// Slash Command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

// Bot Login
client.once("ready", () => {
  console.log("Bot is ready!");
});

// Cloud Scheduler Trigger
if (process.env.TRIGGER === "true") {
  sendDailyMessage().then(() => process.exit(0));
}

client.login(process.env.DISCORD_TOKEN);
