import { randomUUID } from "node:crypto";

import { z } from "zod";

import { ActionExtractionError } from "./errors.js";
import { validateActionEvidence } from "./evidence.js";
import {
  ActionModelError,
  type ActionModelErrorCode,
  type ActionExtractionResult,
} from "./openai-adapter.js";
import { ACTION_PROMPT_VERSION, type ActionExtractionInput } from "./prompt.js";
import { ACTION_SCHEMA_VERSION, type ExtractedAction } from "./schema.js";
import type { ActionCallTrace, ActionTraceStore } from "./trace.js";

const DEFAULT_MAX_MEETING_LENGTH = 100_000;

function isValidTimeZone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export const actionExtractionRequestSchema = z
  .object({
    meeting_content: z.string().max(DEFAULT_MAX_MEETING_LENGTH),
    current_date: z.iso.date(),
    timezone: z.string().trim().min(1).refine(isValidTimeZone, "invalid IANA timezone"),
    output_language: z.string().trim().min(1).default("zh-CN"),
  })
  .strict();

export type ActionExtractionRequest = z.infer<typeof actionExtractionRequestSchema>;

export type ActionExtractionSuccess = {
  request_id: string;
  actions: ExtractedAction[];
  meta: {
    provider: string;
    provider_request_id: string;
    model: string;
    prompt_version: string;
    schema_version: string;
    latency_ms: number;
    input_tokens: number;
    output_tokens: number;
  };
};

export interface ActionExtractor {
  readonly provider: string;
  readonly model: string;
  extract(input: ActionExtractionInput): Promise<ActionExtractionResult>;
}

const modelErrorStatus: Record<ActionModelErrorCode, number> = {
  MODEL_TIMEOUT: 504,
  MODEL_CALL_FAILED: 502,
  MODEL_OUTPUT_PARSE_FAILED: 502,
  MODEL_OUTPUT_SCHEMA_FAILED: 502,
};

function parseRequest(rawRequest: unknown): ActionExtractionRequest {
  const parsed = actionExtractionRequestSchema.safeParse(rawRequest);
  if (!parsed.success) {
    throw new ActionExtractionError(
      "INVALID_REQUEST",
      400,
      "request body does not match the action extraction contract",
      { cause: parsed.error },
    );
  }

  if (parsed.data.meeting_content.trim().length === 0) {
    throw new ActionExtractionError("EMPTY_INPUT", 400, "meeting_content must not be empty");
  }

  return parsed.data;
}

export class ActionExtractionService {
  constructor(
    private readonly extractor: ActionExtractor,
    private readonly traceStore: ActionTraceStore,
    private readonly createRequestId: () => string = randomUUID,
  ) {}

  async execute(
    rawRequest: unknown,
    requestId = this.createRequestId(),
  ): Promise<ActionExtractionSuccess> {
    const startedAt = new Date();
    const startedAtMs = performance.now();
    let trace: ActionCallTrace | undefined;

    try {
      const request = parseRequest(rawRequest);
      const result = await this.extractor.extract({
        meetingContent: request.meeting_content,
        currentDate: request.current_date,
        timezone: request.timezone,
        outputLanguage: request.output_language,
      });
      const evidenceErrors = validateActionEvidence(request.meeting_content, result.actions);

      if (evidenceErrors.length > 0) {
        throw new ActionExtractionError(
          "OUTPUT_GROUNDING_FAILED",
          422,
          "model output contains evidence that is not grounded in meeting_content",
        );
      }

      trace = {
        requestId,
        provider: result.metadata.provider,
        providerRequestId: result.metadata.providerRequestId,
        model: result.metadata.model,
        promptVersion: result.metadata.promptVersion,
        schemaVersion: result.metadata.schemaVersion,
        startedAt: startedAt.toISOString(),
        latencyMs: Math.round(performance.now() - startedAtMs),
        inputTokens: result.metadata.inputTokens,
        outputTokens: result.metadata.outputTokens,
        status: "succeeded",
      };

      return {
        request_id: requestId,
        actions: result.actions,
        meta: {
          provider: result.metadata.provider,
          provider_request_id: result.metadata.providerRequestId,
          model: result.metadata.model,
          prompt_version: result.metadata.promptVersion,
          schema_version: result.metadata.schemaVersion,
          latency_ms: result.metadata.latencyMs,
          input_tokens: result.metadata.inputTokens,
          output_tokens: result.metadata.outputTokens,
        },
      };
    } catch (error) {
      const mappedError = this.mapError(error);
      trace = {
        requestId,
        provider: this.extractor.provider,
        model: this.extractor.model,
        promptVersion: ACTION_PROMPT_VERSION,
        schemaVersion: ACTION_SCHEMA_VERSION,
        startedAt: startedAt.toISOString(),
        latencyMs: Math.round(performance.now() - startedAtMs),
        status: "failed",
        errorCode: mappedError.code,
      };
      throw mappedError;
    } finally {
      if (trace) await this.traceStore.save(trace);
    }
  }

  private mapError(error: unknown): ActionExtractionError {
    if (error instanceof ActionExtractionError) return error;

    if (error instanceof ActionModelError) {
      return new ActionExtractionError(
        error.code,
        modelErrorStatus[error.code],
        error.publicMessage,
        { cause: error },
      );
    }

    return new ActionExtractionError(
      "INTERNAL_ERROR",
      500,
      "action extraction failed unexpectedly",
      { cause: error },
    );
  }
}

export class UnavailableActionExtractionService {
  async execute(_rawRequest?: unknown, _requestId?: string): Promise<never> {
    throw new ActionExtractionError(
      "MODEL_NOT_CONFIGURED",
      503,
      "action extraction model is not configured",
    );
  }
}

export interface ActionExecutionService {
  execute(rawRequest: unknown, requestId?: string): Promise<ActionExtractionSuccess>;
}
