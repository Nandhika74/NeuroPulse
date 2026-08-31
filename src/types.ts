export type RiskTier = 'Low' | 'Medium' | 'High';
export type BiomarkerZone = 'Negative' | 'Intermediate' | 'Positive';
export type PatientPipelineStatus = 
  | 'EXIT_STAGE1_LOW_RISK'
  | 'HELD_STAGE2_BIOMARKERS_REASSURING'
  | 'STAGE3_PASSED'
  | 'STAGE4_CONFIRMATORY_ELIGIBLE'
  | 'STAGE4_RESOURCE_CAPPED'
  | 'EXCLUDED_INSUFFICIENT_DATA';

export interface OASISRow {
  subjectId: string;
  mriId?: string;
  group: 'Nondemented' | 'Demented' | 'Converted' | string;
  visit: number;
  mrDelay: number; // days since first visit
  gender?: string; // M/F
  hand?: string;
  age: number;
  educ: number; // years of education
  ses?: number; // socio-economic status 1-5
  mmse: number; // mini-mental state exam 0-30
  cdr: number; // clinical dementia rating 0, 0.5, 1, 2
  etiv?: number; // estimated total intracranial volume
  nwbv: number; // normalized whole-brain volume 0.6-0.9
  asf?: number; // atlas scaling factor
}

export interface PatientVisit {
  visit: number;
  mrDelayYears: number;
  age: number;
  mmse: number;
  cdr: number;
  nwbv: number;
  etiv?: number;
  expectedMmse?: number;
  residual?: number;
  residualZ?: number;
}

export interface Patient {
  subjectId: string;
  group: string;
  gender?: string;
  educ: number;
  ses?: number;
  visits: PatientVisit[];
  baselineAge: number;
  latestAge: number;
  baselineMmse: number;
  latestMmse: number;
  baselineCdr: number;
  latestCdr: number;
  baselineNwbv: number;
  latestNwbv: number;
  etiv?: number;
  asf?: number;
  mmseSlope: number; // points/year
  nwbvSlope: number; // delta nWBV/year
  hasMultipleVisits: boolean;
  isHeldOut: boolean;
}

export interface AuditTrailItem {
  stage: string;
  action: string;
  reason: string;
  timestamp?: string;
  isSimulated?: boolean;
}

export interface RegressionModel {
  beta0: number;
  intercept: number;
  betaAge: number;
  betaEduc: number;
  residualStd: number;
  rmse: number;
  sampleSize: number;
  rSquared: number;
}

export interface SimulatedBiomarkers {
  pTau217Zone: BiomarkerZone;
  pTau217Value: number; // pg/mL simulated
  amyloidRatioZone: BiomarkerZone;
  amyloidRatioValue: number; // Aβ42/40 ratio simulated
  biomarkerConcernScore: number; // 0.0 - 1.0
}

export interface TriageResult {
  subjectId: string;
  patient: Patient;
  isHeldOut: boolean;
  
  // Stage 1: Cognitive Screening (Real Data)
  stage1: {
    expectedMmse: number;
    residual: number;
    residualZ: number;
    initialTier: RiskTier;
    mmseSlope: number;
    mmseDeclineExceedsRef: boolean; // slope <= -1.68
    tierAfterSlope: RiskTier;
    exitedStage1: boolean;
  };

  // Stage 2: Simulated Blood Biomarkers (Simulated Data)
  stage2?: {
    biomarkers: SimulatedBiomarkers;
    heldAtStage2: boolean;
    proceedToStage3: boolean;
  };

  // Stage 3: MRI Evaluation (Real Data)
  stage3?: {
    nwbvSlope: number;
    nwbvDeclineExceedsRef: boolean; // slope <= -0.010
    tierUpgraded: boolean;
    finalTier: RiskTier;
  };

  // Stage 4: Confirmatory Evaluation Eligibility (Simulated / Gated)
  stage4?: {
    eligibleForConfirmatory: boolean;
    referralSuggested: boolean;
    prioritySlotAllocated: boolean;
  };

  // Final Outputs
  status: PatientPipelineStatus;
  clinicalRiskTier: RiskTier;
  clinicalRiskScore: number; // 0-100%
  severityComponent: number; // 0.1 - 2.1
  urgencyComponent: number; // 0.1 - 2.1
  priorityScore: number; // Severity * Urgency
  priorityRank?: number; // 1 to N among active queue
  
  // Explainability
  reasoningString: string;
  geminiExplanation?: string;
  auditTrail: AuditTrailItem[];
  
  // Ground truth evaluation ledger
  groundTruthPositive: boolean; // e.g. CDR >= 0.5 or Converted/Demented
  classificationCategory?: 'True_Positive' | 'False_Positive' | 'True_Negative' | 'False_Negative' | 'Reassuring_Hold' | 'Low_Risk_Exit';
}

export interface FunnelCounts {
  totalPatients: number;
  stage1Input: number;
  stage1LowRiskExit: number;
  stage2Input: number;
  stage2ReassuringHold: number;
  stage3Input: number;
  stage3MediumToHighUpgrade: number;
  stage4Input: number;
  stage4ConfirmatoryEligible: number;
  stage4ImagingBudgetSlots: number;
}

export interface RocPoint {
  fpr: number;
  tpr: number;
  threshold: number;
}

export interface EvaluationMetrics {
  totalHeldOut: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  sensitivity: number; // Recall
  specificity: number;
  precision: number;
  f1Score: number;
  accuracy: number;
  auc: number;
  evaluatedAt: string;
  rocCurve: RocPoint[];
  designCount: number;
  heldOutCount: number;
}

export interface PipelineOutput {
  results: TriageResult[];
  funnel: FunnelCounts;
  regressionModel: RegressionModel;
  regression?: RegressionModel;
  evaluation: EvaluationMetrics;
  isSyntheticData: boolean;
  dataSourceName: string;
  totalRecordsCount: number;
  splitSeed: number;
}

export interface SanityTestCase {
  id: string;
  name: string;
  description: string;
  testInput: Record<string, any>;
  expectedOutcome: string;
  passed: boolean;
  actualOutcome: string;
  rationale: string;
}
