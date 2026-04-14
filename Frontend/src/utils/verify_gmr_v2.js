/**
 * Verification Script for GMR Pro V2 Logic
 */

const TOTAL_CANDIDATES = 25000;

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
  
  return { gmr: predictedGMR, readiness: totalReadiness };
};

const profiles = [
  { name: "Elite (98% Acc, 6k MCQs, 20 streak, 0 weak)", stats: { avgAccuracy: 98, totalMCQs: 6000, streak: 20, weakSubjects: [] } },
  { name: "Strong (90% Acc, 3k MCQs, 15 streak, 0 weak)", stats: { avgAccuracy: 90, totalMCQs: 3000, streak: 15, weakSubjects: [] } },
  { name: "Unbalanced (90% Acc, 3k MCQs, 15 streak, 3 weak)", stats: { avgAccuracy: 90, totalMCQs: 3000, streak: 15, weakSubjects: ["Math", "Eng", "Coding"] } },
  { name: "Beginner (60% Acc, 500 MCQs, 2 streak, 5 weak)", stats: { avgAccuracy: 60, totalMCQs: 500, streak: 2, weakSubjects: ["A", "B", "C", "D", "E"] } }
];

console.log("--- GMR PRO V2 SIMULATION RESULTS ---");
profiles.forEach(p => {
  const res = calculateWBJECAReadiness(p.stats);
  console.log(`${p.name} => Readiness: ${res.readiness}%, GMR: #${res.gmr}`);
});
