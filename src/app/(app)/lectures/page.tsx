
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  aiHint: string;
}

function CourseSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden shadow-lg">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                 <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}

export default function LecturesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    const enrollmentQuery = query(
      collection(db, 'enrollmentRequests'),
      where('studentId', '==', user.uid),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(enrollmentQuery, async (snapshot) => {
      if (snapshot.empty) {
        setEnrolledCourses([]);
        setLoading(false);
        return;
      }

      const courseIds = snapshot.docs.map(doc => doc.data().courseId);
      const coursesQuery = query(collection(db, 'courses'), where('__name__', 'in', courseIds));
      const coursesSnapshot = await getDocs(coursesQuery);

      const coursesData: Course[] = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Course, 'id'> }));
      setEnrolledCourses(coursesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">My Lectures</h1>
      </div>
       {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({length: 3}).map((_, i) => <CourseSkeleton key={i} />)}
        </div>
      )}
      {!loading && enrolledCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">You are not enrolled in any courses yet.</p>
            <Button asChild variant="link">
                <Link href="/courses">Browse Courses</Link>
            </Button>
        </div>
      )}
      {!loading && enrolledCourses.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48 w-full">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                    data-ai-hint={course.aiHint}
                  />
                </div>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow" />
                <CardFooter>
                   <Button className="w-full" asChild>
                      <Link href={`/lectures/${course.id}`}>
                        Watch Lectures <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                   </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}
    </>
  );
}

