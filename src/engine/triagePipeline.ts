import {
  Patient,
  PipelineOutput,
  RegressionModel,
  RiskTier,
  TriageResult,
  FunnelCounts,
  SimulatedBiomarkers,
  BiomarkerZone,
  AuditTrailItem
} from '../types';
import { evaluateOnHeldOut } from './evaluate';

// Deterministic seed-based pseudo random number generator for reproducible simulated biomarkers
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function stringToSeed(str: string, offset: number = 0): number {
  let hash = offset;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Fits Ordinary Least Squares regression for Expected MMSE = beta0 + betaAge * Age + betaEduc * Educ
 * using ONLY Nondemented cases from the DESIGN set.
 */
export function fitExpectedMMSERegression(designPatients: Patient[]): RegressionModel {
  // Collect all baseline/visit observations from Nondemented design patients
  const points: Array<{ age: number; educ: number; mmse: number }> = [];

  for (const p of designPatients) {
    if (p.group === 'Nondemented' || p.baselineCdr === 0) {
      for (const v of p.visits) {
        if (v.cdr === 0) {
          points.push({ age: v.age, educ: p.educ, mmse: v.mmse });
        }
      }
    }
  }

  // Fallback if small sample size (< 15 normal points)
  if (points.length < 15) {
    // Standard published clinical literature norm (Mungas 1996, Pedraza 2012)
    // MMSE baseline ~ 28.5, -0.05 per year of age, +0.22 per year of education
    return {
      beta0: 27.2,
      intercept: 27.2,
      betaAge: -0.045,
      betaEduc: 0.21,
      residualStd: 1.45,
      rmse: 1.45,
      sampleSize: points.length,
      rSquared: 0.38,
    };
  }

  const n = points.length;
  let sumAge = 0, sumEduc = 0, sumMmse = 0;
  let sumAge2 = 0, sumEduc2 = 0, sumAgeEduc = 0;
  let sumAgeMmse = 0, sumEducMmse = 0;

  for (const pt of points) {
    sumAge += pt.age;
    sumEduc += pt.educ;
    sumMmse += pt.mmse;
    sumAge2 += pt.age * pt.age;
    sumEduc2 += pt.educ * pt.educ;
    sumAgeEduc += pt.age * pt.educ;
    sumAgeMmse += pt.age * pt.mmse;
    sumEducMmse += pt.educ * pt.mmse;
  }

  // Centered sums of squares & cross products
  const sAgeAge = sumAge2 - (sumAge * sumAge) / n;
  const sEducEduc = sumEduc2 - (sumEduc * sumEduc) / n;
  const sAgeEduc = sumAgeEduc - (sumAge * sumEduc) / n;
  const sAgeMmse = sumAgeMmse - (sumAge * sumMmse) / n;
  const sEducMmse = sumEducMmse - (sumEduc * sumMmse) / n;

  const det = sAgeAge * sEducEduc - sAgeEduc * sAgeEduc;

  let betaAge = -0.05;
  let betaEduc = 0.20;

  if (Math.abs(det) > 1e-6) {
    betaAge = (sEducEduc * sAgeMmse - sAgeEduc * sEducMmse) / det;
    betaEduc = (sAgeAge * sEducMmse - sAgeEduc * sAgeMmse) / det;
  }

  const beta0 = (sumMmse - betaAge * sumAge - betaEduc * sumEduc) / n;

  // Calculate residuals and standard deviation
  let sumResidualSq = 0;
  let sumTotalSq = 0;
  const meanMmse = sumMmse / n;

  for (const pt of points) {
    const expected = beta0 + betaAge * pt.age + betaEduc * pt.educ;
    const residual = pt.mmse - expected;
    sumResidualSq += residual * residual;
    sumTotalSq += (pt.mmse - meanMmse) * (pt.mmse - meanMmse);
  }

  const residualStd = Math.max(0.8, Math.sqrt(sumResidualSq / Math.max(1, n - 3)));
  const rSquared = sumTotalSq > 0 ? Math.max(0, 1 - sumResidualSq / sumTotalSq) : 0.35;

  return {
    beta0: Math.round(beta0 * 1000) / 1000,
    intercept: Math.round(beta0 * 1000) / 1000,
    betaAge: Math.round(betaAge * 1000) / 1000,
    betaEduc: Math.round(betaEduc * 1000) / 1000,
    residualStd: Math.round(residualStd * 1000) / 1000,
    rmse: Math.round(residualStd * 1000) / 1000,
    sampleSize: n,
    rSquared: Math.round(rSquared * 1000) / 1000,
  };
}

/**
 * Splits subjects into DESIGN (~70%) and HELD_OUT (~30%) using a fixed reproducible seed
 */
export function partitionSubjects(patients: Patient[], seed: number = 42): { design: Patient[]; heldOut: Patient[] } {
  const sorted = [...patients].sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const design: Patient[] = [];
  const heldOut: Patient[] = [];

  sorted.forEach((p, idx) => {
    // Deterministic pseudo-random draw per subject
    const subSeed = stringToSeed(p.subjectId, seed);
    const r = pseudoRandom(subSeed + idx);
    if (r < 0.30 && heldOut.length < Math.floor(sorted.length * 0.35)) {
      p.isHeldOut = true;
      heldOut.push(p);
    } else {
      p.isHeldOut = false;
      design.push(p);
    }
  });

  // Guarantee at least 1 in each partition if array > 1
  if (heldOut.length === 0 && design.length > 1) {
    const moved = design.pop()!;
    moved.isHeldOut = true;
    heldOut.push(moved);
  }

  return { design, heldOut };
}

/**
 * Simulates plasma biomarkers (pTau217 & Amyloid 42/40) for Stage 2
 */
function simulateBiomarkersForPatient(patient: Patient, tier: RiskTier, seedOffset: number = 101): SimulatedBiomarkers {
  const seedVal = stringToSeed(patient.subjectId, seedOffset);
  const rand1 = pseudoRandom(seedVal);
  const rand2 = pseudoRandom(seedVal + 77);

  let pTau217Zone: BiomarkerZone;
  let amyloidRatioZone: BiomarkerZone;
  let pTau217Value: number;
  let amyloidRatioValue: number;

  if (tier === 'High') {
    // High tier: higher likelihood of Positive / Intermediate
    pTau217Zone = rand1 < 0.65 ? 'Positive' : rand1 < 0.90 ? 'Intermediate' : 'Negative';
    amyloidRatioZone = rand2 < 0.60 ? 'Positive' : rand2 < 0.88 ? 'Intermediate' : 'Negative';
  } else {
    // Medium tier: balanced / lower likelihood of Positive
    pTau217Zone = rand1 < 0.30 ? 'Positive' : rand1 < 0.65 ? 'Intermediate' : 'Negative';
    amyloidRatioZone = rand2 < 0.25 ? 'Positive' : rand2 < 0.60 ? 'Intermediate' : 'Negative';
  }

  // Simulated quantitative lab values
  if (pTau217Zone === 'Positive') {
    pTau217Value = Math.round((0.35 + rand1 * 0.45) * 1000) / 1000; // pg/mL elevated
  } else if (pTau217Zone === 'Intermediate') {
    pTau217Value = Math.round((0.20 + rand1 * 0.14) * 1000) / 1000;
  } else {
    pTau217Value = Math.round((0.08 + rand1 * 0.11) * 1000) / 1000; // normal
  }

  if (amyloidRatioZone === 'Positive') {
    amyloidRatioValue = Math.round((0.065 + rand2 * 0.015) * 1000) / 1000; // abnormal low ratio
  } else if (amyloidRatioZone === 'Intermediate') {
    amyloidRatioValue = Math.round((0.082 + rand2 * 0.012) * 1000) / 1000;
  } else {
    amyloidRatioValue = Math.round((0.096 + rand2 * 0.025) * 1000) / 1000; // normal ratio
  }

  let concern = 0.2;
  if (pTau217Zone === 'Positive') concern += 0.45;
  else if (pTau217Zone === 'Intermediate') concern += 0.20;

  if (amyloidRatioZone === 'Positive') concern += 0.35;
  else if (amyloidRatioZone === 'Intermediate') concern += 0.15;

  concern = Math.min(1.0, Math.max(0.0, concern));

  return {
    pTau217Zone,
    pTau217Value,
    amyloidRatioZone,
    amyloidRatioValue,
    biomarkerConcernScore: Math.round(concern * 100) / 100,
  };
}

/**
 * Runs the full 4-stage explainable triage pipeline on a patient list
 */
export function runTriagePipeline(
  patients: Patient[],
  regressionModel?: RegressionModel,
  splitSeed: number = 42
): PipelineOutput {
  const { design, heldOut } = partitionSubjects(patients, splitSeed);
  const model = regressionModel || fitExpectedMMSERegression(design);

  const results: TriageResult[] = [];
  const funnel: FunnelCounts = {
    totalPatients: patients.length,
    stage1Input: patients.length,
    stage1LowRiskExit: 0,
    stage2Input: 0,
    stage2ReassuringHold: 0,
    stage3Input: 0,
    stage3MediumToHighUpgrade: 0,
    stage4Input: 0,
    stage4ConfirmatoryEligible: 0,
    stage4ImagingBudgetSlots: 0,
  };

  for (const patient of patients) {
    const auditTrail: AuditTrailItem[] = [];
    const reasoningParts: string[] = [];

    // STAGE 1: Cognitive Screening (Real OASIS-2 Data)
    const expectedMmse = model.beta0 + model.betaAge * patient.latestAge + model.betaEduc * patient.educ;
    const residual = patient.latestMmse - expectedMmse;
    const residualZ = residual / model.residualStd;

    let initialTier: RiskTier = 'Low';
    if (residualZ < -2.0) {
      initialTier = 'High';
    } else if (residualZ < -1.0) {
      initialTier = 'Medium';
    }

    const mmseDeclineExceedsRef = patient.hasMultipleVisits && patient.mmseSlope <= -1.68;
    let tierAfterSlope = initialTier;

    auditTrail.push({
      stage: 'Stage 1 — Cognitive Screening',
      action: `Calculated expected MMSE = ${expectedMmse.toFixed(1)} (Actual: ${patient.latestMmse}, Residual: ${residual.toFixed(1)}, z = ${residualZ.toFixed(2)}). Initial tier: ${initialTier}.`,
      reason: `Education-adjusted model baseline (${patient.educ} yrs educ, Age ${patient.latestAge}).`,
      isSimulated: false,
    });

    if (initialTier === 'Low' && mmseDeclineExceedsRef) {
      tierAfterSlope = 'Medium';
      auditTrail.push({
        stage: 'Stage 1 — Trajectory Escalation',
        action: 'Upgraded risk tier from Low to Medium.',
        reason: `MMSE decline rate of ${patient.mmseSlope.toFixed(2)} pts/year exceeds research reference threshold (-1.68 pts/yr).`,
        isSimulated: false,
      });
      reasoningParts.push(`MMSE slope of ${patient.mmseSlope.toFixed(2)} pts/yr exceeds -1.68 threshold (upgraded to Medium tier)`);
    } else {
      if (Math.abs(residual) >= 1.0) {
        reasoningParts.push(`MMSE is ${Math.abs(residual).toFixed(1)} pts ${residual < 0 ? 'below' : 'above'} age/education norm (z = ${residualZ.toFixed(2)})`);
      } else {
        reasoningParts.push(`MMSE is within expected age/education range (${patient.latestMmse} vs ${expectedMmse.toFixed(1)} expected)`);
      }
    }

    const exitedStage1 = tierAfterSlope === 'Low';
    if (exitedStage1) {
      funnel.stage1LowRiskExit++;
    }

    const stage1Result = {
      expectedMmse: Math.round(expectedMmse * 10) / 10,
      residual: Math.round(residual * 10) / 10,
      residualZ: Math.round(residualZ * 100) / 100,
      initialTier,
      mmseSlope: Math.round(patient.mmseSlope * 100) / 100,
      mmseDeclineExceedsRef,
      tierAfterSlope,
      exitedStage1,
    };

    // If exited Stage 1, record low risk result and exit
    if (exitedStage1) {
      const severityScore = Math.max(0.1, Math.min(2.1, 1.0 + (-residualZ) * 0.25));
      const urgencyScore = Math.max(0.1, Math.min(2.1, 1.0 + Math.max(0, -patient.mmseSlope) * 0.2));
      const priorityScore = Math.round(severityScore * urgencyScore * 100) / 100;

      results.push({
        subjectId: patient.subjectId,
        patient,
        isHeldOut: patient.isHeldOut,
        stage1: stage1Result,
        status: 'EXIT_STAGE1_LOW_RISK',
        clinicalRiskTier: 'Low',
        clinicalRiskScore: Math.round(Math.max(5, Math.min(25, 15 + residualZ * 10))),
        severityComponent: Math.round(severityScore * 100) / 100,
        urgencyComponent: Math.round(urgencyScore * 100) / 100,
        priorityScore,
        reasoningString: reasoningParts.join('; ') + '. Cleared at Stage 1 (Low Risk).',
        auditTrail,
        groundTruthPositive: patient.latestCdr >= 0.5 || patient.group === 'Demented' || patient.group === 'Converted',
        classificationCategory: 'Low_Risk_Exit',
      });
      continue;
    }

    // STAGE 2: Simulated Blood Biomarkers (Clearly Labeled Simulated)
    funnel.stage2Input++;
    const biomarkers = simulateBiomarkersForPatient(patient, tierAfterSlope, 303);
    const bothNegative = biomarkers.pTau217Zone === 'Negative' && biomarkers.amyloidRatioZone === 'Negative';
    const heldAtStage2 = bothNegative;

    auditTrail.push({
      stage: 'Stage 2 — Plasma Biomarkers (Simulated)',
      action: `Evaluated simulated pTau217 (${biomarkers.pTau217Zone}) and Amyloid 42/40 (${biomarkers.amyloidRatioZone}).`,
      reason: heldAtStage2
        ? 'Reassuring biomarker profile: both markers negative. Patient held at Stage 2 (does not proceed to MRI review).'
        : `Biomarker concern score: ${(biomarkers.biomarkerConcernScore * 100).toFixed(0)}%. Escalated to Stage 3 MRI review.`,
      isSimulated: true,
    });

    reasoningParts.push(`Simulated biomarkers: pTau217 is ${biomarkers.pTau217Zone}, Aβ42/40 is ${biomarkers.amyloidRatioZone}`);

    const stage2Result = {
      biomarkers,
      heldAtStage2,
      proceedToStage3: !heldAtStage2,
    };

    if (heldAtStage2) {
      funnel.stage2ReassuringHold++;
      const severityScore = Math.max(0.1, Math.min(2.1, 1.0 + (-residualZ) * 0.35));
      const urgencyScore = Math.max(0.1, Math.min(2.1, 0.8));
      const priorityScore = Math.round(severityScore * urgencyScore * 100) / 100;

      results.push({
        subjectId: patient.subjectId,
        patient,
        isHeldOut: patient.isHeldOut,
        stage1: stage1Result,
        stage2: stage2Result,
        status: 'HELD_STAGE2_BIOMARKERS_REASSURING',
        clinicalRiskTier: tierAfterSlope,
        clinicalRiskScore: Math.round(Math.max(20, Math.min(45, 30 + (-residualZ) * 10))),
        severityComponent: Math.round(severityScore * 100) / 100,
        urgencyComponent: Math.round(urgencyScore * 100) / 100,
        priorityScore,
        reasoningString: reasoningParts.join('; ') + '. Held at Stage 2 due to reassuring blood biomarker profile.',
        auditTrail,
        groundTruthPositive: patient.latestCdr >= 0.5 || patient.group === 'Demented' || patient.group === 'Converted',
        classificationCategory: 'Reassuring_Hold',
      });
      continue;
    }

    // STAGE 3: MRI Evaluation (Real OASIS-2 Data)
    funnel.stage3Input++;
    const nwbvDeclineExceedsRef = patient.hasMultipleVisits && patient.nwbvSlope <= -0.010;
    let finalTier = tierAfterSlope;
    let tierUpgraded = false;

    if (tierAfterSlope === 'Medium' && nwbvDeclineExceedsRef) {
      finalTier = 'High';
      tierUpgraded = true;
      funnel.stage3MediumToHighUpgrade++;
      auditTrail.push({
        stage: 'Stage 3 — MRI Morphometry (Real)',
        action: 'Upgraded tier from Medium to High.',
        reason: `Annualized brain volume loss (nWBV slope = ${patient.nwbvSlope.toFixed(4)}/yr) exceeds research reference (-0.010/yr).`,
        isSimulated: false,
      });
      reasoningParts.push(`Accelerated whole-brain volume loss (${patient.nwbvSlope.toFixed(4)}/yr vs -0.010 ref) escalated tier to High`);
    } else {
      auditTrail.push({
        stage: 'Stage 3 — MRI Morphometry (Real)',
        action: `Current nWBV = ${patient.latestNwbv.toFixed(3)}, slope = ${patient.nwbvSlope.toFixed(4)}/yr. Tier remains ${finalTier}.`,
        reason: 'Structural volumetric evaluation consistent with risk profile.',
        isSimulated: false,
      });
      if (patient.hasMultipleVisits) {
        reasoningParts.push(`nWBV slope is ${patient.nwbvSlope.toFixed(4)}/yr (Current nWBV: ${patient.latestNwbv.toFixed(3)})`);
      }
    }

    const stage3Result = {
      nwbvSlope: Math.round(patient.nwbvSlope * 10000) / 10000,
      nwbvDeclineExceedsRef,
      tierUpgraded,
      finalTier,
    };

    // STAGE 4: Confirmatory Evaluation Eligibility (Simulated / Rule-based)
    funnel.stage4Input++;
    const declineExceeds = mmseDeclineExceedsRef || nwbvDeclineExceedsRef || patient.latestMmse <= 24;
    const biomarkerHighConcern = biomarkers.biomarkerConcernScore >= 0.55;
    const eligibleForConfirmatory = finalTier === 'High' && biomarkerHighConcern && declineExceeds;

    if (eligibleForConfirmatory) {
      funnel.stage4ConfirmatoryEligible++;
    }

    auditTrail.push({
      stage: 'Stage 4 — Confirmatory Pathway Referral',
      action: eligibleForConfirmatory ? 'Flagged as eligible for confirmatory evaluation (referral suggested).' : 'Not currently flagged for priority confirmatory evaluation.',
      reason: eligibleForConfirmatory
        ? 'High clinical risk tier + elevated biomarker score + longitudinal rate of decline exceeding research references.'
        : 'Does not meet combined biomarker concern and rapid progression criteria.',
      isSimulated: true,
    });

    if (eligibleForConfirmatory) {
      reasoningParts.push('Qualifies for confirmatory diagnostic pathway referral');
    }

    // PRIORITY RANKING LAYER (Multiplicative Severity * Urgency)
    // Severity: MMSE residual deficit + current nWBV atrophy
    const residualSeverity = Math.max(0, -residualZ) * 0.40;
    const volumeSeverity = Math.max(0, (0.76 - patient.latestNwbv) * 5.0);
    const severityComponent = Math.min(2.1, Math.max(0.1, 0.8 + residualSeverity + volumeSeverity));

    // Urgency: rate of MMSE loss + rate of nWBV loss
    const mmseUrgency = Math.max(0, -patient.mmseSlope) * 0.35;
    const nwbvUrgency = Math.max(0, -patient.nwbvSlope * 60);
    const urgencyComponent = Math.min(2.1, Math.max(0.1, 0.8 + mmseUrgency + nwbvUrgency));

    // Priority Score = Severity * Urgency (MULTIPLICATIVE)
    const priorityScore = Math.round(severityComponent * urgencyComponent * 100) / 100;

    // Clinical Risk Score (0 - 100%)
    let baseRisk = finalTier === 'High' ? 75 : 45;
    baseRisk += (-residualZ) * 6;
    if (biomarkers.biomarkerConcernScore > 0.6) baseRisk += 10;
    const clinicalRiskScore = Math.min(99, Math.max(20, Math.round(baseRisk)));

    const groundTruthPositive = patient.latestCdr >= 0.5 || patient.group === 'Demented' || patient.group === 'Converted';
    let classificationCategory: 'True_Positive' | 'False_Positive' | 'True_Negative' | 'False_Negative' | 'Reassuring_Hold' | 'Low_Risk_Exit';

    if (eligibleForConfirmatory || finalTier === 'High') {
      classificationCategory = groundTruthPositive ? 'True_Positive' : 'False_Positive';
    } else {
      classificationCategory = groundTruthPositive ? 'False_Negative' : 'True_Negative';
    }

    results.push({
      subjectId: patient.subjectId,
      patient,
      isHeldOut: patient.isHeldOut,
      stage1: stage1Result,
      stage2: stage2Result,
      stage3: stage3Result,
      stage4: {
        eligibleForConfirmatory,
        referralSuggested: eligibleForConfirmatory,
        prioritySlotAllocated: false, // will allocate based on budget ranking
      },
      status: eligibleForConfirmatory ? 'STAGE4_CONFIRMATORY_ELIGIBLE' : 'STAGE3_PASSED',
      clinicalRiskTier: finalTier,
      clinicalRiskScore,
      severityComponent: Math.round(severityComponent * 100) / 100,
      urgencyComponent: Math.round(urgencyComponent * 100) / 100,
      priorityScore,
      reasoningString: reasoningParts.join('; ') + '.',
      auditTrail,
      groundTruthPositive,
      classificationCategory,
    });
  }

  // Sort active results by Priority Score to assign global Priority Rank
  const sortedByPriority = [...results].sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Imaging budget allocation: top 25% or up to 6 slots
  const budgetCap = Math.max(2, Math.round(results.length * 0.25));
  funnel.stage4ImagingBudgetSlots = budgetCap;

  sortedByPriority.forEach((res, rankIdx) => {
    res.priorityRank = rankIdx + 1;
    if (res.stage4 && rankIdx < budgetCap && res.stage4.eligibleForConfirmatory) {
      res.stage4.prioritySlotAllocated = true;
    }
  });

  // Calculate live held-out validation metrics
  const evaluation = evaluateOnHeldOut(results);

  return {
    results,
    funnel,
    regressionModel: model,
    regression: model,
    evaluation,
    isSyntheticData: patients.some(p => p.subjectId.startsWith('SYN_')),
    dataSourceName: patients.some(p => p.subjectId.startsWith('SYN_'))
      ? 'Synthetic Demo OASIS-2 Sample'
      : 'OASIS-2 Longitudinal MRI Dataset (Marcus et al.)',
    totalRecordsCount: patients.reduce((acc, p) => acc + p.visits.length, 0),
    splitSeed,
  };
}
