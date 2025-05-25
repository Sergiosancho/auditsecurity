const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TOKEN = 'TU_TOKEN_DE_TELEGRAM';
const bot = new TelegramBot(TOKEN, { polling: true });

// Comando /scan
bot.onText(/\/scan (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1];  // URL enviada por el usuario

  bot.sendMessage(chatId, `🔍 Escaneando ${url}...`);

  try {
    const report = await scanUrl(url);  // Función de escaneo (ver abajo)
    bot.sendMessage(chatId, `📊 Resultados para ${url}:\n${JSON.stringify(report, null, 2)}`);
  } catch (error) {
    bot.sendMessage(chatId, '❌ Error: URL no válida o servicio no disponible.');
  }
});

// Función de escaneo simplificada
async function scanUrl(url) {
  const report = {};

  // 1. Verificar SSL (ejemplo básico)
  try {
    const response = await axios.get(`https://api.ssllabs.com/api/v3/analyze?host=${url}`);
    report.ssl = response.data.grade || 'No seguro';
  } catch (error) {
    report.ssl = 'Error al verificar SSL';
  }

  // 2. Detección de XSS/SQLi (payload básico)
  try {
    const xssTest = await axios.get(`${url}?param=<script>alert('xss')</script>`);
    if (xssTest.data.includes("<script>alert('xss')</script>")) {
      report.xss = 'Vulnerable a XSS';
    }
  } catch (error) {
    report.xss = 'No se pudo testear XSS';
  }

  return report;
}
