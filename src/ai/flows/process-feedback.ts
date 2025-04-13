'use server';
/**
 * @fileOverview Allows incorporating user feedback into the analysis process for continuous model refinement.
 *
 * - processFeedback - A function that handles the processing of feedback for the CT scan analysis.
 * - ProcessFeedbackInput - The input type for the processFeedback function.
 * - ProcessFeedbackOutput - The return type for the processFeedback function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ProcessFeedbackInputSchema = z.object({
  ctScanUrl: z.string().describe('The URL of the kidney CT scan image.'),
  initialCondition: z.enum(['cyst', 'tumor', 'stone', 'normal']).describe('The initial predicted condition.'),
  initialExplanation: z.string().describe('The initial explanation for the prediction.'),
});
export type ProcessFeedbackInput = z.infer<typeof ProcessFeedbackInputSchema>;

const ProcessFeedbackOutputSchema = z.object({
  condition: z.enum(['cyst', 'tumor', 'stone', 'normal']).describe('The refined kidney condition based on feedback.'),
  confidenceLevel: z.number().min(0).max(1).describe('The confidence level of the refined prediction (0 to 1).'),
  analytics: z.string().describe('Refined analytics based on the CT scan image and feedback.'),
  explanation: z.string().describe('Refined explanation of why the model chose the predicted condition, incorporating feedback.'),
});
export type ProcessFeedbackOutput = z.infer<typeof ProcessFeedbackOutputSchema>;

export async function processFeedback(input: ProcessFeedbackInput): Promise<ProcessFeedbackOutput | null> {
  try {
    return await processFeedbackFlow(input);
  } catch (error) {
    console.error('Error processing feedback:', error);
    return null; // Handle the error and return null if feedback processing fails.
  }
}

const feedbackPrompt = ai.definePrompt({
  name: 'feedbackPrompt',
  input: {
    schema: z.object({
      ctScanUrl: z.string().describe('The URL of the kidney CT scan image.'),
      initialCondition: z.string().describe('The initial predicted condition.'),
      initialExplanation: z.string().describe('The initial explanation for the prediction.'),
    }),
  },
  output: {
    schema: ProcessFeedbackOutputSchema,
  },
  prompt: `You are an expert medical AI assistant refining kidney CT scan diagnoses based on user feedback. You are given an initial diagnosis and explanation, and your task is to adjust the diagnosis if necessary based on additional information or corrections.

Instructions:

1. Review the initial diagnosis and explanation.
2. Consider the user's feedback and any new information provided.
3. If the feedback indicates an error or suggests a different diagnosis, re-evaluate the CT scan image and update the diagnosis accordingly.
4. Provide a refined diagnosis, confidence level, analytics, and explanation.

Initial Diagnosis: {{initialCondition}}
Initial Explanation: {{initialExplanation}}
CT Scan Image: {{media url=ctScanUrl}}

Based on your expert analysis and any user feedback, provide a final diagnosis.

Output your response in the following JSON format:
\`\`\`json
{
  "condition": "(cyst, tumor, stone, or normal)",
  "confidenceLevel": "(0 to 1)",
  "analytics": "(concise description of key observations)",
  "explanation": "(detailed explanation for the diagnosis, referencing image features and feedback)"
}
\`\`\`
  `,
});

const processFeedbackFlow = ai.defineFlow<
  typeof ProcessFeedbackInputSchema,
  typeof ProcessFeedbackOutputSchema
>({
  name: 'processFeedbackFlow',
  inputSchema: ProcessFeedbackInputSchema,
  outputSchema: ProcessFeedbackOutputSchema,
},
async input => {
  try {
    const {output} = await feedbackPrompt(input);

    // Validate the output
    const parsedOutput = ProcessFeedbackOutputSchema.safeParse(output);
    if (!parsedOutput.success) {
      console.error('Feedback output validation error:', parsedOutput.error);
      throw new Error('Failed to validate the feedback model output. Please check the model configuration.');
    }

    console.log('Feedback Model Output:', parsedOutput.data);
    return parsedOutput.data;
  } catch (error) {
    console.error('Error processing feedback:', error);
    throw new Error('Failed to process feedback. Please ensure the CT scan URL is valid and try again.');
  }
});
