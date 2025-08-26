
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requestEnrollment } from '@/app/(app)/courses/actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CameraOff } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


interface Course {
  id: string;
  title: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
}

export default function ScannerPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Temporarily disabled camera check until a compatible QR library is added
    // navigator.mediaDevices.getUserMedia({ video: true })
    //   .then(() => setHasCameraPermission(true))
    //   .catch(() => setHasCameraPermission(false));
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'courses'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const coursesData: Course[] = [];
      querySnapshot.forEach((doc) => {
        coursesData.push({ id: doc.id, ...doc.data() } as Course);
      });
      setCourses(coursesData);
    });

    return () => unsubscribe();
  }, []);


  const handleScanSuccess = async (result: any) => {
      if (result && isScanning) {
        setIsScanning(false);
        try {
            const decodedText = result?.getText();
            const studentRef = doc(db, 'students', decodedText);
            const studentSnap = await getDoc(studentRef);

            if (studentSnap.exists()) {
                const studentData = studentSnap.data();
                setScannedStudent({
                id: studentSnap.id,
                name: studentData.name,
                email: studentData.email,
                photoURL: studentData.photoURL,
                });
                toast({ title: 'Student Found', description: `Scanned: ${studentData.name}` });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Student not found.' });
                resetScanner();
            }
        } catch (e) {
            console.error(e)
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch student data.' });
            resetScanner();
        }
      }
  };

  const handleEnroll = async () => {
    if (!scannedStudent || !selectedCourse) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please scan a student ID and select a course.' });
      return;
    }
    setIsLoading(true);
    try {
      await requestEnrollment(selectedCourse, scannedStudent.id, scannedStudent.name);
      toast({ title: 'Success', description: `${scannedStudent.name} has been sent an enrollment request for the selected course.` });
      resetScanner();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create enrollment request.' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const resetScanner = () => {
    setScannedStudent(null);
    setSelectedCourse('');
    setIsScanning(true);
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Manual Enrollment Scanner</h1>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Scan Student QR Code</CardTitle>
          <CardDescription>
            Point the camera at the student's ID card to scan their QR code and enroll them in a course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
            <Alert variant="default" className="w-auto absolute">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Scanner Temporarily Unavailable</AlertTitle>
                <AlertDescription>
                    The QR code scanner is currently being updated.
                </AlertDescription>
            </Alert>
            {!isScanning && scannedStudent && (
              <div className="absolute inset-0 bg-background flex flex-col items-center justify-center text-center p-4">
                 <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={scannedStudent.photoURL} alt={scannedStudent.name} />
                    <AvatarFallback>{scannedStudent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-lg">{scannedStudent.name}</p>
                <p className="text-muted-foreground">{scannedStudent.email}</p>
              </div>
            )}
          </div>

          {scannedStudent && (
             <div className="space-y-4 pt-4 border-t">
                 <Select onValueChange={setSelectedCourse} value={selectedCourse}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a course to enroll" />
                    </SelectTrigger>
                    <SelectContent>
                        {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                                {course.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex gap-2">
                    <Button onClick={handleEnroll} className="flex-1" disabled={!selectedCourse || isLoading}>
                        {isLoading ? 'Enrolling...' : 'Enroll Student'}
                    </Button>
                     <Button onClick={resetScanner} variant="outline">
                        Scan Another
                    </Button>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
