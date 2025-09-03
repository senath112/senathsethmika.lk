
'use client';

import { useEffect, useState } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Check, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
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

const ColoredDot = (props: any) => {
    const { cx, cy, value, payload } = props;
    const category: QuizResult['category'] = payload.category;
    
    let color = "#8884d8"; // Default color

    if (category === 'Daily Dose MCQ') {
        if (value >= 80) color = "#22c55e"; // green
        else if (value >= 60) color = "#facc15"; // yellow
        else if (value >= 30) color = "#f97316"; // orange
        else color = "#ef4444"; // red
    } else { // Main Exam MCQ
        if (value >= 75) color = "#22c55e"; // green
        else if (value >= 55) color = "#facc15"; // yellow
        else if (value >= 25) color = "#f97316"; // orange
        else color = "#ef4444"; // red
    }

    return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={1} />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const value = data.percentage;
        const category = data.category;

        let color = "hsl(var(--background))";
        let borderColor = "hsl(var(--border))";

        if (category === 'Daily Dose MCQ') {
            if (value >= 80) { color = "rgba(34, 197, 94, 0.1)"; borderColor="rgba(34, 197, 94, 0.5)"; }
            else if (value >= 60) { color = "rgba(250, 204, 21, 0.1)"; borderColor="rgba(250, 204, 21, 0.5)"; }
            else if (value >= 30) { color = "rgba(249, 115, 22, 0.1)"; borderColor="rgba(249, 115, 22, 0.5)"; }
            else { color = "rgba(239, 68, 68, 0.1)"; borderColor="rgba(239, 68, 68, 0.5)"; }
        } else { // Main Exam MCQ
            if (value >= 75) { color = "rgba(34, 197, 94, 0.1)"; borderColor="rgba(34, 197, 94, 0.5)"; }
            else if (value >= 55) { color = "rgba(250, 204, 21, 0.1)"; borderColor="rgba(250, 204, 21, 0.5)"; }
            else if (value >= 25) { color = "rgba(249, 115, 22, 0.1)"; borderColor="rgba(249, 115, 22, 0.5)"; }
            else { color = "rgba(239, 68, 68, 0.1)"; borderColor="rgba(239, 68, 68, 0.5)"; }
        }

        return (
            <div className="p-2 rounded-md border text-sm" style={{ backgroundColor: color, borderColor: borderColor, backdropFilter: 'blur(4px)' }}>
                <p className="font-bold">{`${data.quizTitle}`}</p>
                <p>{`Score: ${value.toFixed(1)}%`}</p>
            </div>
        );
    }
    return null;
};


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
            where('studentId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results: QuizResult[] = [];
            snapshot.forEach(doc => {
                results.push({ id: doc.id, ...doc.data() } as QuizResult);
            });
            
            // Sort results by date on the client side
            results.sort((a, b) => {
                const dateA = a.submittedAt?.toDate() || 0;
                const dateB = b.submittedAt?.toDate() || 0;
                return dateA - dateB;
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

    const renderChart = (data: QuizResult[], title: string, description: string, useColoredDots = false) => {
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
                    <div className="h-[350px] relative">
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-5xl lg:text-7xl font-bold text-muted-foreground/10" style={{ transform: 'rotate(-15deg)' }}>
                                ජීවිතයට විද්‍යාව
                            </p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="quizTitle" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={80} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={<CustomTooltip />}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="percentage" 
                                    stroke={useColoredDots ? "#888888" : "hsl(var(--primary))"}
                                    name="Your Score (%)" 
                                    activeDot={{ r: 8 }}
                                    dot={useColoredDots ? <ColoredDot /> : undefined}
                                />
                            </LineChart>
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
                        {renderChart(mainExamResults, "Main Exam MCQ Performance", "Your scores from major exams.", true)}
                        {renderChart(dailyDoseResults, "Daily Dose MCQ Performance", "Your scores from daily practice quizzes.", true)}
                    </>
                )}
            </div>
        </>
    );
}
