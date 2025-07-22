import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-ct-scan.ts';
import '@/ai/flows/generate-prediction-explanation.ts';