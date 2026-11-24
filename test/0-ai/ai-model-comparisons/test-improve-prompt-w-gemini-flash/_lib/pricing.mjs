// Gemini rate card, in USD per 1M tokens. Carried over from nextjs-tools'
// test/0-ai/ai-model-comparisons/test-real-functions-changes-to-new-models/_harness/pricing.mjs with every
// non-Gemini row dropped — this tool only ever calls Flash.
//
// `charged` = the conservative rate the source repo bills at today; `list` = the durable standard rate a
// promotional period reverts to. Verified against ai.google.dev/gemini-api/docs/pricing:
//   gemini-3.7-flash  (2026-08-14) Google's page showed $0 / $0 promotional through 2026-12-31, reverting to
//                     $1.50 / $7.50 on 2027-01-01. `charged` deliberately keeps the conservative
//                     $0.75 / $3.75 rather than $0, so a cost figure is never won by a temporary giveaway;
//                     `list` is the 2027 rate and is the durable basis.
//   gemini-3.8-flash  (2026-10-05) Same rates as gemini-3.7-flash ($0.75 / $3.75 per 1M through 2026-12-31,
//                     then $1.50 / $7.50). The 3.7 row is kept so older run records and a 'latest-flash'
//                     pin that still resolves to 3.7 stay priced.
//   gemini-4-neon     (2026-11-24, Phase 0 verified) Flat $3.00 / $15.00 per 1M in/out, $0.15 cached (0.05x)
//                     across the full 1M context window (no >200K tier).
// Gemini thinking tokens bill at the OUTPUT rate and are already inside candidatesTokenCount +
// thoughtsTokenCount, so they must not be added again here.
export const RATE_CARD = {
    'gemini-3.8-flash': {
        charged: {in: 0.75, out: 3.75},
        list: {in: 1.50, out: 7.50},
        cacheReadMultiplier: 0.10,
        cacheWriteMultiplier: 1.00
    },
    'gemini-3.7-flash': {
        charged: {in: 0.75, out: 3.75},
        list: {in: 1.50, out: 7.50},
        cacheReadMultiplier: 0.10,
        cacheWriteMultiplier: 1.00
    },
    'gemini-4-neon': {
        charged: {in: 3.00, out: 15.00},
        list: {in: 3.00, out: 15.00},
        cacheReadMultiplier: 0.05,
        cacheWriteMultiplier: 1.00
    },
    'gemini-3.1-pro-preview': { // legacy (replaced by gemini-4-neon, Skar-Audio/GlobalIssueTracking#6948)
        charged: {in: 3.50, out: 14.00},
        list: {in: 3.50, out: 14.00},
        cacheReadMultiplier: 0.10,
        cacheWriteMultiplier: 1.00
    },
    'gemini-3.1-flash-lite': {
        charged: {in: 0.25, out: 1.50},
        list: {in: 0.25, out: 1.50},
        cacheReadMultiplier: 0.10,
        cacheWriteMultiplier: 1.00
    }
};

const MILLION = 1_000_000;

export const rateFor = (modelId) => RATE_CARD[modelId] || null;

// An unknown model id is not an error: modelSelection 'latest-flash' can resolve a generation that ships
// after this rate card was written. {usd: 0, unpriced: true} makes the tool print "unpriced model", which is
// the honest outcome — a fabricated rate would be worse than no rate.
export const costForUsage = (modelId, usage, card = 'charged') => {
    const rate = rateFor(modelId);
    if (!rate) return {usd: 0, unpriced: true};

    const rates = rate[card] || rate.charged;
    const inputTokens = usage?.inputTokens || 0;
    const outputTokens = usage?.outputTokens || 0;
    const cacheReadTokens = usage?.cacheReadTokens || 0;
    const cacheWriteTokens = usage?.cacheWriteTokens || 0;

    const usd = (inputTokens / MILLION) * rates.in
        + (outputTokens / MILLION) * rates.out
        + (cacheReadTokens / MILLION) * rates.in * rate.cacheReadMultiplier
        + (cacheWriteTokens / MILLION) * rates.in * (rate.cacheWriteMultiplier ?? 1);

    return {usd, unpriced: false};
};

export const describeRate = (modelId) => {
    const rate = rateFor(modelId);
    if (!rate) return `${modelId}: UNPRICED`;
    const sameCard = rate.charged.in === rate.list.in && rate.charged.out === rate.list.out;
    const charged = `$${rate.charged.in.toFixed(2)}/$${rate.charged.out.toFixed(2)}`;

    return sameCard ? `${charged} per 1M in/out` : `${charged} charged (list $${rate.list.in.toFixed(2)}/$${rate.list.out.toFixed(2)}) per 1M in/out`;
};
