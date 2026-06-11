import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";
const level = process.env.LOG_LEVEL ?? "info";

const logger = isDev
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports
    pino({ level }, require("pino-pretty")({ colorize: true, sync: true }))
  : pino({ level });

export default logger;
