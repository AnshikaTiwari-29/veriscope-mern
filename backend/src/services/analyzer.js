/**
 * VeriScope analyzer - a simple, explainable rule-based checker.
 * It looks for warning signs (clickbait, conspiracy words, ALL CAPS, "share now")
 * and trust signs (sources, quotes, careful wording) and turns them into a 0-100 score.
 */

const RULES = [
  { key: 'clickbait', label: 'Clickbait language', weight: -5, max: -20,
    words: ['shocking', "you won't believe", 'miracle', 'secret', 'exposed', 'unbelievable', 'bombshell', 'viral', 'leaked', 'doctors hate'] },
  { key: 'conspiracy', label: 'Conspiracy framing', weight: -8, max: -24,
    words: ["they don't want you to know", 'mainstream media', 'cover-up', 'cover up', 'wake up', 'big pharma', 'hoax', 'deep state', 'hiding the truth', 'do your own research'] },
  { key: 'absolute', label: 'Exaggerated claims', weight: -4, max: -12,
    words: ['100%', 'guaranteed', 'always', 'never', 'completely cures', 'cures', 'overnight', 'zero risk'] },
  { key: 'urgency', label: 'Pressure to share', weight: -7, max: -14,
    words: ['share this', 'share before', 'before it gets deleted', 'forward this', 'forward to all', 'spread the word'] },
  { key: 'sources', label: 'Cites sources', weight: 4, max: 20,
    words: ['according to', 'study', 'research', 'researchers', 'published in', 'data from', 'official', 'said in a statement', 'report', 'confirmed'] },
  { key: 'careful', label: 'Careful, balanced wording', weight: 2, max: 8,
    words: ['may', 'might', 'suggests', 'estimated', 'approximately', 'however', 'although', 'experts say'] },
];

const TRUSTED_DOMAINS = ['reuters.com', 'apnews.com', 'bbc.com', 'thehindu.com', 'who.int', 'nasa.gov', 'isro.gov.in', 'pib.gov.in', 'nature.com'];
const SATIRE_DOMAINS = ['theonion.com', 'babylonbee.com', 'fakingnews.com'];
const RISKY_ENDINGS = ['.xyz', '.top', '.buzz', '.click', '.info'];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const countMatches = (text, word) =>
  (text.match(new RegExp(`(?<![a-z0-9])${escape(word)}(?![a-z0-9])`, 'gi')) || []).length;

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function getVerdict(score) {
  if (score >= 75) return 'credible';
  if (score >= 55) return 'uncertain';
  if (score >= 35) return 'misleading';
  return 'false';
}

function analyze(text = '', url = '') {
  const content = String(text).replace(/[’]/g, "'");
  const signals = [];

  // 1. word rules
  for (const rule of RULES) {
    const found = rule.words.filter((w) => countMatches(content, w) > 0);
    if (!found.length) continue;
    const raw = rule.weight * found.length;
    const impact = rule.weight < 0 ? Math.max(raw, rule.max) : Math.min(raw, rule.max);
    signals.push({ key: rule.key, label: rule.label, impact, detail: `Found: ${found.map((f) => `"${f}"`).join(', ')}` });
  }

  // 2. writing style
  const words = content.split(/\s+/).filter(Boolean);
  const capsWords = words.filter((w) => w.length >= 4 && /[A-Z]/.test(w) && w === w.toUpperCase()).length;
  if (capsWords >= 2) signals.push({ key: 'caps', label: 'Too many CAPITAL letters', impact: -6, detail: `${capsWords} words written in ALL CAPS` });

  const exclamations = (content.match(/!/g) || []).length;
  if (exclamations >= 2) signals.push({ key: 'punctuation', label: 'Excessive exclamation marks', impact: -6, detail: `${exclamations} exclamation marks` });

  if (/["“][^"”]{10,}["”]/.test(content)) signals.push({ key: 'quotes', label: 'Includes direct quotes', impact: 4, detail: 'Quoted statements can be traced to a speaker' });

  if (words.length > 0 && words.length < 15) signals.push({ key: 'short', label: 'Very little context', impact: -4, detail: `Only ${words.length} words` });

  // 3. source website
  const domain = getDomain(url);
  let satire = false;
  if (domain) {
    if (TRUSTED_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) {
      signals.push({ key: 'domain', label: 'Trusted publisher', impact: 18, detail: `${domain} is a well-known reliable source` });
    } else if (SATIRE_DOMAINS.some((d) => domain.endsWith(d))) {
      satire = true;
      signals.push({ key: 'domain', label: 'Satire website', impact: -10, detail: `${domain} publishes jokes, not news` });
    } else if (RISKY_ENDINGS.some((e) => domain.endsWith(e))) {
      signals.push({ key: 'domain', label: 'Low-trust domain', impact: -10, detail: `${domain} uses a domain ending often used by spam sites` });
    } else if (/\.(gov|edu)(\.[a-z]{2})?$/.test(domain)) {
      signals.push({ key: 'domain', label: 'Official / academic website', impact: 12, detail: `${domain} is a government or education domain` });
    }
  }

  const score = Math.min(99, Math.max(1, 60 + signals.reduce((sum, s) => sum + s.impact, 0)));
  const verdict = satire ? 'satire' : getVerdict(score);
  const redFlags = signals.filter((s) => s.impact < 0).length;

  const summary =
    verdict === 'satire'
      ? 'This comes from a satire website. It is humour, not real news.'
      : redFlags === 0
        ? 'No major warning signs found. Still, confirm important facts with a second source.'
        : `Found ${redFlags} warning sign${redFlags > 1 ? 's' : ''}. Verify with a trusted source before sharing.`;

  signals.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  return { score, verdict, summary, signals, domain, wordCount: words.length };
}

/** Use the first sentence as a title when the user doesn't give one */
function makeTitle(text, url) {
  const clean = String(text || '').trim();
  let first = clean.split(/(?<=[.!?])\s/)[0];
  if (first.length < 20) first = clean; // e.g. "SHOCKING!!!" is too short to be a useful title
  if (first.length >= 3) return first.length > 80 ? `${first.slice(0, 77)}...` : first;
  return getDomain(url) ? `Check of ${getDomain(url)}` : 'Untitled check';
}

module.exports = { analyze, makeTitle, getDomain };
