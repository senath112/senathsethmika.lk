
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { checkAndIncrementViewCount, getVideoViewCount } from '../../actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Ban, ChevronsLeft } from 'lucide-react';
import Link from 'next/link';

const VIDEO_VIEW_LIMIT = 3;

function VideoPlayerSkeleton() {
    return (
        <Card className="max-w-4xl mx-auto w-full">
            <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md">
                    <div className="flex items-center justify-center h-full">
                        <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                </AspectRatio>
            </CardContent>
        </Card>
    );
}

export default function VideoPlayerPage({ params }: { params: { courseId: string; videoId: string } }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [canWatch, setCanWatch] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [courseTitle, setCourseTitle] = useState('');
    const [videoInfo, setVideoInfo] = useState<{ title: string, description: string } | null>(null);

    useEffect(() => {
        if (!user) return;

        const verifyAccess = async () => {
            setLoading(true);
            try {
                const courseRef = doc(db, 'courses', params.courseId);
                const courseSnap = await getDoc(courseRef);
                
                if (courseSnap.exists()) {
                    const courseData = courseSnap.data();
                    setCourseTitle(courseData.title);
                    
                    const video = courseData.youtubeVideos?.find((v: any) => v.url.includes(params.videoId));
                    if (video) {
                        const videoIdFromUrl = new URL(video.url).searchParams.get('v');
                        setVideoInfo({
                            title: `Video from ${courseData.title}`,
                            description: video.description || "No description for this video."
                        });
                    }

                }

                const hasPermission = await checkAndIncrementViewCount(user.uid, params.courseId, params.videoId);
                const viewCount = await getVideoViewCount(user.uid, params.courseId, params.videoId);
                
                if (hasPermission) {
                    setCanWatch(true);
                    toast({
                        title: 'Video Loaded',
                        description: `You have ${VIDEO_VIEW_LIMIT - viewCount} view(s) remaining for this video.`
                    });
                } else {
                    setCanWatch(false);
                    toast({
                        variant: 'destructive',
                        title: 'View limit reached',
                        description: "You have already watched this video 3 times."
                    });
                }

            } catch (e) {
                console.error(e);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: "Could not load video information. Please try again."
                });
                setCanWatch(false);
            } finally {
                setLoading(false);
            }
        };

        verifyAccess();
    }, [user, params.courseId, params.videoId, toast]);

    if (loading) {
        return <VideoPlayerSkeleton />;
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
             <Button asChild variant="outline">
                <Link href={`/lectures/${params.courseId}`}>
                    <ChevronsLeft className="mr-2 h-4 w-4" />
                    Back to {courseTitle || 'Course'}
                </Link>
            </Button>
            <Card>
                {canWatch ? (
                    <>
                        <CardHeader>
                            <CardTitle>{videoInfo?.title || 'Video Lecture'}</CardTitle>
                            <CardDescription>{videoInfo?.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AspectRatio ratio={16 / 9}>
                                <iframe
                                    className="rounded-lg w-full h-full"
                                    src={`https://www.youtube.com/embed/${params.videoId}?autoplay=1`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </AspectRatio>
                        </CardContent>
                    </>
                ) : (
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Ban className="h-6 w-6"/>
                            Access Denied
                        </CardTitle>
                        <CardContent className="pt-6">
                             <Alert variant="destructive">
                                <AlertTitle>View Limit Reached</AlertTitle>
                                <AlertDescription>
                                    You have used all your views for this video.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </CardHeader>
                )}
            </Card>
        </div>
    );
}

