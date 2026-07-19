import { readFile } from "node:fs/promises";

import { z } from "zod";

import type { ActionErrorCode } from "./errors.js";
import { validateActionEvidence } from "./evidence.js";
import { confirmationReasonSchema, extractActionsResponseSchema } from "./schema.js";

const nonEmptyText = z.string().trim().min(1);

const expectedActionSchema = z
  .object({
    title_keywords: z.array(nonEmptyText).min(1),
    owner: nonEmptyText.nullable(),
    due_date: z.iso.date().nullable(),
    needs_confirmation: z.boolean(),
    confirmation_reason: confirmationReasonSchema,
    owner_candidates: z.array(nonEmptyText),
    due_date_candidates: z.array(nonEmptyText),
  })
  .strict();

const evaluationErrorCodeSchema = z
  .enum([
    "EMPTY_INPUT",
    "INVALID_REQUEST",
    "MODEL_NOT_CONFIGURED",
    "MODEL_TIMEOUT",
    "MODEL_CALL_FAILED",
    "MODEL_OUTPUT_PARSE_FAILED",
    "MODEL_OUTPUT_SCHEMA_FAILED",
    "OUTPUT_GROUNDING_FAILED",
    "INTERNAL_ERROR",
  ])
  .nullable();

export const actionEvaluationSetSchema = z
  .object({
    version: z.literal("actions-eval-v1"),
    cases: z
      .array(
        z
          .object({
            id: nonEmptyText,
            category: nonEmptyText,
            input: z
              .object({
                meeting_content: z.string(),
                current_date: z.iso.date(),
                timezone: nonEmptyText,
                output_language: nonEmptyText,
              })
              .strict(),
            expected: z
              .object({
                actions: z.array(expectedActionSchema),
                error_code: evaluationErrorCodeSchema,
              })
              .strict(),
            tags: z.array(nonEmptyText).min(1),
          })
          .strict(),
      )
      .length(10),
  })
  .strict()
  .superRefine((evaluationSet, context) => {
    const ids = evaluationSet.cases.map((testCase) => testCase.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: "custom", path: ["cases"], message: "case IDs must be unique" });
    }

    for (const [index, testCase] of evaluationSet.cases.entries()) {
      if (testCase.expected.error_code !== null && testCase.expected.actions.length > 0) {
        context.addIssue({
          code: "custom",
          path: ["cases", index, "expected"],
          message: "error cases cannot also expect actions",
        });
      }
    }
  });

export type ActionEvaluationSet = z.infer<typeof actionEvaluationSetSchema>;
export type ActionEvaluationCase = ActionEvaluationSet["cases"][number];

export type ActionEvaluationOutcome =
  | { response: unknown; errorCode: null }
  | { response: null; errorCode: ActionErrorCode };

export type ActionCaseScore = {
  id: string;
  passed: boolean;
  schemaValid: boolean | null;
  evidenceValid: boolean | null;
  expectedError: ActionErrorCode | null;
  actualError: ActionErrorCode | null;
  expectedActions: number;
  predictedActions: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  ownerCorrect: number;
  dueDateCorrect: number;
  confirmationCorrect: number;
  matchedActions: number;
  hallucinatedOwners: number;
  hallucinatedDueDates: number;
};

export type ActionEvaluationSummary = {
  totalCases: number;
  passedCases: number;
  casePassRate: number;
  schemaPassRate: number;
  evidencePassRate: number;
  precision: number;
  recall: number;
  ownerAccuracy: number;
  dueDateAccuracy: number;
  confirmationAccuracy: number;
  hallucinatedOwners: number;
  hallucinatedDueDates: number;
};

export async function loadActionEvaluationSet(path: string): Promise<ActionEvaluationSet> {
  const contents = await readFile(path, "utf8");
  return actionEvaluationSetSchema.parse(JSON.parse(contents));
}

function normalize(value: string): string {
  return value.toLocaleLowerCase().replaceAll(/\s+/g, "");
}

function titleMatches(title: string, keywords: string[]): boolean {
  const normalizedTitle = normalize(title);
  return keywords.every((keyword) => normalizedTitle.includes(normalize(keyword)));
}

function sameValues(actual: string[], expected: string[]): boolean {
  return [...actual].sort().join("\u0000") === [...expected].sort().join("\u0000");
}

function failedOutputScore(
  testCase: ActionEvaluationCase,
  actualError: ActionErrorCode | null,
): ActionCaseScore {
  return {
    id: testCase.id,
    passed: false,
    schemaValid: false,
    evidenceValid: false,
    expectedError: null,
    actualError,
    expectedActions: testCase.expected.actions.length,
    predictedActions: 0,
    truePositives: 0,
    falsePositives: 0,
    falseNegatives: testCase.expected.actions.length,
    ownerCorrect: 0,
    dueDateCorrect: 0,
    confirmationCorrect: 0,
    matchedActions: 0,
    hallucinatedOwners: 0,
    hallucinatedDueDates: 0,
  };
}

export function evaluateActionCase(
  testCase: ActionEvaluationCase,
  outcome: ActionEvaluationOutcome,
): ActionCaseScore {
  const expectedError = testCase.expected.error_code;
  if (expectedError !== null) {
    const passed = outcome.errorCode === expectedError;
    return {
      id: testCase.id,
      passed,
      schemaValid: null,
      evidenceValid: null,
      expectedError,
      actualError: outcome.errorCode,
      expectedActions: 0,
      predictedActions: 0,
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      ownerCorrect: 0,
      dueDateCorrect: 0,
      confirmationCorrect: 0,
      matchedActions: 0,
      hallucinatedOwners: 0,
      hallucinatedDueDates: 0,
    };
  }

  if (outcome.errorCode !== null) {
    return failedOutputScore(testCase, outcome.errorCode);
  }

  const parsed = extractActionsResponseSchema.safeParse(outcome.response);
  if (!parsed.success) {
    return failedOutputScore(testCase, null);
  }

  const unmatchedActual = new Set(parsed.data.actions.map((_, index) => index));
  let ownerCorrect = 0;
  let dueDateCorrect = 0;
  let confirmationCorrect = 0;
  let hallucinatedOwners = 0;
  let hallucinatedDueDates = 0;
  let matchedActions = 0;

  for (const expected of testCase.expected.actions) {
    const matchIndex = [...unmatchedActual].find((index) =>
      titleMatches(parsed.data.actions[index].title, expected.title_keywords),
    );
    if (matchIndex === undefined) continue;

    unmatchedActual.delete(matchIndex);
    matchedActions += 1;
    const actual = parsed.data.actions[matchIndex];

    if (actual.owner === expected.owner) ownerCorrect += 1;
    if (actual.due_date === expected.due_date) dueDateCorrect += 1;
    if (
      actual.needs_confirmation === expected.needs_confirmation &&
      actual.confirmation_reason === expected.confirmation_reason &&
      sameValues(
        actual.owner_candidates.map((candidate) => candidate.value),
        expected.owner_candidates,
      ) &&
      sameValues(
        actual.due_date_candidates.map((candidate) => candidate.value),
        expected.due_date_candidates,
      )
    ) {
      confirmationCorrect += 1;
    }

    if (expected.owner === null && actual.owner !== null) hallucinatedOwners += 1;
    if (expected.due_date === null && actual.due_date !== null) hallucinatedDueDates += 1;
  }

  const expectedActions = testCase.expected.actions.length;
  const predictedActions = parsed.data.actions.length;
  const falsePositives = unmatchedActual.size;
  const falseNegatives = expectedActions - matchedActions;
  const evidenceValid =
    validateActionEvidence(testCase.input.meeting_content, parsed.data.actions).length === 0;
  const fieldsCorrect =
    ownerCorrect === expectedActions &&
    dueDateCorrect === expectedActions &&
    confirmationCorrect === expectedActions;

  return {
    id: testCase.id,
    passed: falsePositives === 0 && falseNegatives === 0 && fieldsCorrect && evidenceValid,
    schemaValid: true,
    evidenceValid,
    expectedError: null,
    actualError: null,
    expectedActions,
    predictedActions,
    truePositives: matchedActions,
    falsePositives,
    falseNegatives,
    ownerCorrect,
    dueDateCorrect,
    confirmationCorrect,
    matchedActions,
    hallucinatedOwners,
    hallucinatedDueDates,
  };
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 1 : numerator / denominator;
}

export function summarizeActionEvaluation(scores: ActionCaseScore[]): ActionEvaluationSummary {
  const responseScores = scores.filter((score) => score.expectedError === null);
  const passedCases = scores.filter((score) => score.passed).length;
  const truePositives = scores.reduce((total, score) => total + score.truePositives, 0);
  const falsePositives = scores.reduce((total, score) => total + score.falsePositives, 0);
  const falseNegatives = scores.reduce((total, score) => total + score.falseNegatives, 0);
  const expectedActions = scores.reduce((total, score) => total + score.expectedActions, 0);

  return {
    totalCases: scores.length,
    passedCases,
    casePassRate: ratio(passedCases, scores.length),
    schemaPassRate: ratio(
      responseScores.filter((score) => score.schemaValid).length,
      responseScores.length,
    ),
    evidencePassRate: ratio(
      responseScores.filter((score) => score.evidenceValid).length,
      responseScores.length,
    ),
    precision: ratio(truePositives, truePositives + falsePositives),
    recall: ratio(truePositives, truePositives + falseNegatives),
    ownerAccuracy: ratio(
      scores.reduce((total, score) => total + score.ownerCorrect, 0),
      expectedActions,
    ),
    dueDateAccuracy: ratio(
      scores.reduce((total, score) => total + score.dueDateCorrect, 0),
      expectedActions,
    ),
    confirmationAccuracy: ratio(
      scores.reduce((total, score) => total + score.confirmationCorrect, 0),
      expectedActions,
    ),
    hallucinatedOwners: scores.reduce((total, score) => total + score.hallucinatedOwners, 0),
    hallucinatedDueDates: scores.reduce((total, score) => total + score.hallucinatedDueDates, 0),
  };
}
