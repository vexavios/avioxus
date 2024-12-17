import axios from "axios";
import { client } from "./index.js";
import { APIs, Configs } from "./constants.js";

/* ----------- Helper Functions ----------- */

// Get chosen opening stock prices from API
async function getStockPrices() {
  try {
    // API call
    const response = await axios.get(
      `${APIs.STOCK}?symbol=${Configs.Symbols.STOCK.join(
        ","
      )}&interval=1day&apikey=${process.env.STOCK_API_KEY}`
    );

    // Format and return data
    return Configs.Symbols.STOCK.map(
      (stock) =>
        `${stock}: $${parseInt(
          response.data[stock].values[0].open
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
async function getCryptoPrices() {
  try {
    // API call
    const response = await axios.get(
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

// Get latest news from chosen categories from API
async function getNews() {
  try {
    // API call
    const results = await Promise.all(
      Configs.NEWS_PROPERTIES.map((properties) =>
        axios.get(
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
      // Only keep the first three articles from each category
      const articles = res.data.articles.slice(0, 3);

      return `${Configs.NEWS_PROPERTIES[index].name}:\n${articles
        .map((article) => `- [${article.title}](<${article.url}>)`)
        .join("\n")}`;
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return ["Error fetching news."];
  }
}

// Get weather at chosen location from API
async function getWeather() {
  try {
    // API call
    const response = await axios.get(
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
async function getFunFact() {
  try {
    // API call
    const response = await axios.get(APIs.FUN_FACT);
    return response.data.text;
  } catch (error) {
    console.error("Error fetching fun fact:", error);
    return "Error fetching fun fact.";
  }
}

// Get word of the day from API
async function getWordOfTheDay() {
  try {
    // API call
    const response = await axios.get(
      `${APIs.WORD}?api_key=${process.env.WORD_API_KEY}`
    );
    const { word, definitions } = response.data;

    // Format and return data
    return `Word of the Day: ${word} (${definitions[0].partOfSpeech}) - ${definitions[0].text}`;
  } catch (error) {
    console.error("Error fetching word of the day:", error);
    return "Error fetching word of the day.";
  }
}

// Get currently featured levels from LSS (with optional game to filter by)
export async function getCurrentlyFeaturedLSSLevels(game) {
  try {
    const allFeaturedLevels = [];
    const maxPages = 2;

    // Loop through pages to fetch levels
    for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
      const query =
        game !== -1
          ? `?page=${currentPage}&game=${game}`
          : `?page=${currentPage}`;
      const url = `${APIs.LSS}/levels/featured/get${query}`;

      const response = await axios.get(url);
      const { levels } = response.data;

      if (levels) {
        // Filter featured levels and flatten into allFeaturedLevels
        allFeaturedLevels.push(
          ...levels.filter((level) => level.status === "Featured")
        );
      }
    }

    // Early return if no levels are found
    if (allFeaturedLevels.length === 0) {
      return "There are currently no featured levels on LSS matching your query.";
    }

    // Build the response string
    const responseStr = [
      "__***Currently featured levels on LSS matching your query:***__\n\n",
      ...allFeaturedLevels.map(
        (level) =>
          `[**${level.name}**](<https://levelsharesquare.com/levels/${level._id}>)\n\n`
      ),
    ].join("");

    return responseStr;
  } catch (error) {
    console.error(
      "Error fetching featured levels from LSS:",
      error.message || error
    );
    return "Error fetching featured levels from LSS.";
  }
}

// Split message into multiple parts if it exceeds the Discord character limit
function splitMessage(text) {
  const result = [];
  const maxLength = 2000;

  while (text.length > 0) {
    let chunk = text.slice(0, maxLength);
    const lastNewsHeadlineStart = chunk.lastIndexOf("- [");

    // Avoid cutting in the middle of a news headline
    if (lastNewsHeadlineStart > -1 && chunk.length === maxLength) {
      chunk = chunk.slice(0, lastNewsHeadlineStart);
    }

    result.push(chunk.trim());
    text = text.slice(chunk.length);
  }

  return result;
}

// Construct and send daily post in chosen channel
export async function sendDailyPost() {
  // Get chosen channel
  const channel = await client.channels.fetch(
    process.env.DAILY_POSTS_CHANNEL_ID
  );
  if (!channel) return;

  // Get all data
  const [stocks, crypto, news, weather, funFact, word] = await Promise.all([
    getStockPrices(),
    getCryptoPrices(),
    getNews(),
    getWeather(),
    getFunFact(),
    // getWordOfTheDay(),
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
    "__**Stock Prices:**__\n" + stocks.join("\n"),
    "__**Crypto Prices:**__\n" + crypto.join("\n"),
    "__**News Headlines:**__\n" + news.join("\n"),
    "__**Weather:**__\n" + weather,
    "__**Fun Fact:**__\n" + funFact,
    "__**Word of the Day:**__\n" + word,
  ].join("\n\n");

  // Attempt to break up the message if it's over the Discord character limit
  const messageChunks = splitMessage(message);

  // Send message in chunks
  for (const chunk of messageChunks) await channel.send(chunk);

  // Log sending of post
  console.log(`Daily post sent for ${todayDate} at ${nowIsoDate}.`);
}
