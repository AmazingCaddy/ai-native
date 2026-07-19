import type { FastifyInstance } from "fastify";

import { ActionExtractionError } from "./errors.js";
import type { ActionExecutionService } from "./service.js";

export function registerActionRoutes(
  app: FastifyInstance,
  actionService: ActionExecutionService,
): void {
  app.post("/actions/extract", async (request, reply) => {
    try {
      return await actionService.execute(request.body, request.id);
    } catch (error) {
      let safeError: ActionExtractionError;
      if (error instanceof ActionExtractionError) {
        safeError = error;
      } else {
        safeError = new ActionExtractionError(
          "INTERNAL_ERROR",
          500,
          "action extraction failed unexpectedly",
        );
      }

      return reply.code(safeError.statusCode).send({
        status: "error",
        errorCode: safeError.code,
        errorDescription: safeError.publicMessage,
        request_id: request.id,
      });
    }
  });
}
