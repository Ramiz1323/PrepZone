/**
 * Verification Script for GMR Pro V2 Logic with Proximity
 */

const TOTAL_CANDIDATES = 25000;

const COLLEGES = [
  { name: 'Jadavpur University (JU)', cutoff: 30, minCutoff: 1 },
  { name: 'Techno Main Salt Lake', cutoff: 3500, minCutoff: 2500 },
  { name: 'Techno India Hooghly', cutoff: 5500, minCutoff: 3000 }
];

const calculateWBJECAReadiness = (stats) => {
  const { avgAccuracy = 0, totalMCQs = 0, streak = 0, weakSubjects = [] } = stats;

  const accScore = Math.pow(avgAccuracy / 100, 3) * 70;
  const volScore = Math.min(totalMCQs / 5000, 1) * 20;
  const streakScore = Math.min(streak / 15, 1) * 10;

  let baseReadiness = accScore + volScore + streakScore;
  const penaltyMultiplier = Math.max(0.75, 1 - (weakSubjects.length * 0.05));
  const totalReadiness = Math.max(0, Math.round(baseReadiness * penaltyMultiplier));

  const percentile = totalReadiness / 100;
  let predictedGMR = Math.round(TOTAL_CANDIDATES * Math.pow(1 - percentile, 2.2));
  
  const collegeMatches = COLLEGES.map(college => {
    let probability = 0;
    if (predictedGMR <= college.cutoff) {
        probability = 50; // Just a dummy for sim
    } else {
      const distance = predictedGMR - college.cutoff;
      const maxPossibleDistance = TOTAL_CANDIDATES - college.cutoff;
      const proximityFactor = 1 - (distance / maxPossibleDistance);
      probability = 2 + (Math.pow(proximityFactor, 2) * 23);
    }
    return { name: college.name, prob: probability.toFixed(1) + "%" };
  });

  return { gmr: predictedGMR, colleges: collegeMatches };
};

const user = { name: "Current User", stats: { avgAccuracy: 60, totalMCQs: 257, streak: 0, weakSubjects: ["A", "B", "C"] } };

const res = calculateWBJECAReadiness(user.stats);
console.log(`User Rank: #${res.gmr}`);
res.colleges.forEach(c => console.log(` - ${c.name}: Line Width ${c.prob}`));
