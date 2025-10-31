import pino from 'pino';
import dayjs from 'dayjs';

const isDevelopment = process.env.NODE_ENV !== 'production';

const log = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        },
      }
    : undefined,
  base: {
    pid: false,
    hostname: false,
  },
  timestamp: () => `,"time":"${dayjs().format('YYYY-MM-DD HH:MM:ss')}"`,
});

export default log;