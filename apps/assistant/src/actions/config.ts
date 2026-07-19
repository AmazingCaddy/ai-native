import OpenAI from "openai";

import { OpenAIActionAdapter } from "./openai-adapter.js";
import { ActionExtractionService, type ActionExecutionService } from "./service.js";
import { InMemoryActionTraceStore } from "./trace.js";

type ActionEnvironment = {
  FLOWAY_API_KEY?: string;
  FLOWAY_BASE_URL?: string;
  FLOWAY_MODEL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;
};

export type ActionProviderConfiguration = {
  provider: "floway" | "openai";
  apiKey: string;
  baseURL?: string;
  model: string;
};

function clean(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

export function resolveActionProviderConfiguration(
  environment: ActionEnvironment,
): ActionProviderConfiguration | undefined {
  const floway = {
    apiKey: clean(environment.FLOWAY_API_KEY),
    baseURL: clean(environment.FLOWAY_BASE_URL),
    model: clean(environment.FLOWAY_MODEL),
  };
  const hasFlowaySetting = Object.values(floway).some(Boolean);
  if (hasFlowaySetting) {
    if (!floway.apiKey || !floway.baseURL || !floway.model) return undefined;
    return {
      provider: "floway",
      apiKey: floway.apiKey,
      baseURL: floway.baseURL,
      model: floway.model,
    };
  }

  const apiKey = clean(environment.OPENAI_API_KEY);
  const model = clean(environment.OPENAI_MODEL);
  if (!apiKey || !model) return undefined;

  return {
    provider: "openai",
    apiKey,
    baseURL: clean(environment.OPENAI_BASE_URL),
    model,
  };
}

export function createActionServiceFromEnvironment(
  environment: ActionEnvironment,
): ActionExecutionService | undefined {
  const configuration = resolveActionProviderConfiguration(environment);
  if (!configuration) return undefined;

  const client = new OpenAI({
    apiKey: configuration.apiKey,
    baseURL: configuration.baseURL,
  });
  const adapter = OpenAIActionAdapter.fromClient(client, {
    model: configuration.model,
    provider: configuration.provider,
  });
  return new ActionExtractionService(adapter, new InMemoryActionTraceStore());
}
