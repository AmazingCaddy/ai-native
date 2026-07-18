import { buildApp } from './app.js';

const DEFAULT_PORT = 3001;
const host = process.env.HOST ?? '127.0.0.1';
const rawPort = process.env.PORT ?? String(DEFAULT_PORT);
const port = Number.parseInt(rawPort, 10);

if (!Number.isInteger(port) || port < 1 || port > 65_535 || String(port) !== rawPort) {
  throw new Error(`PORT must be an integer between 1 and 65535; received "${rawPort}"`);
}

const app = buildApp();

try {
  await app.listen({ host, port });
  console.log(`team-knowledge-assistant listening on http://${host}:${port}`);
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
