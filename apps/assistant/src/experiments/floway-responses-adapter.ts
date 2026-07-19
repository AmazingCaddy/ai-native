import OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";

import type { GenerationRequest, GenerationResponse, ModelAdapter } from "./types.js";

type FlowayResponse = {
  id: string;
  model: string;
  output_text: string;
  usage?: {
    input_tokens: number;
    input_tokens_details?: { cached_tokens?: number };
    output_tokens: number;
  };
};

type CreateFlowayResponse = (
  request: ResponseCreateParamsNonStreaming,
  options?: { timeout?: number },
) => Promise<FlowayResponse>;

export class FlowayResponsesAdapter implements ModelAdapter {
  readonly provider = "floway-direct";

  constructor(
    private readonly createResponse: CreateFlowayResponse,
    private readonly timeoutMs = 180_000,
  ) {}

  static fromClient(client: OpenAI, timeoutMs?: number): FlowayResponsesAdapter {
    return new FlowayResponsesAdapter(
      (request, options) => client.responses.create(request, options),
      timeoutMs,
    );
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const response = await this.createResponse(
      {
        model: request.model,
        input: request.prompt,
      },
      { timeout: this.timeoutMs },
    );

    if (!response.output_text.trim()) {
      throw new Error("Floway Responses API returned no text output.");
    }

    return {
      output: response.output_text,
      providerRequestId: response.id,
      actualModel: response.model,
      usage: response.usage
        ? {
            inputTokens: response.usage.input_tokens,
            cachedInputTokens: response.usage.input_tokens_details?.cached_tokens,
            outputTokens: response.usage.output_tokens,
          }
        : undefined,
    };
  }
}
