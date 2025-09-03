
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
import { requestEnrollment } from '@/app/(app)/store/actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Html5Qrcode } from 'html5-qrcode';


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

const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
    const minEdgePercentage = 0.7; // 70%
    const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
    const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
    return {
        width: qrboxSize,
        height: qrboxSize,
    };
}

export default function ScannerPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'courses'));
    const unsubscribeCourses = onSnapshot(q, (querySnapshot) => {
      const coursesData: Course[] = [];
      querySnapshot.forEach((doc) => {
        coursesData.push({ id: doc.id, ...doc.data() } as Course);
      });
      setCourses(coursesData);
    });

    return () => {
        unsubscribeCourses();
    };
  }, []);

  useEffect(() => {
    if (!isClient) {
        return;
    }
    
    // Cleanup function to stop the scanner
    const cleanup = () => {
        if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
            html5QrcodeRef.current.stop().catch(err => console.error("Failed to stop scanner on cleanup", err));
        }
    }

    const startScanner = () => {
        if (html5QrcodeRef.current || !document.getElementById(scannerContainerId)) {
            return;
        }

        const scanner = new Html5Qrcode(scannerContainerId);
        html5QrcodeRef.current = scanner;

        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: qrboxFunction },
            handleScanSuccess,
            (errorMessage) => { /* console.log("QR Scan Error:", errorMessage) */ }
        ).then(() => {
            setHasCameraPermission(true);
        }).catch(err => {
            console.error("Scanner start error:", err);
            setHasCameraPermission(false);
            toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not start the camera. Please grant permission and refresh.'});
        });
    };

    startScanner();

    return () => {
      cleanup();
    };
  }, [isClient, toast]);


  const handleScanSuccess = async (decodedText: string, decodedResult: any) => {
      if (html5QrcodeRef.current?.isScanning) {
        html5QrcodeRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
        
        try {
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
    // Re-start scanning logic is handled by useEffect re-running if we desire so
    // For now, let's just refresh the component state. A full restart would need more state management.
    // A simple approach is to just reload the page or guide user to do so.
    window.location.reload(); // Simple way to re-initiate scanner
  }
  
  const renderScannerState = () => {
    if (!isClient) {
        return (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Loading Scanner...</p>
            </div>
        );
    }

    if (hasCameraPermission === false) {
        return (
            <Alert variant="destructive" className="w-auto">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                    Please enable camera permissions in your browser settings and refresh the page.
                </AlertDescription>
            </Alert>
        );
    }
    
    // Default to loading/initial state until camera permission is confirmed
    return <div id={scannerContainerId} className="w-full h-full" />;
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
             {renderScannerState()}
             {scannedStudent && (
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
