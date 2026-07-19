import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveActionProviderConfiguration } from "../src/actions/config.js";

test("Floway configuration uses an explicit OpenAI-compatible endpoint", () => {
  assert.deepEqual(
    resolveActionProviderConfiguration({
      FLOWAY_BASE_URL: " https://floway.example/v1 ",
      FLOWAY_API_KEY: " proxy-key ",
      FLOWAY_MODEL: " proxy-model ",
    }),
    {
      provider: "floway",
      baseURL: "https://floway.example/v1",
      apiKey: "proxy-key",
      model: "proxy-model",
    },
  );
});

test("partial Floway configuration does not mix with OpenAI credentials", () => {
  assert.equal(
    resolveActionProviderConfiguration({
      FLOWAY_BASE_URL: "https://floway.example/v1",
      OPENAI_API_KEY: "openai-key",
      OPENAI_MODEL: "openai-model",
    }),
    undefined,
  );
});

test("direct OpenAI-compatible configuration remains supported", () => {
  assert.deepEqual(
    resolveActionProviderConfiguration({
      OPENAI_BASE_URL: "https://api.example/v1",
      OPENAI_API_KEY: "openai-key",
      OPENAI_MODEL: "openai-model",
    }),
    {
      provider: "openai",
      baseURL: "https://api.example/v1",
      apiKey: "openai-key",
      model: "openai-model",
    },
  );
});
