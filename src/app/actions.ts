"use server";

import {
  analyzeCtScan,
  type AnalyzeCtScanOutput,
} from "@/ai/flows/analyze-ct-scan";
import { generatePredictionExplanation } from "@/ai/flows/generate-prediction-explanation";

export interface FullAnalysisResult extends AnalyzeCtScanOutput {
  highlightedAreas?: string;
}

export async function analyzeScanAction(
  photoDataUri: string
): Promise<{ success: boolean; data?: FullAnalysisResult; error?: string }> {
  try {
    const initialResult = await analyzeCtScan({ photoDataUri });

    const explanationResult = await generatePredictionExplanation({
      imageUri: photoDataUri,
      condition: initialResult.prediction === 'normal' ? 'normal' : initialResult.diagnosis,
      confidence: initialResult.confidence,
    });

    const fullResult: FullAnalysisResult = {
      ...initialResult,
      explanation: explanationResult.explanation, // Overwrite with the more detailed explanation
      highlightedAreas: explanationResult.highlightedAreas,
    };

    return { success: true, data: fullResult };
  } catch (error) {
    console.error("Error analyzing CT scan:", error);
    let errorMessage = "An unknown error occurred during analysis.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      error: `Failed to analyze the image. Please try again.`,
    };
  }
}
