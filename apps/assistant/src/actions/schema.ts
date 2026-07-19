import { z } from "zod";

export const ACTION_SCHEMA_VERSION = "actions-v1";

const nonEmptyText = z.string().trim().min(1);
const nullableText = nonEmptyText.nullable();
const nullableDate = z.iso.date().nullable();

export const evidenceCandidateSchema = z
  .object({
    value: nonEmptyText,
    evidence: nonEmptyText,
  })
  .strict();

export const confirmationReasonSchema = z
  .enum([
    "missing_owner",
    "missing_due_date",
    "missing_owner_and_due_date",
        "conflicting_owner",
        "conflicting_due_date",
        "ambiguous_owner",
        "ambiguous_action",
  ])
  .nullable();

export const actionSchema = z
  .object({
    title: nonEmptyText,
    owner: nullableText,
    due_date: nullableDate,
    action_evidence: nonEmptyText,
    owner_evidence: nullableText,
    due_date_evidence: nullableText,
    needs_confirmation: z.boolean(),
    confirmation_reason: confirmationReasonSchema,
    owner_candidates: z
      .array(evidenceCandidateSchema)
      .describe("Only populate for conflicting_owner; otherwise return an empty array."),
    due_date_candidates: z
      .array(evidenceCandidateSchema)
      .describe("Only populate for conflicting_due_date; otherwise return an empty array."),
  })
  .strict()
  .superRefine((action, context) => {
    if ((action.owner === null) !== (action.owner_evidence === null)) {
      context.addIssue({
        code: "custom",
        path: ["owner_evidence"],
        message: "owner and owner_evidence must both be present or both be null",
      });
    }

    if ((action.due_date === null) !== (action.due_date_evidence === null)) {
      context.addIssue({
        code: "custom",
        path: ["due_date_evidence"],
        message: "due_date and due_date_evidence must both be present or both be null",
      });
    }

    if (action.needs_confirmation !== (action.confirmation_reason !== null)) {
      context.addIssue({
        code: "custom",
        path: ["confirmation_reason"],
        message: "confirmation_reason must be present exactly when confirmation is required",
      });
    }

    if (action.confirmation_reason === "conflicting_owner") {
      if (action.owner !== null || action.owner_candidates.length < 2) {
        context.addIssue({
          code: "custom",
          path: ["owner_candidates"],
          message: "conflicting owners require a null owner and at least two candidates",
        });
      }
    } else if (action.owner_candidates.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["owner_candidates"],
        message: "owner candidates are only allowed for an owner conflict",
      });
    }

    if (action.confirmation_reason === "conflicting_due_date") {
      if (action.due_date !== null || action.due_date_candidates.length < 2) {
        context.addIssue({
          code: "custom",
          path: ["due_date_candidates"],
          message: "conflicting due dates require a null due_date and at least two candidates",
        });
      }
    } else if (action.due_date_candidates.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["due_date_candidates"],
        message: "due date candidates are only allowed for a due date conflict",
      });
    }
  });

export const extractActionsResponseSchema = z
  .object({
    actions: z.array(actionSchema),
  })
  .strict();

export type ExtractedAction = z.infer<typeof actionSchema>;
export type ExtractActionsResponse = z.infer<typeof extractActionsResponseSchema>;
