'use server';

import {
  analyzeCtScanFlow,
  type AnalyzeCtScanOutput,
} from '@/ai/flows/analyze-ct-scan';
import {
  generatePredictionExplanationFlow,
  type GeneratePredictionExplanationOutput,
} from '@/ai/flows/generate-prediction-explanation';

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
