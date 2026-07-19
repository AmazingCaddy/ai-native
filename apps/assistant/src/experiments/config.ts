function optionValue(arguments_: string[], name: string): string | undefined {
  const inlinePrefix = `--${name}=`;
  const inline = arguments_.find((argument) => argument.startsWith(inlinePrefix));
  if (inline) return inline.slice(inlinePrefix.length);

  const index = arguments_.indexOf(`--${name}`);
  return index >= 0 ? arguments_[index + 1] : undefined;
}

export function parseComparisonModels(value: string): string[] {
  const models = value
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  if (models.length < 2) {
    throw new Error("MODEL_COMPARISON_MODELS must contain at least two comma-separated models.");
  }
  if (new Set(models).size !== models.length) {
    throw new Error("MODEL_COMPARISON_MODELS must not contain duplicate models.");
  }

  return models;
}

export function resolveComparisonModels(
  arguments_: string[],
  environment: NodeJS.ProcessEnv,
): string[] {
  const configured = optionValue(arguments_, "models") ?? environment.MODEL_COMPARISON_MODELS;
  if (!configured) {
    throw new Error("Configure MODEL_COMPARISON_MODELS or pass --models=... before comparing models.");
  }
  return parseComparisonModels(configured);
}
