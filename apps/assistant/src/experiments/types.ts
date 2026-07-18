export type TokenUsage = {
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
};

export type ModelTask = {
  id: string;
  category: "extraction" | "code-explanation" | "grounded-qa" | "clarification";
  title: string;
  prompt: string;
  criteria: string[];
};

export type GenerationRequest = {
  model: string;
  prompt: string;
};

export type GenerationResponse = {
  output: string;
  usage?: TokenUsage;
};

export interface ModelAdapter {
  generate(request: GenerationRequest): Promise<GenerationResponse>;
}

export type ModelRunRecord = {
  experimentId: string;
  taskId: string;
  taskTitle: string;
  criteria: string[];
  model: string;
  repetition: number;
  startedAt: string;
  elapsedMs: number;
  status: "succeeded" | "failed";
  output: string;
  usage?: TokenUsage;
  error?: string;
};
