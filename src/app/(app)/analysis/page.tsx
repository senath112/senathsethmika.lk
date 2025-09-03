
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, TrendingUp, TrendingDown, Target } from "lucide-react";

// Mock data for demonstration
const analysisData = [
  { name: 'Quiz 1', score: 85, total: 100 },
  { name: 'Quiz 2', score: 92, total: 100 },
  { name: 'Midterm', score: 78, total: 100 },
  { name: 'Quiz 3', score: 88, total: 100 },
  { name: 'Quiz 4', score: 95, total: 100 },
  { name: 'Final', score: 90, total: 100 },
];

const averageScore = analysisData.reduce((acc, item) => acc + item.score, 0) / analysisData.length;
const highestScore = Math.max(...analysisData.map(item => item.score));
const lowestScore = Math.min(...analysisData.map(item => item.score));
const quizzesCompleted = analysisData.length;


export default function AnalysisPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Marks Analysis</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Based on {quizzesCompleted} assessments</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{highestScore}%</div>
                <p className="text-xs text-muted-foreground">Your best performance</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{lowestScore}%</div>
                <p className="text-xs text-muted-foreground">An opportunity to improve</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{quizzesCompleted}</div>
                <p className="text-xs text-muted-foreground">Keep up the great work</p>
            </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>
              Your scores from recent quizzes and exams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                            contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)"
                            }}
                        />
                        <Legend />
                        <Bar dataKey="score" fill="hsl(var(--primary))" name="Your Score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
