const TelegramBot = require('node-telegram-bot-api');
const { OpenAIApi, Configuration } = require('openai');

const telegramBotToken = process.env.API_KEY2;
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

const bot = new TelegramBot(telegramBotToken, { polling: true });

let botUsername;
const userConversations = {};

(async function () {
  const botInfo = await bot.getMe();
  botUsername = botInfo.username;
})();

async function generateResponse(prompt, chatId) {
  console.log(prompt);
  
  if (!userConversations[chatId]) {
    userConversations[chatId] = [];
  }

  userConversations[chatId].push({ role: 'user', content: prompt });

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: userConversations[chatId].slice(-5),
    temperature: 0.5,
  });

  const answer = response.data.choices[0] && response.data.choices[0].message;
  console.log(answer.content);

  userConversations[chatId].push({ role: 'assistant', content: answer.content });

  return answer.content;
}

bot.on('text', async (msg) => {
  if (msg.text.includes(`@${botUsername}`)) {
    const prompt = msg.text.replace(`@${botUsername}`, '').trim();

    try {
      const response = await generateResponse(prompt, msg.chat.id);
      const username = `@${msg.from.username}`;
      bot.sendMessage(msg.chat.id, `${username} ${response}`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(msg.chat.id, 'Sorry, I could not process your request.');
    }
  }
});
