const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { OpenAIApi, Configuration } = require('openai');

const telegramBotToken = "6268080932:AAEOkVzGo4R-i2Nya3eRtjgE7BDSPoqvVNw";
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

const bot = new TelegramBot(telegramBotToken, { polling: true });

let botUsername;

(async function () {
  const botInfo = await bot.getMe();
  botUsername = botInfo.username;
})();

async function generateResponse(prompt) {
  console.log(prompt);
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
  });

  const answer = response.data.choices[0] && response.data.choices[0].message;
  console.log(answer?.content);

  return answer?.content;
}
bot.on('text', async (msg) => {
  // Check if the message is in a group and mentions the bot
  if (msg.text.includes(`@${botUsername}`)) {
    // Remove the bot's mention from the text
    const prompt = msg.text.replace(`@${botUsername}`, '').trim();

    try {
      const response = await generateResponse(prompt);
      // Include the username of the person who sent the message in the bot's response
      const username = `@${msg.from.username}`;
      bot.sendMessage(msg.chat.id, `${username} ${response}`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(msg.chat.id, 'Sorry, I could not process your request.');
    }
  }
});
  
