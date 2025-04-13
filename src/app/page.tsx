'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {analyzeCTScan} from '@/ai/flows/analyze-ct-scan';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useEffect} from 'react';
import {RedoIcon} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

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
  const [feedbackCondition, setFeedbackCondition] = useState('');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

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
      setShowFeedbackForm(result.confidenceLevel < 0.5); // Show feedback form if confidence is low

      // Placeholder for triggering visual highlighting component
      if (result.condition && imageContainerRef.current) {
        //  a function `highlightRegion` that takes the image URL and a region identifier (e.g., 'cyst-area', 'tumor-area') as arguments.
        // This function would then use a library like Fabric.js or Konva to overlay the image with shapes or colors,
        // highlighting the identified region.
        // highlightRegion(ctScanUrl, `${result.condition}-area`);
        console.log(`Highlighting ${result.condition} area`);
      }
    } catch (error) {
      console.error('Error analyzing CT scan:', error);
      alert('Failed to analyze CT scan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async () => {
    // Placeholder for sending feedback to the server/AI model
    console.log('Feedback submitted:', {
      condition: feedbackCondition,
      comments: feedbackComments,
      ctScanUrl: ctScanUrl,
      initialCondition: prediction?.condition,
      initialExplanation: prediction?.explanation,
    });
    alert('Feedback submitted. Thank you!'); // Replace with actual feedback submission logic
    setShowFeedbackForm(false);
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const data = prediction
    ? [
      {name: 'Confidence', value: prediction.confidenceLevel * 100},
    ]
    : [];
  const conditionData = prediction
    ? [{name: prediction.condition, value: 1}]
    : [];

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
              <div className="relative" ref={imageContainerRef}>
                <img
                  src={ctScanUrl}
                  alt="CT Scan"
                  className="rounded-md shadow-md"
                  style={{maxHeight: '300px', objectFit: 'contain'}}
                />
                {prediction?.condition === 'cyst' && (
                  <div
                    className="absolute inset-0 rounded-md"
                    style={{border: '4px solid rgba(255, 0, 0, 0.5)'}} // Example: Red border for cysts
                  />
                )}
                {prediction?.condition === 'tumor' && (
                  <div
                    className="absolute inset-0 rounded-md"
                    style={{border: '4px solid rgba(0, 255, 0, 0.5)'}} // Example: Green border for tumors
                  />
                )}
                {prediction?.condition === 'stone' && (
                  <div
                    className="absolute inset-0 rounded-md"
                    style={{border: '4px solid rgba(0, 0, 255, 0.5)'}} // Example: Blue border for stones
                  />
                )}
              </div>
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

      {showFeedbackForm && prediction && (
        <Card className="w-full max-w-md mb-8">
          <CardHeader>
            <CardTitle>Feedback Form</CardTitle>
            <CardDescription>Help us improve our analysis by providing feedback.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="space-y-2">
              <label htmlFor="condition">Correct Condition:</label>
              <Select onValueChange={setFeedbackCondition} defaultValue={prediction.condition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="cyst">Cyst</SelectItem>
                  <SelectItem value="tumor">Tumor</SelectItem>
                  <SelectItem value="stone">Stone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="comments">Additional Comments:</label>
              <Textarea
                id="comments"
                placeholder="Provide any additional comments to help us improve..."
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
              />
            </div>
            <Button onClick={handleFeedback}>Submit Feedback</Button>
          </CardContent>
        </Card>
      )}
       {prediction && (
        <Card className="w-full max-w-md mb-8">
          <CardHeader>
            <CardTitle>Visualized Analytics</CardTitle>
            <CardDescription>Graphical representation of the analysis.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]}/>
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Confidence Level (%)" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={false}
                  data={conditionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Alert className="w-full max-w-md">
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>{DISCLAIMER}</AlertDescription>
      </Alert>
    </div>
  );
}
