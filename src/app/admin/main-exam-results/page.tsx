
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const marksEntrySchema = z.object({
  studentId: z.string().min(1, 'Student is required.'),
  marks: z.coerce.number().min(0, 'Marks cannot be negative.').max(100, 'Marks cannot exceed 100.'),
});

const formSchema = z.object({
  courseId: z.string().min(1, 'Please select a course.'),
  examTitle: z.string().min(3, 'Exam title must be at least 3 characters.'),
  entries: z.array(marksEntrySchema).min(1, 'Please add at least one student entry.'),
});

interface Course {
  id: string;
  title: string;
}

interface Student {
  id: string;
  name: string;
}

export default function MainExamResultsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: '',
      examTitle: '',
      entries: [{ studentId: '', marks: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'entries',
  });

  useEffect(() => {
    async function fetchData() {
      // Fetch courses
      const courseQuery = query(collection(db, 'courses'));
      const courseSnapshot = await getDocs(courseQuery);
      const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, title: doc.data().title })) as Course[];
      setCourses(courseList);

      // Fetch students
      const studentQuery = query(collection(db, 'students'));
      const studentSnapshot = await getDocs(studentQuery);
      const studentList = studentSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })) as Student[];
      setStudents(studentList);
    }
    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      
      values.entries.forEach(entry => {
        const resultRef = collection(db, 'quizResults');
        batch.set(doc(resultRef), {
          studentId: entry.studentId,
          quizTitle: values.examTitle,
          courseId: values.courseId,
          category: 'Main Exam MCQ',
          score: entry.marks,
          totalQuestions: 100,
          percentage: entry.marks,
          submittedAt: new Date(),
        });
      });
      
      await batch.commit();
      
      toast({
        title: 'Success',
        description: 'Main exam marks have been uploaded successfully.',
      });
      form.reset();

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'An error occurred while uploading the marks. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Main Exam Results</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload Marks for Main Exams</CardTitle>
          <CardDescription>
            Enter the final marks for a main exam. This will be reflected in the students' analysis page.
          </CardDescription>
        </CardHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="examTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Final Term Exam 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Student Marks</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                      <FormField
                        control={form.control}
                        name={`entries.${index}.studentId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a student" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {students.map(student => (
                                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`entries.${index}.marks`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marks (out of 100)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 85" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      className="mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ studentId: '', marks: 0 })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Student
                </Button>
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Marks
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </>
  );
}
