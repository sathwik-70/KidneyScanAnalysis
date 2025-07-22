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
  prediction: z
    .enum(['normal', 'abnormal'])
    .describe('The predicted condition of the kidney.'),
  diagnosis: z
    .enum(['none', 'cyst', 'tumor', 'stone', 'not_a_ct_scan'])
    .describe("The specific diagnosis if the condition is 'abnormal'. If the image is not a CT scan, this will be 'not_a_ct_scan'."),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the prediction, ranging from 0 to 1.'),
  explanation: z
    .string()
    .describe('An explanation of why the AI made this prediction.'),
});
export type AnalyzeCtScanOutput = z.infer<typeof AnalyzeCtScanOutputSchema>;

export async function analyzeCtScan(input: AnalyzeCtScanInput): Promise<AnalyzeCtScanOutput> {
  return analyzeCtScanFlow(input);
}

const analyzeCtScanPrompt = ai.definePrompt({
  name: 'analyzeCtScanPrompt',
  input: {schema: AnalyzeCtScanInputSchema},
  output: {schema: AnalyzeCtScanOutputSchema},
  prompt: `You are a world-class radiologist AI specializing in kidney CT scans. Your task is to analyze the provided image with the highest degree of accuracy, following a strict, systematic process.

**Step 1: Image Validation**
First, meticulously examine the image to confirm it is a valid CT scan of a human kidney.
- If it is **NOT** a kidney CT scan, you must set 'prediction' to 'abnormal' and 'diagnosis' to 'not_a_ct_scan'. Provide a clear explanation that the image is not a kidney CT scan. Set confidence to a high value (e.g., 0.98).

**Step 2: Condition Classification**
If the image is a valid kidney CT scan, you will classify its condition.
- If the kidney appears entirely healthy and free of anomalies, classify it as 'normal'.
- If you detect any abnormality, classify it as 'abnormal'.

**Step 3: Specific Diagnosis for Abnormal Kidneys**
If you classified the kidney as 'abnormal' in Step 2, you must provide a specific diagnosis.
- Choose one of the following: 'cyst', 'tumor', or 'stone'.
- Set the 'diagnosis' field to your finding.

---

**Detailed Radiological Criteria:**

You must use the following criteria for your analysis. Pay extremely close attention to the subtle differences.

- **Normal Kidney**:
  - **Contour**: The kidney must have a smooth and well-defined border. There should be no bulges or irregularities.
  - **Parenchyma (tissue)**: The tissue must be homogeneous, meaning it has a uniform appearance and density throughout. There are no focal masses, fluid collections, or bright white spots.
  - **Collecting System**: The renal pelvis (the central collecting part) should be dark but have its characteristic branching shape, not a simple round or oval shape.

- **Cyst**:
  - **Shape and Definition**: A simple cyst is a very well-defined, round or oval-shaped sac.
  - **Density**: It appears as a low-density (dark), homogeneous, fluid-filled area.
  - **Wall**: It has a very thin, almost imperceptible wall. It does not contain solid components.
  - **Key Distinction**: It is critical to differentiate a cyst from the normal renal pelvis. A cyst is typically more spherical and is not part of the branching collecting system.

- **Tumor**:
  - **Shape and Definition**: A solid, often irregularly shaped mass that disrupts the kidney's smooth contour.
  - **Density**: It often has a heterogeneous (non-uniform) appearance and can enhance (light up) with contrast.

- **Stone**:
  - **Density**: A very high-density (bright white), well-defined object. It is hyperdense.
  - **Location**: Typically found within the kidney's collecting system.

**Examples:**

To calibrate your analysis, refer to these examples.

- **Example 1: Normal Kidney**
  - **Observation**: The image shows a kidney with a perfectly smooth contour. The parenchyma is uniform in density. The central collecting system is dark but has a normal, branching appearance. There are no round fluid collections or bright calcifications.
  - **Conclusion**: This is a classic example of a **normal** kidney.

- **Example 2: Kidney with a Cyst**
  - **Observation**: The image shows a kidney that is mostly normal, but there is a distinct, well-defined, dark, circular area on the outer edge. This area is fluid-density and has a very thin wall. It is clearly separate from the main collecting system.
  - **Conclusion**: This is an **abnormal** kidney with a **cyst**.

---

Finally, provide a confidence level (0-1) for your conclusion and a brief, technical explanation for your reasoning based on the criteria above. Output your final analysis as a JSON object.

Here is the CT scan image to analyze:
{{media url=photoDataUri}}
    `,
});

const analyzeCtScanFlow = ai.defineFlow(
  {
    name: 'analyzeCtScanFlow',
    inputSchema: AnalyzeCtScanInputSchema,
    outputSchema: AnalyzeCtScanOutputSchema,
  },
  async input => {
    const {output} = await analyzeCtScanPrompt(input);
    return output!;
  }
);
