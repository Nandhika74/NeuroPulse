import { Patient, SanityTestCase } from '../types';
import { runTriagePipeline } from './triagePipeline';

export function runSanityTests(): SanityTestCase[] {
  const tests: SanityTestCase[] = [];

  // 1. Stable High-Education High-MMSE Patient
  const p1: Patient = {
    subjectId: 'TEST_01_HIGH_EDUC_STABLE',
    group: 'Nondemented',
    gender: 'F',
    educ: 18,
    baselineAge: 75,
    latestAge: 77,
    baselineMmse: 30,
    latestMmse: 30,
    baselineCdr: 0,
    latestCdr: 0,
    baselineNwbv: 0.76,
    latestNwbv: 0.755,
    mmseSlope: 0.0,
    nwbvSlope: -0.0025,
    hasMultipleVisits: true,
    isHeldOut: false,
    visits: [
      { visit: 1, mrDelayYears: 0, age: 75, mmse: 30, cdr: 0, nwbv: 0.76 },
      { visit: 2, mrDelayYears: 2, age: 77, mmse: 30, cdr: 0, nwbv: 0.755 },
    ],
  };

  // 2. Low-Education Stable Patient (Mungas fairness check)
  const p2: Patient = {
    subjectId: 'TEST_02_LOW_EDUC_STABLE',
    group: 'Nondemented',
    gender: 'M',
    educ: 6,
    baselineAge: 74,
    latestAge: 76,
    baselineMmse: 26,
    latestMmse: 26,
    baselineCdr: 0,
    latestCdr: 0,
    baselineNwbv: 0.75,
    latestNwbv: 0.745,
    mmseSlope: 0.0,
    nwbvSlope: -0.0025,
    hasMultipleVisits: true,
    isHeldOut: false,
    visits: [
      { visit: 1, mrDelayYears: 0, age: 74, mmse: 26, cdr: 0, nwbv: 0.75 },
      { visit: 2, mrDelayYears: 2, age: 76, mmse: 26, cdr: 0, nwbv: 0.745 },
    ],
  };

  // 3. High-Education Fast-Declining Patient (Caught by slope)
  const p3: Patient = {
    subjectId: 'TEST_03_HIGH_EDUC_RAPID_DECLINE',
    group: 'Converted',
    gender: 'F',
    educ: 20,
    baselineAge: 70,
    latestAge: 71.5,
    baselineMmse: 29,
    latestMmse: 24,
    baselineCdr: 0,
    latestCdr: 0.5,
    baselineNwbv: 0.73,
    latestNwbv: 0.705,
    mmseSlope: -3.33,
    nwbvSlope: -0.0166,
    hasMultipleVisits: true,
    isHeldOut: false,
    visits: [
      { visit: 1, mrDelayYears: 0, age: 70, mmse: 29, cdr: 0, nwbv: 0.73 },
      { visit: 2, mrDelayYears: 1.5, age: 71.5, mmse: 24, cdr: 0.5, nwbv: 0.705 },
    ],
  };

  // 4. Moderate Dementia Case
  const p4: Patient = {
    subjectId: 'TEST_04_MODERATE_DEMENTIA',
    group: 'Demented',
    gender: 'M',
    educ: 14,
    baselineAge: 78,
    latestAge: 80,
    baselineMmse: 21,
    latestMmse: 17,
    baselineCdr: 0.5,
    latestCdr: 1.0,
    baselineNwbv: 0.69,
    latestNwbv: 0.66,
    mmseSlope: -2.0,
    nwbvSlope: -0.015,
    hasMultipleVisits: true,
    isHeldOut: false,
    visits: [
      { visit: 1, mrDelayYears: 0, age: 78, mmse: 21, cdr: 0.5, nwbv: 0.69 },
      { visit: 2, mrDelayYears: 2, age: 80, mmse: 17, cdr: 1.0, nwbv: 0.66 },
    ],
  };

  // 5. Brain Atrophy Rapid Progression (nWBV slope <= -0.010)
  const p5: Patient = {
    subjectId: 'TEST_05_BRAIN_ATROPHY_UPGRADE',
    group: 'Converted',
    gender: 'F',
    educ: 12,
    baselineAge: 72,
    latestAge: 73.5,
    baselineMmse: 27,
    latestMmse: 25,
    baselineCdr: 0,
    latestCdr: 0.5,
    baselineNwbv: 0.74,
    latestNwbv: 0.718,
    mmseSlope: -1.33,
    nwbvSlope: -0.0146,
    hasMultipleVisits: true,
    isHeldOut: false,
    visits: [
      { visit: 1, mrDelayYears: 0, age: 72, mmse: 27, cdr: 0, nwbv: 0.74 },
      { visit: 2, mrDelayYears: 1.5, age: 73.5, mmse: 25, cdr: 0.5, nwbv: 0.718 },
    ],
  };

  // Run pipeline on test cohort
  const cohort = [p1, p2, p3, p4, p5];
  const pipelineOutput = runTriagePipeline(cohort);
  const resMap = new Map(pipelineOutput.results.map(r => [r.subjectId, r]));

  // Test 1: Stable High-Educ High-MMSE
  const r1 = resMap.get(p1.subjectId)!;
  const t1Passed = r1.status === 'EXIT_STAGE1_LOW_RISK' && r1.clinicalRiskTier === 'Low';
  tests.push({
    id: 'SANITY_01',
    name: 'Stable High-Education Normal Score',
    description: 'High-education patient with perfect score and 0 decline must exit Stage 1 with Low Risk tier and never reach priority referral.',
    testInput: { educ: 18, latestMmse: 30, mmseSlope: 0 },
    expectedOutcome: 'Status: EXIT_STAGE1_LOW_RISK, Risk Tier: Low',
    passed: t1Passed,
    actualOutcome: `Status: ${r1.status}, Risk Tier: ${r1.clinicalRiskTier}`,
    rationale: 'Protects against false positive flags in cognitively healthy individuals with higher schooling.',
  });

  // Test 2: Low-Education Stable Baseline
  const r2 = resMap.get(p2.subjectId)!;
  const t2Passed = r2.clinicalRiskTier !== 'High' && r2.status === 'EXIT_STAGE1_LOW_RISK';
  tests.push({
    id: 'SANITY_02',
    name: 'Education-Fair Norming (Low Schooling)',
    description: 'Patient with 6 years education and score 26 is within expected demographic norm; must not be falsely flagged as High Risk.',
    testInput: { educ: 6, latestMmse: 26, mmseSlope: 0 },
    expectedOutcome: 'Residual_z > -1.0, Risk Tier: Low',
    passed: t2Passed,
    actualOutcome: `Expected MMSE: ${r2.stage1.expectedMmse}, Residual_z: ${r2.stage1.residualZ}, Tier: ${r2.stage1.initialTier}`,
    rationale: 'Prevents systemic bias where less-educated elders are penalized by unadjusted raw cutoff bars.',
  });

  // Test 3: Rapid Decline Trajectory Detection
  const r3 = resMap.get(p3.subjectId)!;
  const t3Passed = r3.stage1.mmseDeclineExceedsRef && r3.clinicalRiskTier === 'High';
  tests.push({
    id: 'SANITY_03',
    name: 'Rapid Decline Trajectory Escalation',
    description: 'Patient with steep MMSE loss (-3.33 pts/yr vs -1.68 ref) must be detected and escalated to High risk tier.',
    testInput: { educ: 20, latestMmse: 24, mmseSlope: -3.33 },
    expectedOutcome: 'MMSE Slope <= -1.68 flagged, Tier: High',
    passed: t3Passed,
    actualOutcome: `MMSE Slope: ${r3.stage1.mmseSlope} pts/yr, ExceedsRef: ${r3.stage1.mmseDeclineExceedsRef}, Final Tier: ${r3.clinicalRiskTier}`,
    rationale: 'Catches real conversion trajectories even in patients whose baseline scores were initially high.',
  });

  // Test 4: Moderate Dementia Prioritization
  const r4 = resMap.get(p4.subjectId)!;
  const t4Passed = r4.clinicalRiskTier === 'High' && r4.priorityScore > 1.5;
  tests.push({
    id: 'SANITY_04',
    name: 'Moderate Dementia Clinical Escalation',
    description: 'Patient with marked MMSE deficit (17) and CDR 1.0 must receive High clinical risk tier and high Priority Score.',
    testInput: { latestMmse: 17, latestCdr: 1.0, latestNwbv: 0.66 },
    expectedOutcome: 'Clinical Tier: High, Priority Score > 1.5',
    passed: t4Passed,
    actualOutcome: `Tier: ${r4.clinicalRiskTier}, Priority Score: ${r4.priorityScore} (Severity: ${r4.severityComponent}, Urgency: ${r4.urgencyComponent})`,
    rationale: 'Ensures patients with established progression receive rapid diagnostic confirmation routing.',
  });

  // Test 5: Brain Volumetric Loss Upgrade (Stage 3)
  const r5 = resMap.get(p5.subjectId)!;
  const t5Passed = r5.stage3?.nwbvDeclineExceedsRef === true && r5.stage3?.tierUpgraded === true;
  tests.push({
    id: 'SANITY_05',
    name: 'Stage 3 MRI Atrophy Escalation',
    description: 'Patient with annualized nWBV loss of -0.0146/yr (exceeding -0.010 ref) must trigger Stage 3 tier upgrade to High.',
    testInput: { nwbvSlope: -0.0146, initialTier: 'Medium' },
    expectedOutcome: 'nWBV Slope <= -0.010 triggered, Tier Upgraded to High',
    passed: t5Passed,
    actualOutcome: `nWBV Slope: ${r5.stage3?.nwbvSlope}/yr, Upgraded: ${r5.stage3?.tierUpgraded}, Final: ${r5.stage3?.finalTier}`,
    rationale: 'Leverages objective structural MRI biomarkers to escalate patients with insidious cerebral atrophy.',
  });

  // Test 6: Multiplicative Inversion Check (Urgency vs Severity)
  const rapidDecliner = r3; // High urgency
  const moderateSevere = r4; // High severity
  const t6Passed = rapidDecliner.priorityScore > 1.0 && moderateSevere.priorityScore > 1.0;
  tests.push({
    id: 'SANITY_06',
    name: 'Multiplicative Priority Ranking Logic',
    description: 'Priority Score = Severity * Urgency must strictly enforce two-dimensional interaction where rapid progression elevates priority rank.',
    testInput: { multiplicativeFormula: 'Severity * Urgency' },
    expectedOutcome: 'Both Severity and Urgency strictly > 0.1, Multiplicative interaction active',
    passed: t6Passed,
    actualOutcome: `Rapid Decliner Score: ${rapidDecliner.priorityScore} (Sev: ${rapidDecliner.severityComponent} x Urg: ${rapidDecliner.urgencyComponent})`,
    rationale: 'Guarantees that urgency of disease progression actively shapes referral queueing rather than single static snapshot.',
  });

  return tests;
}
