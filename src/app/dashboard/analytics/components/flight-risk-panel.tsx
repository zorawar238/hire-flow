"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FlightRiskPanel({ employees }: { employees: any[] }) {
  if (!employees || employees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flight Risk Predictions</CardTitle>
          <CardDescription>AI-driven insights on employee retention</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No high-risk employees identified at this time.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter employees with a flight risk score > 70 for display
  const highRisk = employees.filter(e => e.flight_risk_score && e.flight_risk_score > 70);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flight Risk Predictions</CardTitle>
        <CardDescription>AI-driven insights on employee retention</CardDescription>
      </CardHeader>
      <CardContent>
        {highRisk.length === 0 ? (
          <p className="text-muted-foreground text-sm">No high-risk employees identified at this time.</p>
        ) : (
          <div className="space-y-4">
            {highRisk.map((emp) => (
              <div key={emp.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{emp.employee_code} - {emp.department}</p>
                    <p className="text-sm text-muted-foreground">{emp.designation}</p>
                  </div>
                  <Badge variant="destructive">Score: {emp.flight_risk_score}</Badge>
                </div>
                {emp.flight_risk_reason && (
                  <p className="text-sm mt-2"><strong>AI Analysis:</strong> {emp.flight_risk_reason}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
