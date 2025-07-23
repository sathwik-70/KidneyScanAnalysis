'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Schema and Flow for Analyzing CT Scan ---

const AnalyzeCtScanInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A CT scan image of a kidney, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
type AnalyzeCtScanInput = z.infer<typeof AnalyzeCtScanInputSchema>;

const AnalyzeCtScanOutputSchema = z.object({
  diagnosis: z
    .enum(['normal', 'cyst', 'tumor', 'stone', 'not_a_ct_scan'])
    .describe(
      "The final diagnosis. If the image is not a CT scan, this will be 'not_a_ct_scan'."
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the diagnosis, from 0 to 1.'),
});
export type AnalyzeCtScanOutput = z.infer<typeof AnalyzeCtScanOutputSchema>;

const analyzeCtScanPrompt = ai.definePrompt({
  name: 'analyzeCtScanPrompt',
  input: { schema: AnalyzeCtScanInputSchema },
  output: { schema: AnalyzeCtScanOutputSchema },
  model: 'googleai/gemini-1.5-pro-latest',
  prompt: `You are a world-class radiologist AI specializing in kidney CT scans. Your task is to analyze the provided image with the highest degree of accuracy, following a strict, systematic process.

**Step 1: Image Validation**
First, meticulously examine the image to confirm it is a valid CT scan of a human kidney.
- If it is **NOT** a kidney CT scan, you must set 'diagnosis' to 'not_a_ct_scan'. Provide a clear explanation that the image is not a kidney CT scan. Set confidence to a high value (e.g., 0.98), and STOP.

**Step 2: Systematic Radiological Analysis**
If the image is a valid kidney CT scan, you will perform a detailed analysis based on the following strict criteria. You must classify the scan into **one** of the four categories: Normal, Cyst, Tumor, or Stone.

---
**Radiological Criteria (Analyze in this order):**

1.  **Stone (Calculus):**
    -   **Primary Evidence:** Look for a **hyperdense (very bright white)**, well-defined object.
    -   **Location:** Typically located within the renal pelvis or calyces (the collecting system).
    -   **Action:** If this is present, classify as **'stone'**.

2.  **Tumor (Neoplasm):**
    -   **Primary Evidence:** Look for a **solid, heterogeneous (non-uniform density)** mass that disrupts the kidney's smooth contour. It is not a simple fluid collection. It often shows enhancement (lights up with contrast) compared to the surrounding kidney tissue.
    -   **Contour:** The mass often causes an abnormal bulge or irregularity on the kidney's border.
    -   **Action:** If this is present, classify as **'tumor'**.

3.  **Cyst:**
    -   **Primary Evidence:** Look for a **well-defined, round or oval-shaped, homogeneous, low-density (dark, fluid-filled)** area.
    -   **Wall:** It must have a very thin, almost imperceptible wall. It contains no solid components.
    -   **Critical Distinction:** You must differentiate a simple cyst from the normal renal pelvis. The renal pelvis is part of the branching, complex collecting system. A cyst is a separate, distinct, spherical structure. If you see a dark area that is part of the branching collecting system, it is NOT a cyst.
    -   **Action:** If a distinct, thin-walled, spherical fluid collection is present, classify as **'cyst'**.

4.  **Normal:**
    -   **Primary Evidence:** The kidney has a smooth, well-defined contour.
    -   **Parenchyma (tissue):** The tissue is homogeneous (uniform density) with no focal masses, no hyperdense stones, and no distinct cysts as defined above.
    -   **Collecting System:** The renal pelvis and calyces are visible and may be dark (fluid-filled), but they have a characteristic branching, not a simple spherical, shape.
    -   **Action:** If **none** of the criteria for Stone, Tumor, or Cyst are met, classify as **'normal'**. This is the default diagnosis if no pathology is found.

---
**Final Output:**
Based on your systematic analysis, provide the final diagnosis and a confidence score between 0 and 1. Do not provide an explanation.

CT Scan Image to analyze:
{{media url=photoDataUri}}
    `,
});

const analyzeCtScanFlow = ai.defineFlow(
  {
    name: 'analyzeCtScanFlow',
    inputSchema: AnalyzeCtScanInputSchema,
    outputSchema: AnalyzeCtScanOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeCtScanPrompt(input);
    return output!;
  }
);


// --- Schema and Flow for Generating Prediction Explanation ---

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

const generatePredictionExplanationPrompt = ai.definePrompt({
    name: 'generatePredictionExplanationPrompt',
    input: {schema: GeneratePredictionExplanationInputSchema},
    output: {schema: GeneratePredictionExplanationOutputSchema},
    model: 'googleai/gemini-1.5-pro-latest',
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

const generatePredictionExplanationFlow = ai.defineFlow(
    {
      name: 'generatePredictionExplanationFlow',
      inputSchema: GeneratePredictionExplanationInputSchema,
      outputSchema: GeneratePredictionExplanationOutputSchema,
    },
    async (input) => {
      const {output} = await generatePredictionExplanationPrompt(input);
      return output!;
    }
);


// --- Main Action Function ---

export interface FullAnalysisResult
  extends AnalyzeCtScanOutput,
    GeneratePredictionExplanationOutput {
  // This interface now combines the output of both AI flows.
}

export async function analyzeScanAction(
  photoDataUri: string
): Promise<{ success: boolean; data?: FullAnalysisResult; error?: string }> {
  try {
    // Step 1: Get the initial diagnosis
    const diagnosisResult = await analyzeCtScanFlow({ photoDataUri });

    if (diagnosisResult.diagnosis === 'not_a_ct_scan') {
      return {
        success: true,
        data: {
          ...diagnosisResult,
          explanation:
            'The uploaded image does not appear to be a valid CT scan of a kidney. Please upload a relevant medical image for analysis.',
        },
      };
    }

    // Step 2: Generate a detailed explanation based on the diagnosis
    const explanationResult = await generatePredictionExplanationFlow({
      imageUri: photoDataUri,
      condition: diagnosisResult.diagnosis,
      confidence: diagnosisResult.confidence,
    });

    // Combine the results from both steps
    const fullResult: FullAnalysisResult = {
      ...diagnosisResult,
      ...explanationResult,
    };

    return { success: true, data: fullResult };
  } catch (error) {
    console.error('Error analyzing CT scan:', error);
    let errorMessage = 'An unknown error occurred during analysis.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      error: `Failed to analyze the image. Please try again.`,
    };
  }
}
