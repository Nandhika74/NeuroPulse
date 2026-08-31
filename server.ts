import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { parseOASISCSV } from './src/data/oasisParser';
import { runTriagePipeline } from './src/engine/triagePipeline';
import { evaluateOnHeldOut } from './src/engine/evaluate';
import { runSanityTests } from './src/engine/sanityRunner';
import { generateSyntheticOASIS } from './src/data/syntheticGenerator';
import { PipelineOutput } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory state for current active dataset and pipeline cache
let currentCSVContent = '';
let currentPipelineOutput: PipelineOutput | null = null;

// Read bundled OASIS-2 CSV
function loadDefaultDataset(): string {
  const defaultPath = path.join(__dirname, 'src', 'data', 'oasis2.csv');
  if (fs.existsSync(defaultPath)) {
    return fs.readFileSync(defaultPath, 'utf-8');
  }
  // Fallback to generated synthetic data
  return generateSyntheticOASIS(20);
}

function processCurrentDataset(csvText: string): PipelineOutput {
  const { patients } = parseOASISCSV(csvText);
  const pipelineOutput = runTriagePipeline(patients);
  currentCSVContent = csvText;
  currentPipelineOutput = pipelineOutput;
  return pipelineOutput;
}

// Lazy Gemini API Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Initialize dataset on startup
  const initialCsv = loadDefaultDataset();
  processCurrentDataset(initialCsv);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GET /api/data - returns current pipeline run, funnel, regression model, and evaluation
  app.get('/api/data', (req, res) => {
    if (!currentPipelineOutput) {
      currentPipelineOutput = processCurrentDataset(loadDefaultDataset());
    }
    res.json(currentPipelineOutput);
  });

  // POST /api/upload - handles CSV upload matching OASIS-2 schema
  app.post('/api/upload', (req, res) => {
    try {
      const { csvText } = req.body;
      if (!csvText || typeof csvText !== 'string' || csvText.trim().length === 0) {
        return res.status(400).json({ error: 'Missing or empty csvText in request body' });
      }

      const { rows, patients } = parseOASISCSV(csvText);
      if (patients.length === 0) {
        return res.status(400).json({
          error: 'No valid patient rows found. Please check column headers (Subject ID, Age, EDUC, MMSE, nWBV).',
        });
      }

      const output = processCurrentDataset(csvText);
      res.json({
        success: true,
        message: `Successfully loaded ${rows.length} visit records across ${patients.length} patients.`,
        data: output,
      });
    } catch (err: any) {
      console.error('Error processing uploaded CSV:', err);
      res.status(500).json({ error: err.message || 'Failed to process CSV dataset' });
    }
  });

  // POST /api/generate-synthetic - generates fresh synthetic demo cohort
  app.post('/api/generate-synthetic', (req, res) => {
    try {
      const count = req.body?.count || 18;
      const synthCsv = generateSyntheticOASIS(count);
      const output = processCurrentDataset(synthCsv);
      res.json({
        success: true,
        message: `Generated fresh synthetic demo cohort with ${output.results.length} patients.`,
        data: output,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/reset-data - resets to the bundled OASIS-2 longitudinal dataset
  app.post('/api/reset-data', (req, res) => {
    try {
      const defaultCsv = loadDefaultDataset();
      const output = processCurrentDataset(defaultCsv);
      res.json({
        success: true,
        message: 'Reset to standard OASIS-2 longitudinal dataset.',
        data: output,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/evaluate - live held-out evaluation with timestamp
  app.get('/api/evaluate', (req, res) => {
    try {
      if (!currentPipelineOutput) {
        currentPipelineOutput = processCurrentDataset(loadDefaultDataset());
      }
      const evaluation = evaluateOnHeldOut(currentPipelineOutput.results);
      currentPipelineOutput.evaluation = evaluation;
      res.json(evaluation);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/tests - runs clinical sanity verification test suite
  app.get('/api/tests', (req, res) => {
    try {
      const testResults = runSanityTests();
      const allPassed = testResults.every(t => t.passed);
      res.json({
        allPassed,
        tests: testResults,
        executedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/explain - uses Gemini API to translate computed flags into clinician-ready synthesis
  app.post('/api/explain', async (req, res) => {
    try {
      const { patientData, reasoningString } = req.body;
      if (!patientData) {
        return res.status(400).json({ error: 'Missing patientData' });
      }

      const client = getGeminiClient();
      if (!client) {
        // High quality deterministic fallback synthesis if API key is not configured
        const fallback = `Clinician Summary: Patient ${patientData.subjectId} (${patientData.latestAge}yo, ${patientData.educ} yrs education) presents with a cognitive residual z-score of ${patientData.stage1?.residualZ ?? 'N/A'}, reflecting an annualized MMSE trajectory of ${patientData.stage1?.mmseSlope ?? 0} pts/yr. ${
          patientData.stage2?.biomarkers
            ? `Simulated plasma biomarkers indicate ${patientData.stage2.biomarkers.pTau217Zone} pTau217 and ${patientData.stage2.biomarkers.amyloidRatioZone} Aβ42/40 ratio.`
            : ''
        } ${
          patientData.stage3?.nwbvSlope !== undefined
            ? `Longitudinal MRI indicates brain volume change of ${patientData.stage3.nwbvSlope}/yr.`
            : ''
        } Recommended action: Prioritize for diagnostic evaluation review based on combined urgency and clinical severity.`;
        return res.json({
          explanation: fallback,
          isAiGenerated: false,
          model: 'rule-based-synthesis',
        });
      }

      const prompt = `You are a clinical decision-support AI assisting a memory clinic neurologist.
Transform the following mathematically computed flags into an objective, concise, clinician-readable explanation paragraph (2-3 sentences max).

STRICT RULES:
1. Ground your synthesis ENTIRELY in the provided numbers and facts below. Do NOT invent new lab values or findings.
2. NEVER state that the patient has Alzheimer's disease or make a definitive diagnosis. State only whether further diagnostic evaluation / confirmatory referral is suggested or whether the profile is reassuring.
3. Explicitly note that plasma biomarker and PET flags are simulated research demonstration parameters.

PATIENT METRICS:
- Subject ID: ${patientData.subjectId}
- Age: ${patientData.latestAge}, Education: ${patientData.educ} years
- Observed MMSE: ${patientData.latestMmse} / 30 (Expected for age/educ: ${patientData.stage1?.expectedMmse})
- Cognitive Residual: ${patientData.stage1?.residual} (z-score: ${patientData.stage1?.residualZ})
- MMSE Annualized Slope: ${patientData.stage1?.mmseSlope} pts/yr (Decline threshold: <= -1.68)
- Clinical Risk Tier: ${patientData.clinicalRiskTier}
- Priority Score: ${patientData.priorityScore} (Severity: ${patientData.severityComponent} × Urgency: ${patientData.urgencyComponent})
- Simulated pTau217: ${patientData.stage2?.biomarkers?.pTau217Zone ?? 'N/A'} (Simulated)
- Simulated Amyloid 42/40: ${patientData.stage2?.biomarkers?.amyloidRatioZone ?? 'N/A'} (Simulated)
- nWBV Slope: ${patientData.stage3?.nwbvSlope ?? 'N/A'}/yr (Threshold: <= -0.010)
- Rule-based Trigger String: "${reasoningString}"

Provide ONLY the concise clinical reasoning paragraph.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert neurological decision-support reasoning assistant. Keep responses focused, concise, and scientifically accurate.',
        },
      });

      const explanation = response.text || reasoningString;
      res.json({
        explanation,
        isAiGenerated: true,
        model: 'gemini-3.7-flash',
      });
    } catch (err: any) {
      console.error('Gemini explanation error:', err);
      res.json({
        explanation: req.body.reasoningString || 'Cognitive and biomarker metrics computed according to protocol.',
        isAiGenerated: false,
        error: err.message,
      });
    }
  });

  // Vite development middleware or static production fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EquiTrace server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start EquiTrace server:', err);
  process.exit(1);
});
