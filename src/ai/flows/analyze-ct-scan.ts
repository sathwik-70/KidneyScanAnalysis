'use server';

/**
 * @fileOverview This file defines the Genkit flow for analyzing kidney CT scan images to predict potential conditions.
 *
 * analyzeCtScan - An async function that takes a CT scan image data URI and returns a prediction with confidence and explanation.
 * AnalyzeCtScanInput - The input type for the analyzeCtScan function, which is a data URI of the CT scan image.
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
    .enum(['normal', 'cyst', 'tumor', 'stone'])
    .describe('The predicted condition of the kidney.'),
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

    Based on the image, provide a prediction of whether the kidney is normal, or has a cyst, tumor, or stone. Also, provide a confidence level (0-1) for your prediction and an explanation for your reasoning. Output the prediction, confidence, and explanation as a JSON object.

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
