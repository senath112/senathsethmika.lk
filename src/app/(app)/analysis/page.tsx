
'use client';

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Check, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuizResult {
    id: string;
    quizTitle: string;
    category: 'Main Exam MCQ' | 'Daily Dose MCQ';
    percentage: number;
    submittedAt: any;
}

const ChartSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-[350px] w-full" />
        </CardContent>
    </Card>
);

export default function AnalysisPage() {
    const { user } = useAuth();
    const [mainExamResults, setMainExamResults] = useState<QuizResult[]>([]);
    const [dailyDoseResults, setDailyDoseResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        const q = query(
            collection(db, 'quizResults'), 
            where('studentId', '==', user.uid),
            orderBy('submittedAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results: QuizResult[] = [];
            snapshot.forEach(doc => {
                results.push({ id: doc.id, ...doc.data() } as QuizResult);
            });
            
            setMainExamResults(results.filter(r => r.category === 'Main Exam MCQ'));
            setDailyDoseResults(results.filter(r => r.category === 'Daily Dose MCQ'));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const allResults = [...mainExamResults, ...dailyDoseResults];
    const averageScore = allResults.length > 0 
        ? allResults.reduce((acc, item) => acc + item.percentage, 0) / allResults.length 
        : 0;
    const highestScore = allResults.length > 0 ? Math.max(...allResults.map(item => item.percentage)) : 0;
    const lowestScore = allResults.length > 0 ? Math.min(...allResults.map(item => item.percentage)) : 0;
    const quizzesCompleted = allResults.length;

    const renderChart = (data: QuizResult[], title: string, description: string) => {
        if (data.length === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center">
                        <Alert variant="default" className="w-auto">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No Data</AlertTitle>
                            <AlertDescription>
                                No results found for this category yet.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )
        }
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="quizTitle" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={80} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "var(--radius)"
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="percentage" fill="hsl(var(--primary))" name="Your Score (%)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        );
    }

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
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : `${averageScore.toFixed(1)}%`}</div>
                        <p className="text-xs text-muted-foreground">Based on {quizzesCompleted} assessments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : `${highestScore.toFixed(1)}%`}</div>
                        <p className="text-xs text-muted-foreground">Your best performance</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : `${lowestScore.toFixed(1)}%`}</div>
                        <p className="text-xs text-muted-foreground">An opportunity to improve</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
                        <Check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-10" /> : quizzesCompleted}</div>
                        <p className="text-xs text-muted-foreground">Keep up the great work</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {loading ? (
                    <>
                        <ChartSkeleton />
                        <ChartSkeleton />
                    </>
                ) : (
                    <>
                        {renderChart(mainExamResults, "Main Exam MCQ Performance", "Your scores from major exams.")}
                        {renderChart(dailyDoseResults, "Daily Dose MCQ Performance", "Your scores from daily practice quizzes.")}
                    </>
                )}
            </div>
        </>
    );
}
