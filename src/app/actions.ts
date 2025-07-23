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
  model: 'googleai/gemini-1.5-pro-latest',
  prompt: `You are a world-class radiologist AI specializing in kidney CT scans. Your task is to analyze the provided image with the highest degree of accuracy and then provide a clear, patient-friendly explanation. You must output a single JSON object with 'diagnosis', 'confidence', and 'explanation'.

**Step 1: Image Validation**
First, meticulously examine the image to confirm it is a valid CT scan of a human kidney.
- If it is **NOT** a kidney CT scan, you must set 'diagnosis' to 'not_a_ct_scan', 'confidence' to a high value (e.g., 0.98), and 'explanation' to 'The uploaded image does not appear to be a valid CT scan of a kidney. Please upload a relevant medical image for analysis.', then STOP.

**Step 2: Systematic Radiological Analysis & Explanation Generation**
If the image is a valid kidney CT scan, perform a detailed analysis based on the following strict criteria. You must classify the scan into **one** of the four categories: Normal, Cyst, Tumor, or Stone. After determining the diagnosis, generate the explanation.

---
**Radiological Criteria (Analyze in this order):**

1.  **Stone (Calculus):**
    -   **Primary Evidence:** Look for a **hyperdense (very bright white)**, well-defined object, typically within the renal pelvis or calyces.
    -   **Action:** If present, classify as **'stone'**.
    -   **Explanation:** Explain that the scan shows a small, dense spot characteristic of a kidney stone and advise the user to consult their doctor.

2.  **Tumor (Neoplasm):**
    -   **Primary Evidence:** Look for a **solid, heterogeneous (non-uniform density)** mass that disrupts the kidney's smooth contour. It is not a simple fluid collection and often shows enhancement with contrast.
    -   **Action:** If present, classify as **'tumor'**.
    -   **Explanation:** Explain that there is an area with unusual tissue growth that may indicate a tumor and stress the importance of discussing the findings with a doctor for further evaluation.

3.  **Cyst:**
    -   **Primary Evidence:** Look for a **well-defined, round, homogeneous, low-density (dark, fluid-filled)** area with a very thin wall.
    -   **Critical Distinction:** Differentiate this from the normal renal pelvis, which is a branching structure. A cyst is a separate, spherical structure.
    -   **Action:** If a distinct cyst is present, classify as **'cyst'**.
    -   **Explanation:** Explain that the scan shows a simple, fluid-filled sac known as a cyst, which is often benign, but that a doctor should confirm the diagnosis.

4.  **Normal:**
    -   **Primary Evidence:** Smooth kidney contour, homogeneous tissue, and no signs matching the criteria for stone, tumor, or cyst.
    -   **Action:** If no pathology is found, classify as **'normal'**.
    -   **Explanation:** Reassure the patient that the scan appears normal, showing the kidney has a standard size and shape with no clear signs of common issues like stones, cysts, or tumors.

---
**Final Output:**
Based on your systematic analysis, provide the final JSON object containing 'diagnosis', 'confidence' (a score between 0 and 1), and the corresponding 'explanation'.

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
    return output!;
  }
);


// --- Main Action Function ---

export async function analyzeScanAction(
  photoDataUri: string
): Promise<{ success: boolean; data?: FullAnalysisResult; error?: string }> {
  try {
    // A single, unified call to the AI flow
    const result = await analyzeAndExplainCtScanFlow({ photoDataUri });

    if (!result) {
      throw new Error('AI analysis returned no result.');
    }

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
