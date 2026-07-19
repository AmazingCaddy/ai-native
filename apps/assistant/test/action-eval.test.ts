import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import {
  evaluateActionCase,
  loadActionEvaluationSet,
  summarizeActionEvaluation,
} from "../src/actions/eval.js";

test("action evaluation dataset contains ten unique valid cases", async () => {
  const evaluationSet = await loadActionEvaluationSet(
    join(process.cwd(), "eval", "action-items.json"),
  );

  assert.equal(evaluationSet.version, "actions-eval-v1");
  assert.equal(evaluationSet.cases.length, 10);
  assert.equal(new Set(evaluationSet.cases.map((testCase) => testCase.id)).size, 10);
  assert.ok(evaluationSet.cases.some((testCase) => testCase.expected.error_code !== null));
  assert.ok(evaluationSet.cases.some((testCase) => testCase.category === "conflict"));
});

test("grader passes a grounded missing-field response", async () => {
  const evaluationSet = await loadActionEvaluationSet(
    join(process.cwd(), "eval", "action-items.json"),
  );
  const testCase = evaluationSet.cases.find(
    (candidate) => candidate.id === "E05-missing-owner-and-date",
  );
  assert.ok(testCase);

  const score = evaluateActionCase(testCase, {
    errorCode: null,
    response: {
      actions: [
        {
          title: "演示新的检查流程",
          owner: null,
          due_date: null,
          action_evidence: "新的检查流程需要在值班交接时演示",
          owner_evidence: null,
          due_date_evidence: null,
          needs_confirmation: true,
          confirmation_reason: "missing_owner_and_due_date",
          owner_candidates: [],
          due_date_candidates: [],
        },
      ],
    },
  });

  assert.equal(score.passed, true);
  assert.equal(score.schemaValid, true);
  assert.equal(score.evidenceValid, true);
  assert.equal(score.truePositives, 1);
});

test("grader detects hallucinated fields independently from action recall", async () => {
  const evaluationSet = await loadActionEvaluationSet(
    join(process.cwd(), "eval", "action-items.json"),
  );
  const testCase = evaluationSet.cases.find(
    (candidate) => candidate.id === "E05-missing-owner-and-date",
  );
  assert.ok(testCase);

  const score = evaluateActionCase(testCase, {
    errorCode: null,
    response: {
      actions: [
        {
          title: "演示新的检查流程",
          owner: "张三",
          due_date: null,
          action_evidence: "新的检查流程需要在值班交接时演示",
          owner_evidence: "会议没有指定演示负责人",
          due_date_evidence: null,
          needs_confirmation: true,
          confirmation_reason: "missing_due_date",
          owner_candidates: [],
          due_date_candidates: [],
        },
      ],
    },
  });

  assert.equal(score.passed, false);
  assert.equal(score.truePositives, 1);
  assert.equal(score.falseNegatives, 0);
  assert.equal(score.ownerCorrect, 0);
  assert.equal(score.hallucinatedOwners, 1);
});

test("grader handles expected request errors and summarizes separate metrics", async () => {
  const evaluationSet = await loadActionEvaluationSet(
    join(process.cwd(), "eval", "action-items.json"),
  );
  const emptyCase = evaluationSet.cases.find((candidate) => candidate.id === "E03-empty-input");
  const noActionCase = evaluationSet.cases.find(
    (candidate) => candidate.id === "E04-no-new-action",
  );
  assert.ok(emptyCase);
  assert.ok(noActionCase);

  const scores = [
    evaluateActionCase(emptyCase, { response: null, errorCode: "EMPTY_INPUT" }),
    evaluateActionCase(noActionCase, { response: { actions: [] }, errorCode: null }),
  ];
  const summary = summarizeActionEvaluation(scores);

  assert.equal(summary.passedCases, 2);
  assert.equal(summary.casePassRate, 1);
  assert.equal(summary.schemaPassRate, 1);
  assert.equal(summary.precision, 1);
  assert.equal(summary.recall, 1);
});

test("field accuracy penalizes actions that were not recalled", async () => {
  const evaluationSet = await loadActionEvaluationSet(
    join(process.cwd(), "eval", "action-items.json"),
  );
  const multipleActionCase = evaluationSet.cases.find(
    (candidate) => candidate.id === "E02-multiple-actions",
  );
  assert.ok(multipleActionCase);

  const score = evaluateActionCase(multipleActionCase, {
    errorCode: null,
    response: {
      actions: [
        {
          title: "准备匿名任务样例",
          owner: "周敏",
          due_date: "2026-07-21",
          action_evidence: "周敏负责准备 10 份匿名任务样例，截止 7 月 21 日",
          owner_evidence: "周敏负责",
          due_date_evidence: "截止 7 月 21 日",
          needs_confirmation: false,
          confirmation_reason: null,
          owner_candidates: [],
          due_date_candidates: [],
        },
      ],
    },
  });
  const summary = summarizeActionEvaluation([score]);

  assert.equal(summary.recall, 0.5);
  assert.equal(summary.ownerAccuracy, 0.5);
  assert.equal(summary.dueDateAccuracy, 0.5);
});
