"use client";

import Image from "next/image";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const datasetDistributionData = [
  { name: "Normal", count: 1345, fill: "hsl(var(--chart-1))" },
  { name: "Cyst", count: 830, fill: "hsl(var(--chart-2))" },
  { name: "Tumor", count: 620, fill: "hsl(var(--chart-3))" },
  { name: "Stone", count: 980, fill: "hsl(var(--chart-4))" },
];

const chartConfig: ChartConfig = {
  count: {
    label: "Count",
  },
};

const classificationReportData = [
  { class: "Normal", precision: 0.98, recall: 0.96, f1_score: 0.97, support: 269 },
  { class: "Cyst", precision: 0.92, recall: 0.95, f1_score: 0.93, support: 166 },
  { class: "Tumor", precision: 0.89, recall: 0.91, f1_score: 0.90, support: 124 },
  { class: "Stone", precision: 0.96, recall: 0.97, f1_score: 0.96, support: 196 },
];

const confusionMatrixData = {
  labels: ["Normal", "Cyst", "Tumor", "Stone"],
  matrix: [
    [258, 4, 2, 5],
    [3, 158, 5, 0],
    [2, 8, 113, 1],
    [4, 1, 1, 190],
  ],
};

const samplePredictions = [
  {
    src: "https://placehold.co/400x400.png",
    dataAiHint: "kidney scan",
    actual: "Normal",
    predicted: "Normal",
    correct: true,
  },
  {
    src: "https://placehold.co/400x400.png",
    dataAiHint: "kidney scan",
    actual: "Cyst",
    predicted: "Cyst",
    correct: true,
  },
  {
    src: "https://placehold.co/400x400.png",
    dataAiHint: "kidney scan",
    actual: "Tumor",
    predicted: "Cyst",
    correct: false,
  },
  {
    src: "https://placehold.co/400x400.png",
    dataAiHint: "kidney scan",
    actual: "Stone",
    predicted: "Stone",
    correct: true,
  },
];

const rocData = [
  { fpr: 0.0, tpr: 0.0 }, { fpr: 0.1, tpr: 0.4 }, { fpr: 0.2, tpr: 0.65 },
  { fpr: 0.3, tpr: 0.78 }, { fpr: 0.4, tpr: 0.85 }, { fpr: 0.5, tpr: 0.9 },
  { fpr: 0.6, tpr: 0.94 }, { fpr: 0.7, tpr: 0.97 }, { fpr: 0.8, tpr: 0.98 },
  { fpr: 0.9, tpr: 0.99 }, { fpr: 1.0, tpr: 1.0 },
];

export function AnalyticsDashboard() {
  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Dataset Distribution</CardTitle>
          <CardDescription>
            Number of images per category in the test dataset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={datasetDistributionData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification Report</CardTitle>
          <CardDescription>
            Precision, recall, and F1-score for each class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">Recall</TableHead>
                <TableHead className="text-right">F1-Score</TableHead>
                <TableHead className="text-right">Support</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classificationReportData.map((row) => (
                <TableRow key={row.class}>
                  <TableCell className="font-medium">{row.class}</TableCell>
                  <TableCell className="text-right">{row.precision}</TableCell>
                  <TableCell className="text-right">{row.recall}</TableCell>
                  <TableCell className="text-right">{row.f1_score}</TableCell>
                  <TableCell className="text-right">{row.support}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Confusion Matrix</CardTitle>
          <CardDescription>
            Visual representation of model performance, comparing actual vs.
            predicted labels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actual \ Predicted</TableHead>
                  {confusionMatrixData.labels.map((label) => (
                    <TableHead key={label} className="text-center font-bold">
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {confusionMatrixData.matrix.map((row, i) => (
                  <TableRow key={i}>
                    <TableHead className="font-bold">
                      {confusionMatrixData.labels[i]}
                    </TableHead>
                    {row.map((cell, j) => (
                      <TableCell
                        key={j}
                        className={`text-center text-base ${
                          i === j
                            ? "bg-primary/20 font-bold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ROC Curve (AUC = 0.94)</CardTitle>
          <CardDescription>
            Receiver Operating Characteristic curve illustrating model
            performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] w-full">
            <AreaChart data={rocData} margin={{ left: -20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fpr" type="number" label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="tpr" type="number" label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value, payload) => `FPR: ${payload[0]?.payload.fpr.toFixed(2)}`}
                    formatter={(value) => `TPR: ${Number(value).toFixed(2)}`}
                  />
                }
              />
              <Area type="monotone" dataKey="tpr" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inference Time</CardTitle>
          <CardDescription>
            Average time taken to classify a single image.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <p className="text-6xl font-bold">0.8s</p>
            <p className="text-muted-foreground">per image</p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Sample Predictions</CardTitle>
          <CardDescription>
            Examples of model predictions on test images.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {samplePredictions.map((pred, index) => (
            <div key={index} className="space-y-2">
              <div className="aspect-square relative rounded-lg overflow-hidden border">
                <Image
                  src={pred.src}
                  alt={`Sample ${index + 1}`}
                  fill
                  className="object-cover"
                  data-ai-hint={pred.dataAiHint}
                />
              </div>
              <div
                className={`text-xs p-2 rounded text-center ${
                  pred.correct
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                <p>Actual: {pred.actual}</p>
                <p>Predicted: {pred.predicted}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
