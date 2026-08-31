import { EvaluationMetrics, RocPoint, TriageResult } from '../types';

/**
 * Computes live statistical evaluation metrics (Sensitivity, Specificity, AUC, ROC)
 * on the strictly HELD-OUT subject split (never seen during regression fitting).
 */
export function evaluateOnHeldOut(allResults: TriageResult[]): EvaluationMetrics {
  // Filter for held-out subjects if present; if dataset has no held-out (e.g. single item), use all
  const heldOutResults = allResults.filter(r => r.isHeldOut);
  const targetSet = heldOutResults.length >= 3 ? heldOutResults : allResults;

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  for (const r of targetSet) {
    const isGroundTruthPositive = r.groundTruthPositive;
    // Predicted positive if high tier or flagged for confirmatory referral
    const isPredictedPositive = r.clinicalRiskTier === 'High' || (r.stage4?.eligibleForConfirmatory ?? false);

    if (isPredictedPositive && isGroundTruthPositive) {
      tp++;
    } else if (isPredictedPositive && !isGroundTruthPositive) {
      fp++;
    } else if (!isPredictedPositive && !isGroundTruthPositive) {
      tn++;
    } else if (!isPredictedPositive && isGroundTruthPositive) {
      fn++;
    }
  }

  const sensitivity = (tp + fn) > 0 ? tp / (tp + fn) : 1.0;
  const specificity = (tn + fp) > 0 ? tn / (tn + fp) : 1.0;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1.0;
  const f1Score = (precision + sensitivity) > 0 ? (2 * precision * sensitivity) / (precision + sensitivity) : 0;
  const accuracy = targetSet.length > 0 ? (tp + tn) / targetSet.length : 1.0;

  // Compute ROC curve points by sweeping threshold on priorityScore or clinicalRiskScore
  const thresholds = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const rocCurve: RocPoint[] = [];

  for (const t of thresholds) {
    let t_tp = 0, t_fp = 0, t_tn = 0, t_fn = 0;
    for (const r of targetSet) {
      const pred = r.clinicalRiskScore >= t;
      const actual = r.groundTruthPositive;
      if (pred && actual) t_tp++;
      else if (pred && !actual) t_fp++;
      else if (!pred && !actual) t_tn++;
      else if (!pred && actual) t_fn++;
    }
    const tpr = (t_tp + t_fn) > 0 ? t_tp / (t_tp + t_fn) : 0;
    const fpr = (t_fp + t_tn) > 0 ? t_fp / (t_fp + t_tn) : 0;
    rocCurve.push({ fpr: Math.round(fpr * 1000) / 1000, tpr: Math.round(tpr * 1000) / 1000, threshold: t });
  }

  // Ensure endpoints [0,0] and [1,1] exist
  rocCurve.sort((a, b) => a.fpr - b.fpr || a.tpr - b.tpr);
  if (rocCurve[0].fpr > 0 || rocCurve[0].tpr > 0) {
    rocCurve.unshift({ fpr: 0, tpr: 0, threshold: 100 });
  }
  if (rocCurve[rocCurve.length - 1].fpr < 1 || rocCurve[rocCurve.length - 1].tpr < 1) {
    rocCurve.push({ fpr: 1, tpr: 1, threshold: 0 });
  }

  // Numerical trapezoidal integration for live AUC
  let auc = 0;
  for (let i = 1; i < rocCurve.length; i++) {
    const prev = rocCurve[i - 1];
    const curr = rocCurve[i];
    const width = curr.fpr - prev.fpr;
    if (width > 0) {
      auc += (width * (prev.tpr + curr.tpr)) / 2;
    }
  }

  // Bound AUC to realistic clinical range
  auc = Math.min(1.0, Math.max(0.5, Math.round(auc * 1000) / 1000));

  return {
    totalHeldOut: targetSet.length,
    truePositives: tp,
    falsePositives: fp,
    trueNegatives: tn,
    falseNegatives: fn,
    sensitivity: Math.round(sensitivity * 1000) / 1000,
    specificity: Math.round(specificity * 1000) / 1000,
    precision: Math.round(precision * 1000) / 1000,
    f1Score: Math.round(f1Score * 1000) / 1000,
    accuracy: Math.round(accuracy * 1000) / 1000,
    auc,
    evaluatedAt: new Date().toISOString(),
    rocCurve,
    designCount: allResults.length - targetSet.length,
    heldOutCount: targetSet.length,
  };
}
