'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {analyzeCTScan} from '@/ai/flows/analyze-ct-scan';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useEffect} from 'react';
import {RedoIcon} from 'lucide-react';

const DISCLAIMER =
  'This AI analysis is for informational purposes only and should not be considered a substitute for professional medical advice. Consult with a qualified healthcare provider for diagnosis and treatment.';

export default function Home() {
  const [ctScanUrl, setCtScanUrl] = useState('');
  const [prediction, setPrediction] = useState<
    | {
        condition: 'cyst' | 'tumor' | 'stone' | 'normal';
        confidenceLevel: number;
        analytics: string;
        explanation: string;
      }
    | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedArea, setHighlightedArea] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setCtScanUrl(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeCTScan({ctScanUrl: ctScanUrl});
      setPrediction(result);
    } catch (error) {
      console.error('Error analyzing CT scan:', error);
      alert('Failed to analyze CT scan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Placeholder for visual highlighting logic, can use a library or custom implementation
    if (prediction?.condition) {
      // Example: Highlight a specific area based on the predicted condition
      switch (prediction.condition) {
        case 'cyst':
          setHighlightedArea('Highlighting area potentially indicating a cyst.');
          break;
        case 'tumor':
          setHighlightedArea('Highlighting area potentially indicating a tumor.');
          break;
        case 'stone':
          setHighlightedArea('Highlighting area potentially indicating a stone.');
          break;
        default:
          setHighlightedArea('No specific area highlighted.');
      }
    } else {
      setHighlightedArea('');
    }
  }, [prediction]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">KidneyScan Analyzer</h1>
        <p className="text-muted-foreground">Upload a CT scan image for analysis.</p>
      </header>

      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>Image Upload</CardTitle>
          <CardDescription>Upload a CT scan image of the kidney.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          {ctScanUrl && (
            <img
              src={ctScanUrl}
              alt="CT Scan"
              className="rounded-md shadow-md"
              style={{maxHeight: '300px', objectFit: 'contain'}}
            />
          )}
          <Button onClick={handleAnalyze} disabled={!ctScanUrl || isLoading}>
            {isLoading ? (
              <>
                Analyzing...
                <RedoIcon className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Analyze CT Scan'
            )}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <Card className="w-full max-w-md mb-8">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>Predicted kidney condition.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span>Condition:</span>
              <Badge variant="secondary">{prediction.condition}</Badge>
            </div>
            <div>Confidence Level: {(prediction.confidenceLevel * 100).toFixed(2)}%</div>
            <div>Analytics: {prediction.analytics}</div>
             <div>Explanation: {prediction.explanation}</div>
            {highlightedArea && <div>Visual Highlighting: {highlightedArea}</div>}
          </CardContent>
        </Card>
      )}

       {prediction && prediction.confidenceLevel < 0.6 && (
        <Alert variant="warning" className="w-full max-w-md">
          <AlertTitle>Low Confidence</AlertTitle>
          <AlertDescription>
            The AI analysis has a low confidence level. Please consult with a qualified healthcare provider for diagnosis and treatment.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="w-full max-w-md">
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>{DISCLAIMER}</AlertDescription>
      </Alert>
    </div>
  );
}
