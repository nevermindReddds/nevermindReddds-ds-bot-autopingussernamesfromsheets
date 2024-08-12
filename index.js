const { Client, GatewayIntentBits } = require('discord.js');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Загрузите файл JSON с учетными данными
const credentialsPath = path.join(__dirname, 'credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath));

const { client_email, private_key } = credentials;

const auth = new google.auth.JWT(
    client_email,
    null,
    private_key,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const sheets = google.sheets({ version: 'v4', auth });

// Определите диапазоны ячеек для команд
const ranges = {
    '!смена1': '05.08 - 11.08!H17:H25',
    '!смена2': '05.08 - 11.08!H37:H52',
    '!смена3': '05.08 - 11.08!H57:H72',
    '!смена4': '05.08 - 11.08!H77:H92',
    '!смена5': '05.08 - 11.08!H97:H112',
    '!смена6': '05.08 - 11.08!H117:H132',
    '!смена7': '05.08 - 11.08!H137:H152',
    '!смена8': '05.08 - 11.08!H157:H172',
    '!смена9': '05.08 - 11.08!H178:H193',
    '!смена10':'05.08 - 11.08!H198:H213',
    '!смена11':'05.08 - 11.08!H218:H233',
    '!смена12':'05.08 - 11.08!H228:H230'
    // Добавьте остальные диапазоны
};

// Функция для получения данных из Google Таблицы
async function getGoogleSheetData(range) {
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: '1Pr5WKqqq_9fCjzw3SBJZZ1ZJeWgACyEj-OuD2AFOCQU', // Замените на ID вашей таблицы
            range: range,
        });

        // Фильтрация пустых строк
        const filteredRows = res.data.values ? res.data.values.filter(row => row.some(cell => cell.trim() !== '')) : [];
        
        return filteredRows;
    } catch (error) {
        console.error('Ошибка при получении данных из Google Sheets:', error);
        return [];
    }
}

// Обработка сообщений и команд
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Обработка команд для разных диапазонов
    for (const [command, range] of Object.entries(ranges)) {
        if (message.content.startsWith(command)) {
            const rows = await getGoogleSheetData(range);
            if (rows.length) {
                const response = rows.map(row => row.join(', ')).join('\n');
                message.channel.send(`Вот данные из диапазона ${range}:\n${response}`);
            } else {
                message.channel.send(`Таблица пуста или произошла ошибка для диапазона ${range}.`);
            }
            return;
        }
    }

    // Пример другой команды
    if (message.content.startsWith('!hello')) {
        message.channel.send('Привет! Как я могу помочь?');
    }
});

// Когда бот готов, выводим сообщение в консоль
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
client.login(token);