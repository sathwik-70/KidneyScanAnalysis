"use server";

import {
  analyzeCtScan,
  type AnalyzeCtScanOutput,
} from "@/ai/flows/analyze-ct-scan";

export interface FullAnalysisResult extends AnalyzeCtScanOutput {
  // This interface can be extended in the future if needed
}

export async function analyzeScanAction(
  photoDataUri: string
): Promise<{ success: boolean; data?: FullAnalysisResult; error?: string }> {
  try {
    const result = await analyzeCtScan({ photoDataUri });

    return { success: true, data: result };
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
