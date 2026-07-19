import type { ActionErrorCode } from "./errors.js";

export type ActionCallTrace = {
  requestId: string;
  provider: string;
  providerRequestId?: string;
  model: string;
  promptVersion: string;
  schemaVersion: string;
  startedAt: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  status: "succeeded" | "failed";
  errorCode?: ActionErrorCode;
};

export interface ActionTraceStore {
  save(trace: ActionCallTrace): Promise<void> | void;
}

export class InMemoryActionTraceStore implements ActionTraceStore {
  readonly traces: ActionCallTrace[] = [];

  save(trace: ActionCallTrace): void {
    this.traces.push(structuredClone(trace));
  }
}
