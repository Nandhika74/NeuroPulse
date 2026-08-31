# NeuroPulse: Multi-Stage Alzheimer’s Triage & Referral Prioritization Dashboard

> **Research Prototype** — *Not for clinical diagnosis or medical decision-making. EquiTrace is designed to assist health systems and memory clinics in prioritizing specialist diagnostic review queues using demographic norming, longitudinal velocities, and multi-modal biomarker gatekeeping.*

---

## 1. Overview & Clinical Motivation

Dementia specialist referral pathways face severe waitlist bottlenecks, frequently exceeding 6 to 12 months. Conventional triage systems rely on rigid, raw cognitive screening thresholds (e.g., standard Mini-Mental State Examination cutoff scores like MMSE < 24):

- **High-Education False Negatives (Delayed Care)**: Highly educated individuals with substantial cognitive reserve can suffer significant neurodegenerative loss while remaining above raw score cutoffs, missing critical early therapeutic windows.
- **Low-Education False Positives (Unnecessary Escalation)**: Individuals with limited formal schooling frequently score below standard cutoffs despite having normal cognitive function for their demographic background.
- **Static vs. Velocity Blindness**: Conventional scorecards treat a static score identically regardless of whether the patient is clinically stable or declining rapidly.

**EquiTrace** is an explainable, equity-grounded triage decision-support engine. It replaces arbitrary single-point cutoffs with a 4-stage multi-modal pipeline grounded in peer-reviewed neurological and psychometric literature, dynamically fitted on the **OASIS-2 Longitudinal MRI Dataset**.

---

## 2. Multi-Stage Architectural Pipeline

```
  [ Longitudinal Cohort Ingestion (OASIS-2) ]
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ STAGE 1: Demographic Cognitive Norming & Velocity       │
│ • Live OLS fit: Expected MMSE = β₀ + β₁·Age + β₂·EDUC   │
│ • Residual Z = (MMSE_obs - MMSE_exp) / RMSE             │
│ • Longitudinal MMSE slope assessment (Ref: -1.68 pts/yr)│
└─────────────────────────────┬───────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
  [ Residual Z > -1.0 ]                   [ Residual Z ≤ -1.0 ]
  (Within Normative Band)                 (Cognitive Deficit Detected)
          │                                       │
          ▼                                       ▼
┌───────────────────────────┐         ┌─────────────────────────────────────────┐
│ Exit to Stage 1 Low-Risk  │         │ STAGE 2: Plasma Biomarkers (Simulated)  │
│ Routine PCP Monitoring    │         │ • pTau217 (Cutoffs: <0.20, 0.20-0.45,   │
└───────────────────────────┘         │   >0.45 ng/mL)                          │
                                      │ • Aβ42/40 Ratio (Cutoffs: >0.09,        │
                                      │   0.06-0.09, <0.06)                     │
                                      │ • Double-negative safely held           │
                                      └───────────────────┬─────────────────────┘
                                                          │
                                                          ▼
                                      ┌─────────────────────────────────────────┐
                                      │ STAGE 3: Structural MRI Morphometry     │
                                      │ • Normalized Whole Brain Volume (nWBV)  │
                                      │ • Longitudinal Brain Loss Slope         │
                                      │   (Threshold: ≤ -0.010 nWBV / year)     │
                                      └───────────────────┬─────────────────────┘
                                                          │
                                                          ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: Multiplicative Urgency Queue                                         │
│ • Priority Score = Severity_Component × Urgency_Component                    │
│ • Severity = 1.0 + (Residual_Z_deficit × 0.25) + (Biomarker_Scores)           │
│ • Urgency  = 1.0 + (MMSE_Loss_Rate / 1.68 × 0.45) + (Brain_Loss / 0.010 × 0.4) │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Algorithmic Principles & Formulas

### Stage 1: Education-Adjusted Cognitive Norming
Based on the regression norming framework established by Pedraza et al. (2012) and Mungas et al. (1996), expected baseline cognition is dynamically estimated:

$$\text{Expected MMSE} = \beta_0 + \beta_1 \cdot \text{Age} + \beta_2 \cdot \text{EDUC}$$

$$\text{Residual} = \text{Observed MMSE} - \text{Expected MMSE}$$

$$\text{Residual } Z = \frac{\text{Residual}}{\text{RMSE}}$$

- $\text{Residual } Z > -1.0\sigma$: Normal demographic variation $\rightarrow$ Stage 1 Exit (Low Risk).
- $-2.0\sigma < \text{Residual } Z \le -1.0\sigma$: Mild cognitive deficit $\rightarrow$ Stage 2 Biomarkers.
- $\text{Residual } Z \le -2.0\sigma$: Marked cognitive deficit $\rightarrow$ Stage 2 Biomarkers.

### Stage 2: Plasma Biomarkers (Simulated / Lab Integration)
Grounding on the **NIA-AA Revised Criteria for Alzheimer's Disease Diagnostic Framework (Jack et al., 2018)**:
- **pTau217**: Categorized into Normal ($<0.20$ ng/mL), Intermediate ($0.20 - 0.45$ ng/mL), and Positive ($>0.45$ ng/mL).
- **Aβ42/40 Ratio**: Categorized into Normal ($>0.09$), Intermediate ($0.06 - 0.09$), and Abnormal ($<0.06$).
- **Safety Gate**: Reassuring double-negatives (Normal pTau217 + Normal Amyloid ratio) without rapid cognitive decline exit to Stage 2 Hold.

### Stage 3: Longitudinal Structural MRI Morphometry
Quantifies progressive cerebral atrophy rate via normalized whole-brain volume (nWBV) slope across multiple visits (Marcus et al., 2010):

$$\text{nWBV Velocity} = \frac{\Delta \text{nWBV}}{\Delta \text{Years}}$$

- A rapid atrophy rate ($\le -0.010\text{ nWBV / year}$) upgrades a patient from Medium to High clinical priority.

### Stage 4: Multiplicative Priority Ranking

$$\text{Priority Score} = \text{Severity Component} \times \text{Urgency Component}$$

- **Severity Component**: Captures current point-in-time impairment (Cognitive deficit $Z$ + Plasma biomarker load + Baseline CDR).
- **Urgency Component**: Captures trajectory loss rates relative to empirical references (MMSE decline rate / 1.68 pts/yr + nWBV atrophy rate / 0.010/yr).
- **Why Multiplicative beats Additive**: Additive scoring allows stable, long-standing impairments to monopolize specialist slots. Multiplicative scaling ensures that high trajectory velocity rapidly elevates patients into critical diagnostic windows.

---

## 4. Empirical Evaluation Protocol

EquiTrace enforces rigorous, non-circular statistical validation:

- **Live Held-Out Evaluation Ledger**: Automatically partitions the OASIS-2 dataset into a ~70% design cohort and a ~30% held-out test cohort (fixed seed 42).
- **Zero Hardcoded Metrics**: All sensitivity, specificity, positive predictive value (PPV), F1 score, and ROC AUC metrics are dynamically computed at request time via `evaluateOnHeldOut()`.
- **Ground Truth Definition**: Longitudinal Clinical Dementia Rating ($\text{CDR} \ge 0.5$ or Demented/Converted status).
- **Automated Sanity Test Suite**: Evaluates hand-crafted clinical edge cases verifying demographic fairness, trajectory detection, and sign correctness.

---

## 5. User Interface & Feature Breakdown

| Component | Description |
| :--- | :--- |
| **Header & Disclaimer** | High-contrast control center displaying active cohort size, fitted regression parameters, held-out AUC, and research disclaimer. |
| **Funnel Visualizer** | Step-by-step patient attrition funnel illustrating case resolution across Stages 1, 2, 3, and 4. |
| **Prioritization Queue** | High-density sortable ledger featuring multi-dimensional filtering, risk badges (High / Medium / Low), trajectory velocity flags, and audit triggers. |
| **Patient Audit Modal** | Comprehensive patient drilldown featuring visit histories, interactive synthetic biomarker sliders, and stage-by-stage explainability rationales. |
| **Held-Out Ledger** | Dynamic 2x2 confusion matrix, classification metrics scorecard, and full ROC curve chart with chance diagonal. |
| **Architecture Blueprint** | Detailed interactive equations and mathematical rationale comparing multiplicative vs. additive ranking. |
| **Research Foundation** | Direct academic citations and clinical context (Pedraza 2012, Jack 2018, Marcus 2010, Mungas 1996). |
| **Custom CSV Ingestion** | Drag-and-drop upload for custom OASIS-2 formatted datasets (`oasis_longitudinal.csv`). |

---

## 6. Project Structure

```
├── .env.example              # Environment variables template
├── index.html                # Entry point HTML with metadata
├── metadata.json             # App descriptor and permissions
├── package.json              # Dependencies and scripts
├── server.ts                 # Full-stack Express server with Vite middleware
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration with Tailwind CSS plugin
└── src/
    ├── App.tsx               # Main application controller & tab router
    ├── index.css             # Tailwind styling rules
    ├── main.tsx              # React DOM initialization
    ├── types.ts              # Global TypeScript interfaces and domain types
    ├── components/
    │   ├── ArchitecturePanel.tsx   # Mathematical blueprint & formula guide
    │   ├── EvaluationPanel.tsx     # Live held-out evaluation & ROC chart
    │   ├── FunnelVisualizer.tsx    # Multi-stage triage attrition funnel
    │   ├── Header.tsx              # Navigation bar, banner, and quick actions
    │   ├── LegendBar.tsx           # Legend & status indicators
    │   ├── PatientDetailModal.tsx  # Patient deep-dive & biomarker simulator
    │   ├── PatientTable.tsx        # Searchable, filterable priority table
    │   ├── ReferencesPanel.tsx     # Clinical citations & literature review
    │   ├── SanityTestModal.tsx     # Automated edge-case verification runner
    │   └── UploadModal.tsx         # Drag-and-drop CSV dataset upload
    ├── data/
    │   └── oasisData.ts            # Embedded OASIS-2 longitudinal cohort
    └── engine/
        ├── evaluate.ts             # Dynamic held-out cohort ROC & metrics engine
        ├── sanityRunner.ts         # Clinical validation test suite
        └── triagePipeline.ts       # 4-stage norming, biomarker, & triage engine
```

---

## 7. Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd equitrace

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server (Express + Vite on Port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Type Checking & Building

```bash
# Type check the codebase
npm run lint

# Compile production bundle
npm run build

# Start the compiled production server
npm start
```

---

## 8. Clinical & Academic References

1. **Pedraza, O., et al. (2012)**. *Normative data for the Mini-Mental State Examination in ethnically diverse older adults*. **The Clinical Neuropsychologist**, 26(6), 940–958.
2. **Jack, C. R., et al. (2018)**. *NIA-AA Research Framework: Toward a biological definition of Alzheimer's disease*. **Alzheimer's & Dementia**, 14(4), 535–562.
3. **Marcus, D. S., et al. (2010)**. *Open Access Series of Imaging Studies (OASIS): Longitudinal MRI Data in Nondemented and Demented Older Adults*. **Journal of Cognitive Neuroscience**, 22(12), 2677–2684.
4. **Mungas, D., et al. (1996)**. *Education and ethnicity in dementia assessment: A guide for clinical practice*. **Neurology**, 46(3), 629–633.

---

## 9. Disclaimer & Intended Use

EquiTrace is a **computational research and triage simulation prototype**. It is intended strictly for health systems engineering, algorithmic fairness research, and clinical workflow modeling. It is **not** a diagnostic medical device (SaMD) and must not be used as a standalone basis for patient diagnosis, prescription, or clinical decision-making.
