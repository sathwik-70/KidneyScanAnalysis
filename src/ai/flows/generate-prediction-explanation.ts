'use server';

/**
 * @fileOverview AI flow for generating human-readable explanations for kidney condition predictions.
 *
 * - generatePredictionExplanation - A function that generates explanations for kidney condition predictions.
 * - GeneratePredictionExplanationInput - The input type for the generatePredictionExplanation function.
 * - GeneratePredictionExplanationOutput - The return type for the generatePredictionExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePredictionExplanationInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "A CT scan image of a kidney, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  condition: z.string().describe('The predicted kidney condition (normal, cyst, tumor, or stone).'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
});
export type GeneratePredictionExplanationInput = z.infer<typeof GeneratePredictionExplanationInputSchema>;

const GeneratePredictionExplanationOutputSchema = z.object({
  explanation: z.string().describe('A human-readable explanation for the prediction.'),
  highlightedAreas: z.string().optional().describe('Description of areas of concern.'),
});
export type GeneratePredictionExplanationOutput = z.infer<typeof GeneratePredictionExplanationOutputSchema>;

export async function generatePredictionExplanation(input: GeneratePredictionExplanationInput): Promise<GeneratePredictionExplanationOutput> {
  return generatePredictionExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePredictionExplanationPrompt',
  input: {schema: GeneratePredictionExplanationInputSchema},
  output: {schema: GeneratePredictionExplanationOutputSchema},
  prompt: `You are a medical AI assistant specialized in explaining kidney CT scan analysis results.

  Based on the provided CT scan image, predicted condition, and confidence level, generate a human-readable explanation for the prediction. If possible explain where areas of concern are on the image.

  Image: {{media url=imageUri}}
  Condition: {{{condition}}}
  Confidence Level: {{{confidence}}}
  Explanation: `,
});

const generatePredictionExplanationFlow = ai.defineFlow(
  {
    name: 'generatePredictionExplanationFlow',
    inputSchema: GeneratePredictionExplanationInputSchema,
    outputSchema: GeneratePredictionExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
