
const express = require('express');
const { MessagingResponse } = require('twilio').twiml;
const axios = require('axios');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Función de escaneo más completa
async function scanUrl(url) {
    // Asegurarse de que la URL tiene el formato correcto
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    const report = {
        url: url,
        timestamp: new Date().toISOString(),
        vulnerabilities: []
    };

    try {
        // Verificar si el sitio está en línea
        const response = await axios.get(url, { timeout: 5000 });
        report.status = 'online';
        report.statusCode = response.status;
        
        // Verificar headers de seguridad
        const headers = response.headers;
        report.headers = {};
        
        // Verificar Content-Security-Policy
        if (headers['content-security-policy']) {
            report.headers.csp = 'Presente';
        } else {
            report.headers.csp = 'Ausente';
            report.vulnerabilities.push('Sin Content-Security-Policy');
        }
        
        // Verificar X-XSS-Protection
        if (headers['x-xss-protection']) {
            report.headers.xssProtection = 'Presente';
        } else {
            report.headers.xssProtection = 'Ausente';
            report.vulnerabilities.push('Sin X-XSS-Protection');
        }
        
        // Verificar si usa HTTPS
        if (url.startsWith('https://')) {
            report.ssl = 'Habilitado';
        } else {
            report.ssl = 'No habilitado';
            report.vulnerabilities.push('No usa HTTPS');
        }
        
    } catch (error) {
        report.status = 'error';
        report.error = error.message;
        report.vulnerabilities.push('Error al acceder al sitio');
    }
    
    return report;
}

// Ruta raíz para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('Bot de seguridad activo. Envía mensajes a través de WhatsApp usando Twilio.');
});

// Usar el puerto asignado por Render o 3000 localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));