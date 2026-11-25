// Run with: npm run seed   -> creates an admin, a demo user and a few sample checks
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const { analyze, makeTitle } = require('../services/analyzer');

const samples = [
  { category: 'health', content: "SHOCKING!!! Doctors don't want you to know this MIRACLE drink that completely cures diabetes overnight. Big Pharma is hiding the truth. Share this before it gets deleted!!!" },
  { category: 'science', inputType: 'url', sourceUrl: 'https://www.isro.gov.in/chandrayaan3', content: 'Chandrayaan-3 landed near the lunar south pole, according to ISRO. Officials said in a statement that the rover will run experiments for approximately 14 days.' },
  { category: 'technology', content: '5G towers are spreading the virus and the mainstream media is running a cover-up. Wake up and forward this to all groups!' },
  { category: 'business', content: "India's GDP grew 7.8 percent in the April-June quarter, data from the Ministry of Statistics showed. However, economists said rural demand remains uneven." },
  { category: 'entertainment', inputType: 'url', sourceUrl: 'https://www.theonion.com/area-man', content: 'Area man stuns family by reading entire article before sharing it.' },
  { category: 'politics', content: 'Voting machines were 100% hacked in every state, guaranteed.' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Analysis.deleteMany()]);

  await User.create({ name: 'Admin', email: 'admin@veriscope.dev', password: 'Admin@12345', role: 'admin' });
  const demo = await User.create({ name: 'Riya Sharma', email: 'demo@veriscope.dev', password: 'Demo@12345' });

  for (const s of samples) {
    const r = analyze(s.content, s.sourceUrl);
    await Analysis.create({
      ...s,
      title: makeTitle(s.content, s.sourceUrl),
      score: r.score,
      verdict: r.verdict,
      summary: r.summary,
      signals: r.signals,
      createdBy: demo._id,
    });
  }

  console.log('Seeded! Login with demo@veriscope.dev / Demo@12345 or admin@veriscope.dev / Admin@12345');
  await mongoose.disconnect();
})();
