'use server';
/**
 * @fileOverview Generates analytics from a CT scan based on a prompt.
 *
 * - generateAnalytics - A function that handles the generation of analytics.
 * - GenerateAnalyticsInput - The input type for the generateAnalytics function.
 * - GenerateAnalyticsOutput - The return type for the generateAnalytics function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateAnalyticsInputSchema = z.object({
  ctScanImageUrl: z.string().describe('The URL of the CT scan image.'),
  prompt: z.string().describe('The prompt to use for generating analytics.'),
});
export type GenerateAnalyticsInput = z.infer<typeof GenerateAnalyticsInputSchema>;

const GenerateAnalyticsOutputSchema = z.object({
  analytics: z.string().describe('The generated analytics from the CT scan.'),
  confidenceLevel: z.number().describe('The confidence level of the generated analytics (0-1).'),
});
export type GenerateAnalyticsOutput = z.infer<typeof GenerateAnalyticsOutputSchema>;

export async function generateAnalytics(input: GenerateAnalyticsInput): Promise<GenerateAnalyticsOutput> {
  return generateAnalyticsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnalyticsPrompt',
  input: {
    schema: z.object({
      ctScanImageUrl: z.string().describe('The URL of the CT scan image.'),
      prompt: z.string().describe('The prompt to use for generating analytics.'),
    }),
  },
  output: {
    schema: z.object({
      analytics: z.string().describe('The generated analytics from the CT scan.'),
      confidenceLevel: z.number().describe('The confidence level of the generated analytics (0-1).'),
    }),
  },
  prompt: `You are a medical AI assistant that analyzes CT scans and generates analytics based on a given prompt.\n\nAnalyze the following CT scan image: {{media url=ctScanImageUrl}}\n\nBased on the image and the following prompt, generate the analytics: {{{prompt}}}\n\nPlease provide the analytics and a confidence level (0-1) for your analysis.\n\nAnalytics:`, // Explicitly request analytics
});

const generateAnalyticsFlow = ai.defineFlow<
  typeof GenerateAnalyticsInputSchema,
  typeof GenerateAnalyticsOutputSchema
>({
  name: 'generateAnalyticsFlow',
  inputSchema: GenerateAnalyticsInputSchema,
  outputSchema: GenerateAnalyticsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
