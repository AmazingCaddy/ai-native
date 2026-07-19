export type ActionErrorCode =
  | "EMPTY_INPUT"
  | "INVALID_REQUEST"
  | "MODEL_NOT_CONFIGURED"
  | "MODEL_TIMEOUT"
  | "MODEL_CALL_FAILED"
  | "MODEL_OUTPUT_PARSE_FAILED"
  | "MODEL_OUTPUT_SCHEMA_FAILED"
  | "OUTPUT_GROUNDING_FAILED"
  | "INTERNAL_ERROR";

export class ActionExtractionError extends Error {
  constructor(
    readonly code: ActionErrorCode,
    readonly statusCode: number,
    readonly publicMessage: string,
    options?: ErrorOptions,
  ) {
    super(publicMessage, options);
    this.name = "ActionExtractionError";
  }
}
