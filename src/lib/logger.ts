/**
 * Simple logger utility for Echo: The Bridge.
 * Can be expanded to send logs to an external service in production.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

const isDev = process.env.NODE_ENV === "development";

function log(level: LogLevel, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
        case "info":
            console.info(formattedMessage, ...args);
            break;
        case "warn":
            console.warn(formattedMessage, ...args);
            break;
        case "error":
            console.error(formattedMessage, ...args);
            break;
        case "debug":
            if (isDev) {
                console.debug(formattedMessage, ...args);
            }
            break;
    }
}

export const logger = {
    info: (message: string, ...args: unknown[]) => log("info", message, ...args),
    warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
    error: (message: string, ...args: unknown[]) => log("error", message, ...args),
    debug: (message: string, ...args: unknown[]) => log("debug", message, ...args),
};
