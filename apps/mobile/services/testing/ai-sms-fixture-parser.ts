import {
  buildCategoryMap,
  clampConfidence,
  normalizeCurrency,
  normalizeType,
  parseCategory,
  type ParsedSmsTransaction,
} from "@monyvi/logic";

import { SMS_FIXTURES, type SmsFixture } from "@/services/dev/sms-fixtures";

import type {
  AiParseProgress,
  AiParseResult,
  ParseSmsContext,
  SmsCandidate,
} from "@/services/ai-sms-parser-service";

function findFixture(candidate: SmsCandidate): SmsFixture | null {
  return (
    SMS_FIXTURES.find(
      (fixture) =>
        fixture.sender === candidate.message.address &&
        fixture.body === candidate.message.body
    ) ?? null
  );
}

function parseDate(dateStr: string, fallbackMs: number): Date {
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date(fallbackMs) : parsed;
}

function mapFixtureTransactions(
  candidate: SmsCandidate,
  fixture: SmsFixture,
  context: ParseSmsContext
): ParsedSmsTransaction[] {
  const categoryMap = buildCategoryMap(context.categories);

  return (fixture.expectedTransactions ?? [])
    .filter((transaction) => transaction.isTrusted)
    .map((transaction) => {
      const category = parseCategory(
        transaction.categorySystemName,
        categoryMap
      );

      return {
        amount: Math.abs(transaction.amount),
        currency: normalizeCurrency(transaction.currency),
        type: normalizeType(transaction.type),
        counterparty: transaction.counterparty,
        date: parseDate(transaction.date, candidate.message.date),
        source: "SMS",
        originLabel: candidate.message.address,
        deduplicationHash: candidate.smsFingerprint,
        smsFingerprint: candidate.smsFingerprint,
        senderDisplayName: candidate.message.address,
        categoryId: category.id,
        categoryDisplayName: category.displayName,
        rawSmsBody: candidate.message.body,
        confidence: clampConfidence(transaction.confidenceScore),
        isAtmWithdrawal: transaction.isAtmWithdrawal ?? false,
        cardLast4: transaction.cardLast4,
      };
    });
}

export function parseSmsWithFixtureAi(
  candidates: readonly SmsCandidate[],
  context: ParseSmsContext,
  onProgress?: (progress: AiParseProgress) => void
): Promise<AiParseResult> {
  const transactions: ParsedSmsTransaction[] = [];

  for (const candidate of candidates) {
    const fixture = findFixture(candidate);
    if (!fixture) continue;

    if (fixture.parserFailure) {
      return Promise.resolve({
        transactions,
        hasError: true,
        isRetryable: fixture.parserFailure === "retryable",
      });
    }

    transactions.push(...mapFixtureTransactions(candidate, fixture, context));
  }

  onProgress?.({
    chunksCompleted: candidates.length > 0 ? 1 : 0,
    totalChunks: candidates.length > 0 ? 1 : 0,
    transactionsSoFar: transactions.length,
    chunkDurationMs: 0,
  });

  return Promise.resolve({ transactions, hasError: false });
}
