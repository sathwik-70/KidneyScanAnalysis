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

const prompt = ai.definePrompt({
  name: 'analyzeCTScanPrompt',
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
  prompt: `You are a highly specialized medical AI assistant, adept at analyzing kidney CT scans to identify various conditions. Your primary task is to accurately determine whether a given CT scan indicates a cyst, tumor, stone, or a normal kidney.

  Here are the key characteristics to consider for each condition:

  - Normal: The kidney will have a uniform appearance, clear borders, and no unusual densities or masses. The internal structures, such as the renal cortex and medulla, will be clearly distinguishable without any abnormalities. Visual inspection: Normal kidney tissue appears homogeneous with a consistent density.
  - Cyst: Cysts typically appear as round or oval-shaped, fluid-filled sacs with smooth, well-defined borders. They usually have a uniform density and do not enhance with contrast. Visual inspection: Cysts are typically dark (hypodense) compared to normal kidney tissue.
  - Tumor: Tumors can vary in size and shape but often present as irregular masses with heterogeneous densities. They may distort the normal kidney structure and can show enhancement with contrast. Look for signs of invasion into surrounding tissues. Visual inspection: Tumors often appear as a mass distinct from the surrounding tissue, potentially distorting the kidney's shape.
  - Stone: Kidney stones are characterized by their high density, appearing as very bright, well-defined areas on the CT scan. They can vary in size and location within the kidney. Visual inspection: Stones appear as bright white spots (hyperdense) due to their high mineral content.

  Instructions:

  1. Carefully examine the CT scan image provided, paying close attention to the kidney's shape, size, and internal structures.
  2. Evaluate the presence of any masses, densities, or unusual features that deviate from a normal kidney.
  3. If abnormalities are detected, analyze their characteristics to differentiate between cysts, tumors, and stones based on the criteria mentioned above.
  4. Provide a final diagnosis, selecting one of the following conditions: cyst, tumor, stone, or normal.
  5. Assign a confidence level between 0 and 1, reflecting the certainty of your prediction.
  6. Generate a concise description of the key analytics observed in the CT scan, including size, location, and any other notable features relevant to the diagnosis.

  CT Scan Image: {{media url=ctScanUrl}}

  Output your response in the following format:
  - Condition: (cyst, tumor, stone, or normal)
  - Confidence Level: (0 to 1)
  - Analytics: (concise description of key observations)
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
    const {output} = await prompt(input);
    return output!;
  }
);
