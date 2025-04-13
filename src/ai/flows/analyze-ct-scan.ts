'use server';
/**
 * @fileOverview Analyzes a kidney CT scan image to predict the kidney condition.
 *
 * - analyzeCTScan - A function that handles the CT scan analysis process.
 * - AnalyzeCTScanInput - The input type for the analyzeCTScan function.
 * - AnalyzeCTScanOutput - The return type for the analyzeCTScan function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeCTScanInputSchema = z.object({
  ctScanUrl: z.string().describe('The URL of the kidney CT scan image.'),
});
export type AnalyzeCTScanInput = z.infer<typeof AnalyzeCTScanInputSchema>;

const AnalyzeCTScanOutputSchema = z.object({
  condition: z
    .enum(['cyst', 'tumor', 'stone', 'normal'])
    .describe('The predicted kidney condition.'),
  confidenceLevel: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the prediction (0 to 1).'),
  analytics: z.string().describe('Analytics based on the CT scan image'),
});
export type AnalyzeCTScanOutput = z.infer<typeof AnalyzeCTScanOutputSchema>;

export async function analyzeCTScan(input: AnalyzeCTScanInput): Promise<AnalyzeCTScanOutput> {
  return analyzeCTScanFlow(input);
}

const getMedicalInformation = ai.defineTool({
  name: 'getMedicalInformation',
  description: 'Retrieves medical information about kidney conditions based on keywords.',
  inputSchema: z.object({
    keywords: z.string().describe('Keywords related to kidney conditions (e.g., cyst, tumor, stone).'),
  }),
  outputSchema: z.string().describe('Relevant medical information about the kidney condition.'),
}, async input => {
  // Simulate fetching medical information from a database or API.
  // In a real-world scenario, this would involve querying a medical database.
  const {keywords} = input;
  if (keywords.includes('cyst')) {
    return 'Kidney cysts are round or oval-shaped sacs filled with fluid that form on the kidneys.';
  } else if (keywords.includes('tumor')) {
    return 'Kidney tumors are abnormal growths that can be benign or malignant.';
  } else if (keywords.includes('stone')) {
    return 'Kidney stones are hard deposits made of minerals and salts that form inside the kidneys.';
  } else {
    return 'No specific information found.';
  }
});

const prompt = ai.definePrompt({
  name: 'analyzeCTScanPrompt',
  tools: [getMedicalInformation],
  input: {
    schema: z.object({
      ctScanUrl: z.string().describe('The URL of the kidney CT scan image.'),
    }),
  },
  output: {
    schema: z.object({
      condition: z
        .enum(['cyst', 'tumor', 'stone', 'normal'])
        .describe('The predicted kidney condition.'),
      confidenceLevel: z
        .number()
        .min(0)
        .max(1)
        .describe('The confidence level of the prediction (0 to 1).'),
      analytics: z.string().describe('Analytics based on the CT scan image'),
    }),
  },
  prompt: `You are a medical AI assistant specializing in analyzing kidney CT scans. Analyze the provided CT scan image and predict the kidney condition.

  Based on the image, use the getMedicalInformation tool to gather relevant medical information to help in your diagnosis.
  Consider the following characteristics when determining the condition:

  - Cyst: Usually round or oval-shaped, with smooth borders and fluid-filled appearance.
  - Tumor: Irregular shape, may have solid components, and can distort the kidney's normal structure.
  - Stone: High density, appears very bright on the CT scan, and has a well-defined shape.
  - Normal: Kidney appears healthy with no abnormalities.

  Return the predicted condition as one of the following values: cyst, tumor, stone, normal.
  Also, return a confidence level between 0 and 1 for your prediction.
  Also, generate some relevant analytics based on the CT scan image, including size, location, and any other notable features.

  CT Scan Image: {{media url=ctScanUrl}}
  `,
});

const analyzeCTScanFlow = ai.defineFlow<
  typeof AnalyzeCTScanInputSchema,
  typeof AnalyzeCTScanOutputSchema
>(
  {
    name: 'analyzeCTScanFlow',
    inputSchema: AnalyzeCTScanInputSchema,
    outputSchema: AnalyzeCTScanOutputSchema,
  },
  async input => {
    const {ctScanUrl} = input;
    // Initial analysis based on the image to determine relevant keywords for the tool.
    let keywords = '';
    //This code is added just as a default setting of the AI and can be changed based on the AI response
    keywords = 'kidney condition';
    const {output} = await prompt({ctScanUrl});
    return output!;
  }
);
