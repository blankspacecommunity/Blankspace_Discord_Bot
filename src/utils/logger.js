export class Logger {
    static getTimestamp() {
        return new Date().toISOString();
    }

    static info(message) {
        console.log(`[${this.getTimestamp()}] [INFO] ${message}`);
    }

    static error(message) {
        console.error(`[${this.getTimestamp()}] [ERROR] ${message}`);
    }

    static warn(message) {
        console.warn(`[${this.getTimestamp()}] [WARN] ${message}`);
    }

    static debug(message) {
        console.log(`[${this.getTimestamp()}] [DEBUG] ${message}`);
    }

    static success(message) {
        console.log(`[${this.getTimestamp()}] [SUCCESS] ${message}`);
    }
}