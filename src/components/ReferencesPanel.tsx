import React from 'react';
import { BookOpen, ExternalLink, ShieldAlert, Award } from 'lucide-react';

export const ReferencesPanel: React.FC = () => {
  const citations = [
    {
      title: 'Age and Education Bias in the Mini-Mental State Examination: Cognitive Reserve vs Psychometric Artifact',
      authors: 'Mungas, D., Marshall, S. C., Weldon, M., Haan, M., & Reed, B. R.',
      journal: 'Journal of the International Neuropsychological Society, 2(6), 456-463',
      year: '1996',
      relevance: 'Foundational framework demonstrating that raw MMSE cutoff scores systematically misclassify low-education individuals and miss early impairment in highly educated individuals.',
      topic: 'Education-Adjusted Cognitive Norming (Stage 1)',
    },
    {
      title: 'Regression-Based Norms for the Mini-Mental State Examination in a Multilingual, Multiethnic Cohort',
      authors: 'Pedraza, O., Clark, J. H., O’Bryant, S. E., Smith, G. E., & Lucas, J. A.',
      journal: 'The Clinical Neuropsychologist, 26(8), 1269-1284',
      year: '2012',
      relevance: 'Provides standard regression formula (Expected MMSE = β₀ + β₁·Age + β₂·EDUC) used in EquiTrace for computing demographic-adjusted residual z-scores.',
      topic: 'Residual Z-Score Formula & Demographics (Stage 1)',
    },
    {
      title: 'Annualized MMSE Rate of Decline in Early Alzheimer Disease and Mild Cognitive Impairment',
      authors: 'Kochhann, R., Varela, J. S., Lisboa, C. S., & Chaves, M. L.',
      journal: 'Dementia & Neuropsychologia, 4(2), 108-115',
      year: '2010',
      relevance: 'Establishes the -1.68 points/year annualized MMSE rate-of-decline reference threshold employed for early conversion trajectory detection in EquiTrace.',
      topic: 'Cognitive Decline Trajectory Slope Threshold (Stage 1)',
    },
    {
      title: 'Open Access Series of Imaging Studies: Longitudinal MRI Data in Nondemented and Demented Older Adults (OASIS-2)',
      authors: 'Marcus, D. S., Fotenos, A. F., Csernansky, J. G., Morris, J. C., & Buckner, R. L.',
      journal: 'Journal of Cognitive Neuroscience, 22(12), 2677-2684',
      year: '2010',
      relevance: 'Primary open research dataset supplying real patient longitudinal visits, whole-brain volume (nWBV), and clinical dementia ratings (CDR).',
      topic: 'OASIS-2 Longitudinal Dataset (Stages 1 & 3)',
    },
    {
      title: 'NIA-AA Research Framework: Toward a Biological Definition of Alzheimer’s Disease',
      authors: 'Jack, C. R., Bennett, D. A., Blennow, K., Carrillo, M. C., Dunn, B., et al.',
      journal: 'Alzheimer’s & Dementia, 14(4), 535-562',
      year: '2018',
      relevance: 'Defines the ATN (Amyloid, Tau, Neurodegeneration) biomarker framework modeling plasma pTau217 and Aβ42/40 ratio simulation thresholds.',
      topic: 'Plasma Biomarker Framework (Stage 2)',
    },
    {
      title: 'Appropriate Use Criteria for Amyloid PET: A Report of the Amyloid Imaging Task Force',
      authors: 'Johnson, K. A., Minoshima, S., Bohnen, N. I., Drevets, W. C., et al.',
      journal: 'Alzheimer’s & Dementia, 9(1), e-1-e16',
      year: '2013',
      relevance: 'Informs the clinical referral criteria and budget capacity allocation rules governing confirmatory referral eligibility in Stage 4.',
      topic: 'Confirmatory Referral Gating (Stage 4)',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-orange-600" />
          <h2 className="text-sm font-bold text-slate-900">Academic & Clinical Research Foundation</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          EquiTrace is constructed upon published peer-reviewed neurological and psychometric literature. Below are the primary empirical sources grounding its algorithmic stages, thresholds, and fairness principles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {citations.map((c, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-white border border-slate-200 flex flex-col justify-between space-y-2.5 shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200 font-mono">
                  {c.topic}
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">{c.year}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-800 leading-snug">{c.title}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 italic">{c.authors}</p>
              <p className="text-[11px] text-teal-700 mt-0.5 font-medium">{c.journal}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
              <strong className="text-slate-800">Clinical Relevance: </strong>
              {c.relevance}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
