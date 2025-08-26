
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addCourse, updateCourseVideos } from './actions';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  aiHint: string;
  youtubeUrls?: string[];
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [videoUrls, setVideoUrls] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'courses'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const coursesData: Course[] = [];
      querySnapshot.forEach((doc) => {
        coursesData.push({ id: doc.id, ...(doc.data() as Omit<Course, 'id'>) });
      });
      setCourses(coursesData);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (editingCourse) {
      setVideoUrls((editingCourse.youtubeUrls || []).join('\n'));
    } else {
      setVideoUrls('');
    }
  }, [editingCourse]);

  const handleAddCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await addCourse(null, formData);

    if (result?.errors) {
      const errorMessages = Object.values(result.errors).flat().join(', ');
      toast({
        variant: 'destructive',
        title: 'Error adding course',
        description: errorMessages || 'An unknown error occurred.',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Course added successfully.',
      });
      (event.target as HTMLFormElement).reset();
    }
  };

  const handleUpdateVideos = async () => {
    if (!editingCourse) return;

    const result = await updateCourseVideos(editingCourse.id, videoUrls);

     if (result?.errors) {
       const errorMessages = Object.values(result.errors).flat().join(', ');
       toast({
         variant: 'destructive',
         title: 'Error updating videos',
         description: errorMessages || 'An unknown error occurred.',
       });
     } else {
       toast({
         title: 'Success',
         description: 'YouTube videos updated successfully.',
       });
       setEditingCourse(null);
     }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Courses</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add New Course</CardTitle>
              <CardDescription>Fill out the form to add a new course.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddCourse}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Introduction to Physics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="A brief summary of the course."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrls">YouTube Video URLs</Label>
                  <Textarea
                    id="youtubeUrls"
                    name="youtubeUrls"
                    placeholder="Enter one YouTube URL per line"
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Add Course</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Existing Courses</CardTitle>
              <CardDescription>List of all available courses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Image
                          src={course.image}
                          alt={course.title}
                          width={60}
                          height={40}
                          className="rounded-md object-cover"
                          data-ai-hint={course.aiHint}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setEditingCourse(course)}>Edit Videos</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={!!editingCourse} onOpenChange={(isOpen) => !isOpen && setEditingCourse(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit YouTube Videos for {editingCourse?.title}</DialogTitle>
                <DialogDescription>
                    Add or remove YouTube video URLs for this course. Enter one URL per line.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
                <Label htmlFor="edit-youtubeUrls" className="sr-only">YouTube Video URLs</Label>
                <Textarea
                    id="edit-youtubeUrls"
                    value={videoUrls}
                    onChange={(e) => setVideoUrls(e.target.value)}
                    placeholder="Enter one YouTube URL per line"
                    rows={8}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpdateVideos}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
