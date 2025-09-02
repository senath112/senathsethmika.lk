
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export default function QuizPage({ params }: { params: { courseId: string; quizId: string } }) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function fetchQuiz() {
      setLoading(true);
      const quizRef = doc(db, 'courses', params.courseId, 'quizzes', params.quizId);
      const quizSnap = await getDoc(quizRef);
      if (quizSnap.exists()) {
        setQuiz({ id: quizSnap.id, ...quizSnap.data() } as Quiz);
      }
      setLoading(false);
    }
    fetchQuiz();
  }, [user, params.courseId, params.quizId]);

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (!quiz) return;
    let finalScore = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setIsSubmitted(true);
  };
  
  if (loading) {
    return <QuizSkeleton />;
  }

  if (!quiz) {
    return <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Quiz not found. It might have been removed.</AlertDescription>
    </Alert>;
  }

  if (isSubmitted) {
    return <QuizResult quiz={quiz} score={score} selectedAnswers={selectedAnswers} />
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <p className="font-semibold text-lg">{currentQuestion.question}</p>
            <RadioGroup onValueChange={handleAnswerSelect} value={selectedAnswers[currentQuestionIndex]}>
                {currentQuestion.options.map((option, index) => (
                     <div key={index} className="flex items-center space-x-2 p-2 rounded-md border">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
        <div className="mt-6 flex justify-end">
            {currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]}>Next</Button>
            ) : (
                <Button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}>Submit Quiz</Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuizResult({ quiz, score, selectedAnswers }: { quiz: Quiz, score: number, selectedAnswers: Record<number, string> }) {
  return (
    <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle>Quiz Completed!</CardTitle>
            <CardDescription>You scored</CardDescription>
            <p className="text-4xl font-bold text-primary">{score} / {quiz.questions.length}</p>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <h3 className="font-semibold">Review Your Answers</h3>
                {quiz.questions.map((q, index) => {
                    const userAnswer = selectedAnswers[index];
                    const isCorrect = userAnswer === q.correctAnswer;
                    return (
                        <div key={index} className={`p-4 rounded-md ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 border-green-400' : 'bg-red-100 dark:bg-red-900/30 border-red-400'} border`}>
                            <p className="font-medium">{q.question}</p>
                            <div className="flex items-center gap-2 mt-2">
                                {isCorrect ? <CheckCircle className="text-green-600 h-5 w-5"/> : <XCircle className="text-red-600 h-5 w-5"/>}
                                <p>Your answer: {userAnswer || "No answer"}</p>
                            </div>
                            {!isCorrect && <p className="text-sm mt-1">Correct answer: {q.correctAnswer}</p>}
                        </div>
                    )
                })}
            </div>
             <div className="mt-6 flex justify-center">
                <Button onClick={() => window.location.reload()}>Retake Quiz</Button>
            </div>
        </CardContent>
    </Card>
  )
}

function QuizSkeleton() {
    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
                 <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </CardContent>
        </Card>
    )
}
