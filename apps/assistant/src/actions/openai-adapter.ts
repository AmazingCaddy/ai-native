import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ZodError } from "zod";

import {
  ACTION_SCHEMA_VERSION,
  extractActionsResponseSchema,
  type ExtractActionsResponse,
} from "./schema.js";
import {
  ACTION_EXTRACTION_INSTRUCTIONS,
  ACTION_PROMPT_VERSION,
  buildActionExtractionInput,
  type ActionExtractionInput,
} from "./prompt.js";

type ParsedActionResponse = {
  id: string;
  model: string;
  output_parsed: ExtractActionsResponse | null;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
};

type ParseActionResponse = (
  request: Parameters<OpenAI["responses"]["parse"]>[0],
  options?: { timeout?: number },
) => Promise<ParsedActionResponse>;

export type ActionModelCallMetadata = {
  provider: string;
  providerRequestId: string;
  model: string;
  promptVersion: string;
  schemaVersion: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
};

export type ActionExtractionResult = ExtractActionsResponse & {
  metadata: ActionModelCallMetadata;
};

export type OpenAIActionAdapterOptions = {
  model: string;
  provider?: string;
  timeoutMs?: number;
  maxOutputTokens?: number;
};

export type ActionModelErrorCode =
  | "MODEL_TIMEOUT"
  | "MODEL_CALL_FAILED"
  | "MODEL_OUTPUT_PARSE_FAILED"
  | "MODEL_OUTPUT_SCHEMA_FAILED";

export class ActionModelError extends Error {
  constructor(
    readonly code: ActionModelErrorCode,
    readonly publicMessage: string,
    options?: ErrorOptions,
  ) {
    super(publicMessage, options);
    this.name = "ActionModelError";
  }
}

export class OpenAIActionAdapter {
  readonly provider: string;
  private readonly timeoutMs: number;
  private readonly maxOutputTokens: number;

  constructor(
    private readonly parseResponse: ParseActionResponse,
    private readonly options: OpenAIActionAdapterOptions,
  ) {
    this.provider = options.provider ?? "openai";
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.maxOutputTokens = options.maxOutputTokens ?? 2_000;
  }

  get model(): string {
    return this.options.model;
  }

  static fromClient(client: OpenAI, options: OpenAIActionAdapterOptions): OpenAIActionAdapter {
    return new OpenAIActionAdapter(
      (request, requestOptions) => client.responses.parse(request, requestOptions),
      options,
    );
  }

  async extract(input: ActionExtractionInput): Promise<ActionExtractionResult> {
    const startedAt = performance.now();
    try {
      const response = await this.parseResponse(
        {
          model: this.options.model,
          instructions: ACTION_EXTRACTION_INSTRUCTIONS,
          input: buildActionExtractionInput(input),
          max_output_tokens: this.maxOutputTokens,
          text: {
            format: zodTextFormat(extractActionsResponseSchema, "action_extraction"),
          },
        },
        { timeout: this.timeoutMs },
      );

      if (response.output_parsed === null) {
        throw new ActionModelError(
          "MODEL_OUTPUT_PARSE_FAILED",
          "model response did not contain parsed action extraction output",
        );
      }

      return {
        ...response.output_parsed,
        metadata: {
          provider: this.provider,
          providerRequestId: response.id,
          model: response.model,
          promptVersion: ACTION_PROMPT_VERSION,
          schemaVersion: ACTION_SCHEMA_VERSION,
          latencyMs: Math.round(performance.now() - startedAt),
          inputTokens: response.usage?.input_tokens ?? 0,
          outputTokens: response.usage?.output_tokens ?? 0,
        },
      };
    } catch (error) {
      if (error instanceof ActionModelError) throw error;

      if (error instanceof ZodError) {
        throw new ActionModelError(
          "MODEL_OUTPUT_SCHEMA_FAILED",
          "model response did not match the action extraction schema",
          { cause: error },
        );
      }

      if (error instanceof SyntaxError) {
        throw new ActionModelError(
          "MODEL_OUTPUT_PARSE_FAILED",
          "model response could not be parsed",
          { cause: error },
        );
      }

      const errorName = error instanceof Error ? error.name : "";
      if (errorName.includes("Timeout")) {
        throw new ActionModelError("MODEL_TIMEOUT", "model request timed out", { cause: error });
      }

      throw new ActionModelError("MODEL_CALL_FAILED", "model request failed", { cause: error });
    }
  }
}
