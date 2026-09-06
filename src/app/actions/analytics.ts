"use server";

import { createClient } from "@/utils/supabase/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function getRecruitmentFunnel() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("candidate_applications")
    .select("stage");
    
  if (error) {
    console.error("Error fetching candidate applications:", error);
    return [];
  }
  
  const stages = [
    "APPLIED", "AI_REVIEWED", "SHORTLISTED", "INTERVIEW", "TECHNICAL_TEST", 
    "CULTURE_FIT", "OFFER_APPROVAL", "OFFER_SENT", "OFFER_ACCEPTED", 
    "JOINED", "REJECTED", "WITHDRAWN"
  ];
  
  const counts = stages.reduce((acc, stage) => {
    acc[stage] = 0;
    return acc;
  }, {} as Record<string, number>);
  
  data.forEach((app) => {
    if (counts[app.stage] !== undefined) {
      counts[app.stage]++;
    }
  });
  
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export async function getTimeToHire() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("employees")
    .select("joining_date, created_at, candidate_applications!inner(created_at)")
    .limit(100);
    
  if (error) {
    console.error("Error fetching employees for time to hire:", error);
    return [];
  }
  
  // Aggregate data by month or simply calculate overall average
  // For simplicity, let's return average days per month for the last 6 months
  const monthlyData: Record<string, { totalDays: number, count: number }> = {};
  
  data.forEach(emp => {
    if (!emp.candidate_applications || !emp.candidate_applications.created_at || !emp.joining_date) return;
    
    const appliedDate = new Date(emp.candidate_applications.created_at);
    const joinDate = new Date(emp.joining_date);
    const monthYear = joinDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    const days = (joinDate.getTime() - appliedDate.getTime()) / (1000 * 3600 * 24);
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { totalDays: 0, count: 0 };
    }
    monthlyData[monthYear].totalDays += days;
    monthlyData[monthYear].count++;
  });
  
  return Object.entries(monthlyData).map(([month, stats]) => ({
    name: month,
    days: Math.round(stats.totalDays / stats.count)
  }));
}

export async function getTurnoverPrediction() {
  const supabase = createClient();
  
  const { data: employees, error } = await supabase
    .from("employees")
    .select(`
      id, 
      employee_code, 
      department,
      designation,
      status,
      flight_risk_score,
      flight_risk_reason,
      performance_reviews (
        overall_rating,
        review_period
      )
    `)
    .eq("status", "ACTIVE")
    .limit(10);
    
  if (error) {
    console.error("Error fetching employees for turnover prediction:", error);
    return [];
  }
  
  return employees;
}
