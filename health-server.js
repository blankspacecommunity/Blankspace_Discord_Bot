import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Health check endpoint for UptimeRobot
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'Discord Bot',
        version: getVersion()
    });
});

// Status endpoint with more detailed info
app.get('/status', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: formatUptime(process.uptime()),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        service: 'Discord Bot Health Check',
        version: getVersion(),
        node_version: process.version
    });
});

// Root endpoint - Simple Hello World as per Render example
app.get('/', (req, res) => {
    res.send('Hello World!');
});

function getVersion() {
    try {
        const packagePath = join(__dirname, 'package.json');
        const packageData = JSON.parse(readFileSync(packagePath, 'utf8'));
        return packageData.version || '1.0.0';
    } catch (error) {
        return '1.0.0';
    }
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

export function startHealthServer() {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Example app listening on port ${port}`);
        console.log(`📊 Health endpoint: http://0.0.0.0:${port}/health`);
        console.log(`📈 Status endpoint: http://0.0.0.0:${port}/status`);
    });
}

export default app;
