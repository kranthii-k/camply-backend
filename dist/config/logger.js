"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const devFormat = combine(colorize(), timestamp({ format: "HH:mm:ss" }), errors({ stack: true }), printf(({ level, message, timestamp, stack }) => stack
    ? `${timestamp} [${level}] ${message}\n${stack}`
    : `${timestamp} [${level}] ${message}`));
const prodFormat = combine(timestamp(), errors({ stack: true }), winston_1.default.format.json());
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    transports: [new winston_1.default.transports.Console()],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map