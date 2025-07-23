'use server';

/**
 * @fileOverview AI flow for generating human-readable explanations for kidney condition predictions.
 *
 * - generatePredictionExplanationFlow - A function that generates explanations for kidney condition predictions.
 * - GeneratePredictionExplanationInput - The input type for the generatePredictionExplanation function.
 * - GeneratePredictionExplanationOutput - The return type for the generatePredictionExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
  explanation: z.string().describe('A human-readable explanation for the prediction, written for a patient to understand.'),
});
export type GeneratePredictionExplanationOutput = z.infer<typeof GeneratePredictionExplanationOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generatePredictionExplanationPrompt',
  input: {schema: GeneratePredictionExplanationInputSchema},
  output: {schema: GeneratePredictionExplanationOutputSchema},
  prompt: `You are a medical AI assistant. Your task is to explain a kidney CT scan diagnosis to a patient in a clear, simple, and reassuring way.

**Image Analysis:**
- The AI has analyzed the provided CT scan image and made a diagnosis.
- **Diagnosis:** {{{condition}}}
- **Confidence:** {{{confidence}}}

**Your Task:**
Write a short, easy-to-understand explanation for the patient based on the AI's diagnosis.

- **If the diagnosis is 'normal':** Reassure the patient that the scan appears normal and explain what that means in simple terms (e.g., "The scan shows that your kidney has a normal size and shape, with no clear signs of stones, cysts, or tumors.").
- **If the diagnosis is 'cyst', 'tumor', or 'stone':**
    - Explain what the condition is in simple terms.
    - Briefly describe the visual evidence the AI likely used (e.g., for a stone: "a small, dense spot"; for a cyst: "a round, fluid-filled area").
    - **Crucially, end by advising the patient to discuss these findings with their doctor for a formal diagnosis and next steps.** Do not provide medical advice.
- **Tone:** Keep the tone calm, professional, and empathetic. Avoid overly technical jargon.

**Context:**
- CT Scan Image: {{media url=imageUri}}
- AI Predicted Condition: {{{condition}}}
- AI Confidence Level: {{{confidence}}}

Generate the explanation now.`,
});

export const generatePredictionExplanationFlow = ai.defineFlow(
  {
    name: 'generatePredictionExplanationFlow',
    inputSchema: GeneratePredictionExplanationInputSchema,
    outputSchema: GeneratePredictionExplanationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
