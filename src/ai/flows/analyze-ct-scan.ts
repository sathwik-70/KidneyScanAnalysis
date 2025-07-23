'use server';

/**
 * @fileOverview This file defines the Genkit flow for analyzing kidney CT scan images to predict potential conditions.
 *
 * analyzeCtScan - An async function that takes a CT scan image data URI and returns a prediction with confidence and explanation.
 * AnalyzeCtScanInput - The input type for the analyzeCtscan function, which is a data URI of the CT scan image.
 * AnalyzeCtScanOutput - The output type for the analyzeCtScan function, including the predicted condition, confidence level, and explanation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCtScanInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A CT scan image of a kidney, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCtScanInput = z.infer<typeof AnalyzeCtScanInputSchema>;

const AnalyzeCtScanOutputSchema = z.object({
  diagnosis: z
    .enum(['normal', 'cyst', 'tumor', 'stone', 'not_a_ct_scan'])
    .describe(
      "The final diagnosis. If the image is not a CT scan, this will be 'not_a_ct_scan'."
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the diagnosis, from 0 to 1.'),
});
export type AnalyzeCtScanOutput = z.infer<typeof AnalyzeCtScanOutputSchema>;

export async function analyzeCtScan(
  input: AnalyzeCtScanInput
): Promise<AnalyzeCtScanOutput> {
  return analyzeCtScanFlow(input);
}

const analyzeCtScanPrompt = ai.definePrompt({
  name: 'analyzeCtScanPrompt',
  input: {schema: AnalyzeCtScanInputSchema},
  output: {schema: AnalyzeCtScanOutputSchema},
  prompt: `You are a world-class radiologist AI specializing in kidney CT scans. Your task is to analyze the provided image with the highest degree of accuracy, following a strict, systematic process.

**Step 1: Image Validation**
First, meticulously examine the image to confirm it is a valid CT scan of a human kidney.
- If it is **NOT** a kidney CT scan, you must set 'diagnosis' to 'not_a_ct_scan'. Provide a clear explanation that the image is not a kidney CT scan. Set confidence to a high value (e.g., 0.98), and STOP.

**Step 2: Systematic Radiological Analysis**
If the image is a valid kidney CT scan, you will perform a detailed analysis based on the following strict criteria. You must classify the scan into **one** of the four categories: Normal, Cyst, Tumor, or Stone.

---
**Radiological Criteria (Analyze in this order):**

1.  **Stone (Calculus):**
    -   **Primary Evidence:** Look for a **hyperdense (very bright white)**, well-defined object.
    -   **Location:** Typically located within the renal pelvis or calyces (the collecting system).
    -   **Action:** If this is present, classify as **'stone'**.

2.  **Tumor (Neoplasm):**
    -   **Primary Evidence:** Look for a **solid, heterogeneous (non-uniform density)** mass that disrupts the kidney's smooth contour. It is not a simple fluid collection. It often shows enhancement (lights up with contrast) compared to the surrounding kidney tissue.
    -   **Contour:** The mass often causes an abnormal bulge or irregularity on the kidney's border.
    -   **Action:** If this is present, classify as **'tumor'**.

3.  **Cyst:**
    -   **Primary Evidence:** Look for a **well-defined, round or oval-shaped, homogeneous, low-density (dark, fluid-filled)** area.
    -   **Wall:** It must have a very thin, almost imperceptible wall. It contains no solid components.
    -   **Critical Distinction:** You must differentiate a simple cyst from the normal renal pelvis. The renal pelvis is part of the branching, complex collecting system. A cyst is a separate, distinct, spherical structure. If you see a dark area that is part of the branching collecting system, it is NOT a cyst.
    -   **Action:** If a distinct, thin-walled, spherical fluid collection is present, classify as **'cyst'**.

4.  **Normal:**
    -   **Primary Evidence:** The kidney has a smooth, well-defined contour.
    -   **Parenchyma (tissue):** The tissue is homogeneous (uniform density) with no focal masses, no hyperdense stones, and no distinct cysts as defined above.
    -   **Collecting System:** The renal pelvis and calyces are visible and may be dark (fluid-filled), but they have a characteristic branching, not a simple spherical, shape.
    -   **Action:** If **none** of the criteria for Stone, Tumor, or Cyst are met, classify as **'normal'**. This is the default diagnosis if no pathology is found.

---
**Final Output:**
Based on your systematic analysis, provide the final diagnosis and a confidence score between 0 and 1. Do not provide an explanation.

CT Scan Image to analyze:
{{media url=photoDataUri}}
    `,
});

const analyzeCtScanFlow = ai.defineFlow(
  {
    name: 'analyzeCtScanFlow',
    inputSchema: AnalyzeCtScanInputSchema,
    outputSchema: AnalyzeCtScanOutputSchema,
  },
  async (input) => {
    const {output} = await analyzeCtScanPrompt(input);
    return output!;
  }
);
