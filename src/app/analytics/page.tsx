import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          Model Performance Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          An overview of the KidneyScan Analyzer AI model's performance metrics
          based on our test dataset.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
