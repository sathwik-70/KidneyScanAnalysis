'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {analyzeCTScan} from '@/ai/flows/analyze-ct-scan';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useEffect} from 'react';
import {RedoIcon, Check, X} from 'lucide-react';
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table"

const DISCLAIMER =
  'This AI analysis is for informational purposes only and should not be considered a substitute for professional medical advice. Consult with a qualified healthcare provider for diagnosis and treatment.';

// Dummy data for visualizations
const datasetDistributionData = [
  {name: 'Normal', value: 120},
  {name: 'Cyst', value: 90},
  {name: 'Tumor', value: 70},
  {name: 'Stone', value: 100},
];

const trainingPerformanceData = [
  {epoch: 0, trainingAccuracy: 0.65, validationAccuracy: 0.68, trainingLoss: 0.8, validationLoss: 0.75},
  {epoch: 1, trainingAccuracy: 0.72, validationAccuracy: 0.75, trainingLoss: 0.68, validationLoss: 0.62},
  {epoch: 2, trainingAccuracy: 0.78, validationAccuracy: 0.80, trainingLoss: 0.55, validationLoss: 0.50},
  {epoch: 3, trainingAccuracy: 0.83, validationAccuracy: 0.82, trainingLoss: 0.42, validationLoss: 0.41},
  {epoch: 4, trainingAccuracy: 0.86, validationAccuracy: 0.85, trainingLoss: 0.35, validationLoss: 0.36},
];

const confusionMatrixData = [
  {predicted: 'Normal', actualNormal: 85, actualCyst: 5, actualTumor: 2, actualStone: 8},
  {predicted: 'Cyst', actualNormal: 2, actualCyst: 80, actualTumor: 7, actualStone: 1},
  {predicted: 'Tumor', actualNormal: 3, actualCyst: 6, actualTumor: 68, actualStone: 3},
  {predicted: 'Stone', actualNormal: 10, actualCyst: 9, actualTumor: 23, actualStone: 88},
];

const classificationReportData = [
  {class: 'Normal', precision: 0.88, recall: 0.85, f1Score: 0.86, support: 100},
  {class: 'Cyst', precision: 0.83, recall: 0.80, f1Score: 0.81, support: 95},
  {class: 'Tumor', precision: 0.75, recall: 0.68, f1Score: 0.71, support: 90},
  {class: 'Stone', precision: 0.80, recall: 0.88, f1Score: 0.84, support: 100},
  {class: 'Avg/Total', precision: 0.82, recall: 0.80, f1Score: 0.81, support: 385},
];

const samplePredictionsData = [
  {imageUrl: 'https://osirix-viewer.com/wp-content/uploads/2023/03/Osirix-kidney-tumor.jpg', predicted: 'Tumor', actual: 'Tumor', isCorrect: true},
  {imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Simple_renal_cyst_-_high_resolution_CT.png/600px-Simple_renal_cyst_-_high_resolution_CT.png', predicted: 'Cyst', actual: 'Cyst', isCorrect: true},
  {imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/CT_KUB_showing_left_ureteric_stone.png/600px-CT_KUB_showing_left_ureteric_stone.png', predicted: 'Stone', actual: 'Stone', isCorrect: true},
  {imageUrl: 'https://radiopaedia.org/cases/421/images/original.jpeg?1600438596', predicted: 'Normal', actual: 'Normal', isCorrect: true},
  {imageUrl: 'https://www.imaios.com/var/ezwebin_site/storage/images/_aliases/hd/media/images/e-anatomy/ct-normal-anatomy/kidney-axial-imaios/kidney-axial-imaios/13444661-1-eng-GB/kidney-axial-imaios.jpg', predicted: 'Normal', actual: 'Normal', isCorrect: true},
  {imageUrl: 'https://www.jcm.mdpi.com/article/10.3390/jcm12020483/jcm-12-00483-f001.png', predicted: 'Cyst', actual: 'Cyst', isCorrect: true},
];

const rocCurveData = [
  {threshold: 0, truePositiveRate: 0, falsePositiveRate: 0},
  {threshold: 0.2, truePositiveRate: 0.4, falsePositiveRate: 0.1},
  {threshold: 0.4, truePositiveRate: 0.6, falsePositiveRate: 0.3},
  {threshold: 0.6, truePositiveRate: 0.8, falsePositiveRate: 0.6},
  {threshold: 0.8, truePositiveRate: 0.9, falsePositiveRate: 0.8},
  {threshold: 1, truePositiveRate: 1, falsePositiveRate: 1},
];

const inferenceTimeData = [{name: 'Inference Time', value: 0.25}]; // seconds

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
        <div>
          {/* Placeholder for more features */}
          {/*  Add any more features as required */}
        </div>
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
        <Alert variant ="warning" className="w-full max-w-md">
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

      {/* Analytics & Visualizations */}
      <section className="w-full flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Data Analytics &amp; Visualizations</h2>

        {/* 1. Dataset Distribution */}
        <Card className="w-full max-w-2xl mb-8">
          <CardHeader>
            <CardTitle>Dataset Distribution</CardTitle>
            <CardDescription>Number of images per class.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={datasetDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Image Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Model Training Performance */}
        <Card className="w-full max-w-2xl mb-8">
          <CardHeader>
            <CardTitle>Model Training Performance</CardTitle>
            <CardDescription>Training vs validation accuracy and loss over epochs.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trainingPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" name="Epoch" />
                <YAxis yAxisId="accuracy" label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="loss" orientation="right" label={{ value: 'Loss', angle: -90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="accuracy" type="monotone" dataKey="trainingAccuracy" stroke="#8884d8" name="Training Accuracy" />
                <Line yAxisId="accuracy" type="monotone" dataKey="validationAccuracy" stroke="#82ca9d" name="Validation Accuracy" />
                <Line yAxisId="loss" type="monotone" dataKey="trainingLoss" stroke="#ffc658" name="Training Loss" />
                <Line yAxisId="loss" type="monotone" dataKey="validationLoss" stroke="#a4de6c" name="Validation Loss" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Confusion Matrix */}
        <Card className="w-full max-w-2xl mb-8">
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>True vs predicted class labels.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Predicted</TableHead>
                      <TableHead>Normal</TableHead>
                      <TableHead>Cyst</TableHead>
                      <TableHead>Tumor</TableHead>
                      <TableHead>Stone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confusionMatrixData.map((row) => (
                      <TableRow key={row.predicted}>
                        <TableCell className="font-medium">{row.predicted}</TableCell>
                        <TableCell>{row.actualNormal}</TableCell>
                        <TableCell>{row.actualCyst}</TableCell>
                        <TableCell>{row.actualTumor}</TableCell>
                        <TableCell>{row.actualStone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
          </CardContent>
        </Card>

        {/* 4. Classification Report */}
        <Card className="w-full max-w-2xl mb-8">
          <CardHeader>
            <CardTitle>Classification Report</CardTitle>
            <CardDescription>Precision, recall, F1-score, and support for each class.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Class</TableHead>
                    <TableHead>Precision</TableHead>
                    <TableHead>Recall</TableHead>
                    <TableHead>F1-Score</TableHead>
                    <TableHead>Support</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classificationReportData.map((row) => (
                    <TableRow key={row.class}>
                      <TableCell className="font-medium">{row.class}</TableCell>
                      <TableCell>{row.precision}</TableCell>
                      <TableCell>{row.recall}</TableCell>
                      <TableCell>{row.f1Score}</TableCell>
                      <TableCell>{row.support}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 5. Sample Predictions */}
        <Card className="w-full max-w-2xl mb-8">
          <CardHeader>
            <CardTitle>Sample Predictions</CardTitle>
            <CardDescription>Predicted vs actual labels (green = correct, red = incorrect).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {samplePredictionsData.map((sample, index) => (
                <div key={index} className="flex flex-col items-center relative">
                  <img src={sample.imageUrl} alt={`Sample ${index}`} className="w-40 h-30 object-cover rounded" />
                   <div className="absolute top-0 right-0 p-1 bg-white rounded-full">
                    {sample.isCorrect ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 6. ROC Curve */}
        <Card className="w-full max-w-2xl mb-8">
          <CardHeader>
            <CardTitle>ROC Curve</CardTitle>
            <CardDescription>Performance across thresholds.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={rocCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="falsePositiveRate" name="False Positive Rate" />
                <YAxis dataKey="truePositiveRate" name="True Positive Rate" />
                <Tooltip />
                <Line type="monotone" dataKey="truePositiveRate" stroke="#8884d8" name="True Positive Rate" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2">AUC: 0.75</div>
          </CardContent>
        </Card>

        {/* 7. Inference Time */}
        <Card className="w-full max-w-2xl mb-8">
          <CardHeader>
            <CardTitle>Inference Time</CardTitle>
            <CardDescription>Average time taken to classify a single image (seconds).</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={inferenceTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" name="Inference Time (s)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 8. Grad-CAM Heatmaps */}
        <Card className="w-full max-w-2xl mb-8">
          <CardHeader>
            <CardTitle>Grad-CAM Heatmaps (Optional)</CardTitle>
            <CardDescription>Visual explanation of which part of the image the model focused on.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <img src="https://osirix-viewer.com/wp-content/uploads/2023/03/Osirix-kidney-tumor.jpg" alt="Grad-CAM Heatmap 1" className="rounded" />
                <p className="text-sm text-center">Class: Tumor</p>
              </div>
              <div>
                <img src="https://www.imaios.com/var/ezwebin_site/storage/images/media/images/e-anatomy/ct-normal-anatomy/kidney-axial-imaios/kidney-axial-imaios/13444661-1-eng-GB/kidney-axial-imaios.jpg" alt="Grad-CAM Heatmap 2" className="rounded" />
                <p className="text-sm text-center">Class: Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
