
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { checkAndIncrementViewCount, getVideoViewCount } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Ban, Youtube } from 'lucide-react';

interface CourseVideo {
  url: string;
  description: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  youtubeVideos: CourseVideo[];
}

const VIDEO_VIEW_LIMIT = 3;

function getYouTubeVideoId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return null;
    }
}

export default function CourseVideosPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoViewCounts, setVideoViewCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCourse() {
      if (!user) return;
      setLoading(true);
      const courseRef = doc(db, 'courses', params.courseId);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        const courseData = { id: courseSnap.id, ...courseSnap.data() } as Course;
        // The field might still be youtubeUrls in old documents
        if (!courseData.youtubeVideos && (courseData as any).youtubeUrls) {
          courseData.youtubeVideos = ((courseData as any).youtubeUrls as string[]).map(url => ({ url, description: '' }));
        } else if (!courseData.youtubeVideos) {
          courseData.youtubeVideos = [];
        }
        
        setCourse(courseData);
        
        // Fetch view counts for all videos in parallel
        const counts: Record<string, number> = {};
        for (const video of courseData.youtubeVideos) {
          const videoId = getYouTubeVideoId(video.url);
          if (videoId) {
            counts[videoId] = await getVideoViewCount(user.uid, params.courseId, videoId);
          }
        }
        setVideoViewCounts(counts);

      } else {
        setError("Course not found.");
      }
      setLoading(false);
    }
    fetchCourse();
  }, [user, params.courseId]);

  const handleWatchVideo = async (videoUrl: string) => {
      const videoId = getYouTubeVideoId(videoUrl);
      if (!user || !videoId) return;

      try {
        const canWatch = await checkAndIncrementViewCount(user.uid, params.courseId, videoId);
        if (canWatch) {
            setSelectedVideo(videoId);
            setVideoViewCounts(prev => ({...prev, [videoId]: (prev[videoId] || 0) + 1}));
        } else {
            toast({
                variant: 'destructive',
                title: 'View limit reached',
                description: "You have already watched this video 3 times."
            });
        }
      } catch (e) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: "Could not play video. Please try again."
        });
      }
  }

  if (loading) {
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
    return <p>{error}</p>;
  }

  if (!course) {
    return <p>Course not found.</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Now Playing</CardTitle>
                    <CardDescription>
                        {selectedVideo ? `Video from ${course.title}` : 'Select a video to start watching.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AspectRatio ratio={16/9}>
                        {selectedVideo ? (
                             <iframe
                                className="rounded-lg w-full h-full"
                                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&controls=0`}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                                <p className="text-muted-foreground">Select a video from the list</p>
                            </div>
                        )}
                    </AspectRatio>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>Available Videos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {course.youtubeVideos.length > 0 ? course.youtubeVideos.map((video, index) => {
                        const videoId = getYouTubeVideoId(video.url);
                        if (!videoId) return null;
                        const viewCount = videoViewCounts[videoId] || 0;
                        const limitReached = viewCount >= VIDEO_VIEW_LIMIT;

                        return (
                             <div key={index}>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-left h-auto"
                                    onClick={() => handleWatchVideo(video.url)}
                                    disabled={limitReached}
                                >
                                    <Youtube className="mr-2 text-red-500" />
                                    <div className="flex-1">
                                        <p>Lecture Part {index + 1}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {video.description || `Views: ${viewCount} / ${VIDEO_VIEW_LIMIT}`}
                                        </p>
                                    </div>
                                    {limitReached && <Ban className="h-4 w-4 text-destructive" />}
                                </Button>
                             </div>
                        );
                    }) : (
                         <Alert variant="default">
                            <AlertTitle>No Videos Available</AlertTitle>
                            <AlertDescription>
                                There are no videos for this course yet. Please check back later.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>

    </div>
  );
}
