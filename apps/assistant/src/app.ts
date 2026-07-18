import Fastify, { type FastifyInstance } from 'fastify';

export const serviceInfo = {
  name: 'team-knowledge-assistant',
  version: '0.1.0',
} as const;

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.get('/health', async () => ({
    status: 'ok' as const,
    service: serviceInfo.name,
    version: serviceInfo.version,
  }));

  return app;
}
