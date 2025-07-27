
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Unified Schema for a single, combined AI flow ---

const FullAnalysisResultSchema = z.object({
  diagnosis: z
    .enum(['normal', 'cyst', 'tumor', 'stone', 'not_a_ct_scan'])
    .describe(
      "The final diagnosis. If the image is not a CT scan, this must be 'not_a_ct_scan'."
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the diagnosis, from 0 to 1.'),
  explanation: z
    .string()
    .describe(
      'A human-readable explanation for the diagnosis, written for a patient to understand. If not a CT scan, explain that.'
    ),
});
export type FullAnalysisResult = z.infer<typeof FullAnalysisResultSchema>;


// --- Unified Prompt and Flow ---

const analyzeAndExplainCtScanPrompt = ai.definePrompt({
  name: 'analyzeAndExplainCtScanPrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A CT scan image of a kidney, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: { schema: FullAnalysisResultSchema },
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are a world-class radiologist AI. Your task is to analyze the provided kidney CT scan and determine the single most accurate diagnosis. You will output a single JSON object with 'diagnosis', 'confidence', and 'explanation'.

Follow these rules STRICTLY to determine the diagnosis:

1.  **IMAGE VALIDATION:** First, verify the image is a CT scan of a human kidney. If not, the diagnosis MUST be 'not_a_ct_scan'. STOP HERE.

2.  **DIAGNOSTIC HIERARCHY:** If the image is a valid CT scan, you must evaluate for the following conditions in this exact order. Your primary goal is to avoid misclassifying a normal kidney as a tumor.

    -   **Rule A: Check for a TUMOR.**
        -   **Evidence:** Look for a **distinct, focal, solid mass** that has a different tissue density (enhancement) than the surrounding normal kidney tissue. A tumor is a **space-occupying lesion** that **clearly disrupts and deforms the expected smooth, bean-like outline of the kidney**. It is NOT a subtle or gentle bulge. Normal anatomical variations (like a dromedary hump or fetal lobulations) should NOT be classified as a tumor.
        -   **Decision:** If you are highly confident a solid mass that deforms the kidney contour is present, the diagnosis MUST be 'tumor', regardless of any other findings. This is the most critical rule. STOP HERE.

    -   **Rule B: Check for a STONE.**
        -   **Evidence:** **Only if NO tumor is found**, look for a **hyperdense (very bright white), distinct, well-circumscribed OBJECT**. A stone is an object, NOT a large tissue mass. It does not significantly disrupt the kidney's overall shape.
        -   **Decision:** If a stone is present (and no tumor was found), the diagnosis MUST be 'stone'. STOP HERE.

    -   **Rule C: Check for a CYST.**
        -   **Evidence:** **Only if NO tumor or stone is found**, look for a well-defined, round, **homogeneous, low-density (dark, fluid-filled)** area with a very thin wall. It contains NO solid tissue.
        -   **Decision:** If a cyst is present (and no tumor or stone was found), the diagnosis MUST be 'cyst'. STOP HERE.

    -   **Rule D: NORMAL.**
        -   **Evidence:** A normal kidney has a smooth, regular, bean-shaped contour and uniform tissue density throughout its cortex. Minor variations in shape, like a gentle bulge (dromedary hump) or slight lobulations, are normal.
        -   **Decision:** If the criteria for Tumor, Stone, or Cyst are NOT met, the diagnosis MUST be 'normal'.

3.  **GENERATE EXPLANATION:** Based on your final diagnosis, provide a clear, patient-friendly explanation.

CT Scan Image to analyze:
{{media url=photoDataUri}}
    `,
});

const analyzeAndExplainCtScanFlow = ai.defineFlow(
  {
    name: 'analyzeAndExplainCtScanFlow',
    inputSchema: z.object({ photoDataUri: z.string() }),
    outputSchema: FullAnalysisResultSchema,
  },
  async (input) => {
    const { output } = await analyzeAndExplainCtScanPrompt(input);
    if (!output) {
      throw new Error('AI analysis returned no result.');
    }
    return output;
  }
);


// --- Main Action Function ---

export async function analyzeScanAction(
  photoDataUri: string
): Promise<{ success: boolean; data?: Full.AnalysisResult; error?: string }> {
  try {
    const result = await analyzeAndExplainCtScanFlow({ photoDataUri });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error analyzing CT scan:', error);
    let errorMessage = 'An unknown error occurred during analysis.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      error: `Failed to analyze the image. Please try again. The AI model may be temporarily unavailable.`,
    };
  }
}
