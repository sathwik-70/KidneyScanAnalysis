'use server';
/**
 * @fileOverview Analyzes a kidney CT scan image to predict the kidney condition.
 *
 * - analyzeCTScan - A function that handles the CT scan analysis process and feedback integration.
 * - AnalyzeCTScanInput - The input type for the analyzeCTScan function.
 * - AnalyzeCTScanOutput - The return type for the analyzeCTScan function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {processFeedback} from './process-feedback';

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
  explanation: z.string().describe('Explanation of why the model chose the predicted condition.'),
});
export type AnalyzeCTScanOutput = z.infer<typeof AnalyzeCTScanOutputSchema>;

export async function analyzeCTScan(input: AnalyzeCTScanInput): Promise<AnalyzeCTScanOutput> {
  const result = await analyzeCTScanFlow(input);

  // If the confidence level is low, attempt to refine the analysis with user feedback.
  if (result.confidenceLevel < 0.5) {
    const feedbackResult = await processFeedback({
      ctScanUrl: input.ctScanUrl,
      initialCondition: result.condition,
      initialExplanation: result.explanation,
    });

    // If feedback is available, update the result with the refined analysis.
    if (feedbackResult) {
      return {
        condition: feedbackResult.condition,
        confidenceLevel: feedbackResult.confidenceLevel,
        analytics: feedbackResult.analytics,
        explanation: feedbackResult.explanation,
      };
    }
  }

  return result;
}

const analyzeCTScanTool = ai.defineTool({
    name: 'analyzeCTScanForImageAnalysis',
    description: 'Use this tool to analyze the CT scan image and identify key features relevant to kidney conditions such as cysts, tumors, stones, or normal tissue.',
    inputSchema: z.object({
        ctScanUrl: z.string().describe('The URL of the kidney CT scan image.')
    }),
    outputSchema: z.string().describe('Detailed analysis of the CT scan image, highlighting any abnormalities and key characteristics relevant to diagnosing kidney conditions.')
}, async input => {
    // Placeholder for image analysis logic
    return `Detailed analysis of the CT scan: [PLACEHOLDER - Detailed analysis based on image processing libraries or AI models]`;
});

const prompt = ai.definePrompt({
  name: 'analyzeCTScanPrompt',
  tools: [analyzeCTScanTool],
  input: {
    schema: z.object({
      ctScanUrl: z.string().describe('The URL of the kidney CT scan image.'),
    }),
  },
  output: {
    schema: AnalyzeCTScanOutputSchema,
  },
  prompt: `You are an expert medical AI assistant specializing in analyzing kidney CT scans to diagnose various conditions. Your primary task is to accurately determine whether a given CT scan indicates a cyst, tumor, stone, or a normal kidney. You must provide a detailed analysis with a confidence level reflecting your certainty.

Instructions:

1.  First, use the analyzeCTScanForImageAnalysis tool to get a detailed analysis of the CT scan image. This will provide insights into the kidney's features and any abnormalities.
2.  Examine the CT scan image, paying close attention to the kidney's shape, size, and internal structures.
3.  Evaluate the presence of any abnormalities such as masses, densities, or unusual features that deviate from a normal kidney.
4.  If abnormalities are detected, analyze their characteristics to differentiate between cysts, tumors, and stones.

    *   Normal:
        *   Overall Integrity: The kidney should exhibit a consistent and homogeneous appearance throughout.
        *   Renal Cortex and Medulla: Pay close attention to ensure there is a clear and consistent renal cortex and medulla. The boundary between the cortex and medulla should be well-defined and distinct.
        *   Smooth Outer Contour: The outer border of the kidney should be smooth, continuous, and well-defined.
        *   No Enlargement or Swelling: There should be no enlargement or swelling of the kidney. The size should be within normal physiological limits.
        *   Absence of Masses or Growths: There should be no visible masses, growths, or unusual densities within the kidney tissue.
        *   No Hydronephrosis: Ensure there is no swelling or enlargement of the kidney due to urine buildup. The collecting system should appear normal and not dilated.
        *   Consistent Density: The density of the kidney tissue should be consistent throughout, without any signs of abnormal areas.
    *   Cyst:
        *   Round or Oval Shape: Cysts typically appear as rounded or oval-shaped structures.
        *   Fluid-Filled Sacs: They are filled with fluid, which results in a specific density on the CT scan.
        *   Smooth, Well-Defined Borders: Cysts have clear and smooth borders, indicating a distinct separation from surrounding tissues.
        *   Uniform Density: The density within the cyst should be consistent, without any signs of internal complexity.
        *   No Enhancement with Contrast: Cysts do not enhance when a contrast agent is used during the CT scan.
    *   Tumor:
        *   Irregular Masses: Tumors often present as irregularly shaped masses, which can vary in size.
        *   Heterogeneous Densities: The density within the tumor can be varied, with areas of both high and low density.
        *   Distortion of Kidney Structure: Tumors may distort the normal kidney structure, affecting its shape and appearance.
        *   Enhancement with Contrast: Tumors can show enhancement with contrast, indicating increased blood flow.
        *   Signs of Invasion: Look for signs of the tumor invading surrounding tissues.
    *   Stone:
        *   High Density: Kidney stones are characterized by their high density, appearing as very bright areas on the CT scan.
        *   Well-Defined Areas: Stones have clear, well-defined borders.
        *   Variable Size and Location: They can vary in size and location within the kidney.

5.  For a normal kidney, ensure that the analysis specifically confirms the presence of all the characteristics of a normal kidney and the absence of the characteristics of cysts, tumors, and stones. The analysis should positively affirm the kidney's health by stating that no abnormalities are detected and that all structures appear normal.
6.  Provide a final diagnosis, selecting one of the following conditions: cyst, tumor, stone, or normal.
7.  Assign a confidence level between 0 and 1, reflecting the certainty of your prediction. Ensure that this level corresponds appropriately to the clarity and distinctiveness of the features observed in the scan.
8.  Generate a concise description of the key analytics observed in the CT scan, including size, location, and any other notable features relevant to the diagnosis.
9.  Provide a detailed explanation for your choice, referencing specific features observed in the image that support your diagnosis. Use the analysis from the analyzeCTScanForImageAnalysis tool in your explanation.

Please analyze the CT scan with high scrutiny, and be detailed.

CT Scan Image: {{media url=ctScanUrl}}

Output your response in the following JSON format:
\`\`\`json
{
  "condition": "(cyst, tumor, stone, or normal)",
  "confidenceLevel": "(numerical value between 0 and 1)",
  "analytics": "(concise description of key observations)",
  "explanation": "(detailed explanation for the diagnosis, referencing image features and insights from analyzeCTScanForImageAnalysis)"
}
\`\`\`
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
    try {
      const {output} = await prompt(input);

      // Validate the output
      const parsedOutput = AnalyzeCTScanOutputSchema.safeParse(output);
      if (!parsedOutput.success) {
        console.error('Output validation error:', parsedOutput.error);
        throw parsedOutput.error; // Re-throw the ZodError for better debugging
      }

      // Ensure confidenceLevel is parsed as a number
      const confidenceLevel = typeof parsedOutput.data.confidenceLevel === 'string'
        ? parseFloat(parsedOutput.data.confidenceLevel)
        : parsedOutput.data.confidenceLevel;

      if (isNaN(confidenceLevel)) {
        throw new Error('Confidence level is not a valid number.');
      }

      const result: AnalyzeCTScanOutput = {
        ...parsedOutput.data,
        confidenceLevel: confidenceLevel,
      };

      console.log('Model Output:', result);
      return result;
    } catch (error: any) {
      console.error('Error analyzing CT scan:', error);
      throw new Error(`Failed to analyze CT scan. Please ensure the CT scan URL is valid and try again. Original error: ${error.message}`);
    }
  }
);

    