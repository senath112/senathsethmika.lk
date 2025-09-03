
'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLeaderboard, LeaderboardEntry } from '../actions';
import { Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage({ params }: { params: { courseId: string; quizId: string } }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [leaderboardData, quizDoc] = await Promise.all([
            getLeaderboard(params.quizId),
            getDoc(doc(db, 'courses', params.courseId, 'quizzes', params.quizId))
        ]);

        if (quizDoc.exists()) {
            setQuizTitle(quizDoc.data().title);
        } else {
            setError('Quiz not found.');
        }

        setLeaderboard(leaderboardData);

      } catch (e) {
        setError('Failed to load leaderboard. Please try again later.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.quizId, params.courseId]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <Trophy className="mx-auto h-12 w-12 text-amber-400" />
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>{quizTitle || 'Loading quiz...'}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LeaderboardSkeleton />
        ) : error ? (
           <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : leaderboard.length === 0 ? (
          <Alert>
              <AlertTitle>No Entries Yet</AlertTitle>
              <AlertDescription>
                Be the first to complete the quiz and get on the leaderboard!
                <div className="mt-4">
                  <Button asChild>
                    <Link href={`/courses/${params.courseId}/quiz/${params.quizId}`}>Take Quiz</Link>
                  </Button>
                </div>
              </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow key={entry.rank}>
                  <TableCell className="font-bold">{entry.rank}</TableCell>
                  <TableCell>{entry.studentName}</TableCell>
                  <TableCell className="text-right">{entry.score}/{entry.totalQuestions}</TableCell>
                  <TableCell className="text-right font-medium">{entry.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
