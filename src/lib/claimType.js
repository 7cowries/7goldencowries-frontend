const SUBSCRIPTION_KEYWORDS = ['subscription', 'subscribe', 'subscriber'];
const REFERRAL_KEYWORDS = ['referral', 'refer', 'invite', 'invitation', 'referrer'];

function pushValue(acc, value) {
  if (value == null) return;
  if (Array.isArray(value)) {
    value.forEach((entry) => pushValue(acc, entry));
    return;
  }
  if (typeof value === 'object') {
    Object.values(value).forEach((entry) => pushValue(acc, entry));
    return;
  }
  const text = String(value).trim().toLowerCase();
  if (text) acc.push(text);
}

export function detectSpecialClaimType(quest) {
  if (!quest || typeof quest !== 'object') return null;
  const haystack = [];

  pushValue(haystack, quest.claimType);
  pushValue(haystack, quest.claim_type);
  pushValue(haystack, quest?.claim?.type);
  pushValue(haystack, quest?.action?.type);
  pushValue(haystack, quest?.actionType);
  pushValue(haystack, quest?.action?.category);
  pushValue(haystack, quest.requirement);
  pushValue(haystack, quest.requirement_type);
  pushValue(haystack, quest.requirementType);
  pushValue(haystack, quest.requirements);
  pushValue(haystack, quest.gate);
  pushValue(haystack, quest.slug);
  pushValue(haystack, quest.code);
  pushValue(haystack, quest.type);
  pushValue(haystack, quest.title);
  pushValue(haystack, quest.tags);

  const isSubscription = haystack.some((entry) =>
    SUBSCRIPTION_KEYWORDS.some((keyword) => entry.includes(keyword))
  );
  if (isSubscription) return 'subscription';

  const isReferral = haystack.some((entry) =>
    REFERRAL_KEYWORDS.some((keyword) => entry.includes(keyword))
  );
  if (isReferral) return 'referral';

  return null;
}

export default detectSpecialClaimType;
