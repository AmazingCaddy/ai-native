import Fastify, { type FastifyInstance } from 'fastify';

import { registerActionRoutes } from './actions/routes.js';
import {
  type ActionExecutionService,
  UnavailableActionExtractionService,
} from './actions/service.js';

export const serviceInfo = {
  name: 'team-knowledge-assistant',
  version: '0.1.0',
} as const;

export type BuildAppOptions = {
  actionService?: ActionExecutionService;
};

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: false });
  const actionService = options.actionService ?? new UnavailableActionExtractionService();

  app.get('/health', async () => ({
    status: 'ok' as const,
    service: serviceInfo.name,
    version: serviceInfo.version,
  }));

  registerActionRoutes(app, actionService);

  return app;
}
