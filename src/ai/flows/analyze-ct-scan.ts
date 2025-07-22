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
  prompt: `You are an AI expert in analyzing kidney CT scan images. Your task is to analyze the provided image by following these steps:

Step 1: Validate the Image
- First, determine if the provided image is a valid CT scan of a human kidney.
- If it is NOT a kidney CT scan, set 'prediction' to 'abnormal', 'diagnosis' to 'not_a_ct_scan', provide an explanation, and set confidence to a high value (e.g., 0.95).

Step 2: Classify the Kidney
- If the image is a valid kidney CT scan, classify it as 'normal' or 'abnormal'.
- If the kidney is 'normal', set 'prediction' to 'normal' and 'diagnosis' to 'none'.
- If the kidney is 'abnormal', set 'prediction' to 'abnormal'.

Step 3: Diagnose Abnormal Kidneys
- If you classified the kidney as 'abnormal' in Step 2, you must provide a specific diagnosis from the following options: 'cyst', 'tumor', or 'stone'. Set the 'diagnosis' field accordingly.

Use the following detailed radiological criteria for your analysis:

- **Normal Kidney**:
  - **Contour**: Smooth and well-defined borders.
  - **Parenchyma (tissue)**: Homogeneous (uniform) in appearance and density.
  - **Key Features**: No evidence of masses, collections, calcifications (stones), or hydronephrosis (swelling of the renal pelvis).

- **Cyst**:
  - **Shape & Definition**: A simple cyst is a well-defined, round or oval-shaped sac.
  - **Density**: Appears as a low-density (dark), homogeneous, fluid-filled area.
  - **Wall**: Has a very thin, almost imperceptible wall. It does not contain solid components.
  - **Important**: Differentiate a cyst from the renal pelvis (the central collecting part of the kidney), which is also dark but has a characteristic branching shape.

- **Tumor**:
  - **Shape & Definition**: A solid, often irregularly shaped mass.
  - **Density**: May have a heterogeneous (non-uniform) appearance and can enhance (light up) with IV contrast.
  - **Key Features**: Disrupts the normal smooth contour of the kidney.

- **Stone**:
  - **Density**: A very high-density (bright white), well-defined object.
  - **Location**: Found within the kidney's collecting system or ureter.

Also, provide a confidence level (0-1) for your final conclusion and an explanation for your reasoning. Output the prediction, diagnosis, confidence, and explanation as a JSON object.

Here is the CT scan image:
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
