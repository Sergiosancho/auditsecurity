
const express = require('express');
const { MessagingResponse } = require('twilio').twiml; // Corregido: "MessagingResponse" y "twiml"
const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/bot', async (req, res) => {
    const userMsg = req.body.Body.toLowerCase(); // Corregido: "toLowerCase()"
    const twiml = new MessagingResponse(); // Corregido: "twiml"

    if (userMsg.startsWith('scan ')) { // Corregido: "startsWith()"
        const url = userMsg.split(' ')[1];
        const report = await scanUrl(url); // Asegúrate de tener esta función definida
        twiml.message(`🔍 Reporte de seguridad para ${url}:\n${JSON.stringify(report)}`); // Corregido: template strings
    } else {
        twiml.message('Envía "scan [url]" para analizar un sitio.');
    }

    res.type('text/xml').send(twiml.toString());
});

function scanUrl(url) { // Añade esta función básica si no existe
    return {
        url: url,
        ssl: "OK",
        vulnerabilities: []
    };
}

app.listen(3000, () => console.log('Servidor en puerto 3000'));
app.listen(3000, () => console.log('Servidor en puerto 3000'));