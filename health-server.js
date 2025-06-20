import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Discord Bot is running!',
        health_check: '/health',
        detailed_status: '/status',
        timestamp: new Date().toISOString()
    });
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
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🏥 Health check server running on port ${PORT}`);
        console.log(`📊 Health endpoint: http://0.0.0.0:${PORT}/health`);
        console.log(`📈 Status endpoint: http://0.0.0.0:${PORT}/status`);
    });
}

export default app;
