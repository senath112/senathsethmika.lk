
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
import { addCourse, updateCourseVideos, addCourseDocument } from './actions';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import React, { useEffect, useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CourseVideo {
    url: string;
    description: string;
    thumbnail: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  aiHint: string;
  youtubeVideos?: CourseVideo[];
}

interface DocumentUpload {
  name: string;
  type: string;
  fileUrl: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [uploadingToCourse, setUploadingToCourse] = useState<Course | null>(null);
  const [document, setDocument] = useState<DocumentUpload>({ name: '', type: 'Notes', fileUrl: '' });
  const [videos, setVideos] = useState<CourseVideo[]>([{ url: '', description: '', thumbnail: '' }]);
  const [newCourseVideos, setNewCourseVideos] = useState<CourseVideo[]>([{ url: '', description: '', thumbnail: '' }]);
  
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'courses'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const coursesData: Course[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        coursesData.push({ 
            id: doc.id, 
            ...(data as Omit<Course, 'id'>),
            youtubeVideos: data.youtubeVideos || []
        });
      });
      setCourses(coursesData);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (editingCourse) {
      setVideos(editingCourse.youtubeVideos?.map(v => ({...v, thumbnail: v.thumbnail || ''})) || [{ url: '', description: '', thumbnail: '' }]);
    } else {
      setVideos([{ url: '', description: '', thumbnail: '' }]);
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
      formRef.current?.reset();
      setNewCourseVideos([{ url: '', description: '', thumbnail: '' }]);
    }
  };

  const handleUpdateVideos = async () => {
    if (!editingCourse) return;

    const result = await updateCourseVideos(editingCourse.id, videos);

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

  const handleAddDocument = async () => {
    if (!uploadingToCourse || !document.name || !document.fileUrl) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all document fields.' });
      return;
    }

    const result = await addCourseDocument(uploadingToCourse.id, uploadingToCourse.title, document);
    if (result?.errors) {
      const errorMessages = Object.values(result.errors).flat().join(', ');
       toast({
         variant: 'destructive',
         title: 'Error uploading document',
         description: errorMessages || 'An unknown error occurred.',
       });
    } else {
      toast({
        title: 'Success',
        description: 'Document uploaded successfully.',
      });
      setUploadingToCourse(null);
      setDocument({ name: '', type: 'Notes', fileUrl: '' });
    }
  }

  const handleVideoChange = (index: number, field: keyof CourseVideo, value: string, isNew: boolean) => {
    const list = isNew ? newCourseVideos : videos;
    const setList = isNew ? setNewCourseVideos : setVideos;
    const updatedVideos = [...list];
    updatedVideos[index][field] = value;
    setList(updatedVideos);
  };

  const addVideoInput = (isNew: boolean) => {
    const setList = isNew ? setNewCourseVideos : setVideos;
    setList(prev => [...prev, { url: '', description: '', thumbnail: '' }]);
  };

  const removeVideoInput = (index: number, isNew: boolean) => {
    const list = isNew ? newCourseVideos : videos;
    const setList = isNew ? setNewCourseVideos : setVideos;
    if (list.length > 1 || (list.length === 1 && (list[0].url || list[0].description || list[0].thumbnail))) {
      const updatedVideos = list.filter((_, i) => i !== index);
       if (updatedVideos.length === 0) {
        setList([{ url: '', description: '', thumbnail: '' }]);
      } else {
        setList(updatedVideos);
      }
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
            <form onSubmit={handleAddCourse} ref={formRef}>
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
                  <Label htmlFor="image">Course Cover Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    placeholder="https://example.com/image.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube Videos</Label>
                  {newCourseVideos.map((video, index) => (
                    <div key={index} className="space-y-2 p-2 border rounded-md">
                       <div className="flex items-center gap-2">
                          <Input
                            name="youtubeUrl"
                            value={video.url}
                            onChange={(e) => handleVideoChange(index, 'url', e.target.value, true)}
                            placeholder="YouTube URL"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeVideoInput(index, true)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                      <Input
                        name="youtubeDescription"
                        value={video.description}
                        onChange={(e) => handleVideoChange(index, 'description', e.target.value, true)}
                        placeholder="Description (optional)"
                      />
                       <Input
                        name="youtubeThumbnail"
                        value={video.thumbnail}
                        onChange={(e) => handleVideoChange(index, 'thumbnail', e.target.value, true)}
                        placeholder="Thumbnail URL (optional)"
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addVideoInput(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Video
                  </Button>
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
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingCourse(course)}>Edit Videos</Button>
                        <Button variant="outline" size="sm" onClick={() => setUploadingToCourse(course)}>Upload Doc</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Videos Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(isOpen) => !isOpen && setEditingCourse(null)}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Edit YouTube Videos for {editingCourse?.title}</DialogTitle>
                <DialogDescription>
                    Add, remove, or edit YouTube video links and their descriptions.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                {videos.map((video, index) => (
                  <div key={index} className="space-y-2 p-2 border rounded-md">
                     <div className="flex items-center gap-2">
                        <Input
                          value={video.url}
                          onChange={(e) => handleVideoChange(index, 'url', e.target.value, false)}
                          placeholder="YouTube URL"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeVideoInput(index, false)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                    <Input
                      value={video.description}
                      onChange={(e) => handleVideoChange(index, 'description', e.target.value, false)}
                      placeholder="Description (optional)"
                    />
                     <Input
                      value={video.thumbnail}
                      onChange={(e) => handleVideoChange(index, 'thumbnail', e.target.value, false)}
                      placeholder="Thumbnail URL (optional)"
                    />
                  </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => addVideoInput(false)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Video
                 </Button>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpdateVideos}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
       <Dialog open={!!uploadingToCourse} onOpenChange={(isOpen) => !isOpen && setUploadingToCourse(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Upload Document for {uploadingToCourse?.title}</DialogTitle>
                <DialogDescription>
                    Add a new document like a syllabus or lecture notes to this course.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Document Name</Label>
                <Input id="doc-name" value={document.name} onChange={(e) => setDocument(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Midterm Study Guide" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="doc-type">Document Type</Label>
                <Select value={document.type} onValueChange={(value) => setDocument(d => ({ ...d, type: value }))}>
                  <SelectTrigger id="doc-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Notes">Notes</SelectItem>
                    <SelectItem value="Syllabus">Syllabus</SelectItem>
                    <SelectItem value="Tutorial">Tutorial</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-url">File URL</Label>
                <Input id="doc-url" value={document.fileUrl} onChange={(e) => setDocument(d => ({ ...d, fileUrl: e.target.value }))} placeholder="https://example.com/document.pdf" />
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddDocument}>Upload Document</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
