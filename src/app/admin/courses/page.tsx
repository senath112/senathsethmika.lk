

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
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import React, { useEffect, useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Plus, Trash2, Upload, Loader2, Pencil, Link as LinkIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FcGoogle } from "react-icons/fc";


interface CourseVideo {
    url: string;
    description: string;
    thumbnail: string;
}

interface Document {
    id: string;
    name: string;
    type: string;
    fileUrl: string;
    date: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  aiHint: string;
  youtubeVideos?: CourseVideo[];
  documents?: Document[];
}

interface DocumentUpload {
  name: string;
  type: string;
  fileUrl: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const [document, setDocument] = useState<Omit<DocumentUpload, 'fileUrl'>>({ name: '', type: 'Notes' });
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [courseDocuments, setCourseDocuments] = useState<Document[]>([]);
  
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
      // Fetch documents for the editing course
      const docQuery = query(collection(db, 'documents'), where('courseId', '==', editingCourse.id));
      const unsubscribeDocs = onSnapshot(docQuery, (snapshot) => {
        const docs: Document[] = [];
        snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() } as Document));
        setCourseDocuments(docs);
      });
      return () => unsubscribeDocs();
    } else {
      setVideos([{ url: '', description: '', thumbnail: '' }]);
      setCourseDocuments([]);
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
     }
  };

  const handleAddDocument = async (uploadType: 'file' | 'url' | 'google-drive') => {
    if (!editingCourse || !document.name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a document name.' });
      return;
    }

    setIsUploading(true);
    let finalFileUrl = '';
    
    try {
        if (uploadType === 'file') {
            if (!documentFile) {
                toast({ variant: 'destructive', title: 'Error', description: 'Please select a file to upload.' });
                setIsUploading(false);
                return;
            }
            const storageRef = ref(storage, `course_documents/${editingCourse.id}/${documentFile.name}`);
            const uploadResult = await uploadBytes(storageRef, documentFile);
            finalFileUrl = await getDownloadURL(uploadResult.ref);
        } else { // url or google-drive
            if (!documentUrl) {
                toast({ variant: 'destructive', title: 'Error', description: 'Please provide a document URL.' });
                setIsUploading(false);
                return;
            }
            finalFileUrl = documentUrl;
        }

      const result = await addCourseDocument(editingCourse.id, editingCourse.title, {
        ...document,
        fileUrl: finalFileUrl,
      });
      
      if (result?.errors) {
        const errorMessages = Object.values(result.errors).flat().join(', ');
         toast({
           variant: 'destructive',
           title: 'Error adding document',
           description: errorMessages || 'An unknown error occurred.',
         });
      } else {
        toast({
          title: 'Success',
          description: 'Document added successfully.',
        });
        setDocument({ name: '', type: 'Notes' });
        setDocumentFile(null);
        setDocumentUrl('');
      }
    } catch (error) {
      console.error("Document add error: ", error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not add the document.' });
    } finally {
      setIsUploading(false);
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
                        <Button variant="outline" size="sm" onClick={() => setEditingCourse(course)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Course Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(isOpen) => !isOpen && setEditingCourse(null)}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Edit Course: {editingCourse?.title}</DialogTitle>
                <DialogDescription>
                    Manage videos and documents for this course.
                </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="videos" className="w-full">
                <TabsList>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="videos">
                     <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 py-4">
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
                    <DialogFooter className="pt-4 border-t">
                        <Button onClick={handleUpdateVideos}>Save Video Changes</Button>
                    </DialogFooter>
                </TabsContent>
                <TabsContent value="documents">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Upload Form */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Add New Document</h3>
                            <Tabs defaultValue="upload" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                                    <TabsTrigger value="url">From URL</TabsTrigger>
                                    <TabsTrigger value="google-drive">Google Drive</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="space-y-4 pt-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="doc-name-file">Document Name</Label>
                                        <Input id="doc-name-file" value={document.name} onChange={(e) => setDocument(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Midterm Study Guide" />
                                      </div>
                                       <div className="space-y-2">
                                        <Label htmlFor="doc-type-file">Document Type</Label>
                                        <Select value={document.type} onValueChange={(value) => setDocument(d => ({ ...d, type: value }))}>
                                          <SelectTrigger id="doc-type-file">
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
                                        <Label htmlFor="doc-file">PDF File</Label>
                                        <Input id="doc-file" type="file" accept="application/pdf" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                                      </div>
                                       <Button onClick={() => handleAddDocument('file')} disabled={isUploading}>
                                          {isUploading ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Uploading...
                                            </>
                                          ) : (
                                            <>
                                              <Upload className="mr-2 h-4 w-4" />
                                              Upload Document
                                            </>
                                          )}
                                        </Button>
                                </TabsContent>
                                <TabsContent value="url" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="doc-name-url">Document Name</Label>
                                        <Input id="doc-name-url" value={document.name} onChange={(e) => setDocument(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Midterm Study Guide" />
                                      </div>
                                       <div className="space-y-2">
                                        <Label htmlFor="doc-type-url">Document Type</Label>
                                        <Select value={document.type} onValueChange={(value) => setDocument(d => ({ ...d, type: value }))}>
                                          <SelectTrigger id="doc-type-url">
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
                                        <Label htmlFor="doc-url">Document URL</Label>
                                        <Input id="doc-url" type="url" placeholder="https://example.com/document.pdf" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} />
                                      </div>
                                       <Button onClick={() => handleAddDocument('url')} disabled={isUploading}>
                                         {isUploading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          ) : (
                                            <LinkIcon className="mr-2 h-4 w-4" />
                                          )}
                                          Add from URL
                                        </Button>
                                </TabsContent>
                                 <TabsContent value="google-drive" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="doc-name-gdrive">Document Name</Label>
                                        <Input id="doc-name-gdrive" value={document.name} onChange={(e) => setDocument(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Midterm Study Guide" />
                                      </div>
                                       <div className="space-y-2">
                                        <Label htmlFor="doc-type-gdrive">Document Type</Label>
                                        <Select value={document.type} onValueChange={(value) => setDocument(d => ({ ...d, type: value }))}>
                                          <SelectTrigger id="doc-type-gdrive">
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
                                        <Label htmlFor="doc-gdrive-url">Google Drive Share URL</Label>
                                        <Input id="doc-gdrive-url" type="url" placeholder="Paste Google Drive share link here" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} />
                                      </div>
                                       <Button onClick={() => handleAddDocument('google-drive')} disabled={isUploading}>
                                         {isUploading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          ) : (
                                            <FcGoogle className="mr-2 h-4 w-4" />
                                          )}
                                          Add from Google Drive
                                        </Button>
                                </TabsContent>
                            </Tabs>
                        </div>

                         {/* Existing Documents List */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Uploaded Documents</h3>
                             <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-2">
                                {courseDocuments.length > 0 ? (
                                    courseDocuments.map(doc => (
                                        <div key={doc.id} className="flex justify-between items-center p-2 border rounded-md">
                                            <p className="text-sm font-medium">{doc.name}</p>
                                            <Badge variant="secondary">{doc.type}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No documents uploaded for this course yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                     <DialogFooter className="pt-4 border-t">
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                     </DialogFooter>
                </TabsContent>
            </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

    