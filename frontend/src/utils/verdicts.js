export const VERDICTS = {
  credible: { label: 'Likely Credible', color: '#22c55e' },
  uncertain: { label: 'Needs Verification', color: '#f59e0b' },
  misleading: { label: 'Likely Misleading', color: '#f97316' },
  false: { label: 'Likely False', color: '#ef4444' },
  satire: { label: 'Satire', color: '#a855f7' },
};

export const CATEGORIES = ['politics', 'health', 'science', 'technology', 'business', 'sports', 'entertainment', 'other'];

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
