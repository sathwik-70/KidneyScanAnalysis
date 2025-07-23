"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { analyzeScanAction, type FullAnalysisResult } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Upload,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Bot,
  FileImage,
  Sparkles,
} from "lucide-react";

type AnalysisState =
  | "idle"
  | "loading"
  | "success"
  | "error";

export default function Home() {
  const [analysisState, setAnalysisState] =
    useState<AnalysisState>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [result, setResult] = useState<FullAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, or WEBP image.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImageDataUri(dataUri);
        setImagePreview(URL.createObjectURL(file));
        setAnalysisState("idle");
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageDataUri) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please upload an image to analyze.",
      });
      return;
    }

    setAnalysisState("loading");
    setError(null);
    setResult(null);

    const response = await analyzeScanAction(imageDataUri);

    if (response.success && response.data) {
      setResult(response.data);
      setAnalysisState("success");
    } else {
      setError(response.error || "An unknown error occurred.");
      setAnalysisState("error");
    }
  };

  const handleFeedback = () => {
    toast({
      title: "Feedback Submitted",
      description: "Thank you for helping us improve our AI model!",
    });
  };

  const capitalized = (s: string) => {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const getDisplayDiagnosis = (diagnosis: string) => {
    if (diagnosis === 'not_a_ct_scan') {
      return 'Not a CT Scan';
    }
    return capitalized(diagnosis.replace(/_/g, " "));
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          AI-Powered Kidney Scan Analysis
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Upload a kidney CT scan to get an instant, AI-driven analysis. Our
          tool predicts conditions like cysts, tumors, or stones with an
          accompanying confidence score.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CT Scan Image
          </CardTitle>
          <CardDescription>
            Select a JPEG, PNG, or WEBP file from your device. For informational
            use only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Input
              ref={fileInputRef}
              id="picture"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
            />
            {imagePreview ? (
              <div className="relative w-full max-w-xs aspect-square">
                <Image
                  src={imagePreview}
                  alt="CT Scan Preview"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileImage className="h-12 w-12" />
                <Label htmlFor="picture" className="font-medium text-foreground">
                  Click to browse or drag & drop an image
                </Label>
                <p className="text-sm">Supports: PNG, JPG, WEBP</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleAnalyzeClick}
            disabled={!imagePreview || analysisState === "loading"}
            className="w-full"
            size="lg"
          >
            {analysisState === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Analyze CT Scan
          </Button>
        </CardFooter>
      </Card>

      {analysisState === "loading" && (
         <Card>
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" /> AI is thinking...
            </CardTitle>
            <CardDescription>
                Please wait while the AI analyzes the scan. This may take a moment.
            </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p>Analyzing image for key indicators...</p>
            </div>
            <Progress value={45} className="w-full" />
           </CardContent>
         </Card>
      )}

      {analysisState === "error" && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisState === "success" && result && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" /> Analysis Result
            </CardTitle>
            <CardDescription>
              The AI model has analyzed the provided CT scan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Diagnosis</Label>
              <p className="text-2xl font-bold font-headline">
                {getDisplayDiagnosis(result.diagnosis)}
              </p>
            </div>
            
            {result.diagnosis !== 'not_a_ct_scan' && (
              <div>
                <Label>Confidence</Label>
                <div className="flex items-center gap-4">
                  <Progress value={result.confidence * 100} className="w-full" />
                  <span className="font-bold text-lg">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label>Explanation</Label>
              <p className="text-muted-foreground">{result.explanation}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50 p-4 rounded-b-lg">
            <p className="text-sm text-muted-foreground">
              Was this diagnosis helpful?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleFeedback}>
                <ThumbsUp className="mr-2 h-4 w-4" /> Yes
              </Button>
              <Button variant="outline" size="sm" onClick={handleFeedback}>
                <ThumbsDown className="mr-2 h-4 w-4" /> No
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
