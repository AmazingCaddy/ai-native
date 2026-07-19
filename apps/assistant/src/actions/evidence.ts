import type { ExtractedAction } from "./schema.js";

export type EvidenceField =
  | "action_evidence"
  | "owner_evidence"
  | "due_date_evidence"
  | "owner_candidates"
  | "due_date_candidates";

export type EvidenceValidationError = {
  actionIndex: number;
  field: EvidenceField;
  message: string;
};

export function validateActionEvidence(
  meetingContent: string,
  actions: ExtractedAction[],
): EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  const requireQuote = (actionIndex: number, field: EvidenceField, quote: string) => {
    if (!meetingContent.includes(quote)) {
      errors.push({
        actionIndex,
        field,
        message: "evidence must be an exact substring of meeting_content",
      });
    }
  };

  for (const [actionIndex, action] of actions.entries()) {
    requireQuote(actionIndex, "action_evidence", action.action_evidence);

    if (action.owner_evidence !== null) {
      requireQuote(actionIndex, "owner_evidence", action.owner_evidence);
    }

    if (action.due_date_evidence !== null) {
      requireQuote(actionIndex, "due_date_evidence", action.due_date_evidence);
    }

    for (const candidate of action.owner_candidates) {
      requireQuote(actionIndex, "owner_candidates", candidate.evidence);
    }

    for (const candidate of action.due_date_candidates) {
      requireQuote(actionIndex, "due_date_candidates", candidate.evidence);
    }
  }

  return errors;
}
