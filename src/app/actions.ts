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
  prompt: `You are a world-class radiologist AI. Your task is to analyze the provided image with the highest degree of accuracy and provide a patient-friendly explanation. You will output a single JSON object with 'diagnosis', 'confidence', and 'explanation'.

**Step 1: Image Validation**
First, confirm the image is a valid CT scan of a human kidney. If not, set 'diagnosis' to 'not_a_ct_scan', 'confidence' to 0.99, and 'explanation' to 'The uploaded image does not appear to be a valid CT scan of a kidney. Please upload a relevant medical image for analysis.', then STOP.

**Step 2: Evidence-Based Differential Diagnosis**
If the image is a valid kidney CT scan, you must perform a holistic analysis before reaching a conclusion. Do NOT stop at the first finding. Identify evidence for ALL of the following conditions.

*   **Evidence for Stone (Calculus):** Look for a *hyperdense (very bright white), distinct, and well-circumscribed object*, typically located in the collecting system (renal pelvis or calyces). It should not significantly disrupt the kidney's overall shape.
*   **Evidence for Tumor (Neoplasm):** Look for a *solid mass* that disrupts the kidney's normal smooth contour. Critically, tumors are often *heterogeneous* (have varied density) and can show enhancement. A tumor may contain bright spots (calcifications or vessels), but the primary feature is the presence of a solid, space-occupying tissue mass.
*   **Evidence for Cyst:** Look for a *well-defined, round, homogeneous, low-density (dark, fluid-filled)* area with a very thin, almost imperceptible wall. It does not contain solid tissue.

**Step 3: Final Classification Logic**
After gathering all evidence, apply the following rules to determine the SINGLE correct diagnosis:

1.  **Tumor Overrides Stone:** If you find evidence of a solid, heterogeneous mass (Tumor criteria), even if it contains hyperdense spots, you **MUST** classify it as **'tumor'**. The presence of a mass is the dominant finding. Do not classify it as 'stone'.
2.  **Stone Classification:** Only classify as **'stone'** if you see a distinct, hyperdense object *without* an associated solid, heterogeneous tissue mass.
3.  **Cyst Classification:** Only classify as **'cyst'** if a fluid-filled sac is present and there is **NO** evidence of a solid tumor or a stone.
4.  **Normal Classification:** Only classify as **'normal'** if there is no evidence for a tumor, stone, or cyst.

**Step 4: Generate Explanation**
Based on your final diagnosis, provide a clear, patient-friendly explanation.
*   **If Tumor:** Explain that there is an area of unusual tissue growth that requires immediate medical attention. Stress the importance of discussing the findings with a doctor for further evaluation.
*   **If Stone:** Explain that the scan shows a dense spot characteristic of a kidney stone and advise consulting a doctor.
*   **If Cyst:** Explain that it's a simple, fluid-filled sac, which is often benign, but a doctor should confirm.
*   **If Normal:** Reassure the patient that the scan appears to show no clear signs of common issues.

Provide the final JSON output based on your rigorous analysis.

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
): Promise<{ success: boolean; data?: FullAnalysisResult; error?: string }> {
  try {
    // A single, unified call to the AI flow
    const result = await analyzeAndExplainCtScanFlow({ photoDataUri });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error analyzing CT scan:', error);
    let errorMessage = 'An unknown error occurred during analysis.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Return a user-friendly error message
    return {
      success: false,
      error: `Failed to analyze the image. Please try again. The AI model may be temporarily unavailable.`,
    };
  }
}
