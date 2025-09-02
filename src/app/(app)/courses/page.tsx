
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { requestEnrollment } from "./actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { subDays } from "date-fns";

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  aiHint: string;
  createdAt: any;
}

type EnrollmentStatus = 'enrolled' | 'pending' | 'none';

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, EnrollmentStatus>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'courses'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const coursesData: Course[] = [];
      const cutoffDate = subDays(new Date(), 45);

      querySnapshot.forEach((doc) => {
        const course = { id: doc.id, ...(doc.data() as Omit<Course, 'id'>) };
        if (course.createdAt && course.createdAt.toDate() > cutoffDate) {
          coursesData.push(course);
        } else if (!course.createdAt) {
          // Fallback for courses without a creation date for backward compatibility
          coursesData.push(course);
        }
      });
      setCourses(coursesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function checkEnrollmentStatus() {
      if (!user || courses.length === 0) return;

      const q = query(collection(db, 'enrollmentRequests'), where('studentId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const statuses: Record<string, EnrollmentStatus> = {};
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'approved') {
             statuses[data.courseId] = 'enrolled';
        } else {
             statuses[data.courseId] = data.status;
        }
      });
      setEnrollmentStatus(statuses);
    }
    checkEnrollmentStatus();
  }, [user, courses]);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to enroll.' });
      return;
    }
    
    try {
      await requestEnrollment(courseId, user.uid, user.displayName || 'Anonymous');
      setEnrollmentStatus(prev => ({ ...prev, [courseId]: 'pending' }));
      toast({ title: 'Success', description: 'Enrollment request sent successfully!' });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to send enrollment request.' });
    }
  };


  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Courses</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({length: 6}).map((_, i) => <CourseSkeleton key={i} />)}
        {!loading && courses.map((course) => {
            const status = enrollmentStatus[course.id] || 'none';
            return (
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
                    {status === 'enrolled' ? (
                        <Button className="w-full" asChild>
                            <Link href={`/lectures/${course.id}`}>
                                Open Course <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button 
                            className="w-full" 
                            onClick={() => handleEnroll(course.id)}
                            disabled={status === 'pending'}
                        >
                            {status === 'pending' ? 'Request Sent' : 'Enroll Now'}
                        </Button>
                    )}
                </CardFooter>
              </Card>
            )
        })}
      </div>
    </>
  );
}
