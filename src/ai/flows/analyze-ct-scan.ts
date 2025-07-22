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
    .enum(['none', 'cyst', 'tumor', 'stone'])
    .describe("The specific diagnosis if the condition is 'abnormal'."),
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
  prompt: `You are an AI expert in analyzing kidney CT scan images. Analyze the provided CT scan image and predict the condition of the kidney.

    Based on the image, first provide a prediction of whether the kidney is 'normal' or 'abnormal'.
    If the prediction is 'abnormal', provide a specific diagnosis from the following: 'cyst', 'tumor', or 'stone'.
    If the prediction is 'normal', the diagnosis should be 'none'.
    
    Use the following descriptions to guide your analysis:
    - **Cyst**: Look for a simple, well-defined, round or oval-shaped, fluid-filled sac. On a non-contrast CT, it should appear as a low-density (dark) area.
    - **Tumor**: Look for a solid, irregularly shaped mass that enhances (lights up) with contrast. It may have a heterogeneous appearance.
    - **Stone**: Look for a very high-density (bright white), well-defined object within the kidney or urinary tract.
    
    Also, provide a confidence level (0-1) for your prediction and an explanation for your reasoning. Output the prediction, diagnosis, confidence, and explanation as a JSON object.

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
