import { OASISRow } from '../types';

export function generateSyntheticOASIS(count: number = 18): string {
  const rows: OASISRow[] = [];
  const groups: Array<'Nondemented' | 'Demented' | 'Converted'> = [
    'Nondemented', 'Nondemented', 'Nondemented', 'Nondemented',
    'Demented', 'Demented', 'Converted', 'Nondemented', 'Demented'
  ];

  for (let i = 1; i <= count; i++) {
    const subId = `SYN_${i.toString().padStart(4, '0')}`;
    const group = groups[(i - 1) % groups.length];
    const educ = Math.floor(8 + ((i * 7) % 13)); // 8 - 20 years
    const baseAge = Math.floor(62 + ((i * 5) % 28)); // 62 - 90
    const gender = i % 2 === 0 ? 'F' : 'M';
    const ses = 1 + (i % 4);

    let baselineMmse = 28 + (educ > 14 ? 1 : -1) - (baseAge > 80 ? 1 : 0);
    let baselineCdr = 0;
    let baseNwbv = 0.77 - (baseAge - 60) * 0.003;

    if (group === 'Demented') {
      baselineMmse = Math.max(16, 26 - ((i * 3) % 8));
      baselineCdr = 0.5;
      baseNwbv -= 0.035;
    } else if (group === 'Converted') {
      baselineMmse = 29;
      baselineCdr = 0;
      baseNwbv -= 0.015;
    }

    const numVisits = 2 + (i % 2); // 2 or 3 visits
    for (let v = 1; v <= numVisits; v++) {
      const delayDays = (v - 1) * Math.floor(400 + (i * 30) % 300);
      const delayYears = delayDays / 365.25;
      const curAge = Math.round((baseAge + delayYears) * 10) / 10;
      let curMmse = baselineMmse;
      let curCdr = baselineCdr;
      let curNwbv = baseNwbv - delayYears * 0.004;

      if (group === 'Demented') {
        curMmse = Math.max(12, Math.round(baselineMmse - delayYears * 2.2));
        curCdr = curMmse < 20 ? 1.0 : 0.5;
        curNwbv = Math.round((baseNwbv - delayYears * 0.014) * 1000) / 1000;
      } else if (group === 'Converted') {
        if (v >= 2) {
          curMmse = Math.max(18, Math.round(baselineMmse - (v - 1) * 2.5));
          curCdr = 0.5;
          curNwbv = Math.round((baseNwbv - delayYears * 0.012) * 1000) / 1000;
        }
      } else {
        curMmse = Math.min(30, Math.max(26, baselineMmse - (v > 1 && i % 4 === 0 ? 1 : 0)));
        curNwbv = Math.round((baseNwbv - delayYears * 0.003) * 1000) / 1000;
      }

      rows.push({
        subjectId: subId,
        mriId: `${subId}_MR${v}`,
        group,
        visit: v,
        mrDelay: delayDays,
        gender,
        hand: 'R',
        age: curAge,
        educ,
        ses,
        mmse: curMmse,
        cdr: curCdr,
        etiv: Math.round(1300 + ((i * 67 + v * 12) % 500)),
        nwbv: curNwbv,
        asf: Math.round((1.05 + ((i * 13) % 40) / 100) * 1000) / 1000,
      });
    }
  }

  // Convert to CSV string
  const header = 'Subject ID,MRI ID,Group,Visit,MR Delay,M/F,Hand,Age,EDUC,SES,MMSE,CDR,eTIV,nWBV,ASF\n';
  const lines = rows.map(r => 
    `${r.subjectId},${r.mriId},${r.group},${r.visit},${r.mrDelay},${r.gender},${r.hand},${r.age},${r.educ},${r.ses || ''},${r.mmse},${r.cdr},${r.etiv || ''},${r.nwbv},${r.asf || ''}`
  );
  return header + lines.join('\n');
}
