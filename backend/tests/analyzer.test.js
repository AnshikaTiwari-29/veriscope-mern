const { analyze, makeTitle } = require('../src/services/analyzer');

describe('VeriScope analyzer', () => {
  test('flags an obvious hoax as false', () => {
    const r = analyze("SHOCKING!!! They don't want you to know this MIRACLE cure. Share before it gets deleted!!!");
    expect(r.verdict).toBe('false');
    expect(r.score).toBeLessThan(35);
  });

  test('rates sourced reporting from a trusted site as credible', () => {
    const r = analyze(
      'According to a study published in Nature, researchers found the rate fell by approximately 20 percent. However, experts say more data is needed.',
      'https://www.nature.com/articles/x'
    );
    expect(r.verdict).toBe('credible');
  });

  test('detects satire websites', () => {
    expect(analyze('Area man reads whole article before sharing it.', 'https://theonion.com/x').verdict).toBe('satire');
  });

  test('score always stays between 1 and 99', () => {
    const r = analyze('WAKE UP!!! HOAX! COVER-UP! BIG PHARMA! DEEP STATE! SHARE THIS! 100% GUARANTEED!!!');
    expect(r.score).toBeGreaterThanOrEqual(1);
    expect(r.score).toBeLessThanOrEqual(99);
  });

  test('makes a title from the first sentence', () => {
    expect(makeTitle('Hello world, this is the first. Second sentence.')).toBe('Hello world, this is the first.');
  });
});
