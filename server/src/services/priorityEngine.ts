import { ComplaintPriority } from '../models/Complaint';

export interface PriorityEvaluationResult {
  priority: ComplaintPriority;
  score: number; // 0 to 100
  reason: string;
  factors: {
    safetyRisk: number; // 0-30
    publicHealthRisk: number; // 0-25
    trafficDisruption: number; // 0-20
    recurrenceBonus: number; // 0-15
    populationDensity: number; // 0-10
  };
}

export const calculateComplaintPriority = (params: {
  category: string;
  title: string;
  description: string;
  landmark?: string;
  address: string;
  nearbyReportCount?: number;
  reportedSeverity?: string;
}): PriorityEvaluationResult => {
  const { category, title, description, landmark = '', address = '', nearbyReportCount = 0, reportedSeverity } = params;

  let safetyRisk = 10;
  let publicHealthRisk = 5;
  let trafficDisruption = 5;
  let recurrenceBonus = Math.min(nearbyReportCount * 3, 15);
  let populationDensity = 5;

  const textToScan = `${title} ${description} ${landmark} ${address}`.toLowerCase();

  // Category based baseline
  switch (category) {
    case 'Streetlight & Electrical':
      safetyRisk += 15;
      if (textToScan.includes('wire') || textToScan.includes('shock') || textToScan.includes('spark') || textToScan.includes('exposed')) {
        safetyRisk = 30; // Max safety risk
      }
      break;

    case 'Roads & Potholes':
      trafficDisruption += 12;
      safetyRisk += 8;
      if (textToScan.includes('deep') || textToScan.includes('accident') || textToScan.includes('cave-in') || textToScan.includes('crater')) {
        safetyRisk += 10;
        trafficDisruption = 20;
      }
      break;

    case 'Drainage & Sewerage':
      publicHealthRisk += 15;
      safetyRisk += 5;
      if (textToScan.includes('manhole') || textToScan.includes('open') || textToScan.includes('fall')) {
        safetyRisk = 28; // Open manhole is lethal
      }
      break;

    case 'Water Leakage & Supply':
      publicHealthRisk += 10;
      trafficDisruption += 8;
      if (textToScan.includes('burst') || textToScan.includes('flood') || textToScan.includes('main')) {
        trafficDisruption += 7;
      }
      break;

    case 'Garbage & Sanitation':
      publicHealthRisk += 18;
      break;

    case 'Public Safety & Parks':
      safetyRisk += 14;
      break;
  }

  // High density / Sensitive zone triggers
  if (
    textToScan.includes('school') ||
    textToScan.includes('hospital') ||
    textToScan.includes('market') ||
    textToScan.includes('junction') ||
    textToScan.includes('station') ||
    textToScan.includes('highway') ||
    textToScan.includes('main road')
  ) {
    populationDensity = 10;
    trafficDisruption = Math.min(trafficDisruption + 5, 20);
  }

  // Reported severity weight
  if (reportedSeverity === 'Critical') {
    safetyRisk = Math.min(safetyRisk + 5, 30);
  } else if (reportedSeverity === 'High') {
    safetyRisk = Math.min(safetyRisk + 3, 30);
  }

  // Cap factors
  safetyRisk = Math.min(Math.max(safetyRisk, 0), 30);
  publicHealthRisk = Math.min(Math.max(publicHealthRisk, 0), 25);
  trafficDisruption = Math.min(Math.max(trafficDisruption, 0), 20);
  recurrenceBonus = Math.min(Math.max(recurrenceBonus, 0), 15);
  populationDensity = Math.min(Math.max(populationDensity, 0), 10);

  const totalScore = safetyRisk + publicHealthRisk + trafficDisruption + recurrenceBonus + populationDensity;

  let priority: ComplaintPriority = 'Low';
  let reason = '';

  if (totalScore >= 80 || safetyRisk >= 28) {
    priority = 'Critical';
    reason = `Critical risk detected (Score ${totalScore}/100): High hazard to public life or critical infrastructure safety risk (${safetyRisk}/30). Immediate municipal intervention required.`;
  } else if (totalScore >= 60) {
    priority = 'High';
    reason = `Elevated risk priority (Score ${totalScore}/100): Significant traffic disruption (${trafficDisruption}/20) and public health/safety impact (${safetyRisk + publicHealthRisk}/55).`;
  } else if (totalScore >= 35) {
    priority = 'Medium';
    reason = `Standard civic priority (Score ${totalScore}/100): Routine maintenance issue affecting neighborhood convenience.`;
  } else {
    priority = 'Low';
    reason = `Non-urgent civic issue (Score ${totalScore}/100): Minor wear or cosmetic inconvenience scheduled under regular municipal cycle.`;
  }

  return {
    priority,
    score: totalScore,
    reason,
    factors: {
      safetyRisk,
      publicHealthRisk,
      trafficDisruption,
      recurrenceBonus,
      populationDensity
    }
  };
};
