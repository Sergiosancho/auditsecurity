

const express = require('express');
const { MessagingResponse } = require('twilio').twiml;
const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/bot', async (req, res) => {
  const userMsg = req.body.Body.toLowerCase();
  const twiml = new MessagingResponse();

  if (userMsg.startsWith('scan ')) {
    const url = userMsg.split(' ')[1];
    const report = await scanUrl(url);  // Reutiliza la misma función
    twiml.message(`🔍 Reporte de seguridad para ${url}:\n${JSON.stringify(report)}`);
  } else {
    twiml.message('Envía "scan [url]" para analizar un sitio.');
  }

  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => console.log('Servidor en puerto 3000'));