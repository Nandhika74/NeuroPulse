import Papa from 'papaparse';
import { OASISRow, Patient, PatientVisit } from '../types';

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export function parseOASISCSV(csvContent: string): { rows: OASISRow[]; patients: Patient[]; rawRowCount: number } {
  const parseResult = Papa.parse<Record<string, string>>(csvContent.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    comments: '#',
  });

  const rawRows = parseResult.data;
  const rows: OASISRow[] = [];

  for (const raw of rawRows) {
    // Find keys regardless of case/spacing
    const keys = Object.keys(raw);
    const getVal = (...targetVariants: string[]): string => {
      for (const target of targetVariants) {
        const normTarget = normalizeHeader(target);
        const matchKey = keys.find(k => normalizeHeader(k) === normTarget);
        if (matchKey && raw[matchKey] !== undefined && raw[matchKey] !== '') {
          return raw[matchKey].trim();
        }
      }
      return '';
    };

    const subjectId = getVal('Subject ID', 'SubjectID', 'subject_id', 'Subject', 'ID');
    if (!subjectId) continue;

    const group = getVal('Group', 'group', 'Dx', 'Diagnosis') || 'Nondemented';
    const visitStr = getVal('Visit', 'visit') || '1';
    const mrDelayStr = getVal('MR Delay', 'MRDelay', 'mr_delay', 'Delay') || '0';
    const ageStr = getVal('Age', 'age') || '75';
    const educStr = getVal('EDUC', 'Educ', 'Education', 'education') || '12';
    const sesStr = getVal('SES', 'ses');
    const mmseStr = getVal('MMSE', 'mmse') || '28';
    const cdrStr = getVal('CDR', 'cdr') || '0';
    const etivStr = getVal('eTIV', 'ETIV', 'etiv');
    const nwbvStr = getVal('nWBV', 'NWBV', 'nwbv') || '0.74';
    const asfStr = getVal('ASF', 'asf');
    const gender = getVal('M/F', 'Gender', 'gender', 'Sex');
    const hand = getVal('Hand', 'hand');
    const mriId = getVal('MRI ID', 'MRIID', 'mri_id');

    const age = parseFloat(ageStr);
    const educ = parseFloat(educStr);
    const mmse = parseFloat(mmseStr);
    const cdr = parseFloat(cdrStr);
    const nwbv = parseFloat(nwbvStr);
    const visit = parseInt(visitStr, 10);
    const mrDelay = parseFloat(mrDelayStr);

    if (isNaN(age) || isNaN(educ) || isNaN(mmse) || isNaN(nwbv)) {
      continue;
    }

    rows.push({
      subjectId,
      mriId: mriId || `${subjectId}_MR${visit}`,
      group,
      visit: isNaN(visit) ? 1 : visit,
      mrDelay: isNaN(mrDelay) ? 0 : mrDelay,
      gender: gender || 'F',
      hand: hand || 'R',
      age,
      educ,
      ses: sesStr ? parseFloat(sesStr) : undefined,
      mmse,
      cdr: isNaN(cdr) ? 0 : cdr,
      etiv: etivStr ? parseFloat(etivStr) : undefined,
      nwbv,
      asf: asfStr ? parseFloat(asfStr) : undefined,
    });
  }

  const patients = groupRowsIntoPatients(rows);
  return { rows, patients, rawRowCount: rawRows.length };
}

export function groupRowsIntoPatients(rows: OASISRow[]): Patient[] {
  const patientMap = new Map<string, OASISRow[]>();

  for (const row of rows) {
    if (!patientMap.has(row.subjectId)) {
      patientMap.set(row.subjectId, []);
    }
    patientMap.get(row.subjectId)!.push(row);
  }

  const patients: Patient[] = [];

  for (const [subjectId, pRows] of patientMap.entries()) {
    // Sort rows by visit number or mrDelay
    pRows.sort((a, b) => (a.visit !== b.visit ? a.visit - b.visit : a.mrDelay - b.mrDelay));

    const baseline = pRows[0];
    const latest = pRows[pRows.length - 1];

    const visits: PatientVisit[] = pRows.map(r => ({
      visit: r.visit,
      mrDelayYears: r.mrDelay / 365.25,
      age: r.age,
      mmse: r.mmse,
      cdr: r.cdr,
      nwbv: r.nwbv,
      etiv: r.etiv,
    }));

    // Compute annualized slopes if 2+ visits
    let mmseSlope = 0;
    let nwbvSlope = 0;

    if (pRows.length >= 2) {
      const delayYears = (latest.mrDelay - baseline.mrDelay) / 365.25;
      const effectiveYears = delayYears > 0.1 ? delayYears : Math.max(1, pRows.length - 1);
      mmseSlope = (latest.mmse - baseline.mmse) / effectiveYears;
      nwbvSlope = (latest.nwbv - baseline.nwbv) / effectiveYears;
    }

    patients.push({
      subjectId,
      group: latest.group || baseline.group,
      gender: baseline.gender,
      educ: baseline.educ,
      ses: baseline.ses,
      visits,
      baselineAge: baseline.age,
      latestAge: latest.age,
      baselineMmse: baseline.mmse,
      latestMmse: latest.mmse,
      baselineCdr: baseline.cdr,
      latestCdr: latest.cdr,
      baselineNwbv: baseline.nwbv,
      latestNwbv: latest.nwbv,
      etiv: latest.etiv || baseline.etiv,
      asf: latest.asf || baseline.asf,
      mmseSlope,
      nwbvSlope,
      hasMultipleVisits: pRows.length >= 2,
      isHeldOut: false, // Will be partitioned deterministically
    });
  }

  // Sort by subject ID
  patients.sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  return patients;
}
