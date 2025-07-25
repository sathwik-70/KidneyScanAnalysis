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
  prompt: `You are a world-class radiologist AI specializing in kidney CT scans. Your task is to analyze the provided image with the highest degree of accuracy and then provide a clear, patient-friendly explanation. You must output a single JSON object with 'diagnosis', 'confidence', and 'explanation'.

**Step 1: Image Validation**
First, meticulously examine the image to confirm it is a valid CT scan of a human kidney.
- If it is **NOT** a kidney CT scan, you must set 'diagnosis' to 'not_a_ct_scan', 'confidence' to a high value (e.g., 0.98), and 'explanation' to 'The uploaded image does not appear to be a valid CT scan of a kidney. Please upload a relevant medical image for analysis.', then STOP.

**Step 2: Systematic Radiological Analysis & Explanation Generation**
If the image is a valid kidney CT scan, you must perform a detailed analysis based on the following strict, hierarchical criteria. You must classify the scan into **one** of the four categories: Normal, Cyst, Tumor, or Stone. The order of analysis is critical.

---
**Radiological Criteria (Analyze in this exact order and stop when a positive finding is made):**

1.  **Analyze for Stone (Calculus):**
    -   **Evidence:** Look for a **hyperdense (very bright white)**, well-defined object, typically within the renal pelvis or calyces.
    -   **Action:** If present, you **must** classify as **'stone'** and proceed to generate the explanation. Do not consider other diagnoses.
    -   **Explanation (if stone):** Explain that the scan shows a small, dense spot characteristic of a kidney stone and advise the user to consult their doctor for confirmation and treatment options.

2.  **Analyze for Tumor (Neoplasm):**
    -   **Evidence:** Only if no stone is found, look for a **solid, heterogeneous (non-uniform density) mass** that disrupts the kidney's normal smooth contour. It is not a simple fluid collection and may show enhancement.
    -   **Action:** If present, you **must** classify as **'tumor'** and proceed to generate the explanation. Do not classify it as a cyst or normal.
    -   **Explanation (if tumor):** Explain that there is an area of unusual tissue growth that requires immediate medical attention. Stress the importance of discussing the findings with a doctor for further evaluation, such as a biopsy.

3.  **Analyze for Cyst:**
    -   **Evidence:** Only if no stone or tumor is found, look for a **well-defined, round, homogeneous, low-density (dark, fluid-filled)** area with a very thin, almost imperceptible wall.
    -   **Action:** If a simple cyst is present, classify as **'cyst'** and proceed to generate the explanation.
    -   **Explanation (if cyst):** Explain that the scan shows a simple, fluid-filled sac known as a cyst, which is often benign, but that a doctor should confirm the diagnosis.

4.  **Classify as Normal:**
    -   **Evidence:** Only if **no evidence** for a stone, tumor, or cyst is found after systematically checking for each. The kidney must have a smooth contour and homogeneous tissue density throughout.
    -   **Action:** If no pathology is found, classify as **'normal'**.
    -   **Explanation (if normal):** Reassure the patient that the scan appears normal, showing the kidney has a standard size and shape with no clear signs of common issues like stones, cysts, or tumors. Advise them to continue with regular check-ups as recommended by their doctor.

---
**Final Output:**
Based on your strict, hierarchical analysis, provide the final JSON object containing 'diagnosis', 'confidence' (your confidence score in the classification from 0.0 to 1.0), and the corresponding 'explanation'.

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
