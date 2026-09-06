import { getRecruitmentFunnel, getTimeToHire, getTurnoverPrediction } from "@/app/actions/analytics";
import { FunnelChart } from "./components/funnel-chart";
import { TimeToHireChart } from "./components/time-to-hire-chart";
import { FlightRiskPanel } from "./components/flight-risk-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [funnelData, timeToHireData, employees] = await Promise.all([
    getRecruitmentFunnel(),
    getTimeToHire(),
    getTurnoverPrediction(),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & AI Insights</h1>
        <p className="text-muted-foreground mt-2">
          Track recruitment metrics and monitor employee retention insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Funnel</CardTitle>
            <CardDescription>Number of candidates at each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnelData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Time to Hire</CardTitle>
            <CardDescription>Average days from application to joining</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeToHireChart data={timeToHireData} />
          </CardContent>
        </Card>
      </div>

      <FlightRiskPanel employees={employees} />
    </div>
  );
}
