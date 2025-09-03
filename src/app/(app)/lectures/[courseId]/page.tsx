
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { askQuestion } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Ban, PlayCircle, BookCopy, FileText, Download, Loader2, FileQuestion, HelpCircle, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Image from 'next/image';
import { getWatermarkedPdf } from '../../documents/actions';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


interface CourseVideo {
  url: string;
  description: string;
  thumbnail: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  fileUrl: string;
  courseId: string;
  courseTitle: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: any[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  youtubeVideos: CourseVideo[];
}

function getYouTubeVideoId(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length == 11) ? match[2] : null;
}

export default function CourseHubPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [question, setQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  useEffect(() => {
      setIsClient(true);
  }, []);

  useEffect(() => {
    if (!user || !isClient) return;
    const courseId = params.courseId;

    async function fetchCourse() {
      setLoading(true);
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        const courseData = { id: courseSnap.id, ...courseSnap.data() } as Course;
        courseData.youtubeVideos = courseData.youtubeVideos || [];
        setCourse(courseData);
      } else {
        setError("Course not found.");
      }
      setLoading(false);
    }
    fetchCourse();
    
    const documentsQuery = query(collection(db, 'documents'), where('courseId', '==', courseId));
    const unsubscribeDocs = onSnapshot(documentsQuery, (querySnapshot) => {
        const docsData: Document[] = [];
        querySnapshot.forEach((doc) => docsData.push({ id: doc.id, ...doc.data() } as Document));
        setDocuments(docsData);
    });

    const quizzesQuery = query(collection(db, 'courses', courseId, 'quizzes'));
    const unsubscribeQuizzes = onSnapshot(quizzesQuery, (snapshot) => {
        const quizzesData: Quiz[] = [];
        snapshot.forEach(doc => quizzesData.push({ id: doc.id, ...doc.data() } as Quiz));
        setQuizzes(quizzesData);
    });

    return () => {
        unsubscribeDocs();
        unsubscribeQuizzes();
    }
  }, [user, params.courseId, isClient]);

  const handleDownload = async (doc: Document) => {
    if (!user) return;
    
    if (!doc.fileUrl.toLowerCase().endsWith('.pdf')) {
        window.open(doc.fileUrl, '_blank');
        return;
    }

    setDownloadingDocId(doc.id);
    try {
        const studentId = user.uid;
        const watermarkedPdfBase64 = await getWatermarkedPdf(doc.fileUrl, studentId);
        
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${watermarkedPdfBase64}`;
        link.download = `${doc.name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not process the document for download. Please try again."
        })
    } finally {
        setDownloadingDocId(null);
    }
  };
  
   const handleAskQuestion = async () => {
        if (!user || !course) return;
        if (question.trim().length < 10) {
            toast({ variant: 'destructive', title: 'Question is too short', description: 'Please elaborate on your question.'});
            return;
        }

        setIsSubmittingQuestion(true);
        const result = await askQuestion({
            question: question,
            courseId: course.id,
            studentId: user.uid,
            studentName: user.displayName || 'Anonymous Student',
        });
        setIsSubmittingQuestion(false);

        if (result.success) {
            toast({ title: 'Question Submitted!', description: 'Your question has been sent to the teacher.'});
            setQuestion('');
        } else {
            toast({ variant: 'destructive', title: 'Submission Failed', description: result.error });
        }
    };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'Syllabus': return BookCopy;
      case 'Tutorial': return FileText;
      default: return FileText;
    }
  }

  if (!isClient || loading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-3/4 mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  }

  if (!course) {
    return <p>Course not found.</p>;
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
            </CardHeader>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Available Videos</CardTitle>
                 <CardDescription>
                    Select a video to start watching. You can watch each video up to 3 times.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {course.youtubeVideos.length > 0 ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {course.youtubeVideos.map((video, index) => {
                            const videoId = getYouTubeVideoId(video.url);
                            if (!videoId) return null;
                            const thumbnail = video.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

                            return (
                                <Link key={index} href={`/lectures/${params.courseId}/watch/${videoId}`}>
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="relative aspect-video">
                                            <Image src={thumbnail} alt={video.description || `Lecture Part ${index + 1}`} fill className="object-cover" data-ai-hint="video thumbnail" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <PlayCircle className="h-10 w-10 text-white" />
                                            </div>
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-base">Lecture Part {index + 1}</CardTitle>
                                            <CardDescription className="text-xs truncate" title={video.description}>
                                                {video.description || 'No description'}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <Alert variant="default">
                        <AlertTitle>No Videos Available</AlertTitle>
                        <AlertDescription>
                            There are no videos for this course yet. Please check back later.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-primary" />
                    Ask a Question
                </CardTitle>
                <CardDescription>Have a doubt? Ask the teacher directly from here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question-textarea">Your Question</Label>
                    <Textarea
                        id="question-textarea"
                        placeholder="Type your question about the lecture here..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="min-h-[100px]"
                    />
                  </div>
                  <Button onClick={handleAskQuestion} disabled={isSubmittingQuestion || !question}>
                    {isSubmittingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Question
                  </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Course Documents</CardTitle>
                <CardDescription>Syllabi, notes, and other materials.</CardDescription>
            </CardHeader>
            <CardContent>
                {documents.length > 0 ? (
                    <div className="space-y-2">
                    {documents.map((doc) => {
                        const Icon = getDocIcon(doc.type);
                        return (
                        <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.date}</p>
                            </div>
                            </div>
                            <div className="flex items-center gap-2">
                            <Badge variant={doc.type === 'Syllabus' ? 'default' : 'secondary'}>{doc.type}</Badge>
                            <Button size="icon" variant="outline" onClick={() => handleDownload(doc)} disabled={downloadingDocId === doc.id}>
                                {downloadingDocId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            </Button>
                            </div>
                        </div>
                        )
                    })}
                    </div>
                ) : (
                      <Alert variant="default">
                        <AlertTitle>No Documents Available</AlertTitle>
                        <AlertDescription>
                            There are no documents for this course yet.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Quizzes</CardTitle>
                <CardDescription>Test your knowledge.</CardDescription>
            </CardHeader>
            <CardContent>
                {quizzes.length > 0 ? (
                    <div className="space-y-2">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                    <FileQuestion className="h-5 w-5 text-muted-foreground" />
                                    <p className="font-medium">{quiz.title}</p>
                                </div>
                                <Button asChild>
                                    <Link href={`/courses/${params.courseId}/quiz/${quiz.id}`}>Start Quiz</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Alert variant="default">
                        <AlertTitle>No Quizzes Available</AlertTitle>
                        <AlertDescription>
                            There are no quizzes for this course yet.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
      </div>
  );
}

