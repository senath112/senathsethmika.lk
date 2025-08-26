
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { handleEnrollmentRequest } from './actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface EnrollmentRequest {
  id: string;
  studentName: string;
  courseId: string; // We'll fetch course title separately
  requestedAt: any; // Firestore timestamp
  status: 'pending' | 'approved' | 'rejected';
}

interface Course {
  id: string;
  title: string;
}

export default function AdminEnrollmentsPage() {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [courses, setCourses] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Fetch all courses to map courseId to title
    const courseQuery = query(collection(db, 'courses'));
    const unsubscribeCourses = onSnapshot(courseQuery, (querySnapshot) => {
      const coursesData: Record<string, string> = {};
      querySnapshot.forEach((doc) => {
        coursesData[doc.id] = doc.data().title;
      });
      setCourses(coursesData);
    });

    // Fetch pending enrollment requests
    const requestQuery = query(collection(db, 'enrollmentRequests'), where('status', '==', 'pending'));
    const unsubscribeRequests = onSnapshot(requestQuery, (querySnapshot) => {
      const requestsData: EnrollmentRequest[] = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...(doc.data() as Omit<EnrollmentRequest, 'id'>) });
      });
      setRequests(requestsData);
    });

    return () => {
        unsubscribeCourses();
        unsubscribeRequests();
    };
  }, []);

  const handleAction = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
        await handleEnrollmentRequest(requestId, newStatus);
        toast({
            title: 'Success',
            description: `Request has been ${newStatus}.`,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update request status.',
        });
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Enrollment Requests</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>Review and approve or reject student course enrollment requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">No pending requests.</TableCell>
                </TableRow>
              )}
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.studentName}</TableCell>
                  <TableCell>{courses[req.courseId] || 'Loading...'}</TableCell>
                  <TableCell>{req.requestedAt ? format(req.requestedAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{req.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" onClick={() => handleAction(req.id, 'approved')}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction(req.id, 'rejected')}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
