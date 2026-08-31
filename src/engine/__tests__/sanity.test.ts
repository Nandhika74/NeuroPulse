import { runSanityTests } from '../sanityRunner';

export function runTestsAndLog(): boolean {
  const results = runSanityTests();
  let allPassed = true;
  console.log('--- EquiTrace Sanity Verification Suite ---');
  for (const t of results) {
    const status = t.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status}: [${t.id}] ${t.name}`);
    if (!t.passed) {
      console.error(`  Expected: ${t.expectedOutcome}`);
      console.error(`  Actual:   ${t.actualOutcome}`);
      allPassed = false;
    }
  }
  return allPassed;
}
