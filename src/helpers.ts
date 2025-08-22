import dotenv from "dotenv";
import axios from "axios";
import { BaseGuildTextChannel } from "discord.js";
import { client } from "./index";
import { APIs, Configs, GameMap } from "./constants";

dotenv.config();

// Global variable to store stock market status
let isStockMarketOpen = false;

interface StockResponse {
  [key: string]: {
    values: Array<{
      open: string;
      close: string;
    }>;
  };
}

interface CryptoResponse {
  [key: string]: {
    usd: number;
  };
}

interface WeatherResponse {
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
  }>;
}

interface NewsArticle {
  title: string;
  url: string;
}

interface WordResponse {
  word: string;
  definitions: Array<{
    partOfSpeech: string;
    text: string;
  }>;
}

interface LSSLevel {
  _id: string;
  name: string;
  game: number;
}

// Check if the stock market is open
async function setStockMarketOpen(): Promise<void> {
  try {
    // API call
    const response = await axios.get(
      `${APIs.STOCK}/market_state?apikey=${process.env.STOCK_API_KEY}`
    );

    // Set global variable to market status
    isStockMarketOpen = response.data[0].is_market_open;
  } catch (error) {
    console.error("Error checking stock market status:", error);
  }
}

// Get chosen opening/closing stock prices from API
async function getStockPrices(): Promise<string[]> {
  try {
    // Check if stock market is open
    await setStockMarketOpen();

    // API call
    const response = await axios.get<StockResponse>(
      `${APIs.STOCK}/time_series?symbol=${Configs.Symbols.STOCK.join(
        ","
      )}&interval=1day&apikey=${process.env.STOCK_API_KEY}`
    );

    // Format and return data
    return Configs.Symbols.STOCK.map(
      (stock) =>
        `${stock}: $${parseInt(
          isStockMarketOpen
            ? response.data[stock].values[0].open
            : response.data[stock].values[0].close
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
    );
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return ["Error fetching stock data."];
  }
}

// Get chosen crypto prices from API
async function getCryptoPrices(): Promise<string[]> {
  try {
    // API call
    const response = await axios.get<CryptoResponse>(
      `${APIs.CRYPTO}?ids=${Configs.Symbols.CRYPTO.join(
        ","
      )}&vs_currencies=usd&x_cg_demo_api_key=${process.env.CRYPTO_API_KEY}`
    );

    // Format and return data
    return Configs.Symbols.CRYPTO.map(
      (crypto) =>
        `${crypto.charAt(0).toUpperCase() + crypto.slice(1)}: $${response.data[
          crypto
        ].usd.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
    );
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return ["Error fetching crypto data."];
  }
}

// Get latest US news from chosen categories from API
async function getNews(): Promise<string[]> {
  try {
    // API call
    const results = await Promise.all(
      Configs.NEWS_PROPERTIES.map((properties) =>
        axios.get<{ articles: NewsArticle[] }>(
          `${APIs.NEWS}?country=us${
            properties.category !== null
              ? `&category=${properties.category}`
              : ""
          }&apiKey=${process.env.NEWS_API_KEY}`
        )
      )
    );

    // Format and return data
    return results.map((res, index) => {
      const { name } = Configs.NEWS_PROPERTIES[index];
      const articles = res.data.articles.slice(0, 3);
      return `**${name}:**\n${articles
        .map((article) => `- [${article.title}](<${article.url}>)`)
        .join("\n")}`;
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return ["Error fetching news."];
  }
}

// Get weather at chosen location from API
async function getWeather(): Promise<string> {
  try {
    // API call
    const response = await axios.get<WeatherResponse>(
      `${APIs.WEATHER}?lat=${Configs.Weather.LATITUDE}&lon=${Configs.Weather.LONGITUDE}&units=imperial&appid=${process.env.WEATHER_API_KEY}`
    );
    const { main, weather } = response.data;

    // Format and return data
    return `${Configs.Weather.CITY}: ${main.temp}°F, ${weather[0].description}`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return "Error fetching weather data.";
  }
}

// Get fun fact of the day from API
async function getFunFact(): Promise<string> {
  try {
    // API call
    const response = await axios.get<{ text: string }>(APIs.FUN_FACT);
    return response.data.text;
  } catch (error) {
    console.error("Error fetching fun fact:", error);
    return "Error fetching fun fact.";
  }
}

// Get word of the day from API
async function getWordOfTheDay(): Promise<string> {
  try {
    // API call
    const response = await axios.get<WordResponse>(
      `${APIs.WORD}?api_key=${process.env.WORD_API_KEY}`
    );
    const { word, definitions } = response.data;

    // Format and return data
    return `${word.charAt(0).toUpperCase() + word.slice(1)} *(${
      definitions[0].partOfSpeech
    })*: ${definitions[0].text}`;
  } catch (error) {
    console.error("Error fetching word of the day:", error);
    return "Error fetching word of the day.";
  }
}

// Get an LSS game name from a specified ID
function getLSSGameNameFromId(game: number): string | null {
  const gameMap: GameMap = {
    0: "Super Mario Construct",
    1: "Yoshi's Fabrication Station",
    2: "Super Mario 127",
    4: "Mario Builder 64",
  };

  return gameMap[game] || null; // Return `null` if the game ID is not found
}

// Get currently featured levels from LSS (with optional game to filter by)
export async function getCurrentlyFeaturedLSSLevels(
  game: number
): Promise<string> {
  try {
    const allFeaturedLevels: LSSLevel[] = [];
    const maxPages = 3;

    // Loop through pages to fetch levels
    for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
      const response = await axios.get<{ levels: LSSLevel[] }>(
        `${APIs.LSS}/levels/featured?page=${currentPage}`
      );

      // Exit loop if no more levels are found
      if (!response.data.levels || response.data.levels.length === 0) break;

      // Filter levels by game if specified
      const levels =
        game !== -1
          ? response.data.levels.filter((level) => level.game === game)
          : response.data.levels;

      allFeaturedLevels.push(...levels);
    }

    // Early return if no levels are found
    if (allFeaturedLevels.length === 0) {
      return "No featured levels found matching your query.";
    }

    // If game is specified in command, get game name
    const singleGameName = game !== -1 ? getLSSGameNameFromId(game) : null;

    // Build the response string
    const responseStr = [
      "__***Currently featured levels on LSS matching your query:***__\n\n",
      ...allFeaturedLevels.map(
        (level) =>
          `- [**${level.name}**](<https://levelsharesquare.com/levels/${
            level._id
          }>) *(${singleGameName ?? getLSSGameNameFromId(level.game)})*\n`
      ),
    ].join("");

    return responseStr;
  } catch (error) {
    console.error(
      "Error fetching featured levels from LSS:",
      error instanceof Error ? error.message : error
    );
    return "Error fetching featured levels from LSS.";
  }
}

// Split message into multiple parts if it exceeds the Discord character limit
export function splitMessage(text: string): string[] {
  const result: string[] = [];
  const maxLength = 2000; // Discord character limit

  while (text.length > 0) {
    let chunk = text.slice(0, maxLength);
    const lastLinkStart = chunk.lastIndexOf("- [");

    // Avoid cutting in the middle of a link
    if (lastLinkStart > -1 && chunk.length === maxLength) {
      chunk = chunk.slice(0, lastLinkStart);
    }

    result.push(chunk.trim());
    text = text.slice(chunk.length);
  }

  return result;
}

// Construct and send daily post in chosen channel
export async function sendDailyPost(): Promise<void> {
  // Check environment variable
  const channelId = process.env.DAILY_POSTS_CHANNEL_ID;
  if (!channelId) {
    console.error("Missing DAILY_POSTS_CHANNEL_ID environment variable");
    return;
  }

  // Get chosen channel and ensure it's text-based
  const channel = await client.channels.fetch(channelId);

  // Type guard to ensure channel is text-based
  if (!channel || !("send" in channel) || typeof channel.send !== "function") {
    console.error(
      "Could not find daily posts channel or channel does not support sending messages."
    );
    return;
  }

  // Cast channel to BaseGuildTextChannel type
  const textChannel = channel as BaseGuildTextChannel;

  // Get all data
  const [stocks, crypto, news, weather, funFact, word] = await Promise.all([
    getStockPrices(),
    getCryptoPrices(),
    getNews(),
    getWeather(),
    getFunFact(),
    getWordOfTheDay(),
  ]);

  // Format today's date (in MT) and current timestamp
  const now = new Date();
  const todayDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
  }).format(now);
  const nowIsoDate = now.toISOString();

  // Format and send the daily post message
  const message = [
    `__***Daily Post for ${todayDate}:***__`,
    `__**${
      isStockMarketOpen ? "Today's Opening" : "Last Market Day's Closing"
    } Stock Prices:**__\n` + stocks.join("\n"),
    "__**Crypto Prices:**__\n" + crypto.join("\n"),
    "__**News Headlines:**__\n" + news.join("\n"),
    "__**Weather:**__\n" + weather,
    "__**Fun Fact:**__\n" + funFact,
    "__**Word of the Day:**__\n" + word,
  ].join("\n\n");

  // If message is over the Discord character limit
  const messageChunks = splitMessage(message);

  // Send full message
  for (const chunk of messageChunks) {
    await textChannel.send({ content: chunk });
  }

  // Log sending of post
  console.log(`Daily post sent for ${todayDate} at ${nowIsoDate}.`);
}
