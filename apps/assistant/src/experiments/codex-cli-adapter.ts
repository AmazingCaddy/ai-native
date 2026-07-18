import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { GenerationRequest, GenerationResponse, ModelAdapter, TokenUsage } from "./types.js";

type CodexEvent = {
  type?: string;
  item?: { type?: string; text?: string };
  usage?: {
    input_tokens?: number;
    cached_input_tokens?: number;
    output_tokens?: number;
  };
};

export function parseCodexJsonl(jsonl: string): GenerationResponse {
  const events = jsonl
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as CodexEvent);

  const messages = events
    .filter((event) => event.type === "item.completed" && event.item?.type === "agent_message")
    .map((event) => event.item?.text ?? "")
    .filter(Boolean);
  const usageEvent = [...events]
    .reverse()
    .find((event: CodexEvent) => event.type === "turn.completed" && event.usage);

  if (messages.length === 0) {
    throw new Error("Codex CLI returned no agent message.");
  }

  const usage: TokenUsage | undefined = usageEvent?.usage
    ? {
        inputTokens: usageEvent.usage.input_tokens,
        cachedInputTokens: usageEvent.usage.cached_input_tokens,
        outputTokens: usageEvent.usage.output_tokens,
      }
    : undefined;

  return { output: messages.at(-1)!, usage };
}

export class CodexCliAdapter implements ModelAdapter {
  constructor(
    private readonly codexBin = process.env.CODEX_BIN ?? "codex",
    private readonly timeoutMs = 180_000,
  ) {}

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const workingDirectory = await mkdtemp(join(tmpdir(), "ai-native-model-eval-"));

    try {
      const stdout = await this.runCodex(request, workingDirectory);
      return parseCodexJsonl(stdout);
    } finally {
      await rm(workingDirectory, { recursive: true, force: true });
    }
  }

  private runCodex(request: GenerationRequest, workingDirectory: string): Promise<string> {
    const prompt = `只完成下面的评测任务。不要调用工具，不要读取本地文件，不要解释评测流程。\n\n${request.prompt}`;
    const args = [
      "exec",
      "--ephemeral",
      "--json",
      "--sandbox",
      "read-only",
      "--skip-git-repo-check",
      "--model",
      request.model,
      "--cd",
      workingDirectory,
      prompt,
    ];

    return new Promise((resolve, reject) => {
      const child = spawn(this.codexBin, args, { stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "";
      let stderr = "";
      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error(`Codex CLI timed out after ${this.timeoutMs} ms.`));
      }, this.timeoutMs);

      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk: string) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk: string) => {
        stderr += chunk;
      });
      child.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      child.on("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Codex CLI exited with code ${code}: ${stderr.trim()}`));
        }
      });
    });
  }
}
